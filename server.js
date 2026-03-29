import express from 'express';
import pg from 'pg';
import crypto from 'crypto';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import QRCode from 'qrcode';
import multer from 'multer';
import {
  createCertificateHash,
  signCertificate,
  verifyCertificate,
  extractSignableFields,
} from './lib/certificates.js';

// Load environment variables from .env
try {
  process.loadEnvFile();
} catch (e) {
  // .env file might not exist in production (secrets are set via environment)
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Multer configuration for PDF uploads
const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'public', 'assets', 'presentations')),
  filename: (req, file, cb) => cb(null, `${req.params.slug}-presentation.pdf`)
});
const uploadPresentation = multer({
  storage: uploadStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Tylko pliki PDF'));
  }
});

// PostgreSQL
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Admin session tokens (in-memory, cleared on restart — admin just re-logs in)
const adminTokens = new Set();

// Survey IP rate limiting — max 1 survey per IP per 24h
const surveyIpMap = new Map(); // ip -> timestamp

// Scheduled mailings — in-memory (cleared on restart, that's OK for simple scheduling)
const scheduledMailings = new Map(); // id -> { id, subject, html, target, scheduledAt, status, timeoutId }

// Initialize database tables
async function initDB() {
  if (!process.env.DATABASE_URL) {
    console.warn('[DB] DATABASE_URL not set — database features will be disabled.');
    return;
  }
  await pool.query(`
    CREATE TABLE IF NOT EXISTS submissions (
      id SERIAL PRIMARY KEY,
      type VARCHAR(20) NOT NULL,
      name VARCHAR(255),
      email VARCHAR(255),
      data JSONB NOT NULL,
      status VARCHAR(20) DEFAULT 'new',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS surveys (
      id SERIAL PRIMARY KEY,
      data JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS config (
      key VARCHAR(50) PRIMARY KEY,
      value JSONB NOT NULL
    );
    CREATE TABLE IF NOT EXISTS attendance (
      id SERIAL PRIMARY KEY,
      team_name VARCHAR(255) UNIQUE NOT NULL,
      status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, declined
      confirm_token VARCHAR(64) UNIQUE NOT NULL,
      confirmed_at TIMESTAMP WITH TIME ZONE,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
    CREATE TABLE IF NOT EXISTS certificates (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      hash VARCHAR(64) UNIQUE,
      signature VARCHAR(128),
      participant_name VARCHAR(255) NOT NULL,
      team_name VARCHAR(255) NOT NULL,
      project_name VARCHAR(255) DEFAULT '',
      university VARCHAR(255) DEFAULT '',
      certificate_type VARCHAR(20) DEFAULT 'participation',
      event_name VARCHAR(255) DEFAULT 'AI Krak Hack 2026',
      event_dates VARCHAR(100) DEFAULT '27-28 marca 2026',
      status VARCHAR(20) DEFAULT 'draft',
      approved_by VARCHAR(255),
      approved_at TIMESTAMP WITH TIME ZONE,
      issued_at TIMESTAMP WITH TIME ZONE,
      metadata JSONB DEFAULT '{}',
      submission_id INTEGER REFERENCES submissions(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS membership_applications (
      id SERIAL PRIMARY KEY,
      first_name VARCHAR(255) NOT NULL,
      last_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      university VARCHAR(255) DEFAULT '',
      field_of_study VARCHAR(255) DEFAULT '',
      year_or_status VARCHAR(50) DEFAULT '',
      is_wsei BOOLEAN DEFAULT false,
      attend_meetings BOOLEAN DEFAULT false,
      attend_in_person BOOLEAN DEFAULT false,
      monthly_hours INTEGER DEFAULT 5,
      competencies JSONB DEFAULT '{}',
      what_you_bring TEXT DEFAULT '',
      expectations TEXT DEFAULT '',
      values_resonance TEXT DEFAULT '',
      engagement_types TEXT[] DEFAULT '{}',
      status VARCHAR(30) DEFAULT 'nowe',
      admin_notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS team_projects (
      id SERIAL PRIMARY KEY,
      edition_number INTEGER NOT NULL DEFAULT 3,
      slug VARCHAR(100) NOT NULL,
      name VARCHAR(255) NOT NULL,
      placement INTEGER,
      placement_label VARCHAR(100),
      special_mention VARCHAR(255),
      challenge VARCHAR(50) NOT NULL,
      members TEXT[] NOT NULL DEFAULT '{}',
      university VARCHAR(255) DEFAULT '',
      project_name VARCHAR(255) DEFAULT '',
      short_description TEXT DEFAULT '',
      full_description TEXT[] DEFAULT '{}',
      key_features TEXT[] DEFAULT '{}',
      technologies TEXT[] DEFAULT '{}',
      images JSONB DEFAULT '[]',
      presentation_file VARCHAR(500) DEFAULT '',
      presentation_slides JSONB DEFAULT '[]',
      edit_token VARCHAR(64) UNIQUE,
      edit_token_created_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(edition_number, slug)
    );
    CREATE TABLE IF NOT EXISTS jury_scores (
      id SERIAL PRIMARY KEY,
      edition_number INTEGER NOT NULL DEFAULT 3,
      team_project_id INTEGER REFERENCES team_projects(id) ON DELETE SET NULL,
      team_slug VARCHAR(100) NOT NULL,
      challenge VARCHAR(50) NOT NULL,
      juror_name VARCHAR(255) DEFAULT 'Jury',
      innovation INTEGER DEFAULT 0,
      technical_value INTEGER DEFAULT 0,
      usefulness INTEGER DEFAULT 0,
      presentation_quality INTEGER DEFAULT 0,
      notes TEXT DEFAULT '',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(edition_number, team_slug, juror_name)
    );
    CREATE TABLE IF NOT EXISTS edition_config (
      id SERIAL PRIMARY KEY,
      edition_number INTEGER UNIQUE NOT NULL,
      name VARCHAR(255) DEFAULT '',
      status VARCHAR(50) DEFAULT 'active',
      visible_placements INTEGER DEFAULT 2,
      show_scores BOOLEAN DEFAULT true,
      challenges JSONB DEFAULT '[]',
      special_mentions JSONB DEFAULT '[]',
      jury_members JSONB DEFAULT '[]',
      scoring_categories JSONB DEFAULT '[]',
      max_score_per_category INTEGER DEFAULT 20,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  // Add email_last_sent_at column if it doesn't exist (migration)
  await pool.query(`
    ALTER TABLE team_projects ADD COLUMN IF NOT EXISTS email_last_sent_at TIMESTAMP WITH TIME ZONE;
  `).catch(() => {}); // ignore if table doesn't exist yet

  // Add edit_password column (migration)
  await pool.query(`
    ALTER TABLE team_projects ADD COLUMN IF NOT EXISTS edit_password VARCHAR(20);
  `).catch(() => {});

  // Add edit_history column (migration)
  await pool.query(`
    ALTER TABLE team_projects ADD COLUMN IF NOT EXISTS edit_history JSONB DEFAULT '[]';
  `).catch(() => {});

  // Add scores_json to jury_scores for dynamic scoring categories (future editions)
  await pool.query(`
    ALTER TABLE jury_scores ADD COLUMN IF NOT EXISTS scores_json JSONB DEFAULT '{}';
    ALTER TABLE jury_scores ADD COLUMN IF NOT EXISTS jury_access_id INTEGER;
    ALTER TABLE jury_scores ADD COLUMN IF NOT EXISTS private_notes TEXT DEFAULT '';
  `).catch(() => {});

  // Auto-seed team_projects from teams-seed.json if table is empty
  try {
    const countResult = await pool.query('SELECT COUNT(*) FROM team_projects');
    if (parseInt(countResult.rows[0].count) === 0) {
      const seedPath = path.join(__dirname, 'src/data/editions/edition-2026/teams-seed.json');
      if (fs.existsSync(seedPath)) {
        const teams = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
        for (const team of teams) {
          const token = crypto.randomBytes(16).toString('hex');
          const password = Math.random().toString(36).slice(2, 8).toUpperCase();
          await pool.query(
            `INSERT INTO team_projects (
              edition_number, slug, name, placement, placement_label, special_mention, challenge,
              members, university, project_name, short_description, full_description,
              key_features, technologies, images, presentation_file, presentation_slides,
              edit_token, edit_token_created_at, edit_password
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,NOW(),$19)
            ON CONFLICT (edition_number, slug) DO NOTHING`,
            [
              team.edition_number || 3, team.slug, team.name, team.placement || null,
              team.placement_label || null, team.special_mention || null, team.challenge,
              team.members, team.university || '', team.project_name || '',
              team.short_description || '', team.full_description || [],
              team.key_features || [], team.technologies || [],
              JSON.stringify(team.images || []), team.presentation_file || '',
              JSON.stringify(team.presentation_slides || []), token, password
            ]
          );
        }
        console.log(`[DB] Auto-seeded ${teams.length} teams from teams-seed.json`);
      }
    }
  } catch (err) {
    console.error('[DB] Auto-seed team_projects failed:', err);
  }

  // Auto-seed edition_config for edition 3
  try {
    const cfgCheck = await pool.query('SELECT id FROM edition_config WHERE edition_number = 3 LIMIT 1');
    if (cfgCheck.rows.length === 0) {
      await pool.query(`
        INSERT INTO edition_config (edition_number, name, status, visible_placements, show_scores, challenges, special_mentions, scoring_categories, max_score_per_category)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [3, 'AI Krak Hack 2026', 'active', 2, true,
        JSON.stringify([
          { slug: 'geospatial', label: 'Smart Infrastructure Challenge', color: 'blue' },
          { slug: 'process-automation', label: 'Process-to-Automation Copilot', color: 'purple' }
        ]),
        JSON.stringify([
          { teamSlug: 'konrad-podstawski', award: 'Wyróżnienie specjalne', reason: 'Jedyny solowy uczestnik hackathonu — 3. miejsce z wynikiem 67/80, najwyższa innowacyjność (19/20)' }
        ]),
        JSON.stringify([
          { id: 'innovation', label: 'Innowacyjność', maxScore: 20 },
          { id: 'technicalValue', label: 'Wartość techniczna', maxScore: 20 },
          { id: 'usefulness', label: 'Użyteczność', maxScore: 20 },
          { id: 'presentationQuality', label: 'Jakość prezentacji', maxScore: 20 }
        ]),
        20
      ]);
      console.log('[DB] Auto-seeded edition_config for edition 3');
    }
  } catch (err) {
    console.error('[DB] Auto-seed edition_config failed:', err);
  }

  // Auto-seed jury_scores from results.json for edition 3
  try {
    const juryCheck = await pool.query('SELECT id FROM jury_scores WHERE edition_number = 3 LIMIT 1');
    if (juryCheck.rows.length === 0) {
      const resultsPath = path.join(__dirname, 'src/data/editions/edition-2026/results.json');
      if (fs.existsSync(resultsPath)) {
        const resultsData = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
        let count = 0;
        for (const [challengeSlug, challenge] of Object.entries(resultsData.challenges)) {
          for (const r of challenge.results) {
            const tpResult = await pool.query(
              'SELECT id FROM team_projects WHERE slug = $1 AND edition_number = 3 LIMIT 1',
              [r.teamId]
            );
            const teamProjectId = tpResult.rows[0]?.id || null;
            await pool.query(
              `INSERT INTO jury_scores (edition_number, team_project_id, team_slug, challenge, juror_name, innovation, technical_value, usefulness, presentation_quality)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
               ON CONFLICT (edition_number, team_slug, juror_name) DO NOTHING`,
              [3, teamProjectId, r.teamId, challengeSlug, 'Jury',
               r.scores.innovation, r.scores.technicalValue, r.scores.usefulness, r.scores.presentationQuality]
            );
            count++;
          }
        }
        console.log(`[DB] Auto-seeded ${count} jury scores from results.json`);
      }
    }
  } catch (err) {
    console.error('[DB] Auto-seed jury_scores failed:', err);
  }

  // Auto-sync teams from submissions if they don't exist in attendance
  try {
    const teamsResult = await pool.query(
      "SELECT DISTINCT data->>'teamName' as team_name FROM submissions WHERE type = 'participant' AND data->>'teamName' IS NOT NULL AND data->>'teamName' != ''"
    );
    for (const row of teamsResult.rows) {
      await pool.query(
        "INSERT INTO attendance (team_name, confirm_token) VALUES ($1, $2) ON CONFLICT (team_name) DO NOTHING",
        [row.team_name, crypto.randomBytes(16).toString('hex')]
      );
    }
    console.log('[DB] Attendance sync completed');
  } catch (err) {
    console.error('[DB] Attendance sync failed:', err);
  }
  
  console.log('[DB] Tables initialized');
}

app.use(express.json());
// Serve static files BUT skip index.html (we inject config into it dynamically)
app.use(express.static(path.join(__dirname, 'dist'), { index: false }));

// ─── Helpers ───────────────────────────────────────────────

async function sendResendEmail(to, subject, html) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[Email] RESEND_API_KEY not set, skipping email to:', to);
    return false;
  }
  const fromAddr = process.env.EMAIL_FROM || 'AI Krak Hack Team <onboarding@resend.dev>';
  console.log(`[Email] Sending to: ${to}, from: ${fromAddr}, subject: ${subject}`);
  try {
    const payload = { from: fromAddr, to, subject, html };
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      console.error('[Email] Resend API error:', res.status, JSON.stringify(data));
      return false;
    }
    console.log('[Email] Sent successfully, id:', data.id);
    return true;
  } catch (err) {
    console.error('[Email] Network/fetch error:', err.message || err);
    return false;
  }
}

async function sendSMSAPI(to, message, useFrom = true) {
  const token = (process.env.SMS_GATE_TOKEN || '').trim();
  const from = (process.env.SMS_SENDER || 'AIKrakHack').trim();
  
  if (!token) {
    console.warn('[SMS] SMS_GATE_TOKEN not set, skipping SMS to:', to);
    return { success: false, error: 'Brak tokenu SMS_GATE_TOKEN w konfiguracji serwera.' };
  }

  // Format numbers to 48XXXXXXXXX
  const recipients = (Array.isArray(to) ? to : [to])
    .map(num => {
      let clean = String(num || '').replace(/\D/g, '');
      if (clean.length === 9) clean = '48' + clean;
      return clean;
    })
    .filter(n => n.length >= 9) // basic validation
    .join(',');

  if (!recipients) {
    console.warn('[SMS] No valid recipients found');
    return { success: false, error: 'Nieprawidłowy numer telefonu.' };
  }
  
  try {
    const params = new URLSearchParams();
    params.append('to', recipients);
    params.append('message', message);
    if (useFrom && from && from !== '' && from.toLowerCase() !== 'default') {
      params.append('from', from);
    }
    params.append('format', 'json');
    params.append('encoding', 'utf-8');
    params.append('normalize', '1'); // Replace Polish chars with standard ones (ą->a, etc.)
    params.append('details', '1');   // Get more details in response

    console.log(`[SMS] Sending request to SMSAPI (from: ${useFrom ? from : 'default'})...`, { to: recipients });

    const res = await fetch('https://api.smsapi.pl/sms.do', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const bodyText = await res.text();
    let data = {};
    try {
      data = JSON.parse(bodyText);
    } catch (e) {
      console.error('[SMS] Failed to parse SMSAPI response as JSON:', bodyText);
      return { success: false, error: `Błąd odpowiedzi bramki: ${bodyText.slice(0, 50)}` };
    }

    // Auto-fallback if sender name is invalid (error 14)
    if (useFrom && (data.error === 14 || data.message?.includes('Invalid from field'))) {
      console.warn(`[SMS] Sender ID "${from}" is not active. Falling back to default sender...`);
      return sendSMSAPI(to, message, false); // Recursive call without 'from'
    }

    if (!res.ok || data.error) {
      const errMsg = data.message || (data.error ? `Kod błędu: ${data.error}` : 'Błąd HTTP ' + res.status);
      console.error('[SMS] SMSAPI error response:', res.status, JSON.stringify(data));
      return { success: false, error: errMsg };
    }

    // Check individual message status if available
    const firstMsg = data.list?.[0];
    if (firstMsg && firstMsg.error) {
       console.error('[SMS] SMSAPI individual error:', firstMsg.error);
       return { success: false, error: `Błąd numeru: ${firstMsg.error}` };
    }
    
    console.log('[SMS] Sent successfully to:', recipients, 'Internal ID:', firstMsg?.id);
    return { success: true, sender: useFrom ? from : 'default' };
  } catch (err) {
    console.error('[SMS] SMS Send Exception:', err.message || err);
    return { success: false, error: `Wyjątek sieciowy: ${err.message || 'Nieznany błąd'}` };
  }
}

// Unified event notification — sends to Teams webhook + admin email log
async function notifyEvent(title, details, color = '0076D7') {
  const adminEmail = process.env.ADMIN_EMAIL || 'knai@wsei.edu.pl';
  const timestamp = new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' });

  // Teams notification
  sendTeamsNotification({
    title,
    text: details,
    themeColor: color,
  });

  // Email log to admin
  try {
    const html = `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #${color}; color: white; padding: 16px 20px; border-radius: 12px 12px 0 0;">
    <strong>${title}</strong>
  </div>
  <div style="background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px; color: #334155; font-size: 14px; line-height: 1.6;">
    ${details.replace(/\n/g, '<br>')}
    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 16px 0;">
    <p style="font-size: 12px; color: #94a3b8;">${timestamp} · AI Krak Hack Event Log</p>
  </div>
</div>`;
    await sendResendEmail(adminEmail, `[Event] ${title}`, html);
  } catch (e) {
    console.error('[Notify] Email log failed:', e);
  }
}

async function sendTeamsNotification(message) {
  const webhookUrl = process.env.TEAMS_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn('[Teams] TEAMS_WEBHOOK_URL not set, skipping.');
    return false;
  }
  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "@type": "MessageCard",
        "@context": "http://schema.org/extensions",
        "themeColor": message.themeColor || "0076D7",
        "summary": message.title,
        "title": message.title,
        "text": message.text,
        "sections": message.sections
      })
    });
    return res.ok;
  } catch (err) {
    console.error('[Teams] Notification failed:', err);
    return false;
  }
}

