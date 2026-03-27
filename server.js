import express from 'express';
import pg from 'pg';
import crypto from 'crypto';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import QRCode from 'qrcode';
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

// PostgreSQL
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Admin session tokens (in-memory, cleared on restart — admin just re-logs in)
const adminTokens = new Set();

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
  `);
  
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
app.use(express.static(path.join(__dirname, 'dist')));

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
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Brak statusu' });

    const result = await pool.query(
      'UPDATE submissions SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
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

// Submit survey (public)
app.post('/api/surveys', async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) return res.status(400).json({ error: 'Brak danych ankiety' });

    const result = await pool.query(
      'INSERT INTO surveys (data) VALUES ($1) RETURNING id, created_at',
      [data]
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

      res.json({ success: true, sent: sentCount, total: recipients.length });
      return;
    }

    res.status(400).json({ error: 'Nieprawidłowy cel (target)' });
  } catch (err) {
    console.error('[Mailing] Massive send error:', err);
    res.status(500).json({ error: 'Błąd podczas wysyłki masowej' });
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

// Bulk-generate draft certificates from confirmed attendees
app.post('/api/certificates/generate', requireAdmin, async (req, res) => {
  try {
    // Get confirmed teams with their members
    const teams = await pool.query(`
      SELECT
        a.team_name,
        jsonb_agg(
          jsonb_build_object(
            'name', s.data->>'firstName' || ' ' || s.data->>'lastName',
            'email', s.data->>'email',
            'university', s.data->>'university',
            'submission_id', s.id
          )
        ) as members
      FROM attendance a
      JOIN submissions s ON s.data->>'teamName' = a.team_name AND s.type = 'participant'
      WHERE a.status = 'confirmed'
      GROUP BY a.team_name
    `);

    let created = 0;
    let skipped = 0;

    for (const team of teams.rows) {
      for (const member of team.members) {
        // Check if certificate already exists for this participant+team
        const existing = await pool.query(
          'SELECT id FROM certificates WHERE participant_name = $1 AND team_name = $2',
          [member.name, team.team_name]
        );
        if (existing.rows.length > 0) {
          skipped++;
          continue;
        }

        await pool.query(
          `INSERT INTO certificates (participant_name, team_name, university, submission_id)
           VALUES ($1, $2, $3, $4)`,
          [member.name, team.team_name, member.university || '', member.submission_id || null]
        );
        created++;
      }
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
      `SELECT c.*, s.data->>'email' as participant_email
       FROM certificates c
       LEFT JOIN submissions s ON s.id = c.submission_id
       WHERE c.id = $1 AND c.status = 'issued'`,
      [id]
    );
    if (certResult.rows.length === 0) return res.status(400).json({ error: 'Certyfikat musi byc wydany (issued)' });

    const cert = certResult.rows[0];
    const email = req.body.email || cert.participant_email;
    if (!email) return res.status(400).json({ error: 'Brak adresu email' });

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
    res.json({ success });
  } catch (err) {
    console.error('[Certs] Email error:', err);
    res.status(500).json({ error: 'Blad wysylki emaila' });
  }
});

// Bulk send certificate emails (admin)
app.post('/api/certificates/bulk-send-email', requireAdmin, async (req, res) => {
  try {
    const certs = await pool.query(`
      SELECT c.*, s.data->>'email' as participant_email
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

// Delete certificate (admin)
app.delete('/api/certificates/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM certificates WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Nie znaleziono certyfikatu' });
    res.json({ success: true });
  } catch (err) {
    console.error('[Certs] Delete error:', err);
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

        html = html.replace('</head>', ogTags + '\n  </head>');
        return res.send(html);
      }
    } catch (err) {
      console.error('[OG] Error injecting meta tags:', err);
    }
  }

  res.sendFile(indexPath);
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
