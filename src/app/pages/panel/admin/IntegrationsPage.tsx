/**
 * /panel/admin/integracje — widok zbiorczy mapping user ↔ Discord / ClickUp.
 *
 * Cel: admin widzi w jednym miejscu którzy userzy nie mają wypełnionego
 * discord_username / clickup_email i może jednym klikiem wysłać prośbę o
 * uzupełnienie — pojedynczo (ikonka przy komórce) lub zbiorczo (top-bar
 * "Wyślij do wszystkich bez Discord").
 *
 * Jak tylko podłączymy Discord OAuth / bot-auto-invite, to samo miejsce
 * będzie rozbudowane o akcję "dodaj do serwera".
 */
import { useEffect, useMemo, useState } from 'react';
import {
  Search, RefreshCw, Send, MessageSquare, Mail, AlertCircle, Check, X, Users as UsersIcon,
} from 'lucide-react';
import { adminFetch } from '@/lib/adminApi';
import { PanelSectionHeader } from '@/app/components/panel/shared/PanelSectionHeader';
import { PanelCard } from '@/app/components/panel/shared/PanelCard';
import { InfoBar } from '@/app/components/panel/shared/InfoBar';

interface UserRow {
  id:                  string;
  email:               string;
  displayName:         string | null;
  role:                string;
  discordUsername:     string | null;
  discordId:           string | null;
  clickupEmail:        string | null;
  hasKeycloak:         boolean;
  onboardingCompleted: boolean;
  isActive:            boolean;
  createdAt:           string;
}

type MissingFilter = 'all' | 'discord' | 'clickup' | 'both';

const ROLE_LABEL: Record<string, string> = {
  'admin':                     'Admin',
  'moderator':                 'Moderator',
  'jury':                      'Jury',
  'hackathon-participant':     'Hackathon',
  'scienceclub-participant':   'Koło',
  'participant':               'Uczestnik',
};

