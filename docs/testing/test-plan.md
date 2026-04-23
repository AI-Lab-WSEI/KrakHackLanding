# Test plan — ścieżki manualne do wyklikania

> **Cel:** 6 godzin testowania rozłożonego na 1-3 dni, około 2h/dzień.
> **Target:** niezależny pretester (zewnętrzny, niezaangażowany w implementację).
> **Output:** lista znalezionych błędów / niespójności / security concerns.

## Jak testować

- Środowisko: https://www.krakhack.info (produkcja)
- Konta: przygotuje admin (patrz [test-accounts.md](test-accounts.md))
- Narzędzia: przeglądarka + DevTools (Network, Console)
- Notowanie: gdzie błąd, kroki do reprodukcji, screenshoty / HAR
- Format zgłoszenia: [bug-report-template.md](bug-report-template.md)

## Sesja 1 (2h) — Anonim + Aplikacje/Rejestracje

### T1.1 Homepage + nawigacja (15 min)
- [ ] `/` — wszystkie linki działają
- [ ] Navbar + footer (wszystkie elementy klikają)
- [ ] Responsywność — mobile, tablet, desktop
- [ ] Lightmode/darkmode (jeśli jest przełącznik)

### T1.2 Zgłoszenie do koła (30 min)
- [ ] `/dolacz` — wszystkie 6 kroków wypełnione poprawnie
- [ ] Walidacja (puste pola, niepoprawny email, empty submit)
- [ ] Draft: wypełnij 2 kroki → F5 → dane zachowane?
- [ ] Edge: wpisz tekst >1000 znaków w bio — czy UI się łamie?
- [ ] Edge: skopiuj polskie znaki z Worda (em-dash, smart quotes) — bez literówek?
- [ ] Discord: wpisz `janek#1234` vs `janek.kowalski` — oba akceptowane?
- [ ] Submit → confirmation email w inbox (z `no-reply@possibilitieslab.org`?)
- [ ] Sprawdź w `/panel/admin/aplikacje` że zgłoszenie widoczne (dla admina)

### T1.3 Rejestracja hackathon (30 min)
- [ ] `/hackathon` — formularze: participant, mentor, company
- [ ] Wypełnij participant → submit → confirmation email (z `no-reply@krakhack.info`?)
- [ ] Teammate email niespójny z logged email
- [ ] Wybór challenge (Smart Infrastructure / Process Automation)
- [ ] Admin w Rejestracje zobaczy zgłoszenie

### T1.4 Login / forgot password (30 min)
- [ ] `/login` — email + hasło → redirect `/panel`
- [ ] Błędne hasło → error message jasny
- [ ] Szczególny przypadek: user z temp password (po create-profile) → amber banner "Użyj Keycloak SSO"
- [ ] `/zapomniane-haslo` — podaj swój email → zawsze 200 "jeśli konto istnieje"
- [ ] Dostajesz email z nowym temp hasłem?
- [ ] Rate limit: 4 próby pod rząd — nadal 200 ale 4 email nie doszedł
- [ ] Link "Zaloguj się" z emaila — działa?

### T1.5 Publiczne widoki (15 min)
- [ ] `/uczestnicy` — lista członków
- [ ] `/uczestnicy/:slug` — klik działa, bio pokazuje markdown
- [ ] `/wydarzenia` — kalendarz, iCal download
- [ ] `/projekty/:slug` — publiczny projekt
- [ ] `/wyniki/3` — wyniki edycji 2026

## Sesja 2 (2h) — Uczestnicy + Admin + Moderator

### T2.1 Panel participant (40 min)
(potrzebujesz konta z rolą `hackathon-participant` lub `scienceclub-participant`)

- [ ] Login jako `hackathon-participant`
- [ ] Sidebar: Dashboard, Profil, Projekty, **Mój zespół**, **Moja obecność**, Głosowanie
- [ ] NIE widzi: Mój kompas, admin panel
- [ ] `/panel/profil` — edit bio/skills/Discord → save → refresh → zapisane
- [ ] `/panel/moj-zespol` — lista zespołów edycji, klik claim
- [ ] `/panel/moja-obecnosc` — checkbox "potwierdzam"
- [ ] `/panel/glosowanie` — wybór projektu → vote
- [ ] Próba double-vote → error "już głosowałeś"

