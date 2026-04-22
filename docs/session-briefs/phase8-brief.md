# Phase 8 Brief — VotingWidget, Claims Admin, Participant Profiles, Events Admin

> Stan: **ZAMKNIĘTE** · 2026-04-22  
> Poprzedni brief: `docs/session-briefs/phase3-7-brief.md`  
> Pełny roadmap: `docs/ROADMAP.md`

---

## Faza 8 — Priorytet 1 (przed launch)

### Zrobione

| Co | Gdzie |
|---|---|
| `migrations/0012_add_profile_slug.sql` — nowa kolumna `users.profile_slug` | `migrations/0012_add_profile_slug.sql` |
| `VotingWidget` — People's Choice voting na stronie hackathonu | `src/app/components/VotingWidget.tsx` |
| `GET /api/hackathon/my-vote` — sprawdza aktualny głos usera | `server.js` |
| Wdrożenie VotingWidget w Edition2026 po TeamsSection | `src/app/pages/Edition2026.tsx` |
| Claims tab w ModeratorDashboard (confirm / reject) | `src/app/pages/panel/ModeratorDashboard.tsx` |
| `GET /api/panel/claims` — lista claimów (admin/mod) | `server.js` |
| `PATCH /api/panel/claims/:id` — potwierdź/odrzuć + auto team_members | `server.js` |
| `ParticipantsPage` — `/uczestnicy` publiczny katalog | `src/app/pages/ParticipantsPage.tsx` |
| `ParticipantProfile` — `/uczestnicy/:slug` profil uczestnika | `src/app/pages/ParticipantProfile.tsx` |
| `GET /api/public/participants` — publiczna lista uczestników | `server.js` |
| `GET /api/public/participants/:slug` — profil + projekty | `server.js` |
| `profile_slug` auto-generowany w `PATCH /api/panel/me` i `PATCH /api/invite/complete` | `server.js` |
| `slugify()` helper function w server.js | `server.js` |
| `EventsAdminPage` — `/panel/admin/wydarzenia` | `src/app/pages/panel/EventsAdminPage.tsx` |
| Kafelek "Wydarzenia" w AdminDashboard | `src/app/pages/panel/AdminDashboard.tsx` |
| Routing: `/uczestnicy`, `/uczestnicy/:slug`, `/panel/admin/wydarzenia` | `src/app/routes.ts` |

---

## Szczegóły implementacji

### VotingWidget

- Fetches teams from static `TEAMS` (id = team_projects.slug)
- Live vote bars: `GET /api/public/votes/3` — publiczny, odświeżany po każdym głosie
- User's current vote: `GET /api/hackathon/my-vote?edition=3` (wymaga Bearer token)
- Głosowanie: `POST /api/hackathon/vote` (istniejący endpoint)
- Optimistic UI — progress bar animuje się natychmiast
- Zalogowani nie-uczestnicy widzą komunikat "głosowanie tylko dla uczestników"
- Niezalogowani widzą link do /logowanie

### profile_slug generation

```
slugify(displayName) + '-' + crypto.randomBytes(3).toString('hex')
```
Przykład: "Jan Kowalski" → `jan-kowalski-a3f9b2`

- Generowany automatycznie gdy user po raz pierwszy ustawia `displayName`
- Raz przypisany — nie nadpisywany (trwałe URL profilu)
- `CASE WHEN profile_slug IS NULL AND $9 IS NOT NULL THEN $9 ELSE profile_slug END`

### Claims admin flow

1. Uczestnik klika "To mój zespół" → `team_claims` (status: `pending`)
2. Moderator/admin wchodzi w `/panel/moderator` → tab "Team Claims"
3. Filtr: "Oczekujące" (default) lub "Wszystkie"
4. Potwierdź → status: `confirmed` + jeśli `teams.slug` istnieje → INSERT INTO `team_members`
5. Odrzuć → status: `rejected`

### Participant profiles

- `/uczestnicy` — grid kart z avatar, imię, uczelnia, skills, rola
- `/uczestnicy/:slug` — pełny profil + publiczne projekty usera
- Pokazuje tylko `onboarding_completed = true` AND `profile_slug IS NOT NULL`

### Events admin

- Tabela wszystkich wydarzeń (wszystkie visibility)
- Kliknięcie na badge visibility → toggle public ↔ admin_only
- Formularz dodawania: title, typ, widoczność, daty, URL, opis
- Przycisk "Usuń" z potwierdzeniem

---

## Nowe API endpoints

```
GET  /api/hackathon/my-vote?edition=3   — user's current vote (auth)
GET  /api/panel/claims?status=pending   — list claims (admin/mod)
PATCH /api/panel/claims/:id             — confirm/reject (admin/mod)
GET  /api/public/participants           — public participants list
GET  /api/public/participants/:slug     — single participant profile
```

---

## Aktualny stan systemu (2026-04-22)

### Gotowe do produkcji (po `npm run migrate`)
- ✅ Wszystko z Faza 2–7
- ✅ VotingWidget na stronie hackathonu (Edition2026)
- ✅ Claims admin tab w ModeratorDashboard
- ✅ Publiczne profile uczestników `/uczestnicy`
- ✅ Events admin panel `/panel/admin/wydarzenia`

### DO ZROBIENIA przez Michała (wymagane przed pierwszym use)
- [ ] `npm run migrate` na Railway DB (0001–0012)
- [ ] Ustawić `FRONTEND_URL` + `BOT_API_KEY` na Railway
- [ ] Keycloak: zmienić hasło `michalmadejski2@gmail.com`
- [ ] Przetestować: `/logowanie` → Keycloak → `/panel` → `/panel/profil`
- [ ] Uruchomić `node scripts/migrate-hackathon-data.js` (dry-run najpierw)

---

## Pliki stworzone/zmienione w tej sesji (Faza 8)

```
# Nowe migracje
migrations/0012_add_profile_slug.sql

# Nowe komponenty
src/app/components/VotingWidget.tsx

# Nowe strony
src/app/pages/ParticipantsPage.tsx
src/app/pages/ParticipantProfile.tsx
src/app/pages/panel/EventsAdminPage.tsx

# Zmodyfikowane strony
src/app/pages/Edition2026.tsx              (VotingWidget)
src/app/pages/panel/ModeratorDashboard.tsx (Claims tab)
src/app/pages/panel/AdminDashboard.tsx     (Events tile)
src/app/routes.ts                          (new routes)

# Backend
server.js                                  (slugify, my-vote, claims CRUD, participants API, profile_slug gen)
```

---

## Pozostałe TODO (kolejne sesje)

### Priorytet 3 (po launch)
- [ ] Email notifications o nowych wydarzeniach (event_reminders)
- [ ] Rejestracja online nowych zespołów
- [ ] Team member linking z Faza 4 migration (auto-confirm claims → team_members)
- [ ] Profile uczestników — edycja widoczności (public/private toggle)
- [ ] Jury results page z pełnym scoreboard
- [ ] Live vote count na Edition page (auto-refresh co 30s)