const FIELD_LABELS = {
  firstName: 'Imię', lastName: 'Nazwisko', email: 'Email', phone: 'Telefon',
  university: 'Uczelnia', studyField: 'Kierunek', yearOfStudy: 'Rok studiów',
  experience: 'Doświadczenie', motivation: 'Motywacja', skills: 'Umiejętności',
  teamPreference: 'Zespół', teamName: 'Nazwa zespołu', dietaryRestrictions: 'Dieta',
  companyName: 'Nazwa firmy', contactPerson: 'Osoba kontaktowa', position: 'Stanowisko',
  linkedIn: 'LinkedIn', portfolio: 'Portfolio', additionalNotes: 'Uwagi',
  acceptRules: 'Regulamin', company: 'Firma', availability: 'Dostępność',
  expertise: 'Ekspertyza', previousMentoring: 'Doświadczenie mentorskie', message: 'Wiadomość',
  consentMarketingEmail: 'Zgoda E-mail', consentMarketingPhone: 'Zgoda Telefon',
  consentMarketingSms: 'Zgoda SMS/MMS', consentMarketingChat: 'Zgoda Komunikatory',
  consentImage: 'Zgoda Wizerunek', otherSkill: 'Inne umiejętności'
};

function formatKey(key) {
  return FIELD_LABELS[key] || key;
}

function formatValue(value) {
  if (Array.isArray(value)) return value.join(', ');
  if (value === true) return 'TAK';
  if (value === false) return 'NIE';
  return String(value || '-');
}

function requireAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Brak autoryzacji' });
  }
  const token = auth.split(' ')[1];
  if (!adminTokens.has(token)) {
    return res.status(401).json({ error: 'Nieprawidłowy token' });
  }
  next();
}

// ─── API Routes ────────────────────────────────────────────

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || 'MakaPaka2026';

  if (password === adminPassword) {
    const token = crypto.randomUUID();
    adminTokens.add(token);
    res.json({ success: true, token });
  } else {
    res.status(401).json({ error: 'Nieprawidłowe hasło' });
  }
});

// Verify admin token
app.get('/api/admin/verify', requireAdmin, (req, res) => {
  res.json({ valid: true });
});

// Submit form (public)
app.post('/api/submissions', async (req, res) => {
  try {
    const { type, data } = req.body;
    if (!type || !data) {
      return res.status(400).json({ error: 'Brak wymaganych pól: type, data' });
    }

    const name = data.firstName
      ? `${data.firstName} ${data.lastName || ''}`.trim()
      : data.companyName || data.contactPerson || 'Nieznany';
    const email = data.email || '';

    const result = await pool.query(
      'INSERT INTO submissions (type, name, email, data, status) VALUES ($1, $2, $3, $4, $5) RETURNING id, created_at',
      [type, name, email, data, 'new']
    );

    const submissionId = result.rows[0].id;

    // ── Async notifications (don't block the response) ──

    const typeLabel = { participant: 'Uczestnik', mentor: 'Mentor', company: 'Partner/Sponsor' }[type] || type;

    // Teams notification
    const csvKeys = Object.keys(data);
    const csvHeaders = csvKeys.join(';');
    const csvValues = csvKeys.map(k => {
      const val = data[k];
      const str = Array.isArray(val) ? val.join(', ') : String(val ?? '');
      return `"${str.replace(/"/g, '""')}"`;
    }).join(';');

    sendTeamsNotification({
      title: `🚨 Nowe zgłoszenie: ${typeLabel}`,
      text: `Otrzymano nową aplikację od: **${name}**\n\n### 📝 CSV Dump:\n\`\`\`csv\n${csvHeaders}\n${csvValues}\n\`\`\``,
      themeColor: type === 'participant' ? '00FFFF' : (type === 'mentor' ? 'FF00FF' : '00FF00'),
      sections: [{
        activityTitle: 'Szczegóły zgłoszenia',
        activitySubtitle: new Date().toLocaleString('pl-PL'),
        markdown: true,
        facts: Object.entries(data)
          .filter(([, v]) => v !== undefined && v !== null && v !== '')
          .map(([key, value]) => ({
            name: formatKey(key),
            value: Array.isArray(value) ? value.join(', ') : String(value === true ? 'TAK ✅' : (value === false ? 'NIE ❌' : value))
          }))
      }]
    }).catch(err => console.error('[Teams] Error:', err));

    // Email confirmation to user
    if (email) {
      const typeNamesPl = { participant: 'uczestnika', mentor: 'mentora', company: 'partnera' };
      sendResendEmail(
        email,
        'Potwierdzenie zgłoszenia - AI Krak Hack 2026',
        `<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #1f2937; background: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">AI KRAK HACK 2026</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">27-28 Marca 2026 &bull; Kraków</p>
          </div>

          <div style="padding: 32px 30px;">
            <!-- Greeting -->
            <p style="font-size: 16px; margin: 0 0 16px;">Cześć <strong>${name}</strong>!</p>
            <p style="margin: 0 0 16px;">Dziękujemy za zgłoszenie się jako <strong>${typeNamesPl[type] || type}</strong>. Twoje zgłoszenie <strong>#${submissionId}</strong> zostało zarejestrowane.</p>
            <p style="margin: 0 0 24px;">Nasz zespół organizacyjny skontaktuje się z Tobą w ciągu kilku dni z dalszymi informacjami.</p>

            <!-- Event Details Box -->
            <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 24px; margin: 0 0 24px;">
              <h2 style="margin: 0 0 16px; font-size: 18px; color: #0369a1;">Informacje o wydarzeniu</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; font-weight: 600; color: #374151; width: 120px; vertical-align: top;">Data:</td>
                  <td style="padding: 6px 0; color: #4b5563;">27-28 marca 2026 (piątek-sobota)</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: 600; color: #374151; vertical-align: top;">Miejsce:</td>
                  <td style="padding: 6px 0; color: #4b5563;">Kraków (szczegóły lokalizacji podamy wkrótce)</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: 600; color: #374151; vertical-align: top;">Koszt:</td>
                  <td style="padding: 6px 0; color: #4b5563;">Udział jest <strong>całkowicie darmowy!</strong></td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: 600; color: #374151; vertical-align: top;">Organizator:</td>
                  <td style="padding: 6px 0; color: #4b5563;">Koło Naukowe AI Possibilities Lab, WSEI Kraków</td>
                </tr>
              </table>
            </div>

            <!-- Schedule -->
            <div style="background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 12px; padding: 24px; margin: 0 0 24px;">
              <h2 style="margin: 0 0 16px; font-size: 18px; color: #7c3aed;">Harmonogram</h2>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                  <td style="padding: 5px 0; color: #6b21a8; font-weight: 600; width: 50%;">pt 20.03, 18:00</td>
                  <td style="padding: 5px 0; color: #4b5563;">Materiały przygotowawcze</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #6b21a8; font-weight: 600;">pt 27.03, 18:00</td>
                  <td style="padding: 5px 0; color: #4b5563;">START - udostępnienie zadań</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #6b21a8; font-weight: 600;">sb 28.03, 09:00</td>
                  <td style="padding: 5px 0; color: #4b5563;">Praca na uczelni z mentorami</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #6b21a8; font-weight: 600;">sb 28.03, 13:00</td>
                  <td style="padding: 5px 0; color: #4b5563;">Obiad + mentoring</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #6b21a8; font-weight: 600;">sb 28.03, 17:30</td>
                  <td style="padding: 5px 0; color: #4b5563;">Prezentacje finałowe</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #6b21a8; font-weight: 600;">sb 28.03, 19:00</td>
                  <td style="padding: 5px 0; color: #4b5563;">Knowledge sharing</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #6b21a8; font-weight: 600;">sb 28.03, 20:00</td>
                  <td style="padding: 5px 0; color: #4b5563;">Wyniki i nagrody</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #6b21a8; font-weight: 600;">sb 28.03, 21:00</td>
                  <td style="padding: 5px 0; color: #4b5563;">Afterparty!</td>
                </tr>
              </table>
            </div>

            <!-- Challenges -->
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 24px; margin: 0 0 24px;">
              <h2 style="margin: 0 0 16px; font-size: 18px; color: #15803d;">Wyzwania</h2>
              <p style="margin: 0 0 12px; font-size: 14px;"><strong>1. Smart Infrastructure Challenge</strong> — analiza danych geoprzestrzennych, optymalizacja tras i modelowanie przestrzenne (GIS, Python, PostGIS, ML)</p>
              <p style="margin: 0; font-size: 14px;"><strong>2. Process-to-Automation Copilot</strong> — od danych procesowych do automatyzacji workflow (Process Mining, BPMN, AI Agents, Camunda)</p>
            </div>

            <!-- What to bring -->
            <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 24px; margin: 0 0 24px;">
              <h2 style="margin: 0 0 12px; font-size: 18px; color: #b45309;">Co zabrać ze sobą?</h2>
              <p style="margin: 0; font-size: 14px; color: #4b5563;">Laptop, ładowarkę, dobre nastawienie i chęć do nauki. Jedzenie, napoje i dostęp do wszystkich zasobów zapewniamy my!</p>
            </div>

            <!-- CTA -->
            <div style="text-align: center; margin: 32px 0 24px;">
              <a href="https://krakhack.info" style="display: inline-block; background: linear-gradient(135deg, #06b6d4, #3b82f6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 14px;">Odwiedź stronę wydarzenia</a>
            </div>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
            <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px;">Pytania? Napisz na: <a href="mailto:knai@wsei.edu.pl" style="color: #06b6d4;">knai@wsei.edu.pl</a></p>
            <p style="color: #6b7280; font-size: 13px; margin: 0;">Pozdrawiamy,<br><strong>Zespół AI Krak Hack</strong><br>AI Possibilities Lab &bull; WSEI Kraków</p>
          </div>
        </div>`
      ).catch(err => console.error('[Email] User confirmation error:', err.message || err));

      // Email notification to admin
      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail) {
        sendResendEmail(
          adminEmail,
          `Nowe zgłoszenie ${typeLabel} - ${name}`,
          `<div style="font-family: Arial, sans-serif;">
            <h2>Nowe zgłoszenie: ${typeLabel}</h2>
            <p><strong>Od:</strong> ${name} (${email})</p>
            <p><strong>ID:</strong> #${submissionId}</p>
            <h3>Dane zgłoszenia:</h3>
            <table style="border-collapse: collapse; width: 100%;">
              ${Object.entries(data).map(([k, v]) =>
                `<tr><td style="padding: 6px 10px; border: 1px solid #e5e7eb; font-weight: bold; background: #f9fafb;">${formatKey(k)}</td><td style="padding: 6px 10px; border: 1px solid #e5e7eb;">${formatValue(v)}</td></tr>`
              ).join('')}
            </table>
          </div>`
        ).catch(err => console.error('[Email] Admin notification error:', err));
      }
    }

    res.json({ success: true, id: submissionId });
  } catch (err) {
    console.error('[API] Submission error:', err);
    res.status(500).json({ error: 'Błąd serwera przy zapisie zgłoszenia' });
  }
});

// Get team names for autocomplete (public)
app.get('/api/teams', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT DISTINCT data->>'teamName' as team_name FROM submissions WHERE type = 'participant' AND data->>'teamName' IS NOT NULL AND data->>'teamName' != '' ORDER BY team_name"
    );
    res.json(result.rows.map(r => r.team_name));
  } catch (err) {
    console.error('[API] Teams error:', err);
    res.json([]);
  }
});

