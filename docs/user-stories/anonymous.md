# Aktor: Anonim (niezalogowany)

Osoba odwiedzająca stronę bez konta. Może przeglądać publiczne sekcje i wypełniać formularze.

## Co widzi

Navbar: O nas, Platforma, Hackathon, Dołącz do koła, Ankieta, Kontakt, "Zaloguj się"

Strony publiczne:
- `/` — homepage hackathonu (bieżąca edycja)
- `/o-nas` — o Lab + współprace
- `/o-nas/:slug` — karta value
- `/wspolpraca/:slug` — karta kolaboratora
- `/hackathon` — Edition2026 (bieżąca)
- `/2025` — Edition2025 (archiwum)
- `/edycja/:editionId` — dynamic edycje (np. `/edycja/3`)
- `/dolacz` — formularz aplikacji do koła (6-krokowy wizard)
- `/platforma` — landing platform (partnerzy)
- `/kontakt` — formularz kontaktowy
- `/wydarzenia` — kalendarz publiczny
- `/uczestnicy`, `/uczestnicy/:slug` — katalog członków (public profiles)
- `/projekty/:slug` — publiczny widok projektu
- `/wyniki/:edition` — wyniki jury (jeśli edycja pozwala)
- `/zespoly/:slug` — public team page
- `/demo` — demo nowej strony koła
- `/forms` — landing form
- `/survey`, `/feedback` — ankiety publiczne
- `/verify/:hash` — weryfikacja certyfikatu
- `/login`, `/logowanie` — logowanie
- `/zapomniane-haslo`, `/forgot-password` — reset hasła

## User stories

### US-ANON-01: Zgłoszenie do koła
**Akceptacja:**
- `/dolacz` → 6-krokowy wizard
- Step 1: imię, nazwisko, email, uczelnia, kierunek, rok **+ Discord, ClickUp email** (opcjonalne, mocno rekomendowane)
- Step 2: deklaracja uczestnictwa (spotkania, stacjonarnie, godz/mies)
- Step 3: profil kompetencji (6 kategorii, skala 1-10)
- Step 4: motywacje (co wnosisz, oczekiwania, wartości)
- Step 5: forma zaangażowania (multi-select)
- Step 6: podsumowanie + submit
- Submit → POST `/api/membership-applications` → zapis + confirmation email z `no-reply@possibilitieslab.org`
- Draft zapisywany w localStorage między refresh'ami

**Test:**
1. `/dolacz` → wypełnij wszystkie 6 kroków
2. Submit → "Dziękujemy za zgłoszenie"
3. Email w skrzynce (confirmation)
4. Admin w `/panel/admin/aplikacje` widzi nową aplikację ze statusem `nowe`

### US-ANON-02: Rejestracja na hackathon
**Akceptacja:**
- `/hackathon` lub `/edycja/3` → formularze participant / mentor / company / attendance
- Submit → POST `/api/submissions` → zapis + confirmation email z `no-reply@krakhack.info`
- Admin dostaje notification email

**Test:**
1. `/hackathon` → klik "Zapisz się jako uczestnik"
2. Wypełnij formularz (imię, email, poziom, technologie, zespół)
3. Submit → confirmation screen
4. Email potwierdzający wysłany

### US-ANON-03: Widok publiczny profilu uczestnika
**Akceptacja:**
- `/uczestnicy` — lista userów z `is_public=true`
- Klik karta → `/uczestnicy/:slug` — profil z bio (markdown), skills, linki social
- User z `is_public=false` → 404 na slug

**Test:**
1. `/uczestnicy` → lista
2. Klik na uczestnika → profil
3. Admin user (is_public=true) ma dostępny slug
4. Admin toggle is_public=false w panelu → refresh public → profil nie widoczny

### US-ANON-04: Kalendarz publiczny
**Akceptacja:**
- `/wydarzenia` — lista nadchodzących events + iCal export
- Filtry per kategoria (meeting, conference, deadline, hackathon, ...)
- Klik wydarzenia → szczegóły

**Test:**
1. `/wydarzenia` → lista
2. Click ".ics" → plik kalendarza
3. Filtr "deadline" → tylko te

### US-ANON-05: Login flow
**Akceptacja:**
- `/login` → email + hasło → POST `/api/auth/login`
- Błędne hasło → "Nieprawidłowy email lub hasło"
- Account not fully set up (temp password) → amber banner "Użyj Keycloak SSO"
- Sukces → redirect `/panel`
- Link "Nie pamiętam hasła" → `/zapomniane-haslo`

### US-ANON-06: Forgot password
**Akceptacja:**
- `/zapomniane-haslo` → email → POST `/api/auth/forgot-password`
- Zawsze zwraca 200 (anti-enum)
- Jeśli konto istnieje → email z temp hasłem
- Rate limit: 3/h per email

**Test:**
1. `/zapomniane-haslo` → podaj email → submit → "Jeśli konto istnieje — email wysłany"
2. Inbox: email od `no-reply@possibilitieslab.org` (bo Lab)
3. Link "Zaloguj się" → temp hasło działa
4. Rate limit test: 4 próby pod rząd → nadal 200 ale email nie leci

## Blokady

- Dowolna `/panel/*` ścieżka → redirect na `/login`
- API `/api/me`, `/api/panel/*` → 401 gdy brak JWT
- Admin endpoints → 401 (unauth) lub 403 (authed bez roli)
