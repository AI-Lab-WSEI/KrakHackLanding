# Aktor: Uczestnik hackathonu (hackathon-participant)

Uczestnik AI Krak Hack — osoba, która zarejestrowała się i została dodana do edycji.

Rola Keycloak: `hackathon-participant`.

## Co widzi

**Sidebar MÓJ OBSZAR:**
- Dashboard, Profil, Projekty
- **Mój zespół**, **Moja obecność**, **Głosowanie**

**Brak:** admin panel, Mój kompas.

**Dashboard:**
- Badge indigo `hackathon-participant`
- Missing integrations banner (Discord jeśli brak)
- Szybki dostęp: Profil, Projekty, Mój zespół, Moja obecność, Głosowanie, Wydarzenia

## User stories

### US-HP-01: Pierwsze logowanie z temp hasła
**Akceptacja:**
- Email z tempPassword → login → Keycloak redirectuje na UPDATE_PASSWORD
- User ustawia własne → ląduje w `/panel`
- Dashboard pokazuje "Uzupełnij swój profil" nudge

**Test:**
1. Admin tworzy profil z aplikacji hackathon (edition registration)
2. Uczestnik dostaje email z temp hasłem
3. `/login` → temp hasło → "Account is not fully set up" error → amber banner "Przejdź do Keycloak"
4. Keycloak UI → nowe hasło → redirect → `/panel`

### US-HP-02: Claim swojego zespołu
**Akceptacja:** `/panel/moj-zespol` → lista zespołów edycji → klik "Ten to ja" → submit claim → admin confirm → status `confirmed`
**Test:** Login jako hackathon-p → `/panel/moj-zespol` → widzi listę → wybierz → claim → czeka na admin.

### US-HP-03: Potwierdzenie obecności
**Akceptacja:** `/panel/moja-obecnosc` → checkbox "Potwierdzam" → POST `/api/panel/my-attendance` → zapisane
**Test:** Login → `/panel/moja-obecnosc` → check → submit → UI pokazuje `confirmed_at`.

### US-HP-04: Głosowanie
**Akceptacja:** `/panel/glosowanie` → lista projektów edycji → wybór 1 → POST `/api/hackathon/vote` → zapisane (1 głos per edycja)
**Test:** Login → `/panel/glosowanie` → vote → refresh → pokazuje że już głosował.

### US-HP-05: Dodanie własnego projektu (nie team)
**Akceptacja:** `/panel/projekty/nowy` → formularz (tytuł, opis, repo) → submit → `/panel/projekty/:id`
**Test:** Login → "Dodaj projekt" → fill → save → lista pokazuje nowy.

## Blokady

- `/panel/moj-kompas` → 🚫 (scienceclub-only)
- `/panel/admin/*` → 🚫 (admin-only)
- Double vote → backend 409 "już głosowałeś w tej edycji"
