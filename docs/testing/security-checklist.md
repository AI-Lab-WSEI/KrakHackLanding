# Security checklist — dla audytora bezpieczeństwa

> Skupiamy się na klasach ryzyka specyficznych dla aplikacji. OWASP Top 10 + nasze custom concerns.

## Authentication & Authorization

### AuthN
- [ ] Hasła nigdy nie przechodzą przez logi (grep serwerowy logi — szuka `password=`)
- [ ] JWT access_token ma TTL 5 min, refresh_token 30 min (sprawdź w Keycloak realm config)
- [ ] Refresh token rotation (nowy refresh token przy refresh?)
- [ ] Session storage (nie localStorage) — JWT żyje tylko w sesji przeglądarki ✓
- [ ] Nie ma "remember me" bypass
- [ ] Logout invaliduje refresh token (POST do Keycloak revoke?)
- [ ] Forgot password rate limit: 3/h per email w `/api/auth/forgot-password` ✓
- [ ] Anti-enum: forgot-password zawsze zwraca 200 niezależnie od istnienia konta ✓
- [ ] Temp passwords są unique per request (crypto.randomBytes 6 + suffix)
- [ ] Temp passwords nie są logowane

### AuthZ
- [ ] Wszystkie `/api/admin/*` endpointy mają `requireAdmin` lub `requireRole('admin')` middleware
- [ ] Wszystkie `/api/panel/*` endpointy mają `verifyKeycloakToken`
- [ ] Per-field access: moderator nie może ustawić `user_id` w PATCH membership-applications (silent drop) ✓
- [ ] Moderator nie może wywołać `POST /api/membership-applications/:id/create-profile` (requireAdmin)
- [ ] Moderator nie może zmienić roli usera (`PATCH /api/panel/users/:id/role` — requireRole admin)
- [ ] Jury tokens verify ma check expiry
- [ ] ProtectedRoute frontend + guard backend — **obie** warstwy weryfikują role
- [ ] Przez DevTools: wykonaj `fetch('/api/admin/users', { method: 'DELETE' })` jako moderator → 403

### IDOR
- [ ] `GET /api/panel/users/:id` — sprawdź czy moderator może odczytać dowolny UUID
- [ ] `GET /api/membership-applications/:id` — czy leakują PII osób które nie są moderatorem?
- [ ] `/jury/:token` — czy bruteforce tokenów możliwy? (128-bit random + rate limit?)

## Input validation

- [ ] XSS: pole `bio` markdown — czy `<script>` się renderuje? (ReactMarkdown powinien sanitize)
- [ ] XSS: pole `admin_notes` w AdminApplications — HTML/JS escape?
- [ ] XSS: `display_name` renderowany bez escape w UI → możliwy stored XSS
- [ ] SQL injection: parametryzowane queries? Sprawdź `server.js` grep `${` w SQL
- [ ] Command injection: pola które trafiają do np. shell (prawdopodobnie brak)
- [ ] Prototype pollution: JSON inputy (skills, competencies) — Express body-parser default limit
- [ ] File upload: gallery, presentations — content-type validation? Max size?
- [ ] Polish characters (UTF-8): POST z diacrytami → zapisuje poprawnie

## Session management

- [ ] Session fixation: JWT nie zawiera session ID vulnerable
- [ ] Logout: delete tokens z sessionStorage + POST revoke do Keycloak
- [ ] Concurrent sessions: user zalogowany w 2 kartach — refresh race condition?

## Data exposure

### API responses
- [ ] `GET /api/public/participants` — tylko public users (is_public=true)
- [ ] `GET /api/public/participants/:slug` — nie zwraca email, telefon, Discord_id
- [ ] `GET /api/panel/users` admin — zwraca pełne dane (OK bo admin)
- [ ] `GET /api/me` — nie zwraca password hash, admin tokens itp.
- [ ] Secrets w bundle (hardcoded API keys) — `grep -i 'sk-\|re_\|AKIA' dist/`
- [ ] Source maps wyłączone na prod (sprawdź `dist/*.map`)

### Emails
- [ ] Temp password w plain text w mailu — OK ale sprawdź że nie lecuje w logach cache
- [ ] Error messages w UI nie leakują stack trace (generic "Błąd serwera")
- [ ] 404 vs 401 vs 403 — konsystentne (nie ujawniają czy resource istnieje)

## Rate limiting & DoS

- [ ] `/api/auth/forgot-password` — 3/h per email ✓
- [ ] `/api/auth/login` — rate limit? (brute force protection)
- [ ] `/api/membership-applications` (public submit) — rate limit?
- [ ] `/api/submissions` (hackathon registration) — rate limit?
- [ ] `/api/ai/compass` — 10/min per token ✓ (compassRateLimit)
- [ ] Bulk endpoint (`/api/membership-applications/bulk/create-profile`) — max array size?

