/**
 * AuthCallback — handles redirect from Keycloak after login
 * Route: /auth/callback?code=...&state=...
 */
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';

export function AuthCallback() {
  const { exchangeCode } = useAuth();
  const navigate = useNavigate();
  const done = useRef(false); // guard against StrictMode double-effect

  useEffect(() => {
    if (done.current) return;
    done.current = true;

    const params = new URLSearchParams(window.location.search);
    const code  = params.get('code');
    const error = params.get('error');

    if (error) {
      console.error('[AuthCallback] Keycloak error:', error, params.get('error_description'));
      navigate('/logowanie?error=keycloak', { replace: true });
      return;
    }

    if (!code) {
      navigate('/logowanie?error=no_code', { replace: true });
      return;
    }

    const redirectUri = `${window.location.origin}/auth/callback`;
    exchangeCode(code, redirectUri)
      .then(() => navigate('/panel', { replace: true }))
      .catch(err => {
        console.error('[AuthCallback] Token exchange failed:', err);
        navigate('/logowanie?error=exchange', { replace: true });
      });
  }, [exchangeCode, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
      <p className="text-gray-400 text-sm">Logowanie…</p>
    </div>
  );
}