- [ ] Login jako `scienceclub-participant`
- [ ] Sidebar: Dashboard, Profil, Projekty, **Mój kompas**, Głosowanie
- [ ] NIE widzi: Mój zespół, Moja obecność
- [ ] `/panel/moj-kompas` — widzi skille + porównanie do koła

### T2.2 Admin panel (40 min)
- [ ] Login jako admin
- [ ] Dashboard: admin KPIs (aplikacje nowe, claims, certyfikaty, zapytania)
- [ ] Preview switcher: `Admin | Hackathon | Koło | Jury`
- [ ] Klik "Hackathon" → sidebar dostaje Mój zespół + banner amber "Podgląd aktywny"
- [ ] Klik "Wyłącz podgląd" → wraca

- [ ] `/panel/admin/aplikacje` — lista aplikacji
- [ ] Rozwiń wiersz → widzę wszystkie pola (Discord, ClickUp, bio parts)
- [ ] Klik "Utwórz profil uczestnika" → modal z preview + role selector
- [ ] Submit → email poszedł + user_id wygenerowany (sprawdź w `/panel/admin/uzytkownicy`)
- [ ] Status aplikacji zmienił się na `przyjęty`
- [ ] 2gi klik "Utwórz profil" na tej aplikacji → modal "Profil już utworzony"
- [ ] Bulk: zaznacz 3 aplikacje → "Utwórz profile (3)" → modal z preview → submit

- [ ] `/panel/admin/uzytkownicy` — lista userów
- [ ] Klik edit na userze → modal edycji
- [ ] Zmień role → save → refresh → nowa rola widoczna
- [ ] Klik mail icon (reset password) → modal z nowym temp hasłem
- [ ] Klik ban/delete → confirm → user usunięty

- [ ] `/panel/admin/integracje` — lista userów + Discord/ClickUp
- [ ] Filter "Bez Discord" → ilość
- [ ] Klik mail icon przy userze bez Discord → modal → submit → email poszedł

### T2.3 Moderator (40 min)
(zaloguj się jako moderator — różne konto niż admin)

- [ ] Sidebar — widzi tylko: Dashboard, Profil, Projekty + Rejestracje (krakhack), Aplikacje (lab), Users+Team claims (system)
- [ ] NIE widzi: edycje, mailing, certyfikaty, attendance admin
- [ ] Dashboard: badge moderator (cyan), "Panel administracyjny" shortcut, brak admin KPIs

- [ ] `/panel/admin/aplikacje` — banner cyjan "Jesteś moderatorem"
- [ ] Rozwiń aplikację → może zmienić status (nowe → w_kontakcie)
- [ ] Kliknąć "Wyślij zaproszenie na rozmowę" → email poszedł
- [ ] **BRAK** przycisku "Utwórz profil uczestnika" (admin-only)
- [ ] **BRAK** top-bar "Utwórz profile (N)"
- [ ] Direct URL `/panel/admin/krakhack/edycje` → 🚫 Brak dostępu
- [ ] Direct URL `/panel/admin/mailing` → 🚫
- [ ] Direct URL `/panel/moj-zespol` → 🚫 (moderator nie jest uczestnikiem)

- [ ] `/panel/admin/uzytkownicy` — banner cyjan "Jesteś moderatorem"
- [ ] Edit innego usera → modal **bez** role change, **bez** isActive toggle
- [ ] **BRAK** ikony maila (reset password admin-only)
- [ ] **BRAK** ikony bankruptcy/delete

## Sesja 3 (2h) — Jury + Email flow + Security edge cases

### T3.1 Jury flow (30 min)
- [ ] Admin generuje magic link dla jury → email pójdzie (sprawdź)
- [ ] Juror klika link → `/jury/:token` → widzi listę projektów
- [ ] Ocenia 1 projekt (5 kategorii) → submit → zapisane
- [ ] F5 → oceny zachowane
- [ ] Token wygasły (manualnie expire w DB) → "Link expired"
- [ ] Juror zalogowany przez `/login` (rola Keycloak jury) → `/panel` → widzi card "Użyj magic linka"
- [ ] Klik "Poproś admina o nowy link" → mailto otwiera się