// Get submissions (admin only)
app.get('/api/submissions', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM submissions ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('[API] Fetch submissions error:', err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Update submission status (admin only)
app.patch('/api/submissions/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, data, name, email } = req.body;

    const updates = [];
    const params = [];
    let paramIdx = 1;

    if (status) { updates.push(`status = $${paramIdx++}`); params.push(status); }
    if (data) { updates.push(`data = $${paramIdx++}::jsonb`); params.push(JSON.stringify(data)); }
    if (name) { updates.push(`name = $${paramIdx++}`); params.push(name); }
    if (email) { updates.push(`email = $${paramIdx++}`); params.push(email); }

    if (updates.length === 0) return res.status(400).json({ error: 'Brak danych do aktualizacji' });

    params.push(id);
    const result = await pool.query(
      `UPDATE submissions SET ${updates.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
      params
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Nie znaleziono zgłoszenia' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[API] Update submission error:', err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Submit survey (public, IP rate-limited: 1 per IP per 24h)
app.post('/api/surveys', async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) return res.status(400).json({ error: 'Brak danych ankiety' });

    // IP rate limiting
    const clientIp = req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
    const lastSubmit = surveyIpMap.get(clientIp);
    const DAY_MS = 24 * 60 * 60 * 1000;
    if (lastSubmit && (Date.now() - lastSubmit) < DAY_MS) {
      return res.status(429).json({ error: 'Ankieta została już wysłana z tego adresu. Możesz wysłać kolejną za 24 godziny.' });
    }

    const result = await pool.query(
      'INSERT INTO surveys (data) VALUES ($1) RETURNING id, created_at',
      [data]
    );

    surveyIpMap.set(clientIp, Date.now());
    // Clean old entries periodically
    if (surveyIpMap.size > 1000) {
      for (const [ip, ts] of surveyIpMap) {
        if (Date.now() - ts > DAY_MS) surveyIpMap.delete(ip);
      }
    }

    // Notify about new survey
    notifyEvent(
      '📋 Nowa ankieta',
      `Ocena: ${data.rating || '?'}/5\nWydarzenie: ${data.event || '?'}\nPlusy: ${(data.pros || '').slice(0, 100)}\nMinusy: ${(data.cons || '').slice(0, 100)}`,
      '06b6d4'
    );

    res.json({ success: true, id: result.rows[0].id });
  } catch (err) {
    console.error('[API] Survey error:', err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Get surveys (admin only)
/** @type {import('express').RequestHandler} */
app.get('/api/surveys', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM surveys ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('[API] Fetch surveys error:', err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Site mode config (public — tells frontend which mode we're in)
app.get('/api/config/site', (req, res) => {
  res.json({
    mode: process.env.SITE_MODE || 'hackathon',
    hackathonUrl: process.env.HACKATHON_URL || 'https://krakhack.info',
    labUrl: process.env.LAB_URL || (process.env.BASE_URL || 'http://localhost:5175'),
  });
});

// Get config (public for some keys, admin for others)
app.get('/api/config/:key', async (req, res) => {
  const { key } = req.params;
  if (!process.env.DATABASE_URL) {
    if (key === 'challenge_resources') {
      res.json({});
    } else {
      res.status(404).json({ error: 'DB not connected' });
    }
    return;
  }
  try {
    const result = await pool.query('SELECT value FROM config WHERE key = $1', [key]);
    if (result.rows.length === 0) {
      if (key === 'challenge_resources') {
        res.json({});
      } else {
        res.status(404).json({ error: 'Nie znaleziono konfiguracji' });
      }
      return;
    }
    res.json(result.rows[0].value);
  } catch (err) {
    console.error('[API] Get config error:', err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Update config (admin only)
app.post('/api/config/:key', requireAdmin, async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    await pool.query(
      'INSERT INTO config (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
      [key, value]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('[API] Update config error:', err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Mailing endpoints (admin only)
app.post('/api/admin/mail/send', requireAdmin, async (req, res) => {
  try {
    const { target, email, subject, message, html, useTemplate } = req.body;
    const bodyContent = message || html;
    if (!bodyContent || !subject) {
      res.status(400).json({ error: 'Brak tematu lub treści' });
      return;
    }

    // Fetch challenge resources for placeholders
    let challengeResources = {};
    try {
      if (process.env.DATABASE_URL) {
        const configResult = await pool.query('SELECT value FROM config WHERE key = $1', ['challenge_resources']);
        if (configResult.rows.length > 0) {
          challengeResources = configResult.rows[0].value;
        }
      }
    } catch (e) {
      console.error('[Mailing] Error fetching challenge resources:', e);
    }

    // Replace placeholders in message
    let finalMessage = bodyContent;
    /** @type {any} */
    const cr = challengeResources || {};
    
    // Normalize keys (handle both hyphen and underscore from different UI versions)
    const geo = cr.geospatial || cr.challenge_1 || {};
    const proc = cr['process-automation'] || cr.process_automation || cr.challenge_2 || {};

    const placeholders = {
      // Challenge 1 (Geospatial / Smart Infrastructure)
      '{{challenge_1_name}}': geo.name || 'Smart Infrastructure',
      '{{challenge_1_url}}': geo.materials || geo.url || '#',
      '{{challenge_1_materials_url}}': geo.materials || geo.url || '#',
      '{{challenge_1_task_url}}': geo.task || geo.task_url || '#',
      '{{challenge_1_page_url}}': 'https://krakhack.info/zadania/infrasruktura',
      
      // Challenge 2 (Process Automation / Mining)
      '{{challenge_2_name}}': proc.name || 'Process-to-Automation Copilot',
      '{{challenge_2_url}}': proc.materials || proc.url || '#',
      '{{challenge_2_materials_url}}': proc.materials || proc.url || '#',
      '{{challenge_2_task_url}}': proc.task || proc.task_url || '#',
      '{{challenge_2_page_url}}': 'https://krakhack.info/zadania/asystent',
      '{{year}}': '2026'
    };

    Object.entries(placeholders).forEach(([key, val]) => {
      finalMessage = finalMessage.split(key).join(val);
    });

    // Prepare HTML content
    let htmlContent = finalMessage.replace(/\n/g, '<br>');
    if (useTemplate === 'challenge_ready') {
      htmlContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px; background-color: #ffffff;">
          <div style="background: linear-gradient(135deg, #06b6d4, #3b82f6); padding: 30px; border-radius: 10px 10px 0 0; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">AI KRAK HACK 2026</h1>
          </div>
          <div style="padding: 20px; color: #333;">
            <p style="font-size: 16px; line-height: 1.6;">${finalMessage.replace(/\n/g, '<br>')}</p>
            <div style="margin: 30px 0; text-align: center;">
              <a href="${placeholders['{{challenge_1_url}}']}" style="display: inline-block; padding: 12px 24px; background-color: #06b6d4; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 5px;">${placeholders['{{challenge_1_name}}']} &rarr;</a>
              <a href="${placeholders['{{challenge_2_url}}']}" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 5px;">${placeholders['{{challenge_2_name}}']} &rarr;</a>
            </div>
          </div>
          <p style="font-size: 13px; color: #666; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
            Pozdrawiamy,<br>Zespół AI Krak Hack ${placeholders['{{year}}']}
          </p>
        </div>
      `;
    }

    if (target === 'single') {
      if (!email) {
        res.status(400).json({ error: 'Brak adresu email' });
        return;
      }
      const success = await sendResendEmail(email, subject, htmlContent);
      res.json({ success });
      return;
    } else if (target === 'all' || target === 'attendance' || target === 'participant' || target === 'mentor' || target === 'company') {
      // Fetch target emails and personal data for placeholders
      let queryStr = "";
      const queryParams = [];

      if (target === 'attendance') {
        // Special query to join with attendance table for tokens
        queryStr = `
          SELECT DISTINCT ON (s.email) 
            s.email, 
            a.confirm_token, 
            s.data->>'teamName' as team_name 
          FROM submissions s 
          JOIN attendance a ON s.data->>'teamName' = a.team_name 
          WHERE s.email IS NOT NULL AND s.email != '' AND s.type = 'participant'
        `;
      } else {
        queryStr = "SELECT DISTINCT ON (email) email FROM submissions WHERE email IS NOT NULL AND email != ''";
        if (target !== 'all') {
          queryStr += " AND type = $1";
          queryParams.push(target);
        }
      }
      
      const result = await pool.query(queryStr, queryParams);
      const recipients = result.rows;

      console.log(`[Mailing] Sending personalized bulk email to ${recipients.length} recipients (target: ${target})`);

      // Batch send with personalization
      let sentCount = 0;
      const baseUrl = process.env.BASE_URL || 'https://krakhack.info';

      for (const recipient of recipients) {
        let personalizedHtml = htmlContent;
        
        // Replace per-recipient placeholders if they exist
        if (recipient.confirm_token) {
          const confirmUrl = `${baseUrl}/confirm/${recipient.confirm_token}`;
          personalizedHtml = personalizedHtml.split('{{confirm_url}}').join(confirmUrl);
        }
        if (recipient.team_name) {
          personalizedHtml = personalizedHtml.split('{{team_name}}').join(recipient.team_name);
        }

        const ok = await sendResendEmail(recipient.email, subject, personalizedHtml);
        if (ok) sentCount++;
      }

      notifyEvent('📧 Mass mailing wysłany', `"${subject}" — wysłano do ${sentCount}/${recipients.length} odbiorców (target: ${target})`, '6366f1');
      res.json({ success: true, sent: sentCount, total: recipients.length });
      return;
    }

    res.status(400).json({ error: 'Nieprawidłowy cel (target)' });
  } catch (err) {
    console.error('[Mailing] Massive send error:', err);
    res.status(500).json({ error: 'Błąd podczas wysyłki masowej' });
  }
});

// ─── Scheduled Mailing ────────────────────────────────────────

// Schedule a mailing for later (admin)
app.post('/api/admin/mail/schedule', requireAdmin, async (req, res) => {
  try {
    const { subject, html, target, scheduledAt, useTemplate } = req.body;
    if (!subject || !html || !scheduledAt) {
      return res.status(400).json({ error: 'Brak tematu, treści lub daty' });
    }

    const sendTime = new Date(scheduledAt);
    if (sendTime <= new Date()) {
      return res.status(400).json({ error: 'Data wysyłki musi być w przyszłości' });
    }

    const id = crypto.randomUUID();
    const delayMs = sendTime.getTime() - Date.now();

    const timeoutId = setTimeout(async () => {
      const entry = scheduledMailings.get(id);
      if (!entry || entry.status === 'cancelled') return;
      entry.status = 'sending';
      console.log(`[Scheduled] Sending mailing ${id}: "${subject}" to ${target}`);

      try {
        // Reuse the same logic as /api/admin/mail/send
        const fakeReq = { body: { target, subject, message: html, useTemplate }, headers: { authorization: `Bearer admin` } };
        let queryStr = "SELECT DISTINCT ON (email) email, data->>'firstName' as first_name, data->>'teamName' as team_name FROM submissions WHERE email IS NOT NULL AND email != ''";
        const queryParams = [];
        if (target !== 'all' && target !== 'attendance') {
          queryStr += " AND type = $1";
          queryParams.push(target);
        }
        const result = await pool.query(queryStr, queryParams);
        let sent = 0;
        for (const recipient of result.rows) {
          const ok = await sendResendEmail(recipient.email, subject, html);
          if (ok) sent++;
        }
        entry.status = 'sent';
        entry.sentCount = sent;
        console.log(`[Scheduled] Mailing ${id} sent to ${sent} recipients`);
        notifyEvent('📬 Zaplanowany mailing wysłany', `"${subject}" — wysłano do ${sent} odbiorców (target: ${target})`, '10b981');
      } catch (err) {
        entry.status = 'failed';
        entry.error = err.message;
        console.error(`[Scheduled] Mailing ${id} failed:`, err);
      }
    }, delayMs);

    scheduledMailings.set(id, {
      id, subject, target, scheduledAt: sendTime.toISOString(),
      status: 'scheduled', timeoutId, useTemplate,
      createdAt: new Date().toISOString(),
    });

    res.json({ success: true, id, scheduledAt: sendTime.toISOString() });
  } catch (err) {
    console.error('[Scheduled] Error:', err);
    res.status(500).json({ error: 'Błąd planowania wysyłki' });
  }
});

// List scheduled mailings (admin)
app.get('/api/admin/mail/scheduled', requireAdmin, async (req, res) => {
  const list = [...scheduledMailings.values()].map(({ timeoutId, ...rest }) => rest);
  res.json(list);
});

// Cancel scheduled mailing (admin)
app.delete('/api/admin/mail/scheduled/:id', requireAdmin, async (req, res) => {
  const entry = scheduledMailings.get(req.params.id);
  if (!entry) return res.status(404).json({ error: 'Nie znaleziono' });
  if (entry.status !== 'scheduled') return res.status(400).json({ error: 'Nie można anulować — status: ' + entry.status });
  clearTimeout(entry.timeoutId);
  entry.status = 'cancelled';
  res.json({ success: true });
});

// ─── Participant Deletion ─────────────────────────────────────

// Delete participant submission + cascade to certs (admin)
app.delete('/api/submissions/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    // Delete associated certificates first
    await pool.query('DELETE FROM certificates WHERE submission_id = $1', [id]);
    // Delete submission
    const result = await pool.query('DELETE FROM submissions WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Nie znaleziono' });
    res.json({ success: true, deleted: result.rows[0] });
  } catch (err) {
    console.error('[Admin] Delete submission error:', err);
    res.status(500).json({ error: 'Błąd usuwania' });
  }
});