export function IntegrationsPage() {
  const [users, setUsers]       = useState<UserRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState<MissingFilter>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [modal, setModal]       = useState<{
    userIds: string[];
    fields:  ('discord' | 'clickup')[];
    label:   string;
  } | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res  = await adminFetch('/api/panel/users');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setUsers(data.users ?? []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users.filter(u => {
      if (filter === 'discord' && u.discordUsername?.trim()) return false;
      if (filter === 'clickup' && u.clickupEmail?.trim())    return false;
      if (filter === 'both'   && (u.discordUsername?.trim() || u.clickupEmail?.trim())) return false;
      if (!term) return true;
      return (
        (u.email || '').toLowerCase().includes(term) ||
        (u.displayName || '').toLowerCase().includes(term) ||
        (u.discordUsername || '').toLowerCase().includes(term) ||
        (u.clickupEmail || '').toLowerCase().includes(term)
      );
    });
  }, [users, search, filter]);

  const missingDiscordCount = users.filter(u => !u.discordUsername?.trim()).length;
  const missingClickupCount = users.filter(u => !u.clickupEmail?.trim()).length;
  const missingBothCount    = users.filter(u => !u.discordUsername?.trim() && !u.clickupEmail?.trim()).length;

  function toggleSelected(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }
  function toggleSelectAllFiltered() {
    if (filtered.every(u => selected.has(u.id))) {
      // Unselect tylko te z filtered
      setSelected(prev => {
        const next = new Set(prev);
        filtered.forEach(u => next.delete(u.id));
        return next;
      });
    } else {
      setSelected(prev => new Set([...prev, ...filtered.map(u => u.id)]));
    }
  }

  function openBulkForFilter(fields: ('discord' | 'clickup')[], label: string) {
    const ids = users
      .filter(u => {
        const needsDiscord = fields.includes('discord') && !u.discordUsername?.trim();
        const needsClickup = fields.includes('clickup') && !u.clickupEmail?.trim();
        return needsDiscord || needsClickup;
      })
      .map(u => u.id);
    if (ids.length === 0) {
      alert('Nikt nie ma braków w tych polach — nic do wysłania.');
      return;
    }
    setModal({ userIds: ids, fields, label });
  }

  function openBulkForSelected(fields: ('discord' | 'clickup')[], label: string) {
    if (selected.size === 0) return;
    setModal({ userIds: Array.from(selected), fields, label });
  }

  function openSingle(user: UserRow, field: 'discord' | 'clickup') {
    setModal({
      userIds: [user.id],
      fields:  [field],
      label:   `${user.displayName || user.email} — ${field === 'discord' ? 'Discord' : 'ClickUp'}`,
    });
  }

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      <PanelSectionHeader
        eyebrow="System · Integracje"
        title="Mapowanie Discord / ClickUp"
        subtitle="Kto ma podpięte zewnętrzne kanały, a kto nie. Prośba o uzupełnienie idzie emailem z linkiem do ich profilu — brakujące pola wylistowane w treści."
      />

      <InfoBar
        tone="info"
        title="Jak to działa"
        description="Użytkownicy podają Discord/ClickUp w formularzu /dolacz (opcjonalnie) lub dopełniają w panelu profilu. Admin może wysłać prośbę o uzupełnienie zbiorczo ('wszystkim bez Discord') lub pojedynczo (ikonka maila przy pustej komórce). Integracja Discord bot + ClickUp auto-invite — roadmap."
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        <PanelCard padding="sm">
          <p className="text-2xl font-bold text-white tabular-nums">{users.length}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Zalogowanych userów</p>
        </PanelCard>
        <PanelCard padding="sm" className={missingDiscordCount > 0 ? '!border-amber-500/30' : ''}>
          <p className="text-2xl font-bold text-white tabular-nums">{missingDiscordCount}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Bez Discord</p>
        </PanelCard>
        <PanelCard padding="sm" className={missingClickupCount > 0 ? '!border-amber-500/30' : ''}>
          <p className="text-2xl font-bold text-white tabular-nums">{missingClickupCount}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Bez ClickUp</p>
        </PanelCard>
        <PanelCard padding="sm" className={missingBothCount > 0 ? '!border-red-500/30' : ''}>
          <p className="text-2xl font-bold text-white tabular-nums">{missingBothCount}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Brak obydwu</p>
        </PanelCard>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mt-4 mb-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Szukaj: email, nazwisko, discord, clickup…"
            className="w-full pl-10 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-white/30"
          />
        </div>

        <select
          value={filter}
          onChange={e => setFilter(e.target.value as MissingFilter)}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-white/30 [&>option]:bg-gray-900"
        >
          <option value="all">Wszyscy ({users.length})</option>
          <option value="discord">Bez Discord ({missingDiscordCount})</option>
          <option value="clickup">Bez ClickUp ({missingClickupCount})</option>
          <option value="both">Bez obydwu ({missingBothCount})</option>
        </select>

        <button
          onClick={load}
          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          title="Odśwież"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>

        <div className="grow" />

        {selected.size > 0 ? (
          <>
            <button
              onClick={() => openBulkForSelected(['discord', 'clickup'], `${selected.size} zaznaczonych`)}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5" />
              Wyślij do zaznaczonych ({selected.size})
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="px-2 py-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => openBulkForFilter(['discord'], `wszyscy bez Discord (${missingDiscordCount})`)}
              disabled={missingDiscordCount === 0}
              className="px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Prośba → bez Discord ({missingDiscordCount})
            </button>
            <button
              onClick={() => openBulkForFilter(['clickup'], `wszyscy bez ClickUp (${missingClickupCount})`)}
              disabled={missingClickupCount === 0}
              className="px-3 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5" />
              Prośba → bez ClickUp ({missingClickupCount})
            </button>
          </>
        )}
      </div>

      {error && (
        <div className="p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Table */}
      <PanelCard padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-wider text-gray-500 bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-3 py-2.5 text-left">
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && filtered.every(u => selected.has(u.id))}
                    onChange={toggleSelectAllFiltered}
                    className="accent-indigo-500 cursor-pointer"
                    title="Zaznacz wszystkich w filtrze"
                  />
                </th>
                <th className="px-3 py-2.5 text-left">User</th>
                <th className="px-3 py-2.5 text-left">Rola</th>
                <th className="px-3 py-2.5 text-left">Discord</th>
                <th className="px-3 py-2.5 text-left">ClickUp</th>
                <th className="px-3 py-2.5 text-left">Konto</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-10 text-gray-500">Ładowanie…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-gray-500">
                  {users.length === 0 ? 'Brak userów' : 'Brak wyników dla filtra'}
                </td></tr>
              ) : filtered.map(u => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/3">
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selected.has(u.id)}
                      onChange={() => toggleSelected(u.id)}
                      className="accent-indigo-500 cursor-pointer"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-white font-medium truncate max-w-[220px]">{u.displayName || '—'}</div>
                    <div className="text-[11px] text-gray-500 truncate max-w-[220px]">{u.email}</div>
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-[10px] uppercase tracking-wider bg-white/5 border border-white/10 text-gray-300 px-2 py-0.5 rounded-full">
                      {ROLE_LABEL[u.role] ?? u.role}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <MissingCell
                      value={u.discordUsername}
                      onRequest={() => openSingle(u, 'discord')}
                      tone="amber"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <MissingCell
                      value={u.clickupEmail}
                      onRequest={() => openSingle(u, 'clickup')}
                      tone="purple"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <KeycloakStatus u={u} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PanelCard>

      {modal && (
        <RequestFillModal
          userIds={modal.userIds}
          fields={modal.fields}
          label={modal.label}
          onClose={() => setModal(null)}
          onSent={() => { setModal(null); setSelected(new Set()); load(); }}
        />
      )}
    </div>
  );
}

// ─── Cell renderers ──────────────────────────────────────────────────────────

