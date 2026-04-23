import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { getAdminToken } from '@/lib/adminApi';
import { CompetencyRadarChart } from './membership/CompetencyRadarChart';
import {
  STATUS_LABELS,
  ENGAGEMENT_TYPE_LABELS,
  COMPETENCY_LABELS,
} from '@/types/membership';
import type {
  ApplicationStatus,
  EngagementType,
  CompetencyProfile,
} from '@/types/membership';
import {
  Search,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Send,
  MessageSquare,
  Download,
  UserPlus,
  X,
} from 'lucide-react';

interface ApplicationRow {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  university: string;
  field_of_study: string;
  year_or_status: string;
  is_wsei: boolean;
  attend_meetings: boolean;
  attend_in_person: boolean;
  monthly_hours: number;
  competencies: CompetencyProfile;
  what_you_bring: string;
  expectations: string;
  values_resonance: string;
  engagement_types: string[];
  status: ApplicationStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

async function apiFetch(path: string, options?: RequestInit) {
  const { adminFetch } = await import('@/lib/adminApi');
  const res = await adminFetch(path, options);
  if (res.status === 401) throw new Error('Sesja wygasła');
  if (!res.ok) throw new Error('Błąd API');
  return res.json();
}

const STATUS_ORDER: ApplicationStatus[] = ['nowe', 'w_kontakcie', 'rozmowa_umówiona', 'przyjęty', 'odrzucony'];

export function AdminApplications() {
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [wseiFilter, setWseiFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingNotes, setEditingNotes] = useState<{ id: number; notes: string } | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showBulkInvite, setShowBulkInvite] = useState(false);

  function toggleSelected(id: number) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const apiBase = import.meta.env.DEV ? 'http://localhost:3000' : '';