// SMS endpoints (admin only)
app.post('/api/admin/sms/send', requireAdmin, async (req, res) => {
  try {
    const { target, phone, message } = req.body;
    console.log('[SMS] API Request received:', { target, phone: phone ? '***' : 'MISSING', message: message ? message.slice(0, 20) + '...' : 'MISSING' });

    if (!message) {
      return res.status(400).json({ success: false, error: 'Brak treści wiadomości' });
    }

    if (target === 'single') {
      if (!phone) {
        return res.status(400).json({ success: false, error: 'Brak numeru telefonu' });
      }
      const result = await sendSMSAPI(phone, message);
      return res.json(result);
    } else if (target === 'all') {
      if (!process.env.DATABASE_URL) {
        return res.status(500).json({ error: 'Baza danych niepodłączona' });
      }
      // Fetch numbers of participants (anyone who registered)
      const result = await pool.query("SELECT data FROM submissions WHERE type = 'participant'");
      const phones = result.rows
        .map(row => row.data.phone || row.data.phoneNumber)
        .filter(p => !!p);

      if (phones.length === 0) {
        return res.json({ success: true, count: 0, message: 'Brak numerów do wysyłki (upewnij się, że są zgłoszenia typu "participant")' });
      }

      const smsResult = await sendSMSAPI(phones, message);
      return res.json({ ...smsResult, count: phones.length });
    } else {
      res.status(400).json({ error: 'Nieprawidłowy cel wysyłki' });
    }
  } catch (err) {
    console.error('[SMS] API endpoint error:', err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Attendance Endpoints
app.get('/api/attendance', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.*,
        (
          SELECT jsonb_agg(DISTINCT (data->>'firstName' || ' ' || data->>'lastName'))
          FROM submissions s 
          WHERE s.data->>'teamName' = a.team_name AND s.type = 'participant'
        ) as members,
        (
          SELECT data->>'email'
          FROM submissions s 
          WHERE s.data->>'teamName' = a.team_name AND s.type = 'participant'
          LIMIT 1
        ) as contact_email
      FROM attendance a
      ORDER BY a.team_name
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('[API] Fetch attendance error:', err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

app.get('/api/attendance/token/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const result = await pool.query('SELECT * FROM attendance WHERE confirm_token = $1', [token]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Nieprawidłowy token' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[API] Fetch team by token error:', err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

app.post('/api/attendance/confirm', async (req, res) => {
  try {
    const { token, status } = req.body;
    if (!token || !status) return res.status(400).json({ error: 'Brak tokenu lub statusu' });
    if (!['confirmed', 'declined'].includes(status)) return res.status(400).json({ error: 'Nieprawidłowy status' });

    const result = await pool.query(
      'UPDATE attendance SET status = $1, confirmed_at = CASE WHEN $1 = \'confirmed\' THEN NOW() ELSE NULL END, updated_at = NOW() WHERE confirm_token = $2 RETURNING *',
      [status, token]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Nie znaleziono zespołu' });
    res.json({ success: true, team: result.rows[0] });
  } catch (err) {
    console.error('[API] Confirm attendance error:', err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// ─── Certificate Endpoints ─────────────────────────────────

const CERT_SECRET = process.env.CERTIFICATE_SECRET || 'dev-secret-change-me-in-production';

// List all certificates (admin)
app.get('/api/certificates', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM certificates ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('[Certs] List error:', err);
    res.status(500).json({ error: 'Blad serwera' });
  }
});

// Bulk-generate draft certificates from all registered participants
app.post('/api/certificates/generate', requireAdmin, async (req, res) => {
  try {
    const participants = await pool.query(`
      SELECT
        s.id as submission_id,
        s.data::jsonb->>'firstName' as first_name,
        s.data::jsonb->>'lastName' as last_name,
        s.data::jsonb->>'email' as email,
        s.data::jsonb->>'university' as university,
        s.data::jsonb->>'teamName' as team_name
      FROM submissions s
      WHERE s.type = 'participant'
        AND (s.data->>'excludedFromCerts')::text IS DISTINCT FROM 'true'
    `);

    let created = 0;
    let skipped = 0;

    for (const p of participants.rows) {
      const fullName = ((p.first_name || '') + ' ' + (p.last_name || '')).trim();
      if (!fullName || !p.team_name) { skipped++; continue; }

      // Check if certificate already exists for this participant+team
      const existing = await pool.query(
        'SELECT id FROM certificates WHERE participant_name = $1 AND team_name = $2',
        [fullName, p.team_name]
      );
      if (existing.rows.length > 0) {
        skipped++;
        continue;
      }

      await pool.query(
        `INSERT INTO certificates (participant_name, team_name, university, submission_id)
         VALUES ($1, $2, $3, $4)`,
        [fullName, p.team_name, p.university || '', p.submission_id]
      );
      created++;
    }

    res.json({ success: true, created, skipped });
  } catch (err) {
    console.error('[Certs] Generate error:', err);
    res.status(500).json({ error: 'Blad generowania certyfikatow' });
  }
});

// Get single certificate (admin)
app.get('/api/certificates/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM certificates WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Nie znaleziono certyfikatu' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[Certs] Get error:', err);
    res.status(500).json({ error: 'Blad serwera' });
  }
});

// Update certificate data (admin)
app.patch('/api/certificates/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { participant_name, team_name, project_name, university, certificate_type, metadata } = req.body;

    const result = await pool.query(
      `UPDATE certificates SET
        participant_name = COALESCE($1, participant_name),
        team_name = COALESCE($2, team_name),
        project_name = COALESCE($3, project_name),
        university = COALESCE($4, university),
        certificate_type = COALESCE($5, certificate_type),
        metadata = COALESCE($6, metadata),
        updated_at = NOW()
      WHERE id = $7 RETURNING *`,
      [participant_name, team_name, project_name, university, certificate_type, metadata ? JSON.stringify(metadata) : null, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Nie znaleziono certyfikatu' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[Certs] Update error:', err);
    res.status(500).json({ error: 'Blad serwera' });
  }
});

// Approve certificate (admin)
app.post('/api/certificates/:id/approve', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE certificates SET status = 'approved', approved_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND status = 'draft' RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) return res.status(400).json({ error: 'Certyfikat nie jest w statusie draft' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[Certs] Approve error:', err);
    res.status(500).json({ error: 'Blad serwera' });
  }
});

// Issue certificate — signs it cryptographically (admin)
app.post('/api/certificates/:id/issue', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const certResult = await pool.query('SELECT * FROM certificates WHERE id = $1', [id]);
    if (certResult.rows.length === 0) return res.status(404).json({ error: 'Nie znaleziono certyfikatu' });

    const cert = certResult.rows[0];
    if (cert.status !== 'approved') {
      return res.status(400).json({ error: 'Certyfikat musi byc zatwierdzony (approved) przed wydaniem' });
    }

    const signableData = extractSignableFields(cert);
    const hash = createCertificateHash(signableData, CERT_SECRET);
    const signature = signCertificate(signableData, hash, CERT_SECRET);

    const result = await pool.query(
      `UPDATE certificates SET hash = $1, signature = $2, status = 'issued', issued_at = NOW(), updated_at = NOW()
       WHERE id = $3 RETURNING *`,
      [hash, signature, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[Certs] Issue error:', err);
    res.status(500).json({ error: 'Blad wydawania certyfikatu' });
  }
});

// Revoke certificate (admin)
app.post('/api/certificates/:id/revoke', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE certificates SET status = 'revoked', updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Nie znaleziono certyfikatu' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[Certs] Revoke error:', err);
    res.status(500).json({ error: 'Blad serwera' });
  }
});

// Change certificate type (winner/participation) — works on issued certs too, re-signs them
app.post('/api/certificates/:id/set-type', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { certificate_type, placement, challenge_name } = req.body;
    if (!['winner', 'participation'].includes(certificate_type)) {
      return res.status(400).json({ error: 'Typ musi byc "winner" lub "participation"' });
    }

    // Update type and metadata
    const metadata = {};
    if (placement) metadata.placement = placement;
    if (challenge_name) metadata.challenge_name = challenge_name;

    const result = await pool.query(
      `UPDATE certificates SET
        certificate_type = $1,
        metadata = metadata || $2::jsonb,
        updated_at = NOW()
       WHERE id = $3 RETURNING *`,
      [certificate_type, JSON.stringify(metadata), id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Nie znaleziono' });

    const cert = result.rows[0];

    // Re-sign if already issued (hash/signature depend on certificate_type)
    if (cert.status === 'issued' && cert.hash) {
      const signableData = extractSignableFields(cert);
      const hash = createCertificateHash(signableData, CERT_SECRET);
      const signature = signCertificate(signableData, hash, CERT_SECRET);
      await pool.query(
        `UPDATE certificates SET hash = $1, signature = $2, updated_at = NOW() WHERE id = $3`,
        [hash, signature, id]
      );
      cert.hash = hash;
      cert.signature = signature;
    }

    res.json({ success: true, certificate: cert });
  } catch (err) {
    console.error('[Certs] Set type error:', err);
    res.status(500).json({ error: 'Blad serwera' });
  }
});

// Printable certificate list grouped by team (admin, password auth for new tab)
app.get('/api/certificates/print-list', (req, res, next) => {
  const pw = process.env.ADMIN_PASSWORD || 'MakaPaka2026';
  if (req.query.pw === pw) return next();
  return requireAdmin(req, res, next);
}, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM certificates WHERE status = 'issued' ORDER BY team_name, participant_name"
    );

    // Group by team
    const teams = {};
    for (const cert of result.rows) {
      if (!teams[cert.team_name]) teams[cert.team_name] = [];
      teams[cert.team_name].push(cert);
    }

    const html = `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <title>Lista Certyfikatow — AI Krak Hack 2026</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, sans-serif; background: #fff; color: #000; padding: 20px; }
    .header { text-align: center; padding: 20px 0 30px; border-bottom: 3px solid #000; margin-bottom: 30px; }
    .header h1 { font-size: 28px; font-weight: 900; }
    .header p { color: #666; margin-top: 5px; }
    .team { page-break-inside: avoid; margin-bottom: 30px; border: 2px solid #e0e0e0; border-radius: 12px; overflow: hidden; }
    .team-header { background: #f0f0f0; padding: 12px 20px; font-weight: 800; font-size: 16px; display: flex; justify-content: space-between; align-items: center; }
    .team-header .count { background: #333; color: #fff; padding: 2px 10px; border-radius: 20px; font-size: 12px; }
    .team-header .winner-badge { background: #f59e0b; color: #fff; padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; margin-left: 8px; }
    .member { padding: 10px 20px; border-top: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
    .member .name { font-weight: 600; }
    .member .uni { color: #888; font-size: 13px; }
    .member .type { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
    .member .type.winner { color: #f59e0b; }
    .member .type.participation { color: #06b6d4; }
    .checkbox { width: 16px; height: 16px; border: 2px solid #ccc; border-radius: 3px; margin-right: 12px; flex-shrink: 0; }
    .btn { display: inline-block; padding: 12px 24px; background: #06b6d4; color: #fff; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; margin: 10px; }
    .no-print { }
    .stats { margin-top: 20px; text-align: center; color: #666; font-size: 14px; }
    @media print {
      .no-print { display: none; }
      .team { border: 1px solid #999; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Lista Certyfikatow do Wreczenia</h1>
    <p>AI Krak Hack 2026 &bull; ${result.rows.length} certyfikatow &bull; ${Object.keys(teams).length} zespolow</p>
    <button class="btn no-print" onclick="window.print()">Drukuj / Zapisz PDF</button>
  </div>
  ${Object.entries(teams).map(([teamName, members]) => {
    const hasWinner = members.some(m => m.certificate_type === 'winner');
    return `
    <div class="team">
      <div class="team-header">
        <span>${teamName}${hasWinner ? '<span class="winner-badge">ZWYCIEZCA</span>' : ''}</span>
        <span class="count">${members.length} os.</span>
      </div>
      ${members.map(m => `
        <div class="member">
          <div style="display:flex;align-items:center;">
            <div class="checkbox"></div>
            <div>
              <div class="name">${m.participant_name}</div>
              ${m.university ? `<div class="uni">${m.university}</div>` : ''}
            </div>
          </div>
          <span class="type ${m.certificate_type}">${m.certificate_type === 'winner' ? 'Zwyciezca' : 'Uczestnik'}</span>
        </div>
      `).join('')}
    </div>`;
  }).join('')}
  <div class="stats">
    Wygenerowano: ${new Date().toLocaleString('pl-PL')}
  </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    console.error('[Certs] Print list error:', err);
    res.status(500).json({ error: 'Blad' });
  }
});

// Bulk approve all drafts (admin)
app.post('/api/certificates/bulk-approve', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE certificates SET status = 'approved', approved_at = NOW(), updated_at = NOW()
       WHERE status = 'draft' RETURNING id`
    );
    res.json({ success: true, count: result.rows.length });
  } catch (err) {
    console.error('[Certs] Bulk approve error:', err);
    res.status(500).json({ error: 'Blad serwera' });
  }
});

// Bulk issue all approved certificates (admin)
app.post('/api/certificates/bulk-issue', requireAdmin, async (req, res) => {
  try {
    const certs = await pool.query("SELECT * FROM certificates WHERE status = 'approved'");
    let issued = 0;

    for (const cert of certs.rows) {
      const signableData = extractSignableFields(cert);
      const hash = createCertificateHash(signableData, CERT_SECRET);
      const signature = signCertificate(signableData, hash, CERT_SECRET);

      await pool.query(
        `UPDATE certificates SET hash = $1, signature = $2, status = 'issued', issued_at = NOW(), updated_at = NOW()
         WHERE id = $3`,
        [hash, signature, cert.id]
      );
      issued++;
    }

    notifyEvent('🏆 Certyfikaty wydane', `Wydano ${issued} certyfikatów (bulk issue)`, 'f59e0b');
    res.json({ success: true, issued });
  } catch (err) {
    console.error('[Certs] Bulk issue error:', err);
    res.status(500).json({ error: 'Blad serwera' });
  }
});

// Generate QR code for a certificate (admin)
app.get('/api/certificates/:id/qr', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT hash FROM certificates WHERE id = $1 AND status = $2', [id, 'issued']);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Certyfikat nie zostal jeszcze wydany' });

    const baseUrl = process.env.BASE_URL || 'https://krakhack.info';
    const verifyUrl = `${baseUrl}/verify/${result.rows[0].hash}`;

    const format = req.query.format || 'png';
    if (format === 'svg') {
      const svg = await QRCode.toString(verifyUrl, {
        type: 'svg',
        color: { dark: '#030213', light: '#00000000' },
        margin: 1,
        width: 300,
      });
      res.setHeader('Content-Type', 'image/svg+xml');
      res.send(svg);
    } else {
      const png = await QRCode.toBuffer(verifyUrl, {
        type: 'png',
        color: { dark: '#030213', light: '#ffffff' },
        margin: 2,
        width: 400,
        errorCorrectionLevel: 'H',
      });
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `inline; filename="cert-${result.rows[0].hash.slice(0, 8)}.png"`);
      res.send(png);
    }
  } catch (err) {
    console.error('[Certs] QR error:', err);
    res.status(500).json({ error: 'Blad generowania QR' });
  }
});

// Send certificate email to participant (admin)
app.post('/api/certificates/:id/send-email', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const certResult = await pool.query(
      `SELECT c.*, COALESCE(s.email, s.data->>'email') as participant_email
       FROM certificates c
       LEFT JOIN submissions s ON s.id = c.submission_id
       WHERE c.id = $1 AND c.status = 'issued'`,
      [id]
    );
    if (certResult.rows.length === 0) return res.status(400).json({ error: 'Certyfikat musi byc wydany (issued)' });

    const cert = certResult.rows[0];
    const email = req.body.email || cert.participant_email;
    console.log(`[Certs] Send email for cert ${id}: participant="${cert.participant_name}", email="${email}", submission_id=${cert.submission_id}`);
    if (!email) return res.status(400).json({ error: `Brak adresu email dla ${cert.participant_name} (submission_id: ${cert.submission_id})` });

    const baseUrl = process.env.BASE_URL || 'https://krakhack.info';
    const verifyUrl = `${baseUrl}/verify/${cert.hash}`;
    const isWinner = cert.certificate_type === 'winner';

    const html = `
<div style="font-family: 'Inter', -apple-system, sans-serif; background-color: #f4f7f9; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, ${isWinner ? '#f59e0b, #ef4444' : '#06b6d4, #3b82f6, #8b5cf6'}); padding: 40px; text-align: center; color: #ffffff;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 800;">AI KRAK HACK 2026</h1>
      <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">${isWinner ? 'Certyfikat Zwyciezcy' : 'Certyfikat Uczestnictwa'}</p>
    </div>
    <div style="padding: 40px; color: #334155; line-height: 1.6;">
      <p style="font-size: 18px; font-weight: 600;">Czesc ${cert.participant_name}!</p>
      <p>${isWinner
        ? `Gratulacje! Twoj zespol <strong>${cert.team_name}</strong> zwyciezyl w AI Krak Hack 2026!`
        : `Dziekujemy za udzial w AI Krak Hack 2026 w zespole <strong>${cert.team_name}</strong>!`
      }</p>
      ${cert.project_name ? `<p>Projekt: <strong>${cert.project_name}</strong></p>` : ''}
      <p>Twoj certyfikat jest dostepny online i mozesz go udostepnic na LinkedIn:</p>
      <div style="margin: 30px 0; text-align: center;">
        <a href="${verifyUrl}" style="display: inline-block; padding: 16px 32px; background: ${isWinner ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 'linear-gradient(135deg, #06b6d4, #3b82f6)'}; color: white; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px;">Zobacz certyfikat &rarr;</a>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; text-align: center; margin: 20px 0;">
        <p style="font-size: 12px; color: #64748b; margin: 0 0 4px;">Hash weryfikacyjny</p>
        <code style="font-size: 14px; color: #0f172a; font-weight: 600;">${cert.hash}</code>
      </div>
      <p style="font-size: 13px; color: #94a3b8; text-align: center;">
        Pozdrawiamy,<br><strong>Zespol AI Krak Hack 2026</strong><br>AI Possibilities Lab &bull; WSEI Krakow
      </p>
    </div>
  </div>
</div>`;

    const success = await sendResendEmail(
      email,
      `${isWinner ? 'Certyfikat Zwyciezcy' : 'Certyfikat Uczestnictwa'} - AI Krak Hack 2026`,
      html
    );
    if (!success) {
      return res.status(500).json({ error: 'Nie udalo sie wyslac emaila (sprawdz RESEND_API_KEY i logi serwera)' });
    }
    res.json({ success: true, email });
  } catch (err) {
    console.error('[Certs] Email error:', err);
    res.status(500).json({ error: 'Blad wysylki emaila' });
  }
});

// Bulk send certificate emails (admin)
app.post('/api/certificates/bulk-send-email', requireAdmin, async (req, res) => {
  try {
    const certs = await pool.query(`
      SELECT c.*, COALESCE(s.email, s.data->>'email') as participant_email
      FROM certificates c
      LEFT JOIN submissions s ON s.id = c.submission_id
      WHERE c.status = 'issued' AND c.hash IS NOT NULL
    `);

    let sent = 0;
    const baseUrl = process.env.BASE_URL || 'https://krakhack.info';

    for (const cert of certs.rows) {
      const email = cert.participant_email;
      if (!email) continue;

      const verifyUrl = `${baseUrl}/verify/${cert.hash}`;
      const isWinner = cert.certificate_type === 'winner';

      const html = `
<div style="font-family: 'Inter', -apple-system, sans-serif; background-color: #f4f7f9; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, ${isWinner ? '#f59e0b, #ef4444' : '#06b6d4, #3b82f6, #8b5cf6'}); padding: 40px; text-align: center; color: #ffffff;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 800;">AI KRAK HACK 2026</h1>
      <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">${isWinner ? 'Certyfikat Zwyciezcy' : 'Certyfikat Uczestnictwa'}</p>
    </div>
    <div style="padding: 40px; color: #334155; line-height: 1.6;">
      <p style="font-size: 18px; font-weight: 600;">Czesc ${cert.participant_name}!</p>
      <p>${isWinner
        ? `Gratulacje! Twoj zespol <strong>${cert.team_name}</strong> zwyciezyl w AI Krak Hack 2026!`
        : `Dziekujemy za udzial w AI Krak Hack 2026 w zespole <strong>${cert.team_name}</strong>!`
      }</p>
      ${cert.project_name ? `<p>Projekt: <strong>${cert.project_name}</strong></p>` : ''}
      <div style="margin: 30px 0; text-align: center;">
        <a href="${verifyUrl}" style="display: inline-block; padding: 16px 32px; background: ${isWinner ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 'linear-gradient(135deg, #06b6d4, #3b82f6)'}; color: white; text-decoration: none; border-radius: 12px; font-weight: 700;">Zobacz certyfikat &rarr;</a>
      </div>
      <p style="font-size: 13px; color: #94a3b8; text-align: center;">Zespol AI Krak Hack 2026</p>
    </div>
  </div>
</div>`;

      const ok = await sendResendEmail(
        email,
        `${isWinner ? 'Certyfikat Zwyciezcy' : 'Certyfikat Uczestnictwa'} - AI Krak Hack 2026`,
        html
      );
      if (ok) sent++;
    }

    notifyEvent('📧 Certyfikaty wysłane emailem', `Wysłano ${sent}/${certs.rows.length} certyfikatów emailem (bulk)`, '8b5cf6');
    res.json({ success: true, sent, total: certs.rows.length });
  } catch (err) {
    console.error('[Certs] Bulk email error:', err);
    res.status(500).json({ error: 'Blad wysylki masowej' });
  }
});

// Export certificates for physical printing (admin)
app.get('/api/certificates/export', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM certificates WHERE status = 'issued' ORDER BY team_name, participant_name");
    const baseUrl = process.env.BASE_URL || 'https://krakhack.info';
    const exportData = result.rows.map(c => ({
      participant_name: c.participant_name,
      team_name: c.team_name,
      project_name: c.project_name,
      university: c.university,
      certificate_type: c.certificate_type,
      event_name: c.event_name,
      event_dates: c.event_dates,
      hash: c.hash,
      verify_url: `${baseUrl}/verify/${c.hash}`,
      issued_at: c.issued_at,
      metadata: c.metadata,
    }));
    res.json(exportData);
  } catch (err) {
    console.error('[Certs] Export error:', err);
    res.status(500).json({ error: 'Blad eksportu' });
  }
});

