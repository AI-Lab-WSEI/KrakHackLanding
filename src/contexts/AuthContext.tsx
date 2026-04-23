/**
 * AuthContext — Keycloak PKCE authentication (Faza 1)
 *
 * Flow:
 *   1. User clicks "Zaloguj się" → redirected to Keycloak authorize URL (PKCE)
 *   2. Keycloak redirects back to /auth/callback?code=...
 *   3. Callback page calls exchangeCode() → access_token stored in sessionStorage
 *   4. verifyKeycloakToken middleware on the backend validates token on each request
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

// ─── Config ──────────────────────────────────────────────────────────────────

const KC_URL    = import.meta.env.VITE_KEYCLOAK_URL   as string;
const KC_REALM  = import.meta.env.VITE_KEYCLOAK_REALM as string;
const KC_CLIENT = import.meta.env.VITE_KEYCLOAK_CLIENT_ID as string;

const TOKEN_KEY         = 'kc_access_token';
const REFRESH_TOKEN_KEY = 'kc_refresh_token';
const PKCE_VERIFIER_KEY = 'kc_pkce_verifier';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: string;
  bio: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  university: string | null;
  graduationYear: number | null;
  skills: string[];
  onboardingCompleted: boolean;
  isPublic: boolean;
  notifyEvents: boolean;
  profileSlug: string | null;
  keycloakRoles: string[];
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  /** Redirect-based SSO (PKCE) — used for Google IdP etc. */
  login: () => void;
  /** Direct email+password login via ROPC through /api/auth/login. */
  loginWithPassword: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  exchangeCode: (code: string, redirectUri: string) => Promise<void>;
}

// ─── PKCE Helpers ────────────────────────────────────────────────────────────

function base64urlEncode(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function generatePKCE(): Promise<{ verifier: string; challenge: string }> {
  const array = crypto.getRandomValues(new Uint8Array(32));
  const verifier = base64urlEncode(array.buffer);
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  const challenge = base64urlEncode(digest);
  return { verifier, challenge };
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]     = useState<AuthUser | null>(null);
  const [token, setToken]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Fetch user profile from /api/me ──────────────────────────────────────

  const fetchUser = useCallback(async (accessToken: string) => {
    try {
      let res = await fetch('/api/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // 401 → try refresh + retry once before giving up
      if (res.status === 401) {
        const refreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY);
        if (refreshToken) {
          try {
            const refreshRes = await fetch('/api/auth/refresh', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken }),
            });
            if (refreshRes.ok) {
              const rdata = await refreshRes.json();
              if (rdata.accessToken) {
                sessionStorage.setItem(TOKEN_KEY, rdata.accessToken);
                if (rdata.refreshToken) sessionStorage.setItem(REFRESH_TOKEN_KEY, rdata.refreshToken);
                setToken(rdata.accessToken);
                res = await fetch('/api/me', {
                  headers: { Authorization: `Bearer ${rdata.accessToken}` },
                });
              }
            }
          } catch {
            // refresh itself failed — fall through to hard-logout below
          }
        }
      }

      if (!res.ok) throw new Error(`/api/me returned ${res.status}`);
      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error('[Auth] fetchUser failed:', err);
      setUser(null);
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(REFRESH_TOKEN_KEY);
      setToken(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (token) await fetchUser(token);
  }, [token, fetchUser]);

  // ── Hydrate from sessionStorage on mount ─────────────────────────────────

  useEffect(() => {
    const stored = sessionStorage.getItem(TOKEN_KEY);
    if (stored) {
      setToken(stored);
      fetchUser(stored).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchUser]);

  // ── Silent token refresh every 4 minutes ─────────────────────────────────

  useEffect(() => {
    if (!token) return;
    const interval = setInterval(async () => {
      const refreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) return;
      try {
        const res = await fetch(
          `${KC_URL}/realms/${KC_REALM}/protocol/openid-connect/token`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              grant_type:    'refresh_token',
              client_id:     KC_CLIENT,
              refresh_token: refreshToken,
            }),
          }
        );
        if (!res.ok) throw new Error('Refresh failed');
        const data = await res.json();
        sessionStorage.setItem(TOKEN_KEY, data.access_token);
        if (data.refresh_token) {
          sessionStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
        }
        setToken(data.access_token);
      } catch {
        // Refresh failed — force re-login
        logout();
      }
    }, 4 * 60 * 1000); // 4 minutes
    return () => clearInterval(interval);
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Login with email + password (custom form, routed through our backend) ──

  const loginWithPassword = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Błąd logowania' }));
      throw new Error(err.error ?? 'Nieprawidłowy email lub hasło');
    }
    const data = await res.json();
    sessionStorage.setItem(TOKEN_KEY, data.accessToken);
    if (data.refreshToken) {
      sessionStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    }
    setToken(data.accessToken);
    await fetchUser(data.accessToken);

    // Sync user row in our DB (creates the record on first login).
    await fetch('/api/auth/sync-user', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${data.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
  }, [fetchUser]);

  // ── Login: redirect to Keycloak ───────────────────────────────────────────

  const login = useCallback(async () => {
    const { verifier, challenge } = await generatePKCE();
    sessionStorage.setItem(PKCE_VERIFIER_KEY, verifier);

    const redirectUri = `${window.location.origin}/auth/callback`;
    const params = new URLSearchParams({
      client_id:             KC_CLIENT,
      redirect_uri:          redirectUri,
      response_type:         'code',
      scope:                 'openid profile email',
      code_challenge:        challenge,
      code_challenge_method: 'S256',
    });
    window.location.href = `${KC_URL}/realms/${KC_REALM}/protocol/openid-connect/auth?${params}`;
  }, []);

  // ── Exchange code for tokens (called from /auth/callback) ─────────────────

  const exchangeCode = useCallback(async (code: string, redirectUri: string) => {
    const verifier = sessionStorage.getItem(PKCE_VERIFIER_KEY);
    if (!verifier) throw new Error('PKCE verifier missing');

    const res = await fetch(
      `${KC_URL}/realms/${KC_REALM}/protocol/openid-connect/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type:    'authorization_code',
          client_id:     KC_CLIENT,
          code,
          redirect_uri:  redirectUri,
          code_verifier: verifier,
        }),
      }
    );
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Token exchange failed: ${err}`);
    }
    const data = await res.json();
    sessionStorage.setItem(TOKEN_KEY, data.access_token);
    if (data.refresh_token) {
      sessionStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
    }
    sessionStorage.removeItem(PKCE_VERIFIER_KEY);
    setToken(data.access_token);
    await fetchUser(data.access_token);

    // Sync user to backend
    await fetch('/api/auth/sync-user', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${data.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
  }, [fetchUser]);

  // ── Logout ────────────────────────────────────────────────────────────────

  const logout = useCallback(() => {
    const idToken = sessionStorage.getItem(REFRESH_TOKEN_KEY); // best-effort
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    setToken(null);
    setUser(null);
    const redirectUri = encodeURIComponent(window.location.origin);
    window.location.href =
      `${KC_URL}/realms/${KC_REALM}/protocol/openid-connect/logout?client_id=${KC_CLIENT}&post_logout_redirect_uri=${redirectUri}`;
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, loginWithPassword, logout, refreshUser, exchangeCode }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
