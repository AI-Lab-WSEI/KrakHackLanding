/**
 * Logowanie — /login (alias: /logowanie)
 *
 * Customowa strona logowania w stylu /admin.
 * - Email + hasło → POST /api/auth/login → Keycloak ROPC → token do sessionStorage
 * - Opcjonalnie Keycloak SSO (redirect) — np. dla Google IdP w przyszłości
 *
 * Dlaczego nie hosted Keycloak login? Bo klient chciał formularz "u nas"
 * w stylu legacy /admin — spójny brand, żadnego redirect-bounce.
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function Logowanie() {
  const { user, loading, loginWithPassword, login: ssoLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPassword, setShow]   = useState(false);
  const [submitting, setSubmit]   = useState(false);
  const [error, setError]         = useState<string | null>(null);

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
    try {
      await loginWithPassword(email.trim(), password);
      navigate('/panel', { replace: true });
    } catch (err) {
      setError((err as Error).message || 'Nieprawidłowy email lub hasło');
      setPassword('');
    } finally {
      setSubmit(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
              className="w-16 h-16 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Lock className="w-8 h-8 text-white" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent"
            >
              Logowanie
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground mt-2"
            >
              Dostęp do panelu uczestnika
            </motion.p>
          </div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-5"
          >
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoFocus
                  autoComplete="email"
                  required
                  placeholder="jan.kowalski@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Hasło
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  placeholder="Wprowadź hasło"
                  className="w-full pl-11 pr-12 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShow(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm text-center"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: submitting ? 1 : 1.02 }}
              whileTap={{ scale: submitting ? 1 : 0.98 }}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-cyan-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Logowanie…' : 'Zaloguj się'}
            </motion.button>
          </motion.form>

          {/* Divider + SSO (redirect to Keycloak — kept as fallback for Google IdP etc.) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 pt-6 border-t border-border/50 text-center"
          >
            <button
              type="button"
              onClick={ssoLogin}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
            >
              Zaloguj się przez Keycloak SSO →
            </button>
          </motion.div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Nie masz jeszcze konta? Skontaktuj się z administratorem.
        </p>
      </motion.div>
    </div>
  );
}