// Bulk QR codes — printable HTML page with all issued certificates
// Simple password auth via query param (works in new tab without Bearer token)
app.get('/api/certificates/bulk-qr', async (req, res) => {
  const pw = process.env.ADMIN_PASSWORD || 'MakaPaka2026';
  if (req.query.pw !== pw) {
    return res.status(401).send('<h1>Podaj hasło w URL: ?pw=TWOJE_HASLO</h1>');
  }
  try {
    const result = await pool.query("SELECT * FROM certificates WHERE status = 'issued' AND hash IS NOT NULL ORDER BY team_name, participant_name");
    const baseUrl = process.env.BASE_URL || 'https://krakhack.info';

    const qrPromises = result.rows.map(async (cert) => {
      const verifyUrl = `${baseUrl}/verify/${cert.hash}`;
      const qrSvg = await QRCode.toString(verifyUrl, { type: 'svg', width: 200, margin: 1 });
      return { ...cert, qrSvg, verifyUrl };
    });

    const certs = await Promise.all(qrPromises);

    // Generate printable HTML page
    const html = `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <title>QR Kody Certyfikatow - AI Krak Hack 2026</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, sans-serif; background: #fff; color: #000; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; padding: 20px; }
    .card { border: 1px solid #e0e0e0; border-radius: 12px; padding: 16px; text-align: center; page-break-inside: avoid; }
    .card svg { width: 150px; height: 150px; margin: 0 auto 8px; display: block; }
    .name { font-weight: 700; font-size: 14px; margin-bottom: 4px; }
    .team { font-size: 12px; color: #666; margin-bottom: 4px; }
    .uni { font-size: 11px; color: #999; margin-bottom: 4px; }
    .hash { font-size: 9px; color: #aaa; font-family: monospace; word-break: break-all; }
    .type { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
    .type.winner { color: #f59e0b; }
    .type.participation { color: #06b6d4; }
    @media print {
      .no-print { display: none; }
      .grid { gap: 10px; padding: 10px; }
      .card { border: 1px solid #ccc; }
    }
    .header { text-align: center; padding: 20px; border-bottom: 2px solid #000; margin-bottom: 20px; }
    .header h1 { font-size: 24px; }
    .header p { color: #666; font-size: 14px; }
    .btn { display: inline-block; padding: 12px 24px; background: #06b6d4; color: #fff; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; margin: 10px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>QR Kody Certyfikatow</h1>
    <p>AI Krak Hack 2026 &bull; ${certs.length} certyfikatow</p>
    <button class="btn no-print" onclick="window.print()">Drukuj / Zapisz PDF</button>
  </div>
  <div class="grid">
    ${certs.map(c => `
      <div class="card">
        <div class="type ${c.certificate_type}">${c.certificate_type === 'winner' ? 'Zwyciezca' : 'Uczestnik'}</div>
        ${c.qrSvg}
        <div class="name">${c.participant_name}</div>
        <div class="team">${c.team_name}</div>
        ${c.university ? `<div class="uni">${c.university}</div>` : ''}
        <div class="hash">${c.hash}</div>
      </div>
    `).join('')}
  </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    console.error('[Certs] Bulk QR error:', err);
    res.status(500).json({ error: 'Blad generowania QR kodow' });
  }
});

// Delete certificate (admin)
app.delete('/api/certificates/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    // Get cert info before deleting (to mark submission)
    const certInfo = await pool.query('SELECT submission_id FROM certificates WHERE id = $1', [id]);
    const result = await pool.query('DELETE FROM certificates WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Nie znaleziono certyfikatu' });

    // Mark submission as excluded so cert doesn't respawn
    if (certInfo.rows[0]?.submission_id) {
      await pool.query(
        `UPDATE submissions SET data = data || '{"excludedFromCerts": true}'::jsonb WHERE id = $1`,
        [certInfo.rows[0].submission_id]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error('[Certs] Delete error:', err);
    res.status(500).json({ error: 'Blad serwera' });
  }
});

// Delete all certificates for a team (admin)
app.delete('/api/certificates/team/:teamName', requireAdmin, async (req, res) => {
  try {
    const { teamName } = req.params;
    const result = await pool.query('DELETE FROM certificates WHERE team_name = $1 RETURNING id', [teamName]);

    // Mark submissions as excluded so certs don't respawn on next generate
    await pool.query(
      `UPDATE submissions SET data = data || '{"excludedFromCerts": true}'::jsonb
       WHERE type = 'participant' AND data->>'teamName' = $1`,
      [teamName]
    );

    res.json({ success: true, deleted: result.rows.length });
  } catch (err) {
    console.error('[Certs] Delete team error:', err);
    res.status(500).json({ error: 'Blad serwera' });
  }
});

// ─── Public Certificate Verification ───────────────────────

app.get('/api/verify/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    const result = await pool.query(
      "SELECT * FROM certificates WHERE hash = $1 AND status = 'issued'",
      [hash]
    );

    if (result.rows.length === 0) {
      // Check if it was revoked
      const revoked = await pool.query(
        "SELECT id FROM certificates WHERE hash = $1 AND status = 'revoked'",
        [hash]
      );
      if (revoked.rows.length > 0) {
        return res.json({ valid: false, reason: 'revoked' });
      }
      return res.json({ valid: false, reason: 'not_found' });
    }

    const cert = result.rows[0];
    const signableData = extractSignableFields(cert);
    const verification = verifyCertificate(signableData, cert.hash, cert.signature, CERT_SECRET);

    res.json({
      valid: verification.valid,
      certificate: {
        participant_name: cert.participant_name,
        team_name: cert.team_name,
        project_name: cert.project_name,
        university: cert.university,
        certificate_type: cert.certificate_type,
        event_name: cert.event_name,
        event_dates: cert.event_dates,
        issued_at: cert.issued_at,
        hash: cert.hash,
        metadata: cert.metadata,
      },
    });
  } catch (err) {
    console.error('[Certs] Verify error:', err);
    res.status(500).json({ error: 'Blad weryfikacji' });
  }
});

// ─── Membership Application Email Templates ─────────────────────────────

function buildMembershipConfirmationEmail(name) {
  const baseUrl = process.env.BASE_URL || 'https://krakhack.info';
  return `
<div style="font-family: 'Inter', -apple-system, sans-serif; background-color: #f4f7f9; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6); padding: 40px; text-align: center; color: #ffffff;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 800;">AI POSSIBILITIES LAB</h1>
      <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Potwierdzenie zgłoszenia</p>
    </div>
    <div style="padding: 40px; color: #334155; line-height: 1.6;">
      <p style="font-size: 18px; font-weight: 600;">Cześć ${name}!</p>
      <p>Dziękujemy za zgłoszenie do koła naukowego <strong>AI Possibilities Lab</strong>. Otrzymaliśmy Twoje zgłoszenie i wkrótce się z Tobą skontaktujemy.</p>
      <p>Chcemy Cię poznać — umówimy się na krótką, niezobowiązującą rozmowę, żebyśmy mogli pokazać Ci, jak działa nasze koło. Dajemy Ci czas — żadnego pośpiechu.</p>
      <div style="margin: 30px 0; text-align: center;">
        <a href="${baseUrl}/o-nas" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #06b6d4, #3b82f6); color: white; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px;">Poznaj nas bliżej &rarr;</a>
      </div>
      <p style="font-size: 13px; color: #94a3b8; text-align: center;">
        Pozdrawiamy,<br><strong>Zespół AI Possibilities Lab</strong><br>WSEI Kraków
      </p>
    </div>
  </div>
</div>`;
}

function buildInterviewInviteEmail(name) {
  return `
<div style="font-family: 'Inter', -apple-system, sans-serif; background-color: #f4f7f9; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6); padding: 40px; text-align: center; color: #ffffff;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 800;">AI POSSIBILITIES LAB</h1>
      <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Zaproszenie na rozmowę</p>
    </div>
    <div style="padding: 40px; color: #334155; line-height: 1.6;">
      <p style="font-size: 18px; font-weight: 600;">Cześć ${name}!</p>
      <p>Przejrzeliśmy Twoje zgłoszenie i chcielibyśmy Cię poznać osobiście! Zapraszamy na krótką, niezobowiązującą rozmowę.</p>
      <p>To nie jest żaden egzamin — chcemy po prostu porozmawiać o Twoich zainteresowaniach i pokazać, czym się zajmujemy. Rozmowa trwa ok. 15-20 minut.</p>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0; font-weight: 600;">Jak się umówić?</p>
        <p style="margin: 8px 0 0;">Odpisz na tego maila z propozycją terminu lub napisz do nas na naszych social mediach. Znajdziemy czas, który Ci pasuje.</p>
      </div>
      <p style="font-size: 13px; color: #94a3b8; text-align: center;">
        Do zobaczenia!<br><strong>Zespół AI Possibilities Lab</strong><br>WSEI Kraków
      </p>
    </div>
  </div>
</div>`;
}

function buildSurveyInviteEmail(name, surveyUrl) {
  return `
<div style="font-family: 'Inter', -apple-system, sans-serif; background-color: #f4f7f9; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6); padding: 40px; text-align: center; color: #ffffff;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 800;">AI POSSIBILITIES LAB</h1>
      <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Zaproszenie do ankiety</p>
    </div>
    <div style="padding: 40px; color: #334155; line-height: 1.6;">
      <p style="font-size: 18px; font-weight: 600;">Cześć ${name}!</p>
      <p>Chcielibyśmy poznać Twoje zdanie — wypełnij krótką ankietę, która pomoże nam lepiej planować nasze działania.</p>
      <div style="margin: 30px 0; text-align: center;">
        <a href="${surveyUrl}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #06b6d4, #3b82f6); color: white; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px;">Wypełnij ankietę &rarr;</a>
      </div>
      <p style="font-size: 13px; color: #94a3b8; text-align: center;">
        Pozdrawiamy,<br><strong>Zespół AI Possibilities Lab</strong><br>WSEI Kraków
      </p>
    </div>
  </div>
</div>`;
}

function buildWelcomeEmail(name) {
  const baseUrl = process.env.BASE_URL || 'https://krakhack.info';
  return `
<div style="font-family: 'Inter', -apple-system, sans-serif; background-color: #f4f7f9; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #10b981, #06b6d4, #3b82f6); padding: 40px; text-align: center; color: #ffffff;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 800;">WITAMY W AI POSSIBILITIES LAB! 🎉</h1>
      <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Oficjalnie jesteś z nami</p>
    </div>
    <div style="padding: 40px; color: #334155; line-height: 1.6;">
      <p style="font-size: 18px; font-weight: 600;">Cześć ${name}!</p>
      <p>Z ogromną radością informujemy, że zostałeś/aś <strong>przyjęty/a do koła naukowego AI Possibilities Lab</strong>!</p>
      <p>Oto co Cię czeka:</p>
      <ul style="padding-left: 20px;">
        <li>Dostęp do naszych projektów i zasobów</li>
        <li>Spotkania i warsztaty z innymi członkami</li>
        <li>Możliwość udziału w hackathonach i konferencjach</li>
        <li>Wsparcie merytoryczne od doświadczonych członków</li>
      </ul>
      <div style="margin: 30px 0; text-align: center;">
        <a href="${baseUrl}/o-nas" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #10b981, #06b6d4); color: white; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px;">Poznaj nasze koło &rarr;</a>
      </div>
      <p>Wkrótce skontaktujemy się z Tobą ze szczegółami dotyczącymi najbliższych spotkań i projektów.</p>
      <p style="font-size: 13px; color: #94a3b8; text-align: center;">
        Do zobaczenia!<br><strong>Zespół AI Possibilities Lab</strong><br>WSEI Kraków
      </p>
    </div>
  </div>
</div>`;
}

function buildClubInviteEmailWSEI(firstName) {
  const baseUrl = process.env.BASE_URL || 'https://krakhack.info';
  return `
<div style="font-family: 'Inter', -apple-system, sans-serif; background-color: #f4f7f9; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6); padding: 40px; text-align: center; color: #ffffff;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 800;">AI POSSIBILITIES LAB</h1>
      <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Rozwijaj sie z nami na WSEI</p>
    </div>
    <div style="padding: 40px; color: #334155; line-height: 1.6;">
      <p style="font-size: 18px; font-weight: 600;">Czesc ${firstName}!</p>
      <p>Dziekujemy za udzial w <strong>AI Krak Hack 2026</strong>! Jako student/ka WSEI masz unikalna okazje — dolacz do <strong>AI Possibilities Lab</strong> jako czlonek kola naukowego.</p>

      <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; font-weight: 600; color: #1e40af;">Szukasz pomyslu na prace dyplomowa?</p>
        <p style="margin: 8px 0 0; color: #334155;">Mamy baze pomyslow i mentorow z doswiadczeniem, ktorzy pomoga Ci wybrac i zrealizowac temat na inzynierke lub magisterke.</p>
      </div>

      <p><strong>Co jeszcze zyskujesz?</strong></p>
      <ul style="padding-left: 20px;">
        <li>Rady i wsparcie przy projektach na studia</li>
        <li>Bridging do konferencji naukowych i publikacji</li>
        <li>Regularne spotkania, warsztaty i hackathony</li>
        <li>Mentoring od doswiadczonych czlonkow i ekspertow z branzy</li>
        <li>Wpis do CV — kolo naukowe to realny atut</li>
      </ul>

      <p>Widzisz sie w sciezce naukowej? Chcesz miec projekt, ktory wyrozni Cie na rynku pracy? Dolacz do nas — pokaz Ci jak zaczac.</p>

      <div style="margin: 30px 0; text-align: center;">
        <a href="${baseUrl}/dolacz" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #06b6d4, #3b82f6); color: white; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px;">Zglos sie do kola &rarr;</a>
      </div>
      <p style="font-size: 13px; color: #94a3b8; text-align: center;">
        Pozdrawiamy,<br><strong>Zespol AI Possibilities Lab</strong><br>WSEI Krakow
      </p>
    </div>
  </div>
</div>`;
}

function buildClubInviteEmailExternal(firstName) {
  const baseUrl = process.env.BASE_URL || 'https://krakhack.info';
  return `
<div style="font-family: 'Inter', -apple-system, sans-serif; background-color: #f4f7f9; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6); padding: 40px; text-align: center; color: #ffffff;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 800;">AI POSSIBILITIES LAB</h1>
      <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Dolacz do naszej spolecznosci!</p>
    </div>
    <div style="padding: 40px; color: #334155; line-height: 1.6;">
      <p style="font-size: 18px; font-weight: 600;">Czesc ${firstName}!</p>
      <p>Dziekujemy za udzial w <strong>AI Krak Hack 2026</strong>! Widzimy, ze interesujesz sie AI — zapraszamy Cie do naszej <strong>spolecznosci AI Possibilities Lab</strong>.</p>

      <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; font-weight: 600; color: #065f46;">Dolacz do community na Discordzie</p>
        <p style="margin: 8px 0 0; color: #334155;">Otwarta spolecznosc pasjonatow AI — wymieniaj sie doswiadczeniami, realizuj projekty w wolnym czasie, poznawaj ludzi z branzy.</p>
      </div>

      <p><strong>Jak mozesz sie zaangazowac?</strong></p>
      <ul style="padding-left: 20px;">
        <li>Dolacz do Discorda i wymieniaj sie doswiadczeniami</li>
        <li>Realizuj projekty AI z innymi czlonkami spolecznosci</li>
        <li>Jesli jestes z branzy — podziel sie wiedza i znajdz talenty</li>
        <li>Organizujesz eventy? Dzialajmy razem!</li>
        <li>Bierz udzial w hackathonach, warsztatach i meetupach</li>
      </ul>

      <p>Mamy marke, kierunek i projekty — szukamy ludzi, ktorzy chcieliby z nami wspolpracowac i tworzyc wartosc. Chetnie przyjmiemy wiedze z Twojej strony.</p>

      <div style="margin: 30px 0; text-align: center;">
        <a href="${baseUrl}/o-nas" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #06b6d4, #3b82f6); color: white; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px;">Poznaj AI Possibilities Lab &rarr;</a>
      </div>
      <p style="font-size: 13px; color: #94a3b8; text-align: center;">
        Pozdrawiamy,<br><strong>Zespol AI Possibilities Lab</strong><br>WSEI Krakow
      </p>
    </div>
  </div>
</div>`;
}

// ─── Membership Application API ──────────────────────────────────────

// Submit membership application (public)
app.post('/api/membership-applications', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'Baza danych niepodłączona' });

    const { firstName, lastName, email, university, fieldOfStudy, yearOrStatus,
            attendMeetings, attendInPerson, monthlyHours, competencies,
            whatYouBring, expectations, valuesResonance, engagementTypes } = req.body;

    if (!firstName || !lastName || !email) {
      return res.status(400).json({ error: 'Imię, nazwisko i email są wymagane' });
    }

    const isWsei = (university || '').toLowerCase().includes('wsei');

    const result = await pool.query(
      `INSERT INTO membership_applications
        (first_name, last_name, email, university, field_of_study, year_or_status,
         is_wsei, attend_meetings, attend_in_person, monthly_hours, competencies,
         what_you_bring, expectations, values_resonance, engagement_types)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb,$12,$13,$14,$15)
       RETURNING id`,
      [firstName, lastName, email, university || '', fieldOfStudy || '', yearOrStatus || '',
       isWsei, !!attendMeetings, !!attendInPerson, monthlyHours || 5,
       JSON.stringify(competencies || {}),
       whatYouBring || '', expectations || '', valuesResonance || '',
       engagementTypes || []]
    );

    // Send confirmation email
    try {
      await sendResendEmail(email, 'Potwierdzenie zgłoszenia — AI Possibilities Lab', buildMembershipConfirmationEmail(firstName));
    } catch (emailErr) {
      console.error('[Membership] Confirmation email failed:', emailErr);
    }

    // Notify Teams + admin email
    notifyEvent(
      '🎓 Nowe zgłoszenie do koła',
      `${firstName} ${lastName} (${email})\nUczelnia: ${university || 'brak'}\nTyp: ${isWsei ? 'WSEI — członek koła' : 'Zewnętrzny — community'}\nGodziny/mies.: ${monthlyHours || 5}h`,
      isWsei ? '06b6d4' : '8b5cf6'
    );

    res.json({ success: true, id: result.rows[0].id });
  } catch (err) {
    console.error('[Membership] Submit error:', err);
    res.status(500).json({ error: 'Błąd zapisu zgłoszenia' });
  }
});

// List membership applications (admin)
app.get('/api/membership-applications', requireAdmin, async (req, res) => {
  try {
    const { status, is_wsei, engagement_type, limit = 50, offset = 0 } = req.query;
    let query = 'SELECT * FROM membership_applications WHERE 1=1';
    const params = [];
    let paramIdx = 1;

    if (status) { query += ` AND status = $${paramIdx++}`; params.push(status); }
    if (is_wsei !== undefined) { query += ` AND is_wsei = $${paramIdx++}`; params.push(is_wsei === 'true'); }
    if (engagement_type) { query += ` AND $${paramIdx++} = ANY(engagement_types)`; params.push(engagement_type); }

    query += ` ORDER BY created_at DESC LIMIT $${paramIdx++} OFFSET $${paramIdx++}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);
    const countResult = await pool.query('SELECT COUNT(*) FROM membership_applications');

    res.json({ applications: result.rows, total: parseInt(countResult.rows[0].count) });
  } catch (err) {
    console.error('[Membership] List error:', err);
    res.status(500).json({ error: 'Błąd pobierania zgłoszeń' });
  }
});