## CORS & CSRF

- [ ] CORS origin whitelist (nie `*`)
- [ ] Cookies: SameSite=Strict (Keycloak session) + HttpOnly
- [ ] JWT w Authorization header (nie cookie) — CSRF-safe ✓
- [ ] POST bez custom header wymaga JWT → blokuje CSRF z innych domen

## Infrastructure

- [ ] HTTPS all the way (no HTTP endpoints exposed)
- [ ] Railway Secret Keycloak/Resend keys (nie w commit history)
- [ ] Database backups (Railway PostgreSQL automatic?)
- [ ] Log retention — jak długo trzymane?
- [ ] Keycloak admin credentials — rotowalne? (KEYCLOAK_ADMIN env var)

## Business logic

### Głosowanie
- [ ] User może zagłosować tylko 1x per edycja
- [ ] Zmiana głosu możliwa lub zabroniona? (check `/api/hackathon/vote` logic)
- [ ] Głosowanie po zakończeniu edycji — blokada?
- [ ] Admin widzi rozkład głosów per projekt

### Create-profile
- [ ] Idempotency: drugie wywołanie zwraca 409 (user_id już ustawione) ✓
- [ ] Orphan handling: user usunięty ale aplikacja wciąż linked → defensive check ✓
- [ ] Race condition: 2 adminów klika create-profile jednocześnie → FOR UPDATE lock ✓

### Preview mode (admin)
- [ ] URL `?preview=hackathon` dla nie-admina → ignorowany ✓ (usePreviewScope guard)
- [ ] Preview scope tylko UI — endpointy POST nie "udają" roli uczestnika ✓
- [ ] SessionStorage preview scope persistuje po F5 (zamierzone) ale nie po logout

### Jury scoring
- [ ] Juror może edytować tylko swoje oceny (nie innych)
- [ ] Magic token 1 user = 1 token (nie shared między jurorami)
- [ ] Scores są w jsonb — czy struktura valid per `scoring_categories` z edition_config?

## Third-party

### Keycloak
- [ ] Realm `krakhack` — sprawdź roles, clients
- [ ] `backend-api` client ma tylko potrzebne scopes
- [ ] Admin console dostęp — tylko Michał? (users w realm master)
- [ ] Password policy (min length, complexity, rotation?)

### Resend
- [ ] API key scope (może tylko send, nie read all emails?)
- [ ] Domena verified — DKIM + SPF aktualne
- [ ] Subdomain takeover risk (krakhack.info DNS — kto ma kontrolę?)

### Cloudinary
- [ ] Preset upload — czy admin-only przez signed URL?
- [ ] Publiczny folder galerii — OK, ale private/sensitive?

### SMSAPI
- [ ] Ograniczenie per recipient (nie dict attack)
- [ ] Koszt per SMS — monitoring billingu
- [ ] Numer FROM alphanumerycki — whitelisted?

## Compliance / RODO

- [ ] Aplikacja przechowuje PII: email, imię, nazwisko, uczelnia → cookie consent / privacy policy?
- [ ] Prawo do zapomnienia: DELETE user usuwa również membership_applications.user_id + submissions? 
- [ ] Kompetencje self-reported — nie są wrażliwe ale admin ma wgląd
- [ ] Email/SMS marketing consent (obecnie `notify_events` toggle per user)
- [ ] Data export: user może pobrać swoje dane? (/api/panel/me daje pełny JSON)

## Wątpliwe / wymagają deep dive

1. `user_id` w `PATCH /api/membership-applications/:id` — silent drop dla moderatora, ale admin może wpiąć dowolnego user_id do aplikacji (brak walidacji że user istnieje)
2. Preview mode + działania: admin w preview=hackathon klika "vote" → głos zapisuje się jako admin → czy to zamierzone?
3. Jury private_notes — kto widzi oprócz jurora? Admin? Other jury?
4. Magic token expiry — po ile expiruje? Gdzie jest sprawdzenie TTL?
5. `getAdminToken()` w `src/lib/adminApi.ts` — co to robi? (legacy?) Czy może bypass'ować Keycloak?

## Raport z audytu — sugerowany format

```markdown
# [Severity] [Title]

**Severity:** Critical | High | Medium | Low | Info
**Category:** AuthZ | XSS | IDOR | DoS | Info Disclosure | …
**Affected:** [endpoint/page/flow]

**Reproduction:**
1. …
2. …

**Expected:** …
**Actual:** …

**Impact:** …
**Suggested fix:** …
```
