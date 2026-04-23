# Role w systemie — szczegóły uprawnień

## Model ról

Aplikacja ma **sześć ról** Keycloak. Rola Keycloak jest source-of-truth; DB ma kolumnę `users.role` która jest zsynchronizowana (źródło prawdy = Keycloak przy każdym loginie).

```mermaid
flowchart TD
  KC[Keycloak realm: krakhack] --> admin
  KC --> moderator
  KC --> hackathon_p[hackathon-participant]
  KC --> scienceclub_p[scienceclub-participant]
  KC --> jury
  KC --> default_kc[default-roles-krakhack]

  admin       -->|pełny dostęp| FullAccess[Wszystkie sekcje panelu + CRUD]
  moderator   -->|ograniczony| ModeratorAccess[Aplikacje do koła, Users edit, Team claims, Rejestracje]
  hackathon_p -->|uczestnik| HackParticipant[Moje profil, Mój zespół, Moja obecność, Głosowanie]
  scienceclub_p -->|członek| ClubParticipant[Mój profil, Mój kompas, Głosowanie]
  jury        -->|magic link| JuryFlow[/jury/:token — standalone scoring page]
  default_kc  -->|Keycloak internal| Ignored[Ignorowane przez aplikację]
```

## Role — co każdy widzi i może

### admin (pełny dostęp)

**Sidebar:**
- **MÓJ OBSZAR**: Dashboard, Profil, Projekty (brak: Mój zespół/obecność/kompas/głosowanie — chyba że admin ma dodatkowo role uczestnika)
- **ADMINISTRACJA** (per context):
  - `ctx=krakhack`: Dashboard, Edycje, Rejestracje, Zespoły, Attendance, Projekty zespołów, Wyniki & Jury, Galeria, Certyfikaty
  - `ctx=lab`: Aplikacje do koła, Kompas, Współprace, Zapytania, Organizacja
  - `ctx=system`: Użytkownicy, Integracje, Team claims, Wydarzenia, Mailing, SMS, Ankiety

**Preview mode:** Admin może przełączyć się na podgląd jak `hackathon-participant` / `scienceclub-participant` / `jury` przez segmented control w sidebarze. URL `?preview=<scope>`. Akcje nadal wykonują się jako admin.

**Może wszystko, co endpointy pozwalają** — create/edit/delete userów, CRUD edycji, bulk invite, reset hasła, itp.

### moderator

**Scope:** "proxy-admin" dla obsługi aplikacji + members, BEZ dostępu do konfiguracji edycji / finansów / narzędzi krytycznych.

**Sidebar:**
- **MÓJ OBSZAR**: Dashboard, Profil, Projekty (nic więcej — moderator nie jest uczestnikiem)
- **ADMINISTRACJA**:
  - `ctx=krakhack`: Rejestracje (hackathon participants add/edit)
  - `ctx=lab`: Aplikacje do koła (przeglądanie + status change + interview invite)
  - `ctx=system`: Użytkownicy (edit profili bez role/active), Team claims (moderation)

**Może:**
- Przeglądać aplikacje do koła, zmieniać status (`nowe` → `w_kontakcie` → `rozmowa_umówiona`), dodawać notatki admina
- Wysyłać interview invite email
- Edytować profile userów (bio, linkedin, skills, university)
- Zarządzać team claims (confirm/reject)
- Edytować submissions (rejestracje hackathon)

**Nie może:**
- Tworzyć kont Keycloak (create-profile — backend 403)
- Zmieniać roli usera (PATCH /role — backend 403)
- Zawieszać / usuwać userów (backend 403)
- Reset hasła innego usera
- Bulk invite
- CRUD edycji hackathon
- Attendance confirmation management
- Wyniki & jury scoring
- Mailing masowy, SMS masowy
- Galeria, Certyfikaty, Integracje
- Linkować aplikację do usera (user_id — silent-drop w PATCH)

### hackathon-participant

**Scope:** osoba zarejestrowana/dodana do edycji hackathonu. Ma "swoje" narzędzia do uczestnictwa.

**Sidebar:**
- **MÓJ OBSZAR**: Dashboard, Profil, Projekty, **Mój zespół**, **Moja obecność**, **Głosowanie**
- (brak sekcji admin)