// Get single membership application (admin)
app.get('/api/membership-applications/:id', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM membership_applications WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Nie znaleziono' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[Membership] Get error:', err);
    res.status(500).json({ error: 'Błąd pobierania zgłoszenia' });
  }
});

// Update membership application status (admin)
app.patch('/api/membership-applications/:id', requireAdmin, async (req, res) => {
  try {
    const { status, admin_notes } = req.body;
    const updates = [];
    const params = [];
    let paramIdx = 1;

    if (status) { updates.push(`status = $${paramIdx++}`); params.push(status); }
    if (admin_notes !== undefined) { updates.push(`admin_notes = $${paramIdx++}`); params.push(admin_notes); }
    updates.push(`updated_at = NOW()`);

    params.push(req.params.id);
    const result = await pool.query(
      `UPDATE membership_applications SET ${updates.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
      params
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Nie znaleziono' });

    const app_data = result.rows[0];

    // Auto-send welcome email when accepted
    if (status === 'przyjęty') {
      try {
        await sendResendEmail(app_data.email, 'Witamy w AI Possibilities Lab! 🎉', buildWelcomeEmail(app_data.first_name));
      } catch (emailErr) {
        console.error('[Membership] Welcome email failed:', emailErr);
      }
    }

    res.json({ success: true, application: app_data });
  } catch (err) {
    console.error('[Membership] Update error:', err);
    res.status(500).json({ error: 'Błąd aktualizacji' });
  }
});

// Send interview invitation (admin)
app.post('/api/membership-applications/:id/invite', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM membership_applications WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Nie znaleziono' });

    const app_data = result.rows[0];
    const success = await sendResendEmail(
      app_data.email,
      'Zaproszenie na rozmowę — AI Possibilities Lab',
      buildInterviewInviteEmail(app_data.first_name)
    );

    // Update status to rozmowa_umówiona
    await pool.query(
      "UPDATE membership_applications SET status = 'rozmowa_umówiona', updated_at = NOW() WHERE id = $1",
      [req.params.id]
    );

    res.json({ success });
  } catch (err) {
    console.error('[Membership] Invite error:', err);
    res.status(500).json({ error: 'Błąd wysyłki zaproszenia' });
  }
});

// Send survey invitation to multiple (admin)
app.post('/api/membership-applications/survey-invite', requireAdmin, async (req, res) => {
  try {
    const { emails, survey_url } = req.body;
    if (!emails || !survey_url) return res.status(400).json({ error: 'Brak emails lub survey_url' });

    let sent = 0;
    for (const email of emails) {
      const ok = await sendResendEmail(email, 'Zaproszenie do ankiety — AI Possibilities Lab', buildSurveyInviteEmail('', survey_url));
      if (ok) sent++;
    }
    res.json({ success: true, sent, total: emails.length });
  } catch (err) {
    console.error('[Membership] Survey invite error:', err);
    res.status(500).json({ error: 'Błąd wysyłki ankiety' });
  }
});

// Club invite mailing — sends WSEI vs non-WSEI variants (admin)
app.post('/api/admin/mail/club-invite', requireAdmin, async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'Baza danych niepodłączona' });

    const participants = await pool.query(
      "SELECT DISTINCT ON (email) email, data->>'firstName' as first_name, data->>'university' as university FROM submissions WHERE type = 'participant' AND email IS NOT NULL AND email != ''"
    );

    let sentWsei = 0, sentExternal = 0;
    for (const p of participants.rows) {
      const isWsei = (p.university || '').toLowerCase().includes('wsei');
      const html = isWsei
        ? buildClubInviteEmailWSEI(p.first_name || '')
        : buildClubInviteEmailExternal(p.first_name || '');
      const subject = isWsei
        ? 'Dołącz do AI Possibilities Lab! 🚀'
        : 'Współpracuj z AI Possibilities Lab!';
      const ok = await sendResendEmail(p.email, subject, html);
      if (ok) { isWsei ? sentWsei++ : sentExternal++; }
    }

    notifyEvent('🎓 Zaproszenia do koła wysłane', `WSEI: ${sentWsei}, Zewnętrzni: ${sentExternal}, Total: ${participants.rows.length}`, 'ec4899');
    res.json({ success: true, sentWsei, sentExternal, total: participants.rows.length });
  } catch (err) {
    console.error('[Mailing] Club invite error:', err);
    res.status(500).json({ error: 'Błąd wysyłki zaproszeń do koła' });
  }
});

// ─── Team Projects API ──────────────────────────────────────

// POST /api/admin/team-projects/seed — Seed from JSON data (admin)
app.post('/api/admin/team-projects/seed', requireAdmin, async (req, res) => {
  try {
    const teams = req.body;
    if (!Array.isArray(teams) || teams.length === 0) {
      return res.status(400).json({ error: 'Body must be a non-empty array of team objects' });
    }

    const created = [];
    for (const team of teams) {
      const editToken = crypto.randomBytes(16).toString('hex');
      const editPassword = Math.random().toString(36).slice(2, 8).toUpperCase();
      const result = await pool.query(
        `INSERT INTO team_projects
          (edition_number, slug, name, placement, placement_label, special_mention, challenge,
           members, university, project_name, short_description, full_description,
           key_features, technologies, images, presentation_file, edit_token, edit_token_created_at, edit_password)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW(), $18)
         ON CONFLICT (edition_number, slug) DO NOTHING
         RETURNING *`,
        [
          team.edition_number || 3,
          team.slug,
          team.name,
          team.placement || null,
          team.placement_label || null,
          team.special_mention || null,
          team.challenge,
          team.members || [],
          team.university || '',
          team.project_name || '',
          team.short_description || '',
          team.full_description || [],
          team.key_features || [],
          team.technologies || [],
          JSON.stringify(team.images || []),
          team.presentation_file || '',
          editToken,
          editPassword,
        ]
      );
      if (result.rows.length > 0) {
        created.push(result.rows[0]);
      }
    }

    res.json({ success: true, created: created.length, skipped: teams.length - created.length, teams: created });
  } catch (err) {
    console.error('[TeamProjects] Seed error:', err);
    res.status(500).json({ error: 'Blad seedowania zespolow' });
  }
});

// GET /api/admin/team-projects — List all teams (admin)
app.get('/api/admin/team-projects', requireAdmin, async (req, res) => {
  try {
    const edition = parseInt(req.query.edition) || 3;
    const result = await pool.query(
      'SELECT * FROM team_projects WHERE edition_number = $1 ORDER BY placement NULLS LAST, name',
      [edition]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('[TeamProjects] List error:', err);
    res.status(500).json({ error: 'Blad serwera' });
  }
});

// GET /api/admin/team-projects/preview-email — Preview team edit-link email
app.get('/api/admin/team-projects/preview-email', requireAdmin, async (req, res) => {
  try {
    let query, params;
    if (req.query.id) {
      query = 'SELECT * FROM team_projects WHERE id = $1';
      params = [req.query.id];
    } else {
      query = 'SELECT * FROM team_projects WHERE edit_token IS NOT NULL ORDER BY id LIMIT 1';
      params = [];
    }
    const result = await pool.query(query, params);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Brak zespolu' });

    const team = result.rows[0];
    const baseUrl = process.env.BASE_URL || 'https://krakhack.info';
    const editLink = `${baseUrl}/zespoly/${team.slug}/edytuj/${team.edit_token || 'TOKEN_PLACEHOLDER'}`;
    const html = buildTeamEditLinkHtml(team, editLink);

    res.json({
      subject: 'Edytuj profil swojego zespolu — AI Krak Hack 2026',
      html,
      team_name: team.name,
      edit_link: editLink,
      id: team.id,
    });
  } catch (err) {
    console.error('[TeamProjects] Preview email error:', err);
    res.status(500).json({ error: 'Blad podgladu emaila' });
  }
});

// GET /api/admin/team-projects/:id — Get single team (admin)
app.get('/api/admin/team-projects/:id', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM team_projects WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Nie znaleziono zespolu' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[TeamProjects] Get error:', err);
    res.status(500).json({ error: 'Blad serwera' });
  }
});

// PATCH /api/admin/team-projects/:id — Edit any field (admin)
app.patch('/api/admin/team-projects/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const allowedFields = [
      'slug', 'name', 'placement', 'placement_label', 'special_mention', 'challenge',
      'members', 'university', 'project_name', 'short_description', 'full_description',
      'key_features', 'technologies', 'images', 'presentation_file', 'presentation_slides',
      'edition_number',
    ];

    const updates = [];
    const params = [];
    let paramIdx = 1;

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        const value = ['images', 'presentation_slides'].includes(field)
          ? JSON.stringify(req.body[field])
          : req.body[field];
        updates.push(`${field} = $${paramIdx++}`);
        params.push(value);
      }
    }

    if (updates.length === 0) return res.status(400).json({ error: 'Brak danych do aktualizacji' });

    updates.push(`updated_at = NOW()`);
    params.push(id);

    const result = await pool.query(
      `UPDATE team_projects SET ${updates.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
      params
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Nie znaleziono zespolu' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[TeamProjects] Update error:', err);
    res.status(500).json({ error: 'Blad serwera' });
  }
});

// POST /api/admin/team-projects/:id/regenerate-token — New edit token (admin)
app.post('/api/admin/team-projects/:id/regenerate-token', requireAdmin, async (req, res) => {
  try {
    const token = crypto.randomBytes(16).toString('hex');
    const result = await pool.query(
      'UPDATE team_projects SET edit_token = $1, edit_token_created_at = NOW(), updated_at = NOW() WHERE id = $2 RETURNING *',
      [token, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Nie znaleziono zespolu' });
    res.json({ success: true, edit_token: token, team: result.rows[0] });
  } catch (err) {
    console.error('[TeamProjects] Regenerate token error:', err);
    res.status(500).json({ error: 'Blad serwera' });
  }
});

// POST /api/admin/team-projects/:id/send-edit-link — Send edit link email (admin)
app.post('/api/admin/team-projects/:id/send-edit-link', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM team_projects WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Nie znaleziono zespolu' });

    const team = result.rows[0];
    if (!team.edit_token) {
      return res.status(400).json({ error: 'Brak tokenu edycji — wygeneruj go najpierw' });
    }

    const baseUrl = process.env.BASE_URL || 'https://krakhack.info';
    const editLink = `${baseUrl}/zespoly/${team.slug}/edytuj/${team.edit_token}`;

    // Find submission emails matching team members
    const memberEmails = [];
    for (const member of team.members) {
      const parts = member.trim().split(' ');
      if (parts.length >= 2) {
        const emailResult = await pool.query(
          "SELECT DISTINCT email FROM submissions WHERE type = 'participant' AND data->>'firstName' = $1 AND data->>'lastName' = $2 AND email IS NOT NULL AND email != ''",
          [parts[0], parts.slice(1).join(' ')]
        );
        for (const row of emailResult.rows) {
          if (row.email && !memberEmails.includes(row.email)) {
            memberEmails.push(row.email);
          }
        }
      }
    }

    const html = `
<div style="font-family: 'Inter', -apple-system, sans-serif; background-color: #f4f7f9; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6); padding: 40px; text-align: center; color: #ffffff;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 800;">AI KRAK HACK 2026</h1>
      <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Edycja profilu zespolu</p>
    </div>
    <div style="padding: 40px; color: #334155; line-height: 1.6;">
      <p style="font-size: 18px; font-weight: 600;">Czesc, zespol ${team.name}!</p>
      <p>Mozecie teraz edytowac profil swojego projektu na stronie AI Krak Hack. Dodajcie opis, technologie, screeny i prezentacje.</p>
      <div style="margin: 30px 0; text-align: center;">
        <a href="${editLink}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #06b6d4, #3b82f6); color: white; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px;">Edytuj profil zespolu &rarr;</a>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0;">
        <p style="font-size: 13px; color: #64748b; margin: 0 0 8px;">Link do edycji (nie udostepniajcie go publicznie):</p>
        <code style="font-size: 12px; color: #0f172a; word-break: break-all;">${editLink}</code>
      </div>
      <p style="font-size: 13px; color: #94a3b8; text-align: center;">
        Pozdrawiamy,<br><strong>Zespol AI Krak Hack 2026</strong><br>AI Possibilities Lab &bull; WSEI Krakow
      </p>
    </div>
  </div>
</div>`;

    let emailSent = false;
    if (memberEmails.length > 0) {
      for (const email of memberEmails) {
        const ok = await sendResendEmail(email, 'Edytuj profil swojego zespolu — AI Krak Hack 2026', html);
        if (ok) emailSent = true;
      }
    }

    if (emailSent) {
      await pool.query('UPDATE team_projects SET email_last_sent_at = NOW() WHERE id = $1', [team.id]);
    }

    res.json({
      success: true,
      edit_link: editLink,
      emails_found: memberEmails,
      email_sent: emailSent,
    });
  } catch (err) {
    console.error('[TeamProjects] Send edit link error:', err);
    res.status(500).json({ error: 'Blad wysylki linku edycji' });
  }
});

