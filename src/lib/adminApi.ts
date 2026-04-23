/**
 * adminApi — wspólny adapter auth dla komponentów Admin*.tsx.
 *
 * Stary panel `/admin` trzymał token pod `localStorage['admin_api_token']`
 * (UUID z /api/admin/login). Po migracji na Keycloak SSO, token leży w
 * `sessionStorage['kc_access_token']` (JWT). Ten moduł udostępnia ten sam
 * interfejs `getAdminToken()` co `./AdminAuth`, ale czyta z właściwego miejsca.
 *
 * Komponenty Admin*.tsx używające `getAdminToken()` mają ZERO zmian funkcjonalnych
 * — tylko import się zmienia z `./AdminAuth` na `@/lib/adminApi`.
 */

const KC_TOKEN_KEY = 'kc_access_token';

/**
 * Zwraca aktualny token JWT Keycloak (lub null jeśli user niezalogowany).
 * Interfejs zgodny z dawnym `getAdminToken` z `AdminAuth.tsx`.
 */
export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(KC_TOKEN_KEY);
}

/**
 * `fetch` z automatycznie doklejanym `Authorization: Bearer <kc-token>`.
 *
 *   await adminFetch('/api/admin/applications')
 *   await adminFetch('/api/admin/applications/123', { method: 'PATCH', body: ... })
 *
 * Na 401 wysyła `window.dispatchEvent(new Event('admin-logout'))` — zgodność ze
 * starym flow w AdminDashboard (tam nasłuch kasuje token + redirect).
 */
export async function adminFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = getAdminToken();
  const headers = new Headers(init?.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(path, { ...init, headers });

  if (res.status === 401 && typeof window !== 'undefined') {
    window.dispatchEvent(new Event('admin-logout'));
  }

  return res;
}
