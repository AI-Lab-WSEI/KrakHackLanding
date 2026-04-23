/**
 * /zapomniane-haslo — self-service reset hasła.
 *
 * Flow:
 *   1. User wpisuje email → POST /api/auth/forgot-password
 *   2. Backend zawsze zwraca 200 (anti-enum). Jeśli user istnieje i ma
 *      keycloak_id — generuje nowy temp password, ustawia w Keycloak
 *      (temporary=true) i wysyła branded email z nowym hasłem.
 *   3. User otwiera email, klika link do /login, loguje się tymczasowym
 *      hasłem → Keycloak wymusi zmianę (banner "Pierwsze logowanie" na /login).
 *
 * Rate-limit: max 3 próby na godz na email (po stronie serwera).
 */
import { useState } from 'react';
import { Link } from 'react-router';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export function ForgotPasswordPage() {
  const [email, setEmail]         = useState('');
  const [submitting, setSubmit]   = useState(false);
  const [done, setDone]           = useState(false);
  const [error, setError]         = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting || done) return;
    if (!email.trim() || !email.includes('@')) {
      setError('Podaj prawidłowy email');
      return;
    }
    setError(null);
    setSubmit(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim() }),
      });
      // Backend zawsze zwraca 200. Nie ujawnia czy konto istnieje.
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setDone(true);
    } catch (err) {
      setError((err as Error).message || 'Błąd sieci');
    } finally {
      setSubmit(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-white">Nie pamiętam hasła</h1>
            <p className="text-sm text-gray-400 mt-1">
              Podaj email którym się logujesz. Wyślemy Ci nowe tymczasowe hasło — po zalogowaniu
              Keycloak poprosi o ustawienie Twojego własnego.
            </p>
          </div>

          {done ? (
            <div className="space-y-4">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                <div className="text-sm text-emerald-200">
                  <p className="font-medium mb-1">Wysłaliśmy email (jeśli konto istnieje).</p>
                  <p className="text-emerald-300/80 text-xs leading-relaxed">
                    Sprawdź skrzynkę (także folder spam) dla <code className="text-emerald-400">{email}</code>.
                    Email zawiera nowe hasło tymczasowe i link do logowania.
                    Jeśli nie przyjdzie w ciągu 5 minut — konto pod tym adresem może nie istnieć.
                  </p>
                </div>
              </div>
              <Link
                to="/login"
                className="block w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors text-center"
              >
                Wróć do logowania →
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="forgot-email" className="text-xs text-gray-400 uppercase tracking-wider">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoFocus
                    required
                    placeholder="twoj@email.pl"
                    className="w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {submitting ? 'Wysyłamy…' : 'Wyślij nowe hasło'}
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <Link
              to="/login"
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              Wróć do logowania
            </Link>
          </div>
        </div>

        <p className="text-center text-[11px] text-gray-600 mt-4 leading-relaxed">
          Rate-limit: max 3 próby na godzinę per email. Jeśli coś nie działa — napisz do admina.
        </p>
      </div>
    </div>
  );
}