// POST /api/admin/team-projects/bulk-send-edit-links — Send edit links to all teams (admin)
app.post('/api/admin/team-projects/bulk-send-edit-links', requireAdmin, async (req, res) => {
  try {
    const edition = parseInt(req.query.edition) || 3;
    const result = await pool.query(
      'SELECT * FROM team_projects WHERE edition_number = $1 AND edit_token IS NOT NULL ORDER BY name',
      [edition]
    );
    const teams = result.rows;

    let sent = 0;
    let failed = 0;
    const details = [];

    const baseUrl = process.env.BASE_URL || 'https://krakhack.info';

    for (const team of teams) {
      const editLink = `${baseUrl}/zespoly/${team.slug}/edytuj/${team.edit_token}`;

      // Find submission emails matching team members
      const memberEmails = [];
      for (const member of team.members) {
        const parts = member.trim().split(' ');
        if (parts.length >= 2) {
          const emailResult = await pool.query(
            "SELECT DISTINCT email FROM submissions WHERE type = 'participant' AND data->>'firstName' = $1 AND data->>'lastName' = $2 AND email IS NOT NULL AND email != ''",
            [parts[0], parts.slice(1).join(' ')]
          );
          for (const row of emailResult.rows) {
            if (row.email && !memberEmails.includes(row.email)) {
              memberEmails.push(row.email);
            }
          }
        }
      }

      const html = `
<div style="font-family: 'Inter', -apple-system, sans-serif; background-color: #f4f7f9; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6); padding: 40px; text-align: center; color: #ffffff;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 800;">AI KRAK HACK 2026</h1>
      <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Edycja profilu zespolu</p>
    </div>
    <div style="padding: 40px; color: #334155; line-height: 1.6;">
      <p style="font-size: 18px; font-weight: 600;">Czesc, zespol ${team.name}!</p>
      <p>Mozecie teraz edytowac profil swojego projektu na stronie AI Krak Hack. Dodajcie opis, technologie, screeny i prezentacje.</p>
      <div style="margin: 30px 0; text-align: center;">
        <a href="${editLink}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #06b6d4, #3b82f6); color: white; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px;">Edytuj profil zespolu &rarr;</a>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0;">
        <p style="font-size: 13px; color: #64748b; margin: 0 0 8px;">Link do edycji (nie udostepniajcie go publicznie):</p>
        <code style="font-size: 12px; color: #0f172a; word-break: break-all;">${editLink}</code>
      </div>
      <p style="font-size: 13px; color: #94a3b8; text-align: center;">
        Pozdrawiamy,<br><strong>Zespol AI Krak Hack 2026</strong><br>AI Possibilities Lab &bull; WSEI Krakow
      </p>
    </div>
  </div>
</div>`;

      let teamSent = false;
      if (memberEmails.length > 0) {
        for (const email of memberEmails) {
          const ok = await sendResendEmail(email, 'Edytuj profil swojego zespolu — AI Krak Hack 2026', html);
          if (ok) teamSent = true;
        }
      }

      if (teamSent) {
        sent++;
        await pool.query('UPDATE team_projects SET email_last_sent_at = NOW() WHERE id = $1', [team.id]);
      } else {
        failed++;
      }

      details.push({
        id: team.id,
        name: team.name,
        slug: team.slug,
        emails_found: memberEmails,
        sent: teamSent,
        edit_link: editLink,
      });
    }

    res.json({ success: true, total: teams.length, sent, failed, details });
  } catch (err) {
    console.error('[TeamProjects] Bulk send error:', err);
    res.status(500).json({ error: 'Blad wysylki zbiorczej' });
  }
});

// Helper: build team edit-link email HTML
function buildTeamEditLinkHtml(team, editLink) {
  const passwordBlock = team.edit_password ? `
      <div style="background: #eff6ff; border: 2px solid #bfdbfe; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
        <p style="font-size: 13px; color: #3b82f6; margin: 0 0 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Haslo do edycji</p>
        <code style="font-size: 22px; color: #1e40af; font-weight: 800; letter-spacing: 0.1em;">${team.edit_password}</code>
        <p style="font-size: 12px; color: #64748b; margin: 8px 0 0;">Bedziecie go potrzebowac przy pierwszym logowaniu do formularza edycji.</p>
      </div>` : '';
  return `
<div style="font-family: 'Inter', -apple-system, sans-serif; background-color: #f4f7f9; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6); padding: 40px; text-align: center; color: #ffffff;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 800;">AI KRAK HACK 2026</h1>
      <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Edycja profilu zespolu</p>
    </div>
    <div style="padding: 40px; color: #334155; line-height: 1.6;">
      <p style="font-size: 18px; font-weight: 600;">Czesc, zespol ${team.name}!</p>
      <p>Mozecie teraz edytowac profil swojego projektu na stronie AI Krak Hack. Dodajcie opis, technologie, screeny i prezentacje.</p>
      <div style="margin: 30px 0; text-align: center;">
        <a href="${editLink}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #06b6d4, #3b82f6); color: white; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px;">Edytuj profil zespolu &rarr;</a>
      </div>
      ${passwordBlock}
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0;">
        <p style="font-size: 13px; color: #64748b; margin: 0 0 8px;">Link do edycji (nie udostepniajcie go publicznie):</p>
        <code style="font-size: 12px; color: #0f172a; word-break: break-all;">${editLink}</code>
      </div>
      <p style="font-size: 13px; color: #94a3b8; text-align: center;">
        Pozdrawiamy,<br><strong>Zespol AI Krak Hack 2026</strong><br>AI Possibilities Lab &bull; WSEI Krakow
      </p>
    </div>
  </div>
</div>`;
}

// Helper: build certificate email HTML
function buildCertEmailHtml(cert, verifyUrl) {
  const isWinner = cert.certificate_type === 'winner';
  return `
<div style="font-family: 'Inter', -apple-system, sans-serif; background-color: #f4f7f9; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, ${isWinner ? '#f59e0b, #ef4444' : '#06b6d4, #3b82f6, #8b5cf6'}); padding: 40px; text-align: center; color: #ffffff;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 800;">AI KRAK HACK 2026</h1>
      <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">${isWinner ? 'Certyfikat Zwyciezcy' : 'Certyfikat Uczestnictwa'}</p>
    </div>
    <div style="padding: 40px; color: #334155; line-height: 1.6;">
      <p style="font-size: 18px; font-weight: 600;">Czesc ${cert.participant_name}!</p>
      <p>${isWinner
        ? `Gratulacje! Twoj zespol <strong>${cert.team_name}</strong> zwyciezyl w AI Krak Hack 2026!`
        : `Dziekujemy za udzial w AI Krak Hack 2026 w zespole <strong>${cert.team_name}</strong>!`
      }</p>
      ${cert.project_name ? `<p>Projekt: <strong>${cert.project_name}</strong></p>` : ''}
      <p>Twoj certyfikat jest dostepny online i mozesz go udostepnic na LinkedIn:</p>
      <div style="margin: 30px 0; text-align: center;">
        <a href="${verifyUrl}" style="display: inline-block; padding: 16px 32px; background: ${isWinner ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 'linear-gradient(135deg, #06b6d4, #3b82f6)'}; color: white; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px;">Zobacz certyfikat &rarr;</a>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; text-align: center; margin: 20px 0;">
        <p style="font-size: 12px; color: #64748b; margin: 0 0 4px;">Hash weryfikacyjny</p>
        <code style="font-size: 14px; color: #0f172a; font-weight: 600;">${cert.hash}</code>
      </div>
      <p style="font-size: 13px; color: #94a3b8; text-align: center;">
        Pozdrawiamy,<br><strong>Zespol AI Krak Hack 2026</strong><br>AI Possibilities Lab &bull; WSEI Krakow
      </p>
    </div>
  </div>
</div>`;
}

// POST /api/admin/team-projects/:id/send-test-email — Send team edit-link email to test address
app.post('/api/admin/team-projects/:id/send-test-email', requireAdmin, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Brak adresu email' });

    const result = await pool.query('SELECT * FROM team_projects WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Nie znaleziono zespolu' });

    const team = result.rows[0];
    const baseUrl = process.env.BASE_URL || 'https://krakhack.info';
    const editLink = team.edit_token
      ? `${baseUrl}/zespoly/${team.slug}/edytuj/${team.edit_token}`
      : `${baseUrl}/zespoly/${team.slug}/edytuj/TOKEN_PLACEHOLDER`;
    const html = buildTeamEditLinkHtml(team, editLink);

    const success = await sendResendEmail(email, 'Edytuj profil swojego zespolu — AI Krak Hack 2026', html);
    if (!success) return res.status(500).json({ success: false, message: 'Wysylka nie powiodla sie — sprawdz RESEND_API_KEY' });

    res.json({ success: true, message: `Email testowy wyslany na ${email}` });
  } catch (err) {
    console.error('[TeamProjects] Send test email error:', err);
    res.status(500).json({ success: false, message: 'Blad wysylki testowej' });
  }
});

// GET /api/admin/certificates/preview-email — Preview certificate email
app.get('/api/admin/certificates/preview-email', requireAdmin, async (req, res) => {
  try {
    let query, params;
    if (req.query.id) {
      query = "SELECT * FROM certificates WHERE id = $1 AND status = 'issued'";
      params = [req.query.id];
    } else {
      query = "SELECT * FROM certificates WHERE status = 'issued' AND hash IS NOT NULL ORDER BY id LIMIT 1";
      params = [];
    }
    const result = await pool.query(query, params);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Brak wydanego certyfikatu do podgladu' });

    const cert = result.rows[0];
    const baseUrl = process.env.BASE_URL || 'https://krakhack.info';
    const verifyUrl = `${baseUrl}/verify/${cert.hash}`;
    const isWinner = cert.certificate_type === 'winner';
    const html = buildCertEmailHtml(cert, verifyUrl);

    res.json({
      subject: `${isWinner ? 'Certyfikat Zwyciezcy' : 'Certyfikat Uczestnictwa'} - AI Krak Hack 2026`,
      html,
      participant_name: cert.participant_name,
      id: cert.id,
    });
  } catch (err) {
    console.error('[Certs] Preview email error:', err);
    res.status(500).json({ error: 'Blad podgladu emaila certyfikatu' });
  }
});

// POST /api/admin/certificates/:id/send-test-email — Send certificate email to test address
app.post('/api/admin/certificates/:id/send-test-email', requireAdmin, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Brak adresu email' });

    const result = await pool.query("SELECT * FROM certificates WHERE id = $1 AND status = 'issued'", [req.params.id]);
    if (result.rows.length === 0) return res.status(400).json({ success: false, message: 'Certyfikat musi byc wydany (issued)' });

    const cert = result.rows[0];
    const baseUrl = process.env.BASE_URL || 'https://krakhack.info';
    const verifyUrl = `${baseUrl}/verify/${cert.hash}`;
    const isWinner = cert.certificate_type === 'winner';
    const html = buildCertEmailHtml(cert, verifyUrl);

    const success = await sendResendEmail(
      email,
      `${isWinner ? 'Certyfikat Zwyciezcy' : 'Certyfikat Uczestnictwa'} - AI Krak Hack 2026`,
      html
    );
    if (!success) return res.status(500).json({ success: false, message: 'Wysylka nie powiodla sie — sprawdz RESEND_API_KEY' });

    res.json({ success: true, message: `Email testowy wyslany na ${email}` });
  } catch (err) {
    console.error('[Certs] Send test email error:', err);
    res.status(500).json({ success: false, message: 'Blad wysylki testowej' });
  }
});

// ─── Public Results API ───────────────────────────────────────────────────────

