import express from 'express';
import pg from 'pg';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import path from 'path';

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
  `);
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
  const fromAddr = process.env.EMAIL_FROM || 'AI Krak Hack <onboarding@resend.dev>';
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
            <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px;">Pytania? Napisz na: <a href="mailto:kontakt@aikrakhack.pl" style="color: #06b6d4;">kontakt@aikrakhack.pl</a></p>
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
app.get('/api/surveys', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM surveys ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('[API] Fetch surveys error:', err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// SPA fallback — all non-API routes serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
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
