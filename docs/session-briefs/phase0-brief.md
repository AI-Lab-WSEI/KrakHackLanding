# Phase 0 Brief — Infrastruktura (Migration System + Keycloak)

> Stan: **ZAMKNIĘTA** · 2026-04-22  
> Pełny roadmap: `docs/ROADMAP.md`  
> Poprzedni brief: — (Faza 0 = pierwsza)

---

## Co zostało zrobione

- [x] `migrations/` — 9 plików SQL (0001–0009) tworzących nowe tabele
- [x] `scripts/migrate.js` — runner migracji (Node.js ESM, śledzi wersje w `schema_migrations`)
- [x] `src/types/db.ts` — TypeScript interfejsy dla nowych tabel + helper mapper functions
- [x] `package.json` — dodano `npm run migrate` i `npm run migrate:dry`
- [x] `docs/ROADMAP.md` — pełny plan faz z modelem danych

## Co pozostało w Fazie 0

- [ ] **Uruchomienie migracji na lokalnej bazie** (Michał: `npm run migrate`)
- [ ] **Keycloak na Railway** (instrukcja poniżej)
- [ ] Weryfikacja DoD Fazy 0

---

## Quick-check — sprawdzenie że środowisko żyje

```bash
# 1. Czy baza odpowiada
psql $DATABASE_URL -c "SELECT 1"

# 2. Dry run migracji (pokaże SQL bez wykonania)
npm run migrate:dry

# 3. Uruchomienie migracji
npm run migrate

# 4. Weryfikacja tabel
psql $DATABASE_URL -c "\dt" | grep -E "users|projects|teams|events"

# 5. Stara aplikacja nadal działa
curl http://localhost:3000/api/config/site
```

---

## Instrukcja Keycloak na Railway

### Krok 1 — Nowy service na Railway

W projekcie Railway dodaj nowy service:
- Source: **Docker Image**
- Image: `quay.io/keycloak/keycloak:24.0.4`
- Port: `8080`

### Krok 2 — Zmienne środowiskowe dla Keycloak service

```
KC_BOOTSTRAP_ADMIN_USERNAME=admin
KC_BOOTSTRAP_ADMIN_PASSWORD=<silne hasło>
KC_DB=postgres
KC_DB_URL=jdbc:postgresql://<host>:<port>/<dbname>
KC_DB_USERNAME=<db user>
KC_DB_PASSWORD=<db password>
KC_HOSTNAME=<keycloak-url>.up.railway.app
KC_HOSTNAME_STRICT=false
KC_HTTP_ENABLED=true
KEYCLOAK_EXTRA_ARGS=start
```

> Można użyć tej samej bazy co aplikacja — Keycloak stworzy własne tabele z prefixem `kc_`.  
> Alternatywnie osobna baza (bezpieczniej dla prod).

### Krok 3 — Start command

W Railway service settings → Start command:
```
start --optimized
```

### Krok 4 — Konfiguracja realmu (po starcie Keycloak)

Wejdź na `https://<keycloak-url>/admin`, zaloguj się jako admin.

**Utwórz realm `krakhack`:**
1. Klik "Create realm" → nazwa: `krakhack`
2. Display name: "AI Krak Hack"
3. Save

**Utwórz client `frontend-app`:**
1. Clients → Create
2. Client ID: `frontend-app`
3. Client type: `OpenID Connect`
4. Client authentication: **OFF** (public PKCE client)
5. Valid redirect URIs: `https://krakhack.info/*`, `https://aipossibilitieslab.org/*`, `http://localhost:5173/*`
6. Web origins: `+` (same as redirect URIs)
7. Save

**Utwórz client `backend-api`:**
1. Clients → Create
2. Client ID: `backend-api`
3. Client authentication: **ON** (confidential)
4. Service accounts: ON
5. Save → Credentials tab → skopiuj Secret

**Utwórz realm roles:**
1. Realm roles → Create role → `admin`
2. → Create role → `moderator`
3. → Create role → `participant`
4. → Create role → `jury`

**Utwórz admin usera (Michał):**
1. Users → Create → email: twój email
2. Credentials → Set password
3. Role Mappings → Realm roles → Assign `admin`

### Krok 5 — Zmienne env dla aplikacji (Railway main service)

```
KEYCLOAK_URL=https://<keycloak-url>.up.railway.app
KEYCLOAK_REALM=krakhack
KEYCLOAK_CLIENT_ID=backend-api
KEYCLOAK_CLIENT_SECRET=<secret z Credentials tab>
KEYCLOAK_FRONTEND_CLIENT_ID=frontend-app
```

### Krok 6 — Weryfikacja

```bash
curl https://<keycloak-url>/realms/krakhack/.well-known/openid-configuration
# → powinno zwrócić JSON z issuer, authorization_endpoint, etc.
```

---

## DoD Fazy 0 — checklist

- [ ] `npm run migrate` → "9 migrations applied successfully"
- [ ] `psql $DATABASE_URL -c "\dt"` → widać: users, projects, teams, team_members, project_timeline, jury_members, scoring_categories, events, event_reminders, audit_log, schema_migrations
- [ ] `npm run migrate` → "9 migrations applied successfully"
- [ ] `psql $DATABASE_URL -c "\dt"` → widać: users, projects, teams, team_members, project_timeline, jury_members, scoring_categories, events, event_reminders, audit_log, schema_migrations
- [x] `curl https://keycloak-production-b6e2.up.railway.app/realms/krakhack/.well-known/openid-configuration` → 200 OK ✅
- [x] Keycloak Admin Console dostępna, realm krakhack istnieje ✅
- [x] Wszystkie 4 role istnieją: admin, moderator, participant, jury ✅
- [x] Twoje konto (michalmadejski2@gmail.com) ma rolę admin ✅ (tymcz. hasło: AdminKH2026!)
- [ ] Stara aplikacja bez regresji: `curl http://localhost:3000/api/admin/verify` (stary token) → działa

---

## Pierwsze zadanie w Fazie 1 (po zamknięciu Fazy 0)

**Zacząć od: middleware JWT w server.js**

Plik: `server.js`  
Zadanie: dodać funkcję `verifyKeycloakToken(req, res, next)` która:
1. Pobiera `Authorization: Bearer <token>` z headera
2. Weryfikuje JWT przez Keycloak JWKS endpoint: `GET /realms/krakhack/protocol/openid-connect/certs`
3. Wyciąga `realm_access.roles` i `sub` (= keycloak_id)
4. Zwraca 401 jeśli invalid

Biblioteka: `jose` (pure ESM, kompatybilna z `"type":"module"`) — `npm install jose`

---

## Pliki stworzone w tej fazie

```
migrations/
  0001_create_schema_migrations.sql
  0002_create_users.sql
  0003_create_projects.sql
  0004_create_teams.sql
  0005_create_project_timeline.sql
  0006_create_jury.sql
  0007_create_events.sql
  0008_create_audit_log.sql
  0009_alter_legacy_tables.sql
scripts/
  migrate.js
src/types/
  db.ts  (NOWY — istniejące edition.ts i membership.ts bez zmian)
docs/
  ROADMAP.md
  session-briefs/phase0-brief.md  (ten plik)
```