// GET /api/editions/:number/results — Full results for edition (public)
app.get('/api/editions/:number/results', async (req, res) => {
  try {
    const editionNumber = parseInt(req.params.number);
    if (isNaN(editionNumber)) return res.status(400).json({ error: 'Nieprawidłowy numer edycji' });

    const cfgResult = await pool.query('SELECT * FROM edition_config WHERE edition_number = $1', [editionNumber]);
    if (cfgResult.rows.length === 0) return res.status(404).json({ error: 'Brak konfiguracji edycji' });
    const config = cfgResult.rows[0];

    // Get jury scores joined with team details
    const scoresResult = await pool.query(`
      SELECT
        js.id, js.team_slug, js.challenge, js.juror_name,
        js.innovation, js.technical_value, js.usefulness, js.presentation_quality, js.notes,
        tp.name as team_name, tp.project_name, tp.short_description, tp.members, tp.university
      FROM jury_scores js
      LEFT JOIN team_projects tp ON js.team_project_id = tp.id
      WHERE js.edition_number = $1
      ORDER BY js.challenge, (js.innovation + js.technical_value + js.usefulness + js.presentation_quality) DESC
    `, [editionNumber]);

    // Group by challenge -> team, support multiple jurors (averaging)
    const challengeTeams = {};
    for (const row of scoresResult.rows) {
      const ch = row.challenge;
      const slug = row.team_slug;
      if (!challengeTeams[ch]) challengeTeams[ch] = {};
      if (!challengeTeams[ch][slug]) {
        challengeTeams[ch][slug] = {
          teamId: slug,
          teamName: row.team_name || slug,
          projectName: row.project_name || '',
          shortDescription: row.short_description || '',
          members: row.members || [],
          jurorScores: [],
        };
      }
      challengeTeams[ch][slug].jurorScores.push({
        juror: row.juror_name,
        innovation: row.innovation,
        technicalValue: row.technical_value,
        usefulness: row.usefulness,
        presentationQuality: row.presentation_quality,
      });
    }

    // Compute averaged scores + placement per challenge
    const challengeConfig = Array.isArray(config.challenges) ? config.challenges : JSON.parse(config.challenges || '[]');
    const challenges = {};
    for (const cfg of challengeConfig) {
      const teamsMap = challengeTeams[cfg.slug] || {};
      const teams = Object.values(teamsMap).map(t => {
        const n = t.jurorScores.length || 1;
        const avg = (field) => Math.round(t.jurorScores.reduce((s, j) => s + (j[field] || 0), 0) / n);
        const inn = avg('innovation');
        const tech = avg('technicalValue');
        const use = avg('usefulness');
        const pres = avg('presentationQuality');
        return {
          teamId: t.teamId,
          teamName: t.teamName,
          projectName: t.projectName,
          shortDescription: t.shortDescription,
          members: t.members,
          scores: { innovation: inn, technicalValue: tech, usefulness: use, presentationQuality: pres, total: inn + tech + use + pres },
        };
      });
      teams.sort((a, b) => b.scores.total - a.scores.total);
      teams.forEach((t, i) => { t.placement = i + 1; });
      challenges[cfg.slug] = { slug: cfg.slug, name: cfg.label, color: cfg.color, results: teams };
    }

    const parse = (v) => Array.isArray(v) ? v : (typeof v === 'string' ? JSON.parse(v || '[]') : (v || []));

    res.json({
      edition: editionNumber,
      name: config.name,
      status: config.status,
      visible_placements: config.visible_placements,
      show_scores: config.show_scores,
      scoring_categories: parse(config.scoring_categories),
      max_score_per_category: config.max_score_per_category,
      challenges,
      special_mentions: parse(config.special_mentions),
      jury_members: parse(config.jury_members),
    });
  } catch (err) {
    console.error('[Results] Get results error:', err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// ─── Admin: Edition Config ────────────────────────────────────────────────────

// GET /api/admin/edition-config/:number
app.get('/api/admin/edition-config/:number', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM edition_config WHERE edition_number = $1', [parseInt(req.params.number)]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Brak konfiguracji' });
    const row = result.rows[0];
    const parse = (v) => Array.isArray(v) ? v : (typeof v === 'string' ? JSON.parse(v || '[]') : (v || []));
    res.json({ ...row, challenges: parse(row.challenges), special_mentions: parse(row.special_mentions), jury_members: parse(row.jury_members), scoring_categories: parse(row.scoring_categories) });
  } catch (err) {
    console.error('[Config] GET error:', err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// PATCH /api/admin/edition-config/:number
app.patch('/api/admin/edition-config/:number', requireAdmin, async (req, res) => {
  try {
    const { name, status, visible_placements, show_scores, challenges, special_mentions, jury_members, scoring_categories, max_score_per_category } = req.body;
    const result = await pool.query(`
      INSERT INTO edition_config (edition_number, name, status, visible_placements, show_scores, challenges, special_mentions, jury_members, scoring_categories, max_score_per_category, updated_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW())
      ON CONFLICT (edition_number) DO UPDATE SET
        name = EXCLUDED.name, status = EXCLUDED.status,
        visible_placements = EXCLUDED.visible_placements, show_scores = EXCLUDED.show_scores,
        challenges = EXCLUDED.challenges, special_mentions = EXCLUDED.special_mentions,
        jury_members = EXCLUDED.jury_members, scoring_categories = EXCLUDED.scoring_categories,
        max_score_per_category = EXCLUDED.max_score_per_category, updated_at = NOW()
      RETURNING *
    `, [parseInt(req.params.number), name, status, visible_placements, show_scores,
        JSON.stringify(challenges || []), JSON.stringify(special_mentions || []),
        JSON.stringify(jury_members || []), JSON.stringify(scoring_categories || []),
        max_score_per_category || 20]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[Config] PATCH error:', err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// ─── Admin: Jury Scores ───────────────────────────────────────────────────────

// GET /api/admin/jury-scores/:editionNumber
app.get('/api/admin/jury-scores/:editionNumber', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT js.*, tp.name as team_name
      FROM jury_scores js
      LEFT JOIN team_projects tp ON js.team_project_id = tp.id
      WHERE js.edition_number = $1
      ORDER BY js.challenge, (js.innovation + js.technical_value + js.usefulness + js.presentation_quality) DESC
    `, [parseInt(req.params.editionNumber)]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// PATCH /api/admin/jury-scores/:id
app.patch('/api/admin/jury-scores/:id', requireAdmin, async (req, res) => {
  try {
    const { innovation, technical_value, usefulness, presentation_quality, notes, juror_name } = req.body;
    const result = await pool.query(`
      UPDATE jury_scores SET
        innovation = COALESCE($1, innovation),
        technical_value = COALESCE($2, technical_value),
        usefulness = COALESCE($3, usefulness),
        presentation_quality = COALESCE($4, presentation_quality),
        notes = COALESCE($5, notes),
        juror_name = COALESCE($6, juror_name),
        updated_at = NOW()
      WHERE id = $7 RETURNING *
    `, [innovation, technical_value, usefulness, presentation_quality, notes, juror_name, req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Nie znaleziono' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// POST /api/admin/jury-scores — add/upsert jury score
app.post('/api/admin/jury-scores', requireAdmin, async (req, res) => {
  try {
    const { edition_number, team_slug, challenge, juror_name, innovation, technical_value, usefulness, presentation_quality, notes } = req.body;
    const tpResult = await pool.query('SELECT id FROM team_projects WHERE slug = $1 AND edition_number = $2 LIMIT 1', [team_slug, edition_number]);
    const teamProjectId = tpResult.rows[0]?.id || null;
    const result = await pool.query(`
      INSERT INTO jury_scores (edition_number, team_project_id, team_slug, challenge, juror_name, innovation, technical_value, usefulness, presentation_quality, notes)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      ON CONFLICT (edition_number, team_slug, juror_name) DO UPDATE SET
        innovation = EXCLUDED.innovation, technical_value = EXCLUDED.technical_value,
        usefulness = EXCLUDED.usefulness, presentation_quality = EXCLUDED.presentation_quality,
        notes = EXCLUDED.notes, updated_at = NOW()
      RETURNING *
    `, [edition_number, teamProjectId, team_slug, challenge, juror_name || 'Jury',
        innovation || 0, technical_value || 0, usefulness || 0, presentation_quality || 0, notes || '']);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[JuryScores] POST error:', err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// GET /api/teams/edition/:editionNumber — List teams for edition (public)
app.get('/api/teams/edition/:editionNumber', async (req, res) => {
  try {
    const edition = parseInt(req.params.editionNumber);
    if (isNaN(edition)) return res.status(400).json({ error: 'Nieprawidlowy numer edycji' });

    const result = await pool.query(
      `SELECT id, edition_number, slug, name, placement, placement_label, special_mention,
              challenge, members, university, project_name, short_description, full_description,
              key_features, technologies, images, presentation_file, presentation_slides,
              created_at, updated_at
       FROM team_projects WHERE edition_number = $1
       ORDER BY placement NULLS LAST, name`,
      [edition]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('[TeamProjects] Public list error:', err);
    res.status(500).json({ error: 'Blad serwera' });
  }
});

// GET /api/teams/edition/:editionNumber/:slug — Single team (public)
app.get('/api/teams/edition/:editionNumber/:slug', async (req, res) => {
  try {
    const edition = parseInt(req.params.editionNumber);
    if (isNaN(edition)) return res.status(400).json({ error: 'Nieprawidlowy numer edycji' });

    const result = await pool.query(
      `SELECT id, edition_number, slug, name, placement, placement_label, special_mention,
              challenge, members, university, project_name, short_description, full_description,
              key_features, technologies, images, presentation_file, presentation_slides,
              created_at, updated_at
       FROM team_projects WHERE edition_number = $1 AND slug = $2`,
      [edition, req.params.slug]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Nie znaleziono zespolu' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[TeamProjects] Public get error:', err);
    res.status(500).json({ error: 'Blad serwera' });
  }
});

// GET /api/teams/:slug/edit/:token — Get team data for editing (token-based, public)
app.get('/api/teams/:slug/edit/:token', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, edition_number, slug, name, placement, placement_label, special_mention,
              challenge, members, university, project_name, short_description, full_description,
              key_features, technologies, images, presentation_file, presentation_slides,
              edit_password, edit_history,
              created_at, updated_at
       FROM team_projects WHERE slug = $1 AND edit_token = $2`,
      [req.params.slug, req.params.token]
    );
    if (result.rows.length === 0) return res.status(403).json({ error: 'Nieprawidlowy token edycji' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[TeamProjects] Token get error:', err);
    res.status(500).json({ error: 'Blad serwera' });
  }
});

// POST /api/teams/:slug/verify-edit-password/:token — Verify team edit password
app.post('/api/teams/:slug/verify-edit-password/:token', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Brak hasla' });

    const result = await pool.query(
      'SELECT edit_password FROM team_projects WHERE slug = $1 AND edit_token = $2',
      [req.params.slug, req.params.token]
    );
    if (result.rows.length === 0) return res.status(403).json({ error: 'Nieprawidlowy token edycji' });

    const team = result.rows[0];
    const adminPassword = process.env.ADMIN_PASSWORD || 'MakaPaka2026';

    if (password === team.edit_password || password === adminPassword) {
      return res.json({ success: true });
    }
    return res.status(403).json({ error: 'Nieprawidlowe haslo' });
  } catch (err) {
    console.error('[TeamProjects] Verify password error:', err);
    res.status(500).json({ error: 'Blad serwera' });
  }
});

// PATCH /api/teams/:slug/edit/:token — Update editable fields (token-based, public)
app.patch('/api/teams/:slug/edit/:token', async (req, res) => {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD || 'MakaPaka2026';
    const providedPassword = req.headers['x-edit-password'];

    // Verify token and get current data for history
    const check = await pool.query(
      'SELECT id, edit_password, edit_history FROM team_projects WHERE slug = $1 AND edit_token = $2',
      [req.params.slug, req.params.token]
    );
    if (check.rows.length === 0) return res.status(403).json({ error: 'Nieprawidlowy token edycji' });

    const team = check.rows[0];

    // Validate password
    if (!providedPassword || (providedPassword !== team.edit_password && providedPassword !== adminPassword)) {
      return res.status(403).json({ error: 'Nieprawidlowe haslo edycji' });
    }

    const teamId = team.id;
    const editableFields = [
      'project_name', 'short_description', 'full_description',
      'key_features', 'technologies', 'images', 'presentation_file', 'university',
    ];

    const updates = [];
    const params = [];
    let paramIdx = 1;

    const changedFields = [];
    for (const field of editableFields) {
      if (req.body[field] !== undefined) {
        changedFields.push(field);
        const value = field === 'images'
          ? JSON.stringify(req.body[field])
          : req.body[field];
        updates.push(`${field} = $${paramIdx++}`);
        params.push(value);
      }
    }

    if (updates.length === 0) return res.status(400).json({ error: 'Brak danych do aktualizacji' });

    // Build edit history entry
    const historyEntry = {
      timestamp: new Date().toISOString(),
      editor: providedPassword === adminPassword ? 'admin' : 'team',
      fields: changedFields,
    };
    const currentHistory = team.edit_history || [];
    const newHistory = [historyEntry, ...currentHistory].slice(0, 20);

    updates.push(`edit_history = $${paramIdx++}`);
    params.push(JSON.stringify(newHistory));
    updates.push(`updated_at = NOW()`);
    params.push(teamId);

    const result = await pool.query(
      `UPDATE team_projects SET ${updates.join(', ')} WHERE id = $${paramIdx}
       RETURNING id, edition_number, slug, name, placement, placement_label, special_mention,
                 challenge, members, university, project_name, short_description, full_description,
                 key_features, technologies, images, presentation_file, presentation_slides,
                 edit_history, created_at, updated_at`,
      params
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[TeamProjects] Token update error:', err);
    res.status(500).json({ error: 'Blad serwera' });
  }
});

// POST /api/teams/:slug/upload-presentation/:token — Upload PDF presentation (token-based)
app.post('/api/teams/:slug/upload-presentation/:token', (req, res, next) => {
  // Validate token before allowing upload
  const { slug, token } = req.params;
  pool.query(
    'SELECT id, edit_password FROM team_projects WHERE slug = $1 AND edit_token = $2',
    [slug, token]
  ).then(check => {
    if (check.rows.length === 0) return res.status(403).json({ error: 'Nieprawidlowy token edycji' });

    const team = check.rows[0];
    const adminPassword = process.env.ADMIN_PASSWORD || 'MakaPaka2026';
    const providedPassword = req.headers['x-edit-password'];

    if (!providedPassword || (providedPassword !== team.edit_password && providedPassword !== adminPassword)) {
      return res.status(403).json({ error: 'Nieprawidlowe haslo edycji' });
    }

    // Proceed with multer upload
    uploadPresentation.single('file')(req, res, async (err) => {
      if (err) {
        if (err.message === 'Tylko pliki PDF') return res.status(400).json({ error: 'Tylko pliki PDF sa dozwolone' });
        if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'Plik jest za duzy (maks. 20MB)' });
        return res.status(400).json({ error: err.message || 'Blad przeslania pliku' });
      }
      if (!req.file) return res.status(400).json({ error: 'Brak pliku' });

      const presentationPath = `/assets/presentations/${slug}-presentation.pdf`;
      try {
        await pool.query(
          'UPDATE team_projects SET presentation_file = $1, updated_at = NOW() WHERE id = $2',
          [presentationPath, team.id]
        );
        res.json({ success: true, presentation_file: presentationPath });
      } catch (dbErr) {
        console.error('[TeamProjects] Upload presentation DB error:', dbErr);
        res.status(500).json({ error: 'Blad zapisywania sciezki pliku' });
      }
    });
  }).catch(err => {
    console.error('[TeamProjects] Upload presentation token check error:', err);
    res.status(500).json({ error: 'Blad serwera' });
  });
});

// POST /api/admin/team-projects/:id/upload-presentation — Upload PDF presentation (admin)
app.post('/api/admin/team-projects/:id/upload-presentation', requireAdmin, async (req, res) => {
  try {
    const teamResult = await pool.query('SELECT slug FROM team_projects WHERE id = $1', [req.params.id]);
    if (teamResult.rows.length === 0) return res.status(404).json({ error: 'Nie znaleziono zespolu' });

    // Set slug on params so multer filename callback can use it
    req.params.slug = teamResult.rows[0].slug;

    uploadPresentation.single('file')(req, res, async (err) => {
      if (err) {
        if (err.message === 'Tylko pliki PDF') return res.status(400).json({ error: 'Tylko pliki PDF sa dozwolone' });
        if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'Plik jest za duzy (maks. 20MB)' });
        return res.status(400).json({ error: err.message || 'Blad przeslania pliku' });
      }
      if (!req.file) return res.status(400).json({ error: 'Brak pliku' });

      const presentationPath = `/assets/presentations/${req.params.slug}-presentation.pdf`;
      await pool.query(
        'UPDATE team_projects SET presentation_file = $1, updated_at = NOW() WHERE id = $2',
        [presentationPath, req.params.id]
      );
      res.json({ success: true, presentation_file: presentationPath });
    });
  } catch (err) {
    console.error('[TeamProjects] Admin upload presentation error:', err);
    res.status(500).json({ error: 'Blad serwera' });
  }
});

// SPA fallback with OG meta tag injection for certificate pages
app.get('*', async (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');

  // Inject OG meta tags for /verify/:hash URLs
  const verifyMatch = req.path.match(/^\/verify\/([a-f0-9]{32,64})$/);
  if (verifyMatch && process.env.DATABASE_URL) {
    try {
      const certResult = await pool.query(
        "SELECT * FROM certificates WHERE hash = $1 AND status = 'issued'",
        [verifyMatch[1]]
      );
      if (certResult.rows.length > 0) {
        const c = certResult.rows[0];
        let html = fs.readFileSync(indexPath, 'utf8');

        const isWinner = c.certificate_type === 'winner';
        const title = isWinner
          ? `AI Krak Hack 2026 — Zwyciezca: ${c.participant_name}`
          : `AI Krak Hack 2026 — Certyfikat: ${c.participant_name}`;
        const desc = isWinner
          ? `${c.participant_name} zwyciezyl/a w AI Krak Hack 2026 z projektem "${c.project_name}" w zespole ${c.team_name}. Certyfikat zweryfikowany kryptograficznie.`
          : `${c.participant_name} wzial/a udzial w AI Krak Hack 2026 w zespole ${c.team_name}. Certyfikat zweryfikowany kryptograficznie.`;

        const baseUrl = process.env.BASE_URL || 'https://krakhack.info';
        const ogTags = `
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${baseUrl}/verify/${c.hash}" />
    <meta property="og:site_name" content="AI Krak Hack 2026 — Certyfikaty" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${desc}" />`;

        const siteConfig = JSON.stringify({
          mode: process.env.SITE_MODE || 'hackathon',
          hackathonUrl: process.env.HACKATHON_URL || 'https://krakhack.info',
          labUrl: process.env.LAB_URL || (process.env.BASE_URL || 'http://localhost:5175'),
        });
        html = html.replace('</head>', ogTags + `\n  <script>window.__SITE_CONFIG__=${siteConfig}</script>\n  </head>`);
        return res.send(html);
      }
    } catch (err) {
      console.error('[OG] Error injecting meta tags:', err);
    }
  }

  // Inject site config + mode-specific meta tags into HTML
  try {
    let html = fs.readFileSync(indexPath, 'utf8');
    const mode = process.env.SITE_MODE || 'hackathon';
    const siteConfig = JSON.stringify({
      mode,
      hackathonUrl: process.env.HACKATHON_URL || 'https://krakhack.info',
      labUrl: process.env.LAB_URL || (process.env.BASE_URL || 'http://localhost:5175'),
    });

    let injections = `<script>window.__SITE_CONFIG__=${siteConfig}</script>`;

    // In lab mode, replace hackathon meta tags with lab-specific ones
    if (mode === 'lab') {
      const labUrl = process.env.LAB_URL || 'https://possibilitieslab.org';
      html = html.replace(/<title>[^<]*<\/title>/, '<title>AI Possibilities Lab — Koło Naukowe AI | WSEI Kraków</title>');
      html = html.replace(/content="AI KrakHack 2026 - Hackathon AI \| WSEI Kraków"/g, 'content="AI Possibilities Lab — Koło Naukowe AI | WSEI Kraków"');
      html = html.replace(/content="Dołącz do AI KrakHack 2026![^"]*"/g, 'content="Koło Naukowe AI przy WSEI w Krakowie. Projekty, hackathony, community i współpraca z biznesem. Dołącz do nas!"');
      html = html.replace(/content="https:\/\/krakhack\.info\/"/g, `content="${labUrl}/"`);
      html = html.replace(/content="https:\/\/krakhack\.info\/image\.png"/g, `content="${labUrl}/favicon-lab.png"`);
      injections += `\n  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-lab-32.png" />`;
      injections += `\n  <link rel="icon" type="image/png" sizes="192x192" href="/favicon-lab.png" />`;
      injections += `\n  <link rel="apple-touch-icon" href="/apple-touch-icon-lab.png" />`;
    }

    html = html.replace('</head>', `  ${injections}\n  </head>`);
    res.send(html);
  } catch (err) {
    res.sendFile(indexPath);
  }
});

// ─── Start ─────────────────────────────────────────────────

initDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`[Server] Running on port ${port}`);
      console.log(`[Server] Database: connected`);
      console.log(`[Server] Email: ${process.env.RESEND_API_KEY ? 'configured (key: ' + process.env.RESEND_API_KEY.slice(0, 6) + '...)' : 'NOT configured (set RESEND_API_KEY)'}`);
      console.log(`[Server] Email FROM: ${process.env.EMAIL_FROM || 'AI Krak Hack <onboarding@resend.dev> (default)'}`);
      console.log(`[Server] Admin email: ${process.env.ADMIN_EMAIL || 'NOT configured (set ADMIN_EMAIL)'}`);
      console.log(`[Server] Teams: ${process.env.TEAMS_WEBHOOK_URL ? 'configured' : 'NOT configured (set TEAMS_WEBHOOK_URL)'}`);
    });
  })
  .catch(err => {
    console.error('[Server] Database initialization failed:', err.message);
    console.error('[Server] Make sure DATABASE_URL is set correctly.');
    // Start server anyway so static files still work
    app.listen(port, () => {
      console.log(`[Server] Running on port ${port} (WITHOUT database — API calls will fail)`);
    });
  });
