/**
 * ModeratorDashboard — /panel/moderator
 * Dostęp: role 'admin' lub 'moderator'
 *
 * Funkcje:
 *  - Lista użytkowników z paginacją
 *  - Zmiana roli (tylko admin)
 *  - Wysyłanie zaproszeń do onboardingu
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PanelUser {
  id: string;
  email: string;
  displayName: string | null;
  role: string;
  onboardingCompleted: boolean;
  isActive: boolean;
  createdAt: string;
}

type UserRole = 'admin' | 'moderator' | 'hackathon-participant' | 'scienceclub-participant' | 'jury';

const ROLE_OPTIONS: UserRole[] = [
  'admin',
  'moderator',
  'hackathon-participant',
  'scienceclub-participant',
  'jury',
];

const ROLE_LABEL: Record<UserRole, string> = {
  admin:                    '⚙️ Admin',
  moderator:                '🛡 Moderator',
  'hackathon-participant':   '🚀 Uczestnik Hackathonu',
  'scienceclub-participant': '🔬 Uczestnik Koła',
  jury:                     '⚖️ Jury',
};

// ─── Hooks ───────────────────────────────────────────────────────────────────

function useUsers(token: string | null) {
  const [users, setUsers]   = useState<PanelUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/panel/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setUsers(data.users ?? []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  return { users, loading, error, reload: load };
}

// ─── Components ───────────────────────────────────────────────────────────────

function InviteModal({ onClose, onSent }: { onClose: () => void; onSent: () => void }) {
  const { token } = useAuth();
  const [email, setEmail]   = useState('');
  const [name, setName]     = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !email.trim()) return;
    setSending(true);
    setResult(null);
    try {
      const res = await fetch('/api/invite/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim(), displayName: name.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Błąd serwera');
      setResult({ ok: true, message: `Zaproszenie wysłane na ${email}` });
      onSent();
    } catch (err) {
      setResult({ ok: false, message: (err as Error).message });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-base">Wyślij zaproszenie</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400">Email *</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="jan.kowalski@example.com"
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400">Imię i nazwisko (opcjonalnie)</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Jan Kowalski"
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {result && (
            <p className={`text-xs px-3 py-2 rounded-lg ${result.ok ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
              {result.message}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm rounded-lg border border-gray-700 text-gray-400 hover:text-white transition-colors"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={sending}
              className="flex-1 px-4 py-2 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors disabled:opacity-50"
            >
              {sending ? 'Wysyłanie…' : 'Wyślij zaproszenie'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RoleSelect({ user, isAdmin, token, onUpdated }: {
  user: PanelUser;
  isAdmin: boolean;
  token: string | null;
  onUpdated: () => void;
}) {
  const [updating, setUpdating] = useState(false);

  async function handleChange(newRole: string) {
    if (!token || !isAdmin) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/panel/users/${user.id}/role`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error('Błąd zmiany roli');
      onUpdated();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  }

  if (!isAdmin) {
    return (
      <span className="text-xs text-gray-400">
        {ROLE_LABEL[user.role as UserRole] ?? user.role}
      </span>
    );
  }

  return (
    <select
      value={user.role}
      disabled={updating}
      onChange={e => handleChange(e.target.value)}
      className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
    >
      {ROLE_OPTIONS.map(r => (
        <option key={r} value={r}>{ROLE_LABEL[r]}</option>
      ))}
    </select>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function ModeratorDashboard() {
  const { user, token } = useAuth();
  const [showInvite, setShowInvite] = useState(false);
  const [search, setSearch] = useState('');
  const { users, loading, error, reload } = useUsers(token);

  if (!user) return null;
  const canAccess = user.keycloakRoles.includes('admin') || user.keycloakRoles.includes('moderator');
  if (!canAccess) return <Navigate to="/panel" replace />;

  const isAdmin = user.keycloakRoles.includes('admin');

  const filtered = users.filter(u =>
    !search ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.displayName ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Użytkownicy</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {users.length} {users.length === 1 ? 'użytkownik' : 'użytkowników'}
          </p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Zaproś
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Szukaj po emailu lub imieniu…"
        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
      />

      {/* Table */}
      {loading ? (
        <p className="text-gray-500 text-sm py-8 text-center">Ładowanie…</p>
      ) : error ? (
        <p className="text-red-400 text-sm py-8 text-center">{error}</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500 text-sm py-8 text-center">Brak użytkowników</p>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-xs text-gray-500">
                <th className="text-left px-4 py-3 font-medium">Użytkownik</th>
                <th className="text-left px-4 py-3 font-medium">Rola</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Dołączył</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr
                  key={u.id}
                  className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors
                    ${i === filtered.length - 1 ? 'border-b-0' : ''}`}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{u.displayName ?? '—'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <RoleSelect
                      user={u}
                      isAdmin={isAdmin}
                      token={token}
                      onUpdated={reload}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        u.onboardingCompleted
                          ? 'bg-green-900/40 text-green-400'
                          : 'bg-amber-900/30 text-amber-400'
                      }`}
                    >
                      {u.onboardingCompleted ? 'Kompletny' : 'Niekompletny'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(u.createdAt).toLocaleDateString('pl-PL')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Invite modal */}
      {showInvite && (
        <InviteModal
          onClose={() => setShowInvite(false)}
          onSent={() => {
            setShowInvite(false);
            reload();
          }}
        />
      )}
    </div>
  );
}
