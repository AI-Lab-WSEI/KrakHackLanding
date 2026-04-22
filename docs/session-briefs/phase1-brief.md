# Phase 1 Brief — Auth + konta użytkowników

> Stan: **DO ZROBIENIA** · 2026-04-22  
> Poprzedni brief: `docs/session-briefs/phase0-brief.md`  
> Pełny roadmap: `docs/ROADMAP.md`

---

## Zależności Fazy 0 (do zamknięcia przed startem)

- [ ] `npm run migrate` → 9 migracji zastosowanych na Railway DB
- [ ] Stara aplikacja bez regresji

## Co robimy w Fazie 1

### 1. Middleware JWT w `server.js`

Funkcja `verifyKeycloakToken(req, res, next)`:
1. Wyciąga `Authorization: Bearer <token>` z headera
2. Weryfikuje JWT przez JWKS: `GET /realms/krakhack/protocol/openid-connect/certs`
3. Wyciąga `realm_access.roles` i `sub` (= keycloak_id)
4. Zwraca 401 jeśli invalid

**Biblioteka:** `jose` (pure ESM, `npm install jose`)

```js
import { createRemoteJWKSet, jwtVerify } from 'jose';

const JWKS = createRemoteJWKSet(
  new URL(`${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/certs`)
);

async function verifyKeycloakToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' });
  try {
    const { payload } = await jwtVerify(auth.slice(7), JWKS, {
      issuer: `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}`,
    });
    req.user = {
      keycloakId: payload.sub,
      email: payload.email,
      roles: payload.realm_access?.roles ?? [],
      isHackathonParticipant: (payload.realm_access?.roles ?? []).includes('hackathon-participant'),
      isScienceclubParticipant: (payload.realm_access?.roles ?? []).includes('scienceclub-participant'),
    };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}
```

### 2. Endpoint `GET /api/me`

Zwraca profil zalogowanego użytkownika z tabeli `users` (join po `keycloak_id`).
Jeśli użytkownik nie istnieje w DB — tworzy go (first-time login).

### 3. Endpoint `POST /api/auth/sync-user`

Wywoływany po każdym logowaniu z frontu. Syncuje dane z Keycloak (email, display_name) do tabeli `users`.

### 4. Frontend `AuthProvider`

- Plik: `src/contexts/AuthContext.tsx`
- Używa `@react-keycloak/web` lub ręczny PKCE flow
- Przechowuje token w memory (nie localStorage)
- Refresh token co 4 minuty (access_token TTL = 5 min)

### 5. Strona `/logowanie`

- Plik: `src/pages/Logowanie.tsx`
- Redirect do Keycloak authorization URL z PKCE
- Po powrocie: wymiana code→token → `/api/auth/sync-user` → redirect do `/panel`

### 6. Legacy auth backward compat

Stary endpoint `POST /api/admin/login` (z hasłem `MakaPaka2026`) — pozostaje aktywny do końca Fazy 3. Zwraca UUID session token jak dotychczas. Nowe endpointy wymagają JWT.

---

## Zmienne env (już ustawione na Railway)

```
KEYCLOAK_URL=https://keycloak-production-b6e2.up.railway.app
KEYCLOAK_REALM=krakhack
KEYCLOAK_CLIENT_ID=backend-api
KEYCLOAK_CLIENT_SECRET=12Wbe2mgrDj5WROKFo5dRvdRMSanuCnk
KEYCLOAK_FRONTEND_CLIENT_ID=frontend-app
```

---

## Invite-based onboarding (Faza 1 końcowa)

Admin wysyła email z `invite_token` → `/onboarding?invite_token=XXX`:
1. Sprawdza token w tabeli `users.invite_token`
2. Pokazuje formularz pre-filled z `membership_applications` (match po email)
3. Po wypełnieniu → Keycloak rejestracja → `users.keycloak_id` ustawiany → `onboarding_completed = true`

**Endpoint:** `POST /api/invite/send` (admin only), `GET /api/invite/verify?token=XXX`

---

## DoD Fazy 1

- [ ] `verifyKeycloakToken` middleware działa — zwraca 401 bez tokenu, 200 z ważnym tokenem
- [ ] `GET /api/me` zwraca profil (lub tworzy nowy rekord przy first login)
- [ ] `/logowanie` → redirect Keycloak → powrót → zalogowany
- [ ] Legacy `POST /api/admin/login` nadal działa (regression test)
- [ ] `npm run migrate` uruchomione, tabela `users` istnieje
- [ ] Michał może zalogować się przez Keycloak i zobaczyć `/panel` (choćby placeholder)

---

## Kolejność implementacji

1. `npm install jose` + middleware JWT w `server.js`
2. `GET /api/me` endpoint
3. `AuthContext.tsx` + hook `useAuth()`
4. Strona `/logowanie`
5. Invite flow (send + verify + onboarding page)

---

## Pliki do stworzenia/zmodyfikowania

```
server.js                          — dodać middleware verifyKeycloakToken + /api/me
src/contexts/AuthContext.tsx       — NOWY
src/pages/Logowanie.tsx            — NOWY
src/pages/Onboarding.tsx           — NOWY  
src/pages/Panel.tsx                — NOWY (placeholder po logowaniu)
```