  const fetchApplications = async () => {
    setLoading(true);
    setError('');
    try {
      let url = `${apiBase}/api/membership-applications?limit=100`;
      if (statusFilter !== 'all') url += `&status=${statusFilter}`;
      if (wseiFilter !== 'all') url += `&is_wsei=${wseiFilter === 'wsei'}`;
      const data = await apiFetch(url);
      setApplications(data.applications || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApplications(); }, [statusFilter, wseiFilter]);

  const updateStatus = async (id: number, status: ApplicationStatus) => {
    setActionLoading(id);
    try {
      await apiFetch(`${apiBase}/api/membership-applications/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      await fetchApplications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd');
    } finally {
      setActionLoading(null);
    }
  };

  const saveNotes = async (id: number, notes: string) => {
    try {
      await apiFetch(`${apiBase}/api/membership-applications/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ admin_notes: notes }),
      });
      setEditingNotes(null);
      await fetchApplications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd');
    }
  };

  const sendInvite = async (id: number) => {
    setActionLoading(id);
    try {
      await apiFetch(`${apiBase}/api/membership-applications/${id}/invite`, {
        method: 'POST',
      });
      await fetchApplications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd');
    } finally {
      setActionLoading(null);
    }
  };

  const exportCircleCSV = () => {
    const rows = filtered.length > 0 ? filtered : applications;
    const headers = [
      'id', 'imię', 'nazwisko', 'email', 'uczelnia', 'kierunek', 'rok',
      'wsei', 'godziny_miesiecznie', 'typy_zaangazowania', 'status', 'data_zgloszenia',
      'programowanie', 'analityka', 'soft_skills', 'organizacja', 'kreatywnosc', 'marketing',
    ];
    const csvRows = [headers.join(';')];
    for (const app of rows) {
      const c = app.competencies || {};
      const row = [
        app.id,
        `"${(app.first_name || '').replace(/"/g, '""')}"`,
        `"${(app.last_name || '').replace(/"/g, '""')}"`,
        `"${(app.email || '').replace(/"/g, '""')}"`,
        `"${(app.university || '').replace(/"/g, '""')}"`,
        `"${(app.field_of_study || '').replace(/"/g, '""')}"`,
        `"${(app.year_or_status || '').replace(/"/g, '""')}"`,
        app.is_wsei ? 'TAK' : 'NIE',
        app.monthly_hours ?? '',
        `"${(app.engagement_types || []).join(', ')}"`,
        app.status || '',
        new Date(app.created_at).toLocaleDateString('pl-PL'),
        c.programming ?? '',
        c.analytics ?? '',
        c.softSkills ?? '',
        c.organization ?? '',
        c.creativity ?? '',
        c.marketing ?? '',
      ];
      csvRows.push(row.join(';'));
    }
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aplikacje_kolo_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = applications.filter((app) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      app.first_name.toLowerCase().includes(term) ||
      app.last_name.toLowerCase().includes(term) ||
      app.email.toLowerCase().includes(term) ||
      (app.university || '').toLowerCase().includes(term)
    );
  });

  return (
    <motion.div key="applications" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="p-8 bg-white/5 border border-white/10 rounded-[2rem]">
        <h2 className="text-2xl font-black uppercase italic flex items-center gap-3 mb-6">
          <MessageSquare className="w-6 h-6 text-cyan-400" />
          Aplikacje do koła ({total})
        </h2>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Szukaj po imieniu, nazwisku, email..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500"
          >
            <option value="all" className="bg-gray-900 text-white">Wszystkie statusy</option>
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s} className="bg-gray-900 text-white">{STATUS_LABELS[s].label}</option>
            ))}
          </select>

          <select
            value={wseiFilter}
            onChange={(e) => setWseiFilter(e.target.value)}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500 [&>option]:bg-gray-900 [&>option]:text-white"
          >
            <option value="all">Wszystkie uczelnie</option>
            <option value="wsei">WSEI</option>
            <option value="external">Zewnętrzni</option>
          </select>

          <button
            onClick={fetchApplications}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={exportCircleCSV}
            title="Eksportuj do CSV"
            className="px-4 py-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400 hover:bg-cyan-500/20 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>

          {selectedIds.size > 0 && (
            <button
              onClick={() => setShowBulkInvite(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium text-sm transition-colors flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Zaproś zaznaczonych ({selectedIds.size})
            </button>
          )}
        </div>

        {error && (
          <div className="p-3 mb-4 bg-red-500/15 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-500">Ładowanie...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Brak zgłoszeń</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((app) => {
              const isExpanded = expandedId === app.id;
              const statusInfo = STATUS_LABELS[app.status];

              return (
                <div key={app.id} className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
                  {/* Row */}
                  <div className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors">
                    <label
                      className="shrink-0 cursor-pointer p-1"
                      onClick={e => e.stopPropagation()}
                      title="Zaznacz do bulk invite"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.has(app.id)}
                        onChange={() => toggleSelected(app.id)}
                        className="w-4 h-4 accent-emerald-500 cursor-pointer"
                      />
                    </label>
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : app.id)}
                    className="flex-1 flex items-center gap-4 text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-gray-500 text-[10px] font-mono">#{app.id}</span>
                        <span className="text-white font-medium">{app.first_name} {app.last_name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusInfo.color} ${statusInfo.textColor}`}>
                          {statusInfo.label}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${app.is_wsei ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'}`}>
                          {app.is_wsei ? 'WSEI' : 'Zewnętrzny'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1 truncate">
                        {app.email} | {app.university || 'brak uczelni'} | {new Date(app.created_at).toLocaleDateString('pl-PL')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {app.engagement_types.map((t) => {
                        const info = ENGAGEMENT_TYPE_LABELS[t as EngagementType];
                        return info ? (
                          <span key={t} className="text-lg" title={info.title}>{info.emoji}</span>
                        ) : null;
                      })}
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                    </div>
                  </button>
                  </div>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div className="border-t border-white/8 p-6 space-y-6">
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {/* Left: Info */}
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Dane podstawowe</h4>
                            <div className="space-y-1 text-sm">
                              <p className="text-gray-300"><span className="text-gray-500">Uczelnia:</span> {app.university || '—'}</p>
                              <p className="text-gray-300"><span className="text-gray-500">Kierunek:</span> {app.field_of_study || '—'}</p>
                              <p className="text-gray-300"><span className="text-gray-500">Rok:</span> {app.year_or_status || '—'}</p>
                              <p className="text-gray-300"><span className="text-gray-500">Spotkania:</span> {app.attend_meetings ? 'Tak' : 'Nie'}</p>
                              <p className="text-gray-300"><span className="text-gray-500">Stacjonarnie:</span> {app.attend_in_person ? 'Tak' : 'Nie'}</p>
                              <p className="text-gray-300"><span className="text-gray-500">Godziny/mies.:</span> {app.monthly_hours}h</p>
                            </div>
                          </div>

                          {app.what_you_bring && (
                            <div>
                              <h4 className="text-xs font-bold uppercase text-gray-500 mb-1">Co wnosi</h4>
                              <p className="text-gray-300 text-sm break-words">{app.what_you_bring}</p>
                            </div>
                          )}
                          {app.expectations && (
                            <div>
                              <h4 className="text-xs font-bold uppercase text-gray-500 mb-1">Oczekiwania</h4>
                              <p className="text-gray-300 text-sm break-words">{app.expectations}</p>
                            </div>
                          )}
                          {app.values_resonance && (
                            <div>
                              <h4 className="text-xs font-bold uppercase text-gray-500 mb-1">Wartości</h4>
                              <p className="text-gray-300 text-sm break-words">{app.values_resonance}</p>
                            </div>
                          )}

                          {/* Admin Notes */}
                          <div>
                            <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Notatki admina</h4>
                            {editingNotes?.id === app.id ? (
                              <div className="space-y-2">
                                <textarea
                                  value={editingNotes.notes}
                                  onChange={(e) => setEditingNotes({ id: app.id, notes: e.target.value })}
                                  rows={3}
                                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500 resize-none"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => saveNotes(app.id, editingNotes.notes)}
                                    className="px-3 py-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg text-xs font-medium hover:bg-cyan-500/30"
                                  >
                                    Zapisz
                                  </button>
                                  <button
                                    onClick={() => setEditingNotes(null)}
                                    className="px-3 py-1.5 bg-white/5 text-gray-400 rounded-lg text-xs hover:bg-white/10"
                                  >
                                    Anuluj
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setEditingNotes({ id: app.id, notes: app.admin_notes || '' })}
                                className="text-sm text-gray-400 hover:text-white transition-colors"
                              >
                                {app.admin_notes || 'Kliknij, żeby dodać notatkę...'}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Right: Radar Chart */}
                        <div>
                          <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Profil kompetencji</h4>
                          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                            <CompetencyRadarChart competencies={app.competencies} size={250} />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-2">
                              {(Object.keys(COMPETENCY_LABELS) as (keyof CompetencyProfile)[]).map((key) => (
                                <div key={key} className="flex justify-between text-xs px-2">
                                  <span className="text-gray-500">{COMPETENCY_LABELS[key]}</span>
                                  <span className="text-cyan-400 font-medium">{app.competencies[key]}/10</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 pt-4 border-t border-white/8">
                        {STATUS_ORDER.map((s) => {
                          const sl = STATUS_LABELS[s];
                          const isActive = app.status === s;
                          return (
                            <button
                              key={s}
                              onClick={() => updateStatus(app.id, s)}
                              disabled={isActive || actionLoading === app.id}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                isActive
                                  ? `${sl.color} ${sl.textColor} cursor-default`
                                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
                              } disabled:cursor-default`}
                            >
                              {sl.label}
                            </button>
                          );
                        })}
                        <button
                          onClick={() => sendInvite(app.id)}
                          disabled={actionLoading === app.id}
                          className="px-4 py-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg text-xs font-medium hover:bg-cyan-500/30 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <Send className="w-3 h-3" />
                          Wyślij zaproszenie na rozmowę
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showBulkInvite && (
        <BulkInviteModal
          emails={filtered.filter(a => selectedIds.has(a.id)).map(a => a.email)}
          onClose={() => setShowBulkInvite(false)}
          onSent={() => { setShowBulkInvite(false); setSelectedIds(new Set()); fetchApplications(); }}
        />
      )}
    </motion.div>
  );
}

// ─── Bulk invite modal ────────────────────────────────────────────────────────

function BulkInviteModal({
  emails, onClose, onSent,
}: {
  emails: string[];
  onClose: () => void;
  onSent: () => void;
}) {
  const [role, setRole]       = useState<'scienceclub-participant' | 'hackathon-participant'>('scienceclub-participant');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult]   = useState<{ sent: number; errors: Array<{ email: string; reason: string }> } | null>(null);

  async function handleSubmit() {
    if (sending) return;
    setSending(true);
    try {
      const { adminFetch } = await import('@/lib/adminApi');
      const res  = await adminFetch('/api/invite/bulk', {
        method: 'POST',
        body: JSON.stringify({ emails, role, message: message.trim() || undefined }),
      });
      const data = await res.json();
      setResult({ sent: data.sent ?? 0, errors: data.errors ?? [] });
      if (data.sent > 0) setTimeout(onSent, 1500);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gray-950 border border-white/10 rounded-2xl w-full max-w-xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Bulk invite — {emails.length} os.</h3>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-300">
            <strong>Co się stanie:</strong> dla każdego emaila utworzymy konto Keycloak z tymczasowym hasłem,
            przypiszemy rolę <code>{role}</code> i wyślemy email z danymi do logowania. Przy pierwszym loginie
            user jest zmuszony zmienić hasło.
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Rola docelowa</span>
            <select
              value={role}
              onChange={e => setRole(e.target.value as typeof role)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
            >
              <option value="scienceclub-participant">scienceclub-participant (członek koła)</option>
              <option value="hackathon-participant">hackathon-participant (uczestnik hackathonu)</option>
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Własna wiadomość (opcjonalna)</span>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={3}
              placeholder="Np. 'Witaj! Zostałeś przyjęty/a do koła. Pierwsze spotkanie w piątek…'"
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/30 resize-none"
            />
          </label>

          <div className="max-h-40 overflow-y-auto bg-white/5 border border-white/10 rounded-lg p-3">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Odbiorcy ({emails.length})</p>
            <div className="flex flex-wrap gap-1.5">
              {emails.map(e => (
                <span key={e} className="text-[11px] bg-white/10 text-gray-300 px-2 py-0.5 rounded-full">{e}</span>
              ))}
            </div>
          </div>

          {result && (
            <div className={`p-3 rounded-lg text-xs ${result.errors.length > 0 ? 'bg-amber-500/10 border border-amber-500/20 text-amber-300' : 'bg-green-500/10 border border-green-500/20 text-green-300'}`}>
              <strong>Wysłano: {result.sent}.</strong>
              {result.errors.length > 0 && (
                <div className="mt-2 space-y-0.5">
                  {result.errors.map((e, i) => (
                    <div key={i} className="text-[10px]">• {e.email}: {e.reason}</div>
                  ))}
                </div>
              )}
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
              type="button"
              onClick={handleSubmit}
              disabled={sending || emails.length === 0}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {sending ? 'Wysyłam…' : `Wyślij zaproszenia (${emails.length})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
