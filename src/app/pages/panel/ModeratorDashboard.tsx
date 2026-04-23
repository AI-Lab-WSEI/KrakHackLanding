/**
 * ModeratorDashboard — /panel/moderator
 * Dostęp: role 'admin' lub 'moderator'
 *
 * Funkcje:
 *  - Lista użytkowników z paginacją
 *  - Zmiana roli (tylko admin)
 *  - Wysyłanie zaproszeń do onboardingu
 *  - Tab: Pending team claims (confirm / reject)
 */
import { useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { adminFetch } from '@/lib/adminApi';

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
      const res = await adminFetch('/api/panel/users');
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
      const res = await adminFetch('/api/invite/send', {
        method: 'POST',
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
      const res = await adminFetch(`/api/panel/users/${user.id}/role`, {
        method: 'PATCH',
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

// ─── Claims tab ───────────────────────────────────────────────────────────────

interface Claim {
  id:              string;
  userId:          string;
  editionNumber:   number;
  teamSlug:        string;
  status:          string;
  claimedAt:       string;
  userDisplayName: string | null;
  userEmail:       string;
}

function useClaims(token: string | null, status?: string) {
  const [claims, setClaims]   = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const qs  = status ? `?status=${status}` : '';
      const res = await adminFetch(`/api/panel/claims${qs}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setClaims(
        (data.claims ?? []).map((c: Record<string, unknown>) => ({
          id:              c.id,
          userId:          c.user_id          ?? c.userId,
          editionNumber:   c.edition_number   ?? c.editionNumber,
          teamSlug:        c.team_slug        ?? c.teamSlug,
          status:          c.status,
          claimedAt:       c.claimed_at       ?? c.claimedAt,
          userDisplayName: c.user_display_name ?? c.userDisplayName ?? null,
          userEmail:       c.user_email       ?? c.userEmail,
        }))
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [token, status]);

  useEffect(() => { load(); }, [load]);

  return { claims, loading, error, reload: load };
}

function ClaimsTab({ token, isAdmin }: { token: string | null; isAdmin: boolean }) {
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const { claims, loading, error, reload } = useClaims(
    token,
    filter === 'pending' ? 'pending' : undefined
  );
  const [acting, setActing] = useState<string | null>(null);
  const [backfilling, setBackfilling] = useState(false);
  const [backfillMsg, setBackfillMsg] = useState<string | null>(null);

  async function act(id: string, action: 'confirm' | 'reject') {
    if (!token || acting) return;
    setActing(id);
    try {
      await adminFetch(`/api/panel/claims/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ action }),
      });
      reload();
    } finally {
      setActing(null);
    }
  }

  async function runBackfill() {
    if (!token || backfilling) return;
    setBackfilling(true);
    setBackfillMsg(null);
    try {
      const res = await adminFetch('/api/panel/claims/backfill', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setBackfillMsg(`OK — dolinkowano ${data.linked ?? 0} członków zespołów.`);
      } else {
        setBackfillMsg(data.error ?? 'Błąd');
      }
    } catch {
      setBackfillMsg('Błąd sieci');
    } finally {
      setBackfilling(false);
    }
  }

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      pending:   'bg-amber-900/30 text-amber-400',
      confirmed: 'bg-green-900/30 text-green-400',
      rejected:  'bg-red-900/30 text-red-400',
    };
    return map[s] ?? 'bg-gray-800 text-gray-400';
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Filter toggle + admin-only backfill */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex gap-2">
          {(['pending', 'all'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                filter === f
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {f === 'pending' ? 'Oczekujące' : 'Wszystkie'}
            </button>
          ))}
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
            {backfillMsg && (
              <span className="text-xs text-gray-400">{backfillMsg}</span>
            )}
            <button
              onClick={runBackfill}
              disabled={backfilling}
              className="text-xs px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white disabled:opacity-50"
              title="Dolinkuj team_members dla wszystkich potwierdzonych claimów"
            >
              {backfilling ? 'Linkuję…' : '🔗 Backfill members'}
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm py-8 text-center">Ładowanie…</p>
      ) : error ? (
        <p className="text-red-400 text-sm py-8 text-center">{error}</p>
      ) : claims.length === 0 ? (
        <p className="text-gray-500 text-sm py-8 text-center">
          {filter === 'pending' ? 'Brak oczekujących claimów.' : 'Brak claimów.'}
        </p>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-xs text-gray-500">
                <th className="text-left px-4 py-3 font-medium">Uczestnik</th>
                <th className="text-left px-4 py-3 font-medium">Zespół</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Data</th>
                <th className="text-right px-4 py-3 font-medium">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((c, i) => (
                <tr
                  key={c.id}
                  className={`border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors
                    ${i === claims.length - 1 ? 'border-b-0' : ''}`}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{c.userDisplayName ?? '—'}</p>
                    <p className="text-xs text-gray-500">{c.userEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    <span className="font-mono bg-gray-800 px-1.5 py-0.5 rounded">
                      {c.teamSlug}
                    </span>
                    <span className="ml-1 text-gray-600">ed.{c.editionNumber}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge(c.status)}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(c.claimedAt).toLocaleDateString('pl-PL')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {c.status === 'pending' && (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => act(c.id, 'confirm')}
                          disabled={acting === c.id}
                          className="text-xs bg-green-900/30 hover:bg-green-900/50 text-green-400 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50"
                        >
                          Potwierdź
                        </button>
                        <button
                          onClick={() => act(c.id, 'reject')}
                          disabled={acting === c.id}
                          className="text-xs bg-red-900/20 hover:bg-red-900/40 text-red-400 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50"
                        >
                          Odrzuć
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type ActiveTab = 'users' | 'claims';

interface ModeratorDashboardProps {
  /** Gdy podane — wymusza konkretny tab i ukrywa tab-nav (dla wrapperów /panel/admin/*). */
  lockTab?: ActiveTab;
}

export function ModeratorDashboard({ lockTab }: ModeratorDashboardProps = {}) {
  const { user, token } = useAuth();
  const [showInvite, setShowInvite] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<ActiveTab>(lockTab ?? 'users');
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
          <h1 className="text-xl font-bold">Użytkownicy & Claimy</h1>
          <p className="text-gray-400 text-sm mt-0.5">Zarządzaj społecznością platformy</p>
        </div>
        {activeTab === 'users' && (
          <button
            onClick={() => setShowInvite(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Zaproś
          </button>
        )}
      </div>

      {/* Tab nav — hidden when tab is locked (embedded as /panel/admin/* page) */}
      {!lockTab && (
        <div className="flex gap-2 border-b border-gray-800 pb-0">
          {([['users', 'Użytkownicy'], ['claims', 'Team Claims']] as [ActiveTab, string][]).map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium transition-colors -mb-px border-b-2
                ${activeTab === tab
                  ? 'text-white border-indigo-500'
                  : 'text-gray-500 border-transparent hover:text-gray-300'}`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* ── Users tab ── */}
      {activeTab === 'users' && (
        <>
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
        </>
      )}

      {/* ── Claims tab ── */}
      {activeTab === 'claims' && <ClaimsTab token={token} isAdmin={isAdmin} />}

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
