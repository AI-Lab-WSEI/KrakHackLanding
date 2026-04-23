/**
 * adminApi — wspólny adapter auth + auto-refresh dla komponentów Admin*.tsx.
 *
 *   getAdminToken()           — czyta aktualny access_token z sessionStorage
 *   adminFetch(path, init)    — fetch + Authorization Bearer + AUTO-RETRY na 401
 *                               (trigger /api/auth/refresh, podmień token, retry raz)
 *
 * Access token z Keycloak żyje 5 min; AuthContext ma background refresh co 4 min,
 * ale jak admin wchodzi w ciężką sekcję zaraz przed cutoff-em, apiFetch może
 * dostać 401. Zamiast wywalać "Sesja wygasła" — robimy transparent refresh+retry.
 */

const KC_TOKEN_KEY   = 'kc_access_token';
const KC_REFRESH_KEY = 'kc_refresh_token';

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(KC_TOKEN_KEY);
}

function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(KC_REFRESH_KEY);
}

/** Zwraca nowy access token lub null jeśli refresh failed. */
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  try {
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.accessToken) {
      sessionStorage.setItem(KC_TOKEN_KEY, data.accessToken);
      if (data.refreshToken) sessionStorage.setItem(KC_REFRESH_KEY, data.refreshToken);
      return data.accessToken;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Fetch wrapper z automatycznym Authorization Bearer header i retry na 401.
 *
 *   await adminFetch('/api/admin/applications')
 *   await adminFetch('/api/admin/applications/123', { method: 'PATCH', body: JSON.stringify({...}) })
 *
 * Na 401 próbuje /api/auth/refresh. Jeśli refresh się uda — retry raz.
 * Jeśli dalej 401 po retry — zwraca tę response (caller decyduje jak reagować).
 */
export async function adminFetch(
  path: string,
  init?: RequestInit,
  _retry: boolean = false,
): Promise<Response> {
  const token = getAdminToken();
  const headers = new Headers(init?.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(path, { ...init, headers });

  if (res.status === 401 && !_retry) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      // Retry raz z nowym tokenem
      return adminFetch(path, init, true);
    }
    // Refresh nie pomogł — dopiero TERAZ sygnalizujemy full logout
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('admin-logout'));
    }
  }

  return res;
}
