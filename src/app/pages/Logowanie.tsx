/**
 * Logowanie — /login (alias: /logowanie)
 *
 * Prosta karta z email+hasłem. Styl spójny z resztą panelu:
 *   bg-gray-950 shell · bg-white/5 + border-white/10 karta · lucide input ikony
 *   żadnych gradient hero, żadnych Lock-in-circle dekoracji
 *
 * Auth flow: POST /api/auth/login → Keycloak ROPC → token → /panel.
 * Fallback link "Zaloguj przez Keycloak SSO" na wypadek Google IdP w przyszłości.
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function Logowanie() {
  const { user, loading, loginWithPassword, login: ssoLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShow] = useState(false);
  const [submitting, setSubmit] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  /** Pokaż dedykowany banner z CTA do SSO gdy user ma temp password / required action. */
  const [needsSsoSetup, setNeedsSsoSetup] = useState(false);

  // Already logged in — bounce to panel
  useEffect(() => {
    if (!loading && user) navigate('/panel', { replace: true });
  }, [user, loading, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (!email.trim() || !password) {
      setError('Podaj email i hasło');
      return;
    }
    setSubmit(true);
    setError(null);
    setNeedsSsoSetup(false);
    try {
      await loginWithPassword(email.trim(), password);
      navigate('/panel', { replace: true });
    } catch (err) {
      const msg = (err as Error).message || 'Nieprawidłowy email lub hasło';
      // Keycloak zwraca "Account is not fully set up" gdy user ma required
      // action (np. UPDATE_PASSWORD po create-profile / bulk invite). ROPC nie
      // wspiera tych akcji — musimy przekierować do Keycloak UI (PKCE flow).
      if (/not fully set up/i.test(msg) || /update.?password/i.test(msg)) {
        setNeedsSsoSetup(true);
        setError(null);
      } else {
        setError(msg);
      }
      setPassword('');
    } finally {
      setSubmit(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/10 border-t-white/50 rounded-full animate-spin" />
      </div>
    );
  }

  const inputCls =
    'w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white ' +
    'placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors';

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-white">Zaloguj się</h1>
            <p className="text-sm text-gray-400 mt-1">Dostęp do panelu uczestnika</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs text-gray-400 uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoFocus
                  autoComplete="email"
                  required
                  placeholder="jan.kowalski@example.com"
                  className={inputCls}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs text-gray-400 uppercase tracking-wider">
                Hasło
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  placeholder="Wprowadź hasło"
                  className={inputCls + ' pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShow(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 text-center">
                {error}
              </div>
            )}

            {needsSsoSetup && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-300 space-y-2">
                <p className="font-medium text-amber-200">Pierwsze logowanie — ustaw własne hasło</p>
                <p className="text-amber-300/80 leading-relaxed">
                  Twoje konto jest nowe i ma hasło tymczasowe. Kliknij poniżej, żeby przejść do Keycloaka
                  i ustawić własne hasło. To jednorazowa operacja — potem możesz logować się stąd.
                </p>
                <button
                  type="button"
                  onClick={ssoLogin}
                  className="w-full mt-2 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-lg text-amber-200 text-xs font-medium transition-colors"
                >
                  Przejdź do Keycloak i ustaw hasło →
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
            >
              {submitting ? 'Logowanie…' : 'Zaloguj się'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 flex flex-col gap-3 items-center">
            <Link
              to="/zapomniane-haslo"
              className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
            >
              Nie pamiętam hasła
            </Link>
            <button
              type="button"
              onClick={ssoLogin}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Zaloguj się przez Keycloak SSO →
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-4">
          Nie masz konta? Skontaktuj się z administratorem.
        </p>
      </div>
    </div>
  );
}