### T3.2 Email sender split (30 min)
- [ ] Submit `/dolacz` → email z `no-reply@possibilitieslab.org`? ✓
- [ ] Submit `/hackathon` jako participant → email z `no-reply@krakhack.info`? ✓
- [ ] Admin create-profile dla scienceclub → email z possibilitieslab.org? ✓
- [ ] Admin create-profile dla hackathon-participant → email z krakhack.info? ✓
- [ ] Forgot-password jako admin (rola admin → context lab) → email z possibilitieslab.org? ✓
- [ ] Certyfikat wysłany → krakhack.info? ✓
- [ ] Request-fill Discord → possibilitieslab.org? ✓

### T3.3 Security edge cases (60 min)
- [ ] Moderator próbuje przez DevTools zmienić body POST request na `role: "admin"` w create-profile → backend 403?
- [ ] Juror próbuje manipulować magic token (zmienić 1 char) → 401?
- [ ] Anon próbuje dostać się do `/panel/admin/aplikacje` → redirect na `/login`
- [ ] Anon submit aplikacji z `<script>alert('xss')</script>` w bio → backend sanitizuje? (check display w admin panel — script nie odpala)
- [ ] Anon submit aplikacji z bardzo długim polem (10MB) → backend ma limit?
- [ ] CSRF: POST z innej domeny na `/api/auth/login` z cred → CORS blokuje? (browser enforced)
- [ ] SQLi: wpisz w search bar `'; DROP TABLE users; --` → normalnie działa (parametryzowane queries)
- [ ] Path traversal: `/api/public/projects/../../../etc/passwd` → 404
- [ ] Hardcoded secrets w bundle.js (`grep -r 'RESEND_API_KEY' dist/`) → nic nie znajduje
- [ ] Rate limit forgot-password: 10 prób pod rząd → backend throttle
- [ ] IDOR: GET `/api/panel/users/UUID-INNEGO-USERA` jako hackathon-participant → 403 (lub 404 żeby nie leak ID existence)
- [ ] Preview mode bypass: URL `?preview=admin` dla nie-admina → ignorowane (usePreviewScope guard)

### T3.4 Niespójności UI (30 min)
- [ ] Polskie znaki we wszystkich przyciskach + placeholder (bez ? lub broken)
- [ ] Responsywność admin panel na mobile 375px
- [ ] Sidebar hamburger na mobile — działa?
- [ ] Modal close na ESC?
- [ ] Loading states w long actions (bulk create-profile, mailing)
- [ ] Error states (network fail, timeout) — user zrozumiale
- [ ] Empty states (0 aplikacji, 0 userów) — nie pada
- [ ] Long text: wpisz nick 200 char → UI obcina/pokazuje ellipsis
- [ ] Dates: time zone (UTC vs Europe/Warsaw)

## Co zgłaszać

**Bug**: kroki do reprodukcji + expected vs actual + screenshot.
**UX issue**: co było mylące, jaka była Twoja expectation, proposed improvement.
**Security concern**: szczegóły + potencjalny impact + jak exploit.

Format: Markdown w GH Issues lub ClickUp.

## Checklist dla pretestera po 6h

- [ ] Sesja 1 wykonana (anonim + logowanie)
- [ ] Sesja 2 wykonana (participant + admin + moderator)
- [ ] Sesja 3 wykonana (jury + email + security)
- [ ] Wszystkie znalezione bugi zgłoszone
- [ ] Lista "podejrzane, wymagają deep dive" przekazana

## Znane ograniczenia (nie zgłaszaj jako bugi)

- Bulk invite zakłada rolę taką samą dla wszystkich — per-user role TBD
- Moderator ma limit + silent drop `user_id` w PATCH — intentional
- Discord bot auto-invite — nie istnieje (tylko mapping)
- ClickUp workspace auto-invite — nie istnieje
- Admin preview "akcje wykonują się jako admin" — intentional (nie fake-user actions)
