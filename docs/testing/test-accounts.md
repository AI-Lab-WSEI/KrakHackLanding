# Konta testowe dla pretestera

> Admin zrealizuje utworzenie tych kont przed startem testów. Hasła nigdzie nie commit'owane — admin przekaże pretesterowi osobno (np. 1Password share, Signal).

## Wymagane konta

### 1. Admin (real — Michał)
- Email: `michalmadejski2@gmail.com`
- Rola Keycloak: `admin`
- Dostęp: pełny panel

### 2. Moderator (test)
- Email: `pretest-moderator@test.krakhack.info`
- Rola Keycloak: `moderator`
- Preview scope: przez URL `?preview=...` niedostępne (tylko admin ma preview)

### 3. Hackathon-participant (test)
- Email: `pretest-hackathon@test.krakhack.info`
- Rola Keycloak: `hackathon-participant`
- Dodaj uczestnika do current edition (3) — w `team_projects` lub `submissions` żeby mógł claim team

### 4. Scienceclub-participant (test)
- Email: `pretest-club@test.krakhack.info`
- Rola Keycloak: `scienceclub-participant`
- Pre-filled bio/skills (żeby kompas miał co pokazać)

### 5. Jury (test)
- Email: `pretest-jury@test.krakhack.info`
- Rola Keycloak: `jury`
- Dodaj też do `jury_members` current edition → admin wygeneruje magic link → testerz dostanie mailem

### 6. No-role (test)
- Email: `pretest-norole@test.krakhack.info`
- Rola Keycloak: żadna (tylko default realm roles)
- Sprawdzenie flow "konto czeka na przypisanie"

## Jak admin tworzy te konta

Dla każdego (przykład bash — skrypt poniżej):

```bash
# 1. Submit aplikacji z tym emailem (public POST)
curl -X POST https://www.krakhack.info/api/membership-applications \
  -H 'Content-Type: application/json' \
  -d '{"firstName":"Pretest","lastName":"Moderator","email":"pretest-moderator@test.krakhack.info", ...}'

# 2. Jako admin — create-profile z wybraną rolą
TOKEN=$(curl -X POST /api/auth/login ... | jq -r .accessToken)
curl -X POST -H "Authorization: Bearer $TOKEN" \
  "/api/membership-applications/<APP_ID>/create-profile" \
  -d '{"role":"moderator","customMessage":"pretester"}'

# 3. Przez Keycloak Admin API — ustaw permanent password (bez UPDATE_PASSWORD wymuszania)
KC_TOK=$(curl -X POST ${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token \
  -d "grant_type=password&client_id=admin-cli&username=$KC_ADMIN&password=$KC_PW" | jq -r .access_token)
curl -X PUT "${KEYCLOAK_URL}/admin/realms/krakhack/users/$KC_UUID/reset-password" \
  -H "Authorization: Bearer $KC_TOK" \
  -d '{"type":"password","value":"Pretest2026!","temporary":false}'
curl -X PUT "${KEYCLOAK_URL}/admin/realms/krakhack/users/$KC_UUID" \
  -H "Authorization: Bearer $KC_TOK" \
  -d '{"requiredActions":[]}'
```

## Reset / cleanup po pretest

Po zakończonym teście:
1. DELETE wszystkich pretest userów via `DELETE /api/panel/users/:id` (cascaduje do Keycloak + nulluje applications.user_id)
2. Sprawdź: no `pretest-*@test.krakhack.info` users ani w `users`, ani w Keycloak
3. Aplikacje zostają w `membership_applications` (historia) — admin może ręcznie status=odrzucony albo zostawić

## Alt: Pretester przynosi własny email

Jeśli pretester preferuje real email (np. do mobile test):
- Admin tworzy moderator + participant konta z jego mailami (za zgodą)
- Pretester używa swoich maili do testów email deliverability
- Po pretest — cleanup (delete accounts, logout sesje)

## Credentials handover

Po utworzeniu kont — admin przekaże pretesterowi:
```
Admin:                michalmadejski2@gmail.com / <shared-secret>
Moderator:            pretest-moderator@...      / <shared>
Hackathon-p:          pretest-hackathon@...      / <shared>
Scienceclub-p:        pretest-club@...           / <shared>
Jury:                 pretest-jury@...           / <shared> (+ magic link mailem po wygenerowaniu)
No-role:              pretest-norole@...         / <shared>
```
