# Phase 3–7 Brief — Portfolio, Migration, Jury, Hackathon Flow, Events

> Stan: **ZAMKNIĘTE** · 2026-04-22  
> Poprzedni brief: `docs/session-briefs/phase2-brief.md`  
> Pełny roadmap: `docs/ROADMAP.md`

---

## Faza 3 — Profile + Portfolio projektów

### Zrobione

| Co | Gdzie |
|---|---|
| `AuthUser` rozszerzony o bio/github/linkedin/university/skills | `src/contexts/AuthContext.tsx` |
| `/panel/profil` — edycja profilu | `src/app/pages/panel/ProfilePage.tsx` |
| `/panel/projekty` — lista projektów z delete | `src/app/pages/panel/ProjectsPage.tsx` |
| `/panel/projekty/nowy` + `/panel/projekty/:id/edytuj` | `src/app/pages/panel/ProjectEditPage.tsx` |
| `/projekty/:slug` — publiczny widok projektu | `src/app/pages/ProjectPublicView.tsx` |
| Backend CRUD: `GET/POST/PATCH/DELETE /api/panel/projects` | `server.js` |
| `GET /api/public/projects/:slug` — publiczny (tylko visibility=public) | `server.js` |

### Slug generation
Nowy projekt: `slugify(title) + '-' + random(5)` — gwarantuje unikalność.

### Znany issue
`projects.team_project_id` był zadeklarowany jako `UUID` w migration 0003, a powinien być `INT`.  
Poprawiono w migration 0003 (przed uruchomieniem na Railway).

---

## Faza 4 — Migracja danych hackathonowych

### Zrobione

| Co | Gdzie |
|---|---|
| `scripts/migrate-hackathon-data.js` — idempotentny skrypt migracji | `scripts/migrate-hackathon-data.js` |
| `POST /api/admin/migrate-hackathon-data` — trigger przez panel (admin) | `server.js` |
| `GET /api/admin/migrate-hackathon-data/status` | `server.js` |

### Jak uruchomić

```bash
# Podgląd (dry-run, nic nie zapisuje)
node scripts/migrate-hackathon-data.js

# Aplikuj
node scripts/migrate-hackathon-data.js --apply

# Force re-migruj już zmigowane
node scripts/migrate-hackathon-data.js --apply --force
```

Lub przez panel admina:
```http
POST /api/admin/migrate-hackathon-data
{ "dryRun": false }
```

### Co robi
- Tworzy wpis w `teams` dla każdego `team_projects` (lub reużywa istniejący po slug)
- Tworzy wpis w `projects` dla każdego `team_projects` (widoczność: public, typ: hackathon)
- Ustawia `team_projects.project_id` = nowe project UUID (marker migracji)
- **Nie linkuje** `team_members` — uczestnicy klaimują ręcznie przez `/panel/moj-zespol`

---

## Faza 5 — Jury panel (magic-link)

### Zrobione

| Co | Gdzie |
|---|---|
| `/jury/:token` — pełnoekranowy panel jury | `src/app/pages/JuryPanel.tsx` |
| `verifyJuryToken` middleware (bez Keycloak) | `server.js` |
| `POST /api/jury/magic-link` (admin) — generuje 64-znakowy token | `server.js` |
| `GET /api/jury/verify?token` — publiczny, zwraca info o juroze | `server.js` |
| `GET /api/jury/projects?edition` — lista projektów + własne oceny | `server.js` |
| `POST /api/jury/scores` — upsert ocen (backward-compat kolumny + JSONB) | `server.js` |

### Jak wysłać zaproszenie dla jurora

```http
POST /api/jury/magic-link
Authorization: Bearer <admin_token>
{
  "name": "Jan Kowalski",
  "title": "Senior AI Engineer",
  "company": "Google",
  "editionNumber": 3,
  "expiresInDays": 14
}
```

Odpowiedź: `{ magicLink: "https://krakhack.info/jury/<64-char-token>" }`

### Scoring
- 4 kryteria: innowacyjność, wartość techniczna, użyteczność, jakość prezentacji
- Każde 0–20 pkt → maks. 80 pkt
- Range slidery w UI
- Backward-compat: zapisuje też stare kolumny `innovation`, `technical_value`, etc.

---

## Faza 6 — Pełny hackathon flow

### Zrobione

| Co | Gdzie |
|---|---|
| `migrations/0011` — `participant_votes` + `team_claims` | `migrations/0011_votes_events_claims.sql` |
| `/panel/moj-zespol` — claim przynależności do zespołu | `src/app/pages/panel/TeamClaimPage.tsx` |
| `POST/DELETE /api/hackathon/teams/claim` | `server.js` |
| `GET /api/hackathon/my-claims` | `server.js` |
| `GET /api/hackathon/teams?edition` — publiczna lista teamów | `server.js` |
| `POST /api/hackathon/vote` — głosowanie (1 głos / user / edycja) | `server.js` |
| `GET /api/public/votes/:edition` — liczba głosów per team | `server.js` |
| `GET /api/public/results/:edition` — zagregowane wyniki jury | `server.js` |

### Team claim flow
1. User klika "To mój zespół" na `/panel/moj-zespol`
2. Claim trafia do `team_claims` (status: `pending`)
3. Admin widzi pending claims (TODO: UI w moderator dashboard)
4. Admin potwierdza → status: `confirmed`
5. Po Fazie 4 migracji: `team_members` jest uzupełniany automatycznie

### Voting
- Jeden głos per user per edycja
- Zmiana głosu: ponowny `POST /api/hackathon/vote` (upsert)
- Wyniki głosowania: `GET /api/public/votes/3`

