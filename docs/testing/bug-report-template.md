# Template zgłoszenia bugu

Skopiuj ten szablon i wklej jako nowy issue/task w ClickUp. Zastąp placeholdery.

---

## [BUG] <krótki tytuł>

**Severity:** `Critical` | `High` | `Medium` | `Low`
**Scope:** `AuthZ` | `UX` | `Data integrity` | `Security` | `Email` | `Performance` | `Accessibility`
**Found by:** <pretester name>
**Date:** YYYY-MM-DD

### Which role / flow
Jako **[admin | moderator | hackathon-participant | scienceclub-participant | jury | anon]**, w ścieżce **[login / panel admin / /dolacz / ...]**.

### Steps to reproduce
1. ...
2. ...
3. ...

### Expected result
...

### Actual result
...

### Impact
Co to oznacza praktycznie (np. moderator może usunąć admin account, user może zobaczyć cudze dane, email nie dociera).

### Evidence
- Screenshot: (załączony)
- HAR file: (jeśli network-related)
- Console log: (jeśli JS error)
- Browser: Chrome 128 / Firefox 120 / Safari 17
- Device: Desktop / Mobile 375px / ...

### Suggested fix (opcjonalne)
Jeśli wiadomo gdzie szukać rozwiązania.

---

## Przykład wypełnionego

## [BUG] Moderator może wywołać bulk create-profile przez curl

**Severity:** Critical
**Scope:** AuthZ
**Found by:** Security Pretester
**Date:** 2026-04-25

### Which role / flow
Jako **moderator**, w ścieżce **backend API `/api/membership-applications/bulk/create-profile`**.

### Steps to reproduce
1. Login jako moderator przez `/login`
2. Get JWT z sessionStorage.kc_access_token (DevTools → Application)
3. Wywołaj:
```bash
curl -X POST https://www.krakhack.info/api/membership-applications/bulk/create-profile \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"applicationIds":[5,7,9],"role":"admin"}'
```

### Expected result
HTTP 403 — moderator nie ma uprawnień do tej operacji. Response: `{"error":"Zabronione"}`.

### Actual result
HTTP 200 — profile utworzone z rolą admin. 3 nowych adminów w systemie.

### Impact
**Krytyczny**. Moderator może utworzyć konta z rolą `admin` → pełna elevacja uprawnień → reading wszystkich danych, modyfikacja edycji, mailing masowy. Potencjalnie też poprzez panel UI jeśli admin-only przyciski nie są hidden.

### Evidence
- HAR attached: bulk-create-profile-mod-bypass.har
- Console: no error
- JWT payload: `realm_access.roles = ["moderator", "default-roles-krakhack"]`

### Suggested fix
`server.js` line 1580: sprawdzić czy `requireRole('admin')` middleware jest applied (tylko `requireAdmin` na single endpoint, bulk może używać innej funkcji).