function MissingCell({
  value, onRequest, tone,
}: {
  value: string | null;
  onRequest: () => void;
  tone: 'amber' | 'purple';
}) {
  if (value && value.trim()) {
    return (
      <div className="flex items-center gap-1.5">
        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <code className="text-xs text-gray-200 truncate max-w-[180px]">{value}</code>
      </div>
    );
  }
  const toneCls = tone === 'amber'
    ? 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border-amber-500/30'
    : 'bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 border-purple-500/30';
  return (
    <button
      onClick={onRequest}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] transition-colors ${toneCls}`}
      title="Wyślij prośbę o uzupełnienie"
    >
      <Mail className="w-3 h-3" />
      Poproś o uzupełnienie
    </button>
  );
}

function KeycloakStatus({ u }: { u: UserRow }) {
  if (!u.hasKeycloak) {
    return (
      <span className="text-[10px] text-gray-500 italic" title="Tylko invite row — user się jeszcze nie zalogował">
        Pending
      </span>
    );
  }
  if (!u.onboardingCompleted) {
    return (
      <span className="text-[10px] text-amber-400" title="User zalogowany, ale nie ukończył onboardingu">
        Onboarding
      </span>
    );
  }
  if (!u.isActive) {
    return (
      <span className="text-[10px] text-red-400" title="Konto zdezaktywowane">
        Inactive
      </span>
    );
  }
  return (
    <span className="text-[10px] text-emerald-400 flex items-center gap-1" title="Konto aktywne">
      <Check className="w-3 h-3" />
      Active
    </span>
  );
}

// ─── Request-fill modal ──────────────────────────────────────────────────────

function RequestFillModal({
  userIds, fields, label, onClose, onSent,
}: {
  userIds: string[];
  fields:  ('discord' | 'clickup')[];
  label:   string;
  onClose: () => void;
  onSent:  () => void;
}) {
  const [customMessage, setCustomMessage] = useState('');
  const [onlyIfMissing, setOnlyIfMissing] = useState(true);
  const [sending, setSending]             = useState(false);
  const [result, setResult]               = useState<{ sent: number; skipped: number; errors: Array<{ email?: string; reason: string }> } | null>(null);
  const [error, setError]                 = useState<string | null>(null);

  async function handleSubmit() {
    if (sending || result) return;
    setSending(true);
    setError(null);
    try {
      const res  = await adminFetch('/api/admin/integrations/request-fill', {
        method: 'POST',
        body:   JSON.stringify({
          userIds,
          fields,
          customMessage: customMessage.trim() || undefined,
          onlyIfMissing,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || data.detail || `HTTP ${res.status}`);
      } else {
        setResult({
          sent:    data.sent ?? 0,
          skipped: (data.skipped || []).length,
          errors:  data.errors || [],
        });
        if (data.sent > 0) setTimeout(onSent, 1800);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gray-950 border border-white/10 rounded-2xl w-full max-w-xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h3 className="text-lg font-semibold text-white">Wyślij prośbę o uzupełnienie</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Adresaci: {label} · Pola: {fields.join(' + ')}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {!result ? (
          <div className="px-6 py-5 space-y-4">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-300 leading-relaxed">
              <UsersIcon className="w-3.5 h-3.5 inline mr-1" />
              Email zawiera listę brakujących pól (tylko tych faktycznie pustych jeśli włączony "Pomiń
              userów którzy już mają") + link do <code>/panel/profil</code>. Wysyłka przez Resend, jedna wiadomość na usera.
            </div>

            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">
                Własna wiadomość (opcjonalna)
              </span>
              <textarea
                value={customMessage}
                onChange={e => setCustomMessage(e.target.value)}
                rows={3}
                placeholder="Np. 'Planujemy w piątek dodać wszystkich do serwera Discord — uzupełnijcie do czwartku.'"
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/30 resize-none"
              />
            </label>

            <label className="flex items-start gap-2 text-xs text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyIfMissing}
                onChange={e => setOnlyIfMissing(e.target.checked)}
                className="mt-0.5 accent-indigo-500"
              />
              <span>
                <span className="text-gray-300 font-medium">Pomiń userów którzy już mają te pola</span><br />
                Jeśli ktoś z zaznaczonych już podał Discord/ClickUp — nie spamujemy go drugi raz.
                Wyłącz jeśli chcesz zweryfikować dane wszystkim ("sprawdź czy Twój Discord jest aktualny").
              </span>
            </label>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-300">
                <strong>Błąd:</strong> {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={sending}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              >
                Anuluj
              </button>
              <button
                onClick={handleSubmit}
                disabled={sending}
                className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold uppercase tracking-wider rounded-lg transition-colors disabled:opacity-50"
              >
                {sending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Wysyłam…
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Wyślij ({userIds.length})
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="px-6 py-5 space-y-3">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              <p className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                <Check className="w-4 h-4" />
                Wysłano {result.sent} {result.sent === 1 ? 'email' : 'emaili'}
              </p>
              {result.skipped > 0 && (
                <p className="text-xs text-emerald-200/70 mt-1">
                  Pominięto {result.skipped} (już mają wypełnione pola — flaga "Pomiń" włączona).
                </p>
              )}
            </div>
            {result.errors.length > 0 && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-300">
                <p className="font-medium mb-1">Błędy ({result.errors.length}):</p>
                {result.errors.slice(0, 5).map((e, i) => (
                  <div key={i}>• {e.email ?? '—'}: {e.reason}</div>
                ))}
              </div>
            )}
            <div className="flex items-center justify-end">
              <button
                onClick={onSent}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Gotowe
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
