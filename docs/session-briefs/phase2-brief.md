# Phase 2 Brief — Panel shells + Invite flow + Moderator CMS

> Stan: **ZAMKNIĘTA** · 2026-04-22  
> Poprzedni brief: `docs/session-briefs/phase1-brief.md`  
> Pełny roadmap: `docs/ROADMAP.md`

---

## Co zrobiliśmy w Fazie 2

### 1. ProtectedRoute (`src/app/components/ProtectedRoute.tsx`)
- Auth guard: redirect do `/logowanie` jeśli brak sesji
- Role check: jeśli `roles` prop podany — wymaga co najmniej jednej z ról
- 403 UI jeśli zalogowany ale bez wymaganej roli

### 2. PanelLayout (`src/app/pages/panel/PanelLayout.tsx`)
- Sidebar z nawigacją role-aware
- `sticky top-16` — działa z fixed headerem
- `<Outlet />` dla sub-stron
- Auth guard (redirect do /logowanie)

### 3. Restructured routes (`src/app/routes.ts`)
```
/panel                 → PanelLayout (sidebar)
  (index)              → PanelHome
  admin                → AdminDashboard [wymaga: admin]
  moderator            → ModeratorDashboard [wymaga: admin|moderator]
/onboarding            → Onboarding (pre/post auth)
```

### 4. PanelHome (`src/app/pages/panel/PanelHome.tsx`)
- Ekstrakcja treści z starego Panel.tsx
- Powitanie, role badges, onboarding nudge, kafelki

### 5. AdminDashboard (`src/app/pages/panel/AdminDashboard.tsx`)
- Kafelki prowadzące do: stary panel admina, users, attendance, timer
- Guard: tylko rola `admin`

### 6. ModeratorDashboard (`src/app/pages/panel/ModeratorDashboard.tsx`)
- Lista użytkowników z search filtr
- RoleSelect dropdown (edytowalny tylko przez admin)
- InviteModal — formularz email + opcjonalnie imię
- Guard: admin lub moderator

### 7. Onboarding (`src/app/pages/Onboarding.tsx`)
- Tryb pre-auth: `?invite_token=XXX` → weryfikuje token, pre-fill z membership_applications
- Tryb post-auth: zalogowany user uzupełnia profil
- `savePendingOnboarding()` / `loadPendingOnboarding()` — bridguje dane przez Keycloak redirect
- Przycisk "Utwórz konto" → `login()` z zapisem do sessionStorage

### 8. AuthCallback update (`src/app/pages/AuthCallback.tsx`)
- Po exchangeCode sprawdza `loadPendingOnboarding()`
- Jeśli pending → redirect do `/onboarding` (zamiast `/panel`)

### 9. Backend — Invite flow (`server.js`)

| Endpoint | Auth | Opis |
|---|---|---|
| `POST /api/invite/send` | admin/moderator | Tworzy user + invite_token, wysyła email |
| `GET /api/invite/verify?token=XXX` | publiczny | Weryfikuje token, zwraca dane pre-fill |
| `PATCH /api/invite/complete` | JWT | Zapisuje profil, `onboarding_completed = true` |

### 10. Backend — User management (`server.js`)

| Endpoint | Auth | Opis |
|---|---|---|
| `GET /api/panel/users` | admin/moderator | Lista użytkowników (max 500) |
| `PATCH /api/panel/users/:id/role` | admin | Zmiana roli |
| `PATCH /api/panel/me` | JWT | Aktualizacja własnego profilu |

---

## DoD Fazy 2

- [x] `ProtectedRoute` — działa redirect i role guard ✅
- [x] `PanelLayout` z sidebar, sticky pod fixed headerem ✅
- [x] `/panel/admin` — shell admina, guard admin-only ✅
- [x] `/panel/moderator` — user list, role change, invite modal ✅
- [x] `/onboarding` — pre-fill z invite_token, post-auth save ✅
- [x] `POST /api/invite/send` + email z Resend ✅
- [x] `GET /api/invite/verify` — publiczny ✅
- [x] `PATCH /api/invite/complete` — zapisuje profil ✅
- [x] `GET /api/panel/users` — lista ✅
- [x] `PATCH /api/panel/users/:id/role` — zmiana roli ✅
- [x] Build przechodzi bez błędów ✅
- [ ] `npm run migrate` na Railway — do uruchomienia przez Michała (wciąż)
- [ ] E2E: admin wysyła zaproszenie → user klika link → uzupełnia profil

---

## Nowe zmienne env

```
FRONTEND_URL=https://krakhack.info   # używane w invite email URL (Railway)
```

---

## Fazy do zrobienia (kolejność)

### Faza 3 — Portfolio + profil uczestnika (Faza 2 DoD już domknięta)

- `GET /panel/profil` — strona edycji profilu (bio, GitHub, zdjęcie)
- `GET /panel/projekty` — lista projektów uczestnika
- Tworzenie projektu: nazwa, opis, tech stack, linki
- Widok publiczny projektu: `/projekty/:slug`
- Team management

### Faza 4 — Migracja danych hackathonowych

- Import team-projects do nowego schematu
- Migracja certyfikatów do nowych tabel
- Linki team → participants

### Faza 5 — Jury panel (magic link)

- `POST /api/jury/magic-link` — generuje jednorazowy link dla jurora
- `GET /jury/:token` — panel jury z listą projektów do oceny
- Formularz oceny projektu

### Faza 6 — Pełny hackathon flow

- Rejestracja zespołów online
- Voting przez uczestników
- Wyniki live

### Faza 7 — Kalendarz + OpenClaw bot

- Tabela `events` (już w DB)
- `GET /api/events` — lista eventów
- POST z Discord/OpenClaw bot → tworzy event
- Frontend calendar widget

---

## Pliki zmienione / stworzone

```
src/app/components/ProtectedRoute.tsx    — NOWY
src/app/pages/panel/PanelLayout.tsx      — NOWY
src/app/pages/panel/PanelHome.tsx        — NOWY (ekstrakowana z Panel.tsx)
src/app/pages/panel/AdminDashboard.tsx   — NOWY
src/app/pages/panel/ModeratorDashboard.tsx — NOWY
src/app/pages/Onboarding.tsx             — NOWY
src/app/pages/AuthCallback.tsx           — ZMODYFIKOWANY (pending onboarding)
src/app/routes.ts                        — ZMODYFIKOWANY (panel sub-routes)
server.js                                — ZMODYFIKOWANY (+invite/panel endpoints)
docs/session-briefs/phase2-brief.md     — NOWY
```

> Uwaga: stary `src/app/pages/Panel.tsx` wciąż istnieje ale jest nieużywany (nie w routes.ts).
> Można usunąć w Fazie 3.