**Może:**
- Edytować własny profil (bio, skills, Discord, GitHub, LinkedIn)
- CRUD własnych projektów
- Claim'ować swój zespół (team claim → admin confirm)
- Potwierdzać swoją obecność na hackathonie (`attendance_confirmations`)
- Głosować na projekty (1 głos per edition)

**Nie może:**
- Widzieć innych userów ani admin panels
- Edytować/usuwać projekty innych userów
- Potwierdzać obecności innym

### scienceclub-participant

**Scope:** członek koła naukowego (po zaakceptowaniu `membership_applications.status='przyjęty'` → admin `create-profile` → user ma tę rolę).

**Sidebar:**
- **MÓJ OBSZAR**: Dashboard, Profil, Projekty, **Mój kompas** (skills mapping), **Głosowanie**
- (brak sekcji admin)

**Może:**
- Edytować własny profil (+ Discord + ClickUp email)
- Widzieć swój kompas kompetencji vs średnia koła
- Głosować
- CRUD własnych projektów

**Nie może:**
- Widzieć aplikacji do koła
- Edytować innych profili
- Dostępu do admin tools

### jury

**Scope:** juror — oceny zewnętrznego hackathonu, tylko przez **magic link** z emaila (token krótkoterminowy w tabeli `jury_members`).

**Zachowanie:**
- Login do `/panel` daje Dashboard z banerem "Jesteś jurorem — użyj magic linka z maila"
- Właściwy panel oceny: `/jury/:token` (standalone, bez sidebara, bez Keycloak — magic token JWT)
- CTA "Poproś admina o nowy link" (mailto)

**Może:**
- Oceniać projekty per kategorie (scoring_categories w `edition_config`)
- Dodawać prywatne notatki (private_notes)

**Nie może:**
- Widzieć panelu admin/moderator
- Zmieniać oceny innych jurorów (każdy jury widzi tylko swoje scores)

### (brak roli)

User zalogowany ale bez specific roli (np. świeży signup przez Keycloak).

**Sidebar:**
- **MÓJ OBSZAR**: Dashboard, Profil, Projekty
- Dashboard pokazuje banner "Konto czeka na przypisanie" z kontaktem do admina

## Tabela uprawnień per endpoint (wybrane)

| Endpoint | admin | moderator | hackathon-p | scienceclub-p | jury | anon |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| `POST /api/auth/login` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `POST /api/auth/forgot-password` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET /api/me` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `PATCH /api/panel/me` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `GET /api/panel/users` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `PATCH /api/panel/users/:id` | ✅ | ✅ (bez is_active/is_public/notify) | ❌ | ❌ | ❌ | ❌ |
| `DELETE /api/panel/users/:id` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `PATCH /api/panel/users/:id/role` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `POST /api/panel/users/:id/resend-invite` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `GET /api/membership-applications` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `PATCH /api/membership-applications/:id` | ✅ | ✅ (bez user_id) | ❌ | ❌ | ❌ | ❌ |
| `POST /api/membership-applications/:id/invite` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `POST /api/membership-applications/:id/create-profile` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `POST /api/membership-applications/bulk/create-profile` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `POST /api/invite/bulk` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `POST /api/admin/integrations/request-fill` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `POST /api/admin/editions` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `POST /api/hackathon/teams/claim` | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `GET /api/hackathon/my-claims` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `POST /api/panel/my-attendance` | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `POST /api/hackathon/vote` | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| `GET /api/jury/projects` | (verify token) | ❌ | ❌ | ❌ | via magic link | ❌ |
| `POST /api/jury/scores` | (verify token) | ❌ | ❌ | ❌ | via magic link | ❌ |

## Pytania dla audytora

1. Czy moderator może przez UI wywołać action która powinna być admin-only (frontend bypass)?
2. Czy moderator może poprzez direct URL/curl wywołać endpoint który powinien być admin-only (backend guard miss)?
3. Czy hackathon-participant może głosować wielokrotnie / podmieniać swój głos bez śladu?
4. Czy scienceclub-participant może widzieć listę aplikacji do koła (innych osób)?
5. Czy jury może przez manipulację magic tokena widzieć projekty innej edycji?
6. Czy anonimowy user może submitować membership-application z fałszywymi danymi (CAPTCHA? Rate limit?)
7. Czy publiczne endpointy `/api/public/*` leakują PII?
