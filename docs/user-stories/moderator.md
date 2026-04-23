# Aktor: Moderator

## Kim jest

Osoba zaufana przez admina — pomaga w przeglądaniu aplikacji i moderacji, ale **nie zarządza** Keycloak accounts, edycjami, mailingiem masowym ani finansami.

Rola Keycloak: `moderator`. DB `users.role = 'moderator'`.

## Co widzi po zalogowaniu

**Sidebar:**
- MÓJ OBSZAR: Dashboard, Profil, Projekty (nic więcej — moderator nie jest uczestnikiem)
- ContextSwitcher: **KRAK HACK** / **AI LAB** / **SYSTEM** (widoczny bo `isAdminOrMod`)
- ADMINISTRACJA (per kontekst):

| ctx=krakhack | ctx=lab | ctx=system |
|---|---|---|
| Rejestracje | Aplikacje do koła | Użytkownicy |
| | | Team claims |

**Dashboard (`/panel`)** pokazuje:
- Role badge `moderator` (cyan)
- "Panel administracyjny — otwórz panel" shortcut
- **BEZ** admin KPIs (te są admin-only)
- Brak onboarding nudge

## User stories

### US-MOD-01: Zalogowanie + scope awareness

**Jako** moderator **chcę** od razu wiedzieć **co mogę a czego nie** **żeby** nie tracić czasu na próby admin-only akcji.

**Akceptacja:**
- Po loginie widoczny badge `moderator`
- Na każdej admin page (Aplikacje, Users) baner cyjanowy "Jesteś moderatorem — możesz X, Y. Nie możesz: A, B."
- Przyciski admin-only ukryte (np. "Utwórz profil uczestnika")

**Test:**
1. Login jako moderator
2. `/panel` — expect badge cyan `moderator`, brak `Mój zespół/kompas/głosowanie`
3. `/panel/admin/aplikacje` — expect cyan banner z scopem + BRAK button "Utwórz profil uczestnika"
4. `/panel/admin/uzytkownicy` — expect cyan banner, brak przycisków Delete/Reset/Role

### US-MOD-02: Moderacja aplikacji do koła

**Jako** moderator **chcę** przejrzeć nową aplikację i oznaczyć ją jako "w kontakcie" **żeby** admin wiedział że się nią zajmuję.

**Akceptacja:**
- `/panel/admin/aplikacje` — lista widzialna
- Klik na wiersz → rozwinięcie (kompetencje, bio, engagement types)
- Zmiana statusu (przyciski `nowe`, `w_kontakcie`, `rozmowa_umówiona`, `przyjęty`, `odrzucony`)
- Edycja notatek admina
- Wysyłka interview invite email ("Wyślij zaproszenie na rozmowę")

**Test:**
1. `/panel/admin/aplikacje` → rozwinąć aplikację
2. Klik status "w kontakcie" → PATCH wykonany → UI zaktualizowany
3. Dodać notatkę admin
4. Klik "Wyślij zaproszenie na rozmowę" → email poszedł do kandydata

### US-MOD-03: Edycja profilu usera

**Jako** moderator **chcę** poprawić literówkę w bio lub linkach LinkedIn innego usera **żeby** dane były spójne.

**Akceptacja:**
- `/panel/admin/uzytkownicy` → klik ikona "Edytuj"
- Modal edycji: dostępne pola — displayName, bio, github, linkedin, university, graduationYear, skills
- NIEdostępne: isActive, isPublic, notifyEvents, role, delete, reset password

**Test:**
1. Users page → klik edit na innym userze
2. Modal → zmień bio → Save
3. Expect: PATCH success
4. Verify: brak przycisków role change / delete / ban

### US-MOD-04: Ograniczenia — próba admin-only

**Jako** moderator **chcę** się dowiedzieć że nie mogę wykonać akcji admin-only **żeby** eskalować do admina.

**Akceptacja:**
- Direct URL `/panel/admin/edycje` → 🚫 Brak dostępu screen
- Direct URL `/panel/admin/mailing` → 🚫
- POST curl na endpoint admin-only → 403 Forbidden
- W UI przyciski admin-only ukryte (moderator nie widzi nawet że istnieją)

**Test:**
1. Direct URL `/panel/admin/krakhack/edycje` → block screen z "Wymagana rola: admin"
2. Direct URL `/panel/admin/mailing` → block
3. `/panel/admin/uzytkownicy` → brak kolumny delete button
4. curl -H "Bearer $MOD_TOKEN" DELETE /api/panel/users/:id → 403

## Co moderator NIE może

| Akcja | Blokada | Dlaczego |
|---|---|---|
| Utworzyć konto Keycloak (create-profile) | Backend 403 + UI hidden | Krytyczna operacja bezpieczeństwa |
| Bulk invite | Backend 403 + UI hidden | Tworzenie wielu kont = admin-only |
| Usunąć usera | UI hidden | Destructive + FK cascade |
| Zmienić rolę | UI hidden | Elevacja uprawnień |
| Reset hasła | UI hidden | Może zablokować komuś dostęp |
| Zawiesić konto (is_active=false) | UI hidden | Access management |
| CRUD edycji | Direct URL 🚫 block | Konfiguracja hackathonu |
| Wyniki jury / scoring | Direct URL 🚫 block | Integrity konkursu |
| Mailing masowy | Direct URL 🚫 block | Reputacja sendera |
| Certyfikaty | Direct URL 🚫 block | Oficjalne dokumenty |
| Galeria / Cloudinary | Direct URL 🚫 block | Treści na stronie |
| Integracje Discord/ClickUp | Direct URL 🚫 block | API keys itp. |
| Linking aplikacja → user (user_id w PATCH) | Backend silent-drop | Manualna operacja, rzadka |

## Co moderator może w ramach uczestnictwa

Moderator **nie widzi** items dla uczestników:
- `/panel/moj-zespol` → 🚫 block
- `/panel/moja-obecnosc` → 🚫 block
- `/panel/moj-kompas` → 🚫 block
- `/panel/glosowanie` → 🚫 block

Jeśli moderator chce też być uczestnikiem — admin dodaje mu dodatkową rolę `hackathon-participant` lub `scienceclub-participant` w Keycloak.

## Edge cases

- Moderator klika "Utwórz profil" z DevTools (manipulacja DOM) → backend odrzuci z 403
- Moderator widzi ContextSwitcher z "SYSTEM" ale tam tylko 2 items (Users, Team claims) — prawie pusto
- Moderator na Rejestracje page (AdminDashboard embedded) — co widzi? **Do weryfikacji w Fazie C**