### TODO (nie zaimplementowane — Faza 6 partial)
- [ ] UI głosowania na stronie hackathonowej (`/hackathon` lub `/edycja/3`)
- [ ] Wyświetlanie live wyników na stronie edycji
- [ ] Admin UI do potwierdzania claimów (extend ModeratorDashboard)
- [ ] Rejestracja nowych zespołów online (tylko dla Fazy 4+ po launch)

---

## Faza 7 — Kalendarz + OpenClaw bot

### Zrobione

| Co | Gdzie |
|---|---|
| `/wydarzenia` — publiczny kalendarz wydarzeń | `src/app/pages/EventsPage.tsx` |
| `GET /api/public/events` — publiczne eventy | `server.js` |
| `GET/POST/PATCH/DELETE /api/events` (admin/moderator) | `server.js` |
| `POST /api/events/bot` — webhook dla bota (X-Bot-Key auth) | `server.js` |

### Bot webhook
```http
POST /api/events/bot
X-Bot-Key: <BOT_API_KEY env var>
Content-Type: application/json

{
  "title": "Hackathon XYZ 2026",
  "startsAt": "2026-06-15T09:00:00Z",
  "deadlineAt": "2026-06-01T23:59:00Z",
  "description": "...",
  "eventType": "hackathon",
  "url": "https://example.com",
  "organizer": "Some Org",
  "tags": ["AI", "ML"],
  "relevanceScore": 8,
  "source": "bot_openclaw"
}
```

Nowy event trafia z `visibility='admin_only'` → admin przełącza na `public` przez PATCH.

### Nowa zmienna env
```
BOT_API_KEY=<tajny klucz dla OpenClaw bota>
```

---

## Wszystkie nowe zmienne env (do ustawienia na Railway)

```
FRONTEND_URL=https://krakhack.info   # URL frontu (w invite email + jury link)
BOT_API_KEY=<losowy string>          # Klucz dla OpenClaw bot webhook
```

---

## Aktualny stan systemu (2026-04-22)

### Gotowe do produkcji (po `npm run migrate`)
- ✅ Keycloak SSO z PKCE flow
- ✅ `/logowanie` → Keycloak → `/panel`
- ✅ Panel z sidebar: Dashboard, Profil, Projekty, Mój zespół, Moderator, Admin, Wydarzenia, Certyfikaty
- ✅ Zaproszenia emailowe do onboardingu
- ✅ Moderator dashboard: lista userów, zmiana ról, invite modal
- ✅ Portfolio projektów (create/edit/delete + public view)
- ✅ Jury panel z magic-link (bez Keycloak)
- ✅ Głosowanie uczestników (1 głos / edycja)
- ✅ Team claim flow (pending → confirmed by admin)
- ✅ Publiczny kalendarz wydarzeń
- ✅ Bot webhook dla OpenClaw
- ✅ Legacy admin panel nadal działa

### DO ZROBIENIA przez Michała (wymagane przed pierwszym use)
- [ ] `npm run migrate` na Railway DB (0001–0011)
- [ ] Ustawić `FRONTEND_URL` + `BOT_API_KEY` na Railway
- [ ] Keycloak: zmienić hasło `michalmadejski2@gmail.com` (było `AdminKH2026!`)
- [ ] Przetestować: `/logowanie` → Keycloak → `/panel` → `/panel/profil`
- [ ] Wysłać pierwsze zaproszenie przez Moderator dashboard
- [ ] Uruchomić `node scripts/migrate-hackathon-data.js` (dry-run najpierw)

---

## Pozostałe TODO (kolejne sesje)

### Priorytet 1 (przed launch)
- [ ] UI głosowania na stronie edycji (VotingWidget component)
- [ ] Live wyniki: komponent na `/hackathon` pobierający `/api/public/results/3`
- [ ] Admin UI do potwierdzania claimów (extend ModeratorDashboard z tabem "Pending Claims")
- [ ] Events admin panel (prosta tabela w `/panel/admin`)

### Priorytet 2 (po launch)
- [ ] Profil publiczny: `/uczestnicy/:slug` — widok profilu uczestnika
- [ ] Katalog uczestników: `/uczestnicy` — lista z filtrowaniem
- [ ] Team member linkowanie po Fazie 4 migracji (confirm claims → team_members)
- [ ] Rejestracja online nowych zespołów (Faza 4+)
- [ ] Powiadomienia email o eventach (event_reminders)

---

## Pliki stworzone/zmienione w tej sesji (Fazy 2-7)

```
# Faza 2
src/app/components/ProtectedRoute.tsx
src/app/pages/panel/PanelLayout.tsx
src/app/pages/panel/PanelHome.tsx
src/app/pages/panel/AdminDashboard.tsx
src/app/pages/panel/ModeratorDashboard.tsx
src/app/pages/Onboarding.tsx
src/app/pages/AuthCallback.tsx          (zmodyfikowany)
src/app/routes.ts                       (zmodyfikowany)
server.js                               (zmodyfikowany)
migrations/0001–0010 + scripts/migrate.js

# Faza 3
src/app/pages/panel/ProfilePage.tsx
src/app/pages/panel/ProjectsPage.tsx
src/app/pages/panel/ProjectEditPage.tsx
src/app/pages/ProjectPublicView.tsx
src/contexts/AuthContext.tsx            (zmodyfikowany)

# Faza 4
migrations/0003_create_projects.sql     (poprawka: UUID→INT)
scripts/migrate-hackathon-data.js

# Faza 5
src/app/pages/JuryPanel.tsx

# Faza 6–7
migrations/0011_votes_events_claims.sql
src/app/pages/panel/TeamClaimPage.tsx
src/app/pages/EventsPage.tsx
```
