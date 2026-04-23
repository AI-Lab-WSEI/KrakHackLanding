# Aktor: Admin

## Kim jest

Organizator hackathonu / szef koła. Ma pełny dostęp do wszystkich narzędzi zarządzania.

Rola Keycloak: `admin`. DB `users.role = 'admin'`.

## Co widzi po zalogowaniu

**Sidebar:**
- MÓJ OBSZAR: Dashboard, Profil, Projekty (+ inne user-items tylko gdy ma dodatkowe role Keycloak jak `hackathon-participant`)
- ContextSwitcher: **KRAK HACK** / **AI LAB** / **SYSTEM**
- ADMINISTRACJA (per kontekst):

| ctx=krakhack | ctx=lab | ctx=system |
|---|---|---|
| Dashboard | Aplikacje do koła | Użytkownicy |
| Edycje | Kompas kompetencji | Integracje |
| Rejestracje | Współprace | Team claims |
| Zespoły | Zapytania | Wydarzenia |
| Attendance | Organizacja | Mailing |
| Projekty zespołów | | SMS |
| Wyniki & Jury | | Ankiety |
| Galeria | | |
| Certyfikaty | | |

**Dashboard (`/panel`)** pokazuje:
- Role badge `admin` (purple)
- "Panel administracyjny — otwórz panel" shortcut
- Admin KPIs (aplikacje nowe, claims pending, certyfikaty draft, zapytania nowe)
- "Twoje statystyki" (projekty, skills)
- Preview switcher `Admin | Hackathon | Koło | Jury`

## User stories

### US-ADM-01: Zalogowanie + dashboard

**Jako** admin **chcę** widzieć pulpit z przeglądem wszystkich pending spraw **żeby** szybko przejść do zarządzania.

**Akceptacja:**
- Po logowaniu na `/login` → redirect na `/panel`
- Dashboard pokazuje admin KPIs (cyfry klikalne → linki do sekcji)
- Nie widzi zbędnych user-side items jeśli nie ma innych ról

**Test:**
1. Login: `michalmadejski2@gmail.com` / `MichaelPrzemek2026!`
2. Expect: URL `/panel`, badge `admin`, admin KPIs widoczne
3. Click "Aplikacje nowe" → `/panel/admin/aplikacje`

### US-ADM-02: Utworzenie profilu uczestnika z aplikacji do koła

**Jako** admin **chcę** jednym klikiem zaakceptować aplikację do koła **żeby** utworzyć użytkownikowi konto Keycloak + profil Lab.

**Akceptacja:**
- `/panel/admin/aplikacje` → rozwijam wiersz aplikacji → "Utwórz profil uczestnika"
- Modal z preview profilu (skills z competencies ≥5, bio z 3 sekcji, Discord/ClickUp z aplikacji)
- Wybieram rolę (default: scienceclub-participant)
- Klik Submit → backend:
  1. Keycloak user z temp hasłem (temporary=true)
  2. users row z pre-filled
  3. Aplikacja linked (status=przyjęty, user_id=new.id)
  4. Email z temp password (z `no-reply@possibilitieslab.org` bo lab context)
- UI pokazuje `emailSent: true/false` + temp password jako fallback do copy

**Test:**
1. Login jako admin → `/panel/admin/aplikacje`
2. Znaleźć aplikację ze statusem `nowe` (lub utworzyć testową via `/dolacz`)
3. Rozwinąć wiersz → klik "Utwórz profil uczestnika"
4. Wybrać rolę = `scienceclub-participant`
5. Submit → expect success, tempPassword widoczny
6. Otwórz inbox testowego emaila → email od `no-reply@possibilitieslab.org`

### US-ADM-03: Bulk invite

**Jako** admin **chcę** utworzyć profile dla 10 osób naraz **żeby** oszczędzić czas przy przyjmowaniu nowej kohorty.

**Akceptacja:**
- Zaznaczyć checkboxami N aplikacji → top-bar button "Utwórz profile (N)"
- Modal z preview (N odbiorców, role selector, custom message)
- Submit → per-user result z emailSent/emailError status
- Failed emails → admin może skopiować temp hasła

**Test:**
1. Zaznaczyć 3 aplikacje
2. Klik "Utwórz profile (3)"
3. Submit → Expect stats: `utworzono: 3, pominięto: 0, błędów: 0`
4. Jeśli któreś email failed → lista z temp password copy

### US-ADM-04: Preview jako uczestnik

**Jako** admin **chcę** przełączyć widok na "uczestnik koła" **żeby** sprawdzić co widzi realny user bez konieczności zmiany ról Keycloak.

**Akceptacja:**
- Sidebar ma segmented control `Admin | Hackathon | Koło | Jury`
- Klik "Koło" → URL `?preview=scienceclub`
- Sidebar MÓJ OBSZAR dostaje "Mój kompas", "Głosowanie"
- Amber banner na górze "Podgląd aktywny — akcje wykonują się jako admin"
- Klik "Wyłącz podgląd" → wracam do admin

**Test:**
1. Login jako admin
2. Sidebar → kliknij "Koło" w Podgląd jako
3. Expect: banner amber, sidebar zawiera "Mój kompas"
4. Klik "Wyłącz podgląd" → banner znika, sidebar bez Mój kompas

### US-ADM-05: Request-fill Discord/ClickUp

**Jako** admin **chcę** wysłać masową prośbę o uzupełnienie danych do userów bez Discord/ClickUp **żeby** mieć pełny mapping przed dodaniem do serwera.

**Akceptacja:**
- `/panel/admin/integracje` pokazuje listę userów + kolumny Discord / ClickUp / Konto
- Filtr "Bez Discord (X)", "Bez ClickUp (Y)"
- Button "Prośba → bez Discord" → modal → submit → email per user
- Per-cell button (mail icon) → single request

**Test:**
1. `/panel/admin/integracje`
2. Filter "Bez Discord"
3. Zaznaczyć 2 userów → "Wyślij do zaznaczonych"
4. Email template z listą brakujących pól → odbiorcy

### US-ADM-06: Reset hasła dla usera

**Jako** admin **chcę** zresetować hasło userowi który zapomniał **żeby** nie musiał przechodzić przez flow `/forgot-password`.

**Akceptacja:**
- `/panel/admin/uzytkownicy` → kolumna akcji → mail icon
- Potwierdzenie → backend: nowe temp hasło w Keycloak (temporary=true) + email
- UI pokazuje modal z nowym temp hasłem (fallback)

**Test:**
1. Users page → znajdź usera z Keycloak
2. Klik mail icon → confirm
3. Expect: modal z temp password, email wysłany

## Edge cases / niespójności

- Admin z preview=hackathon klika "Claim team" → attendance/team zapisuje się dla admina (mylące)
- Admin widzi ContextSwitcher KRAK HACK / LAB / SYSTEM — moderator też widzi (bo isAdminOrMod), ale moderator ma mniej items w każdym ctx
- Admin bez roli `hackathon-participant` NIE widzi "Mój zespół" (fixed — było scope bleed)
