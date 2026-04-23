import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { getAdminToken } from '@/lib/adminApi';
import { useAuth } from '@/contexts/AuthContext';
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
  UserCheck,
  Copy,
  Check,
  Sparkles,
  Mail,
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
  /** UUID usera, jeśli admin już utworzył profil z tej aplikacji. */
  user_id: string | null;
  /** Integracje (opcjonalne w formularzu /dolacz). */
  discord_username: string | null;
  clickup_email:    string | null;
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
  // Role check — moderator widzi ten panel ale nie tworzy kont (backend odrzuci
  // `create-profile` i `invite/bulk` z 403 requireAdmin). Żeby UX był spójny,
  // ukrywamy też przyciski które moderator-only user and tak nie wywoła.
  const { user } = useAuth();
  const isAdmin  = !!user?.keycloakRoles.includes('admin');

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
  const [createProfileApp, setCreateProfileApp] = useState<ApplicationRow | null>(null);
  const [resendingId, setResendingId] = useState<number | null>(null);
  const [resendResult, setResendResult] = useState<{
    appId:        number;
    email:        string;
    emailSent:    boolean;
    emailError:   string | null;
    tempPassword: string;
  } | null>(null);

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

  /**
   * Resend welcome email dla apps których profil już został utworzony.
   * Generuje nowe tymczasowe hasło (Keycloak reset-password) i wysyła email.
   * Użyj gdy:
   *   - Admin kliknął "Utwórz profil" ale email się nie wysłał (Resend fail)
   *   - User zgłosił "nie dostałem maila / nie pamiętam hasła"
   *   - Admin chce reset hasła z powodu zapomnienia
   */
  const resendInvite = async (app: ApplicationRow) => {
    if (!app.user_id) return;
    setResendingId(app.id);
    setError('');
    try {
      const { adminFetch } = await import('@/lib/adminApi');
      const res = await adminFetch(`/api/panel/users/${app.user_id}/resend-invite`, {
        method: 'POST',
        body: JSON.stringify({ reason: 'resend_invite' }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || data.error || `HTTP ${res.status}`);
        return;
      }
      setResendResult({
        appId:        app.id,
        email:        data.email,
        emailSent:    data.emailSent !== false,
        emailError:   data.emailError ?? null,
        tempPassword: data.tempPassword,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd');
    } finally {
      setResendingId(null);
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

        {/* Role scope banner — moderator widzi panel ale z ograniczonymi akcjami */}
        {!isAdmin && (
          <div className="mb-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
            <p className="text-sm font-semibold text-cyan-200 mb-1">Jesteś moderatorem</p>
            <p className="text-xs text-cyan-300/80 leading-relaxed">
              Możesz: <strong>przeglądać aplikacje</strong>, zmieniać status (np. "w kontakcie" → "rozmowa umówiona"),
              dodawać notatki, wysyłać zaproszenia na rozmowę. <br/>
              Tworzenie kont w Keycloak (przycisk "Utwórz profil uczestnika") jest <strong>admin-only</strong> —
              admin zrobi to po Twoim review.
            </p>
          </div>
        )}

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

          {selectedIds.size > 0 && isAdmin && (
            <button
              onClick={() => setShowBulkInvite(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm uppercase tracking-wider transition-colors flex items-center gap-2"
              title="Dla każdej zaznaczonej aplikacji: utwórz konto Keycloak + profil (bio/skills/university/discord/clickup z aplikacji) + wyślij email z hasłem tymczasowym. Jak 'Utwórz profil uczestnika' tylko hurtowo."
            >
              <Sparkles className="w-4 h-4" />
              Utwórz profile ({selectedIds.size})
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
                              <p className="text-gray-300">
                                <span className="text-gray-500">Discord:</span>{' '}
                                {app.discord_username ? <code className="text-cyan-400">{app.discord_username}</code> : <span className="text-gray-600 italic">nie podano</span>}
                              </p>
                              <p className="text-gray-300">
                                <span className="text-gray-500">ClickUp:</span>{' '}
                                {app.clickup_email ? <code className="text-cyan-400">{app.clickup_email}</code> : <span className="text-gray-600 italic">nie podano</span>}
                              </p>
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

                        {/* Utwórz profil z aplikacji — core feature. Tylko admin;
                            moderator widzi aplikacje ale nie tworzy kont (stąd i backend
                            zwraca 403 requireAdmin — tu dopasowujemy UX). */}
                        {!isAdmin ? null : app.user_id ? (
                          <>
                            <div
                              className="px-4 py-1.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-medium flex items-center gap-1.5"
                              title={`Profil utworzony (user id: ${app.user_id}).`}
                            >
                              <UserCheck className="w-3 h-3" />
                              Profil utworzony
                            </div>
                            <button
                              onClick={() => resendInvite(app)}
                              disabled={resendingId === app.id}
                              className="px-3 py-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-medium hover:bg-indigo-500/30 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                              title="Wyślij email z nowym tymczasowym hasłem. Używaj gdy: user nie dostał maila, zapomniał hasła, admin chce zresetować hasło."
                            >
                              {resendingId === app.id ? (
                                <>
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                  Wysyłam…
                                </>
                              ) : (
                                <>
                                  <Mail className="w-3 h-3" />
                                  Wyślij email ponownie / reset hasła
                                </>
                              )}
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setCreateProfileApp(app)}
                            disabled={actionLoading === app.id}
                            className="px-4 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-emerald-500/30 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                            title="Utwórz konto Keycloak + profil uczestnika z danych tej aplikacji, wyślij email z hasłem."
                          >
                            <Sparkles className="w-3 h-3" />
                            Utwórz profil uczestnika
                          </button>
                        )}
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
          applications={filtered.filter(a => selectedIds.has(a.id))}
          onClose={() => setShowBulkInvite(false)}
          onSent={() => { setShowBulkInvite(false); setSelectedIds(new Set()); fetchApplications(); }}
        />
      )}

      {createProfileApp && (
        <CreateProfileModal
          application={createProfileApp}
          onClose={() => setCreateProfileApp(null)}
          onCreated={() => { setCreateProfileApp(null); fetchApplications(); }}
        />
      )}

      {resendResult && (
        <ResendResultModal
          result={resendResult}
          onClose={() => setResendResult(null)}
        />
      )}
    </motion.div>
  );
}

// ─── Bulk create-profile modal ─────────────────────────────────────────────
// Wersja single "Utwórz profil uczestnika" dla wielu aplikacji naraz.
// Używa /api/membership-applications/bulk/create-profile — dla każdej
// aplikacji pełny flow: Keycloak user + users row (bio/skills/university/discord/
// clickup z aplikacji) + link aplikacji + email.
//
// UI pokazuje per-user status emaila (Resend może odrzucić niektóre), żeby
// admin widział które profiles wymagają retry.

function BulkInviteModal({
  applications, onClose, onSent,
}: {
  applications: ApplicationRow[];
  onClose: () => void;
  onSent: () => void;
}) {
  const [role, setRole]                       = useState<'scienceclub-participant' | 'hackathon-participant' | 'moderator' | 'admin'>('scienceclub-participant');
  const [message, setMessage]                 = useState('');
  const [overrideExisting, setOverrideExisting] = useState(false);
  const [sending, setSending]                 = useState(false);
  const [result, setResult]                   = useState<{
    created: Array<{ appId: number; userId: string; email: string; tempPassword: string; emailSent: boolean; emailError: string | null }>;
    skipped: Array<{ appId: number; reason: string; email?: string }>;
    errors:  Array<{ appId: number; email?: string; reason: string }>;
  } | null>(null);
  const [error, setError]                     = useState<string | null>(null);

  async function handleSubmit() {
    if (sending || result) return;
    setError(null);
    setSending(true);
    try {
      const { adminFetch } = await import('@/lib/adminApi');
      const res  = await adminFetch('/api/membership-applications/bulk/create-profile', {
        method: 'POST',
        body:   JSON.stringify({
          applicationIds: applications.map(a => a.id),
          role,
          customMessage:  message.trim() || undefined,
          overrideExisting,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || data.error || `HTTP ${res.status}`);
        return;
      }
      setResult({
        created: data.created ?? [],
        skipped: data.skipped ?? [],
        errors:  data.errors ?? [],
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSending(false);
    }
  }

  const sentCount     = (result?.created ?? []).filter(c => c.emailSent).length;
  const emailFailures = (result?.created ?? []).filter(c => !c.emailSent);

  return (
    <div className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gray-950 border border-white/10 rounded-2xl w-full max-w-2xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Utwórz profile dla zaznaczonych
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {applications.length} {applications.length === 1 ? 'aplikacja' : 'aplikacje'} · pełny create-profile flow (Keycloak + bio + skills + discord/clickup + email)
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {!result ? (
          <div className="px-6 py-5 space-y-4">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-300 leading-relaxed">
              <strong className="block mb-1">Co się wydarzy (per aplikacja):</strong>
              1. Konto Keycloak z tymczasowym hasłem<br />
              2. Users row: bio (markdown z 3 sekcji), skills (kompetencje ≥5 + engagement), university, discord, clickup<br />
              3. Link aplikacja → user (status "przyjęty")<br />
              4. Email z hasłem tymczasowym<br />
              <span className="opacity-70">Aplikacje z user_id już ustawionym zostaną pominięte (idempotency).</span>
            </div>

            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">Rola docelowa</span>
              <select
                value={role}
                onChange={e => setRole(e.target.value as typeof role)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 [&>option]:bg-gray-900"
              >
                <option value="scienceclub-participant">Członek koła (default)</option>
                <option value="hackathon-participant">Uczestnik hackathonu</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin (ostrożnie!)</option>
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">Własna wiadomość (opcjonalna)</span>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={3}
                placeholder="Np. 'Witaj! Zostałeś/aś przyjęty/a do koła. Pierwsze spotkanie w piątek…'"
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/30 resize-none"
              />
            </label>

            <label className="flex items-start gap-2 text-xs text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                checked={overrideExisting}
                onChange={e => setOverrideExisting(e.target.checked)}
                className="mt-0.5 accent-emerald-500"
              />
              <span>
                <span className="text-gray-300 font-medium">Podepnij istniejących userów</span><br />
                Jeśli email już ma konto Keycloak — zamiast pominąć, dopełnij profil (bio, skills, discord) + zaktualizuj rolę + zresetuj hasło. Użyj ostrożnie (może nadpisać istniejące uprawnienia).
              </span>
            </label>

            <div className="max-h-40 overflow-y-auto bg-white/5 border border-white/10 rounded-lg p-3">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Odbiorcy ({applications.length})</p>
              <div className="flex flex-wrap gap-1.5">
                {applications.map(a => (
                  <span key={a.id} className="text-[11px] bg-white/10 text-gray-300 px-2 py-0.5 rounded-full" title={a.email}>
                    #{a.id} {a.first_name} {a.last_name}
                  </span>
                ))}
              </div>
            </div>

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
                type="button"
                onClick={handleSubmit}
                disabled={sending || applications.length === 0}
                className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold uppercase tracking-wider rounded-lg transition-colors disabled:opacity-50"
              >
                {sending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Tworzę {applications.length} profili…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Utwórz profile ({applications.length})
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="px-6 py-5 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-center">
                <p className="text-2xl font-bold text-emerald-300">{result.created.length}</p>
                <p className="text-[10px] text-emerald-400 uppercase tracking-wider">Utworzono</p>
              </div>
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-center">
                <p className="text-2xl font-bold text-amber-300">{result.skipped.length}</p>
                <p className="text-[10px] text-amber-400 uppercase tracking-wider">Pominięto</p>
              </div>
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
                <p className="text-2xl font-bold text-red-300">{result.errors.length}</p>
                <p className="text-[10px] text-red-400 uppercase tracking-wider">Błędów</p>
              </div>
            </div>

            <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300">
              Emaile: <strong className="text-emerald-400">{sentCount}</strong> wysłane /
              <strong className="text-red-400"> {emailFailures.length}</strong> NIE wysłane
              {emailFailures.length > 0 && (
                <span className="text-[10px] text-gray-500 block mt-1">
                  (profile utworzone, temp hasła dostępne poniżej — admin może skopiować i przekazać offline)
                </span>
              )}
            </div>

            {emailFailures.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 max-h-40 overflow-y-auto">
                <p className="text-xs font-bold text-red-300 mb-2">Emaile NIE wysłane — temp hasła do przekazania offline:</p>
                {emailFailures.map(f => (
                  <div key={f.appId} className="text-[11px] text-red-200/90 py-0.5 flex items-center justify-between gap-2">
                    <span className="truncate">{f.email}</span>
                    <code className="bg-black/30 px-2 py-0.5 rounded text-white select-all shrink-0">{f.tempPassword}</code>
                  </div>
                ))}
              </div>
            )}

            {result.skipped.length > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 max-h-32 overflow-y-auto text-[11px] text-amber-300">
                <p className="font-bold mb-1">Pominięte:</p>
                {result.skipped.map((s, i) => (
                  <div key={i}>#{s.appId}: {s.reason}</div>
                ))}
              </div>
            )}

            {result.errors.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 max-h-32 overflow-y-auto text-[11px] text-red-300">
                <p className="font-bold mb-1">Błędy (profile NIE utworzone):</p>
                {result.errors.map((e, i) => (
                  <div key={i}>#{e.appId} {e.email ?? ''}: {e.reason}</div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
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

// ─── Create profile from application modal ───────────────────────────────────
//
// Single-aplicantowa wersja BulkInviteModal — ale wykorzystuje dedykowany
// endpoint `POST /api/membership-applications/:id/create-profile` który
// pre-filluje users row pełnymi danymi z aplikacji (bio z markdown, skills
// z competencies + engagement_types, university) zamiast tylko email + nazwisko.
//
// Endpoint zwraca temp password — admin widzi go raz w UI (z opcją "Kopiuj"),
// do momentu zamknięcia modalu.

type TargetRole = 'scienceclub-participant' | 'hackathon-participant' | 'moderator' | 'admin';

const ROLE_OPTIONS: { value: TargetRole; label: string; hint: string }[] = [
  {
    value: 'scienceclub-participant',
    label: 'Członek koła',
    hint:  'Domyślna rola dla aplikacji z tego formularza. Widzi "MÓJ OBSZAR" + Kompas kompetencji.',
  },
  {
    value: 'hackathon-participant',
    label: 'Uczestnik hackathonu',
    hint:  'Widzi "Mój zespół" + głosowanie + moja obecność. Alternatywa jeśli osoba jest z edycji hackathonu.',
  },
  {
    value: 'moderator',
    label: 'Moderator',
    hint:  'Dostęp do zarządzania członkami, team claims, aplikacjami. Nie widzi CRUD edycji.',
  },
  {
    value: 'admin',
    label: 'Admin',
    hint:  'Pełny dostęp (wszystkie panele, CRUD edycji, bulk invite). Uprawnienie krytyczne — tylko dla zaufanych.',
  },
];

interface CompetencySummary {
  competencies:     CompetencyProfile;
  engagementTypes:  string[];
}

function buildPreviewSkills({ competencies, engagementTypes }: CompetencySummary): string[] {
  const compLabels: Record<keyof CompetencyProfile, string> = {
    programming:  'Programowanie',
    analytics:    'Analityka / Data Science',
    softSkills:   'Umiejętności miękkie',
    organization: 'Organizacja',
    creativity:   'Kreatywność / Design',
    marketing:    'Marketing / PR',
  };
  const engLabels: Record<string, string> = {
    technical_projects:    'Projekty techniczne',
    discussions_research:  'Research i dyskusje',
    marketing_pr:          'Marketing i PR',
    organization:          'Koordynacja wydarzeń',
    academic_path:         'Ścieżka naukowa',
  };
  const fromComp = (Object.keys(compLabels) as (keyof CompetencyProfile)[])
    .filter(k => Number(competencies?.[k] || 0) >= 5)
    .map(k => compLabels[k]);
  const fromEng = (engagementTypes || [])
    .map(t => engLabels[t])
    .filter(Boolean) as string[];
  return Array.from(new Set([...fromComp, ...fromEng]));
}

function CreateProfileModal({
  application, onClose, onCreated,
}: {
  application: ApplicationRow;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [role, setRole]                       = useState<TargetRole>('scienceclub-participant');
  const [customMessage, setCustomMessage]     = useState('');
  const [overrideExisting, setOverrideExisting] = useState(false);
  const [submitting, setSubmitting]           = useState(false);
  const [result, setResult]                   = useState<{
    userId:       string;
    keycloakId:   string;
    tempPassword: string;
    displayName:  string;
    skillsCount:  number;
    hasBio:       boolean;
    emailSent:    boolean;
    emailError:   string | null;
  } | null>(null);
  const [error, setError]                     = useState<string | null>(null);
  const [copied, setCopied]                   = useState(false);

  const previewSkills = buildPreviewSkills({
    competencies:    application.competencies,
    engagementTypes: application.engagement_types,
  });
  const hasBioSource =
    !!application.what_you_bring ||
    !!application.expectations ||
    !!application.values_resonance;

  async function handleSubmit() {
    if (submitting || result) return;
    setError(null);
    setSubmitting(true);
    try {
      const { adminFetch } = await import('@/lib/adminApi');
      const res = await adminFetch(`/api/membership-applications/${application.id}/create-profile`, {
        method: 'POST',
        body: JSON.stringify({
          role,
          customMessage: customMessage.trim() || undefined,
          overrideExisting,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || data.error || `HTTP ${res.status}`);
        return;
      }
      setResult({
        userId:       data.userId,
        keycloakId:   data.keycloakId,
        tempPassword: data.tempPassword,
        displayName:  data.displayName,
        skillsCount:  data.skillsCount ?? 0,
        hasBio:       !!data.hasBio,
        emailSent:    data.emailSent !== false,
        emailError:   data.emailError ?? null,
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    // Jeśli user został utworzony, refresh list zanim zamkniemy — żeby "Profil
    // utworzony" badge się pojawił.
    if (result) onCreated();
    else onClose();
  }

  function copyPassword() {
    if (!result) return;
    navigator.clipboard.writeText(result.tempPassword).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gray-950 border border-white/10 rounded-2xl w-full max-w-xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Utwórz profil uczestnika
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Z aplikacji #{application.id} · {application.first_name} {application.last_name}
            </p>
          </div>
          <button onClick={handleClose} className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {!result ? (
          <div className="px-6 py-5 space-y-4">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-300 leading-relaxed">
              <strong className="block mb-1">Co się wydarzy:</strong>
              1. Konto Keycloak z tymczasowym hasłem (wymuszana zmiana przy pierwszym logowaniu)<br />
              2. Wpis w users: display_name, university, bio (markdown z "co wnoszę / oczekiwania / wartości"), skills z kompetencji i typów zaangażowania<br />
              3. Link aplikacja → user (status "przyjęty", user_id ustawione)<br />
              4. Email do <code>{application.email}</code> z hasłem i linkiem do logowania
            </div>

            {/* Preview section */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Podgląd profilu</p>
              <div className="text-sm text-gray-300 space-y-1">
                <p><span className="text-gray-500">display_name:</span> {application.first_name} {application.last_name}</p>
                <p><span className="text-gray-500">email:</span> {application.email}</p>
                {application.university && (
                  <p><span className="text-gray-500">university:</span> {application.university}</p>
                )}
                <p>
                  <span className="text-gray-500">skills ({previewSkills.length}):</span>{' '}
                  {previewSkills.length === 0 ? (
                    <span className="text-gray-600 italic">brak (wszystkie kompetencje poniżej 5/10)</span>
                  ) : (
                    previewSkills.map(s => (
                      <span key={s} className="inline-block bg-white/10 text-gray-300 px-2 py-0.5 rounded-full text-[10px] mr-1 mb-1">
                        {s}
                      </span>
                    ))
                  )}
                </p>
                <p>
                  <span className="text-gray-500">bio:</span>{' '}
                  {hasBioSource ? (
                    <span className="text-emerald-400">✓ markdown z 3 sekcji aplikacji</span>
                  ) : (
                    <span className="text-gray-600 italic">pusto (aplikacja bez tekstów)</span>
                  )}
                </p>
                <p>
                  <span className="text-gray-500">discord:</span>{' '}
                  {application.discord_username ? (
                    <code className="text-emerald-400">{application.discord_username}</code>
                  ) : (
                    <span className="text-gray-600 italic">nie podano w aplikacji</span>
                  )}
                </p>
                <p>
                  <span className="text-gray-500">clickup:</span>{' '}
                  {application.clickup_email ? (
                    <code className="text-emerald-400">{application.clickup_email}</code>
                  ) : (
                    <span className="text-gray-600 italic">nie podano w aplikacji</span>
                  )}
                </p>
              </div>
            </div>

            {/* Role selector */}
            <div className="flex flex-col gap-2">
              <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">Rola docelowa</span>
              <div className="grid grid-cols-1 gap-2">
                {ROLE_OPTIONS.map(opt => (
                  <label
                    key={opt.value}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      role === opt.value
                        ? 'bg-emerald-500/10 border-emerald-500/40'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={opt.value}
                      checked={role === opt.value}
                      onChange={() => setRole(opt.value)}
                      className="mt-1 accent-emerald-500"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${role === opt.value ? 'text-emerald-300' : 'text-white'}`}>
                        {opt.label}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{opt.hint}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Custom message */}
            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">Własna wiadomość (opcjonalna)</span>
              <textarea
                value={customMessage}
                onChange={e => setCustomMessage(e.target.value)}
                rows={3}
                placeholder="Np. 'Witaj! Zostałeś przyjęty/a do koła. Pierwsze spotkanie w piątek…'"
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/30 resize-none"
              />
            </label>

            <label className="flex items-start gap-2 text-xs text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                checked={overrideExisting}
                onChange={e => setOverrideExisting(e.target.checked)}
                className="mt-0.5 accent-emerald-500"
              />
              <span>
                <span className="text-gray-300 font-medium">Podepnij jeśli user już istnieje</span><br />
                Jeśli email ma już konto Keycloak — zamiast 409, dopełnij istniejący profil (skills, bio), zaktualizuj rolę i ustaw link aplikacji. Użyj ostrożnie.
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
                onClick={handleClose}
                disabled={submitting}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              >
                Anuluj
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold uppercase tracking-wider rounded-lg transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Tworzę profil…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Utwórz profil + wyślij email
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          // SUCCESS SCREEN — pokazuje temp password (jednorazowo) + next steps
          <div className="px-6 py-5 space-y-4">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              <p className="text-sm font-bold text-emerald-300 flex items-center gap-2 mb-2">
                <UserCheck className="w-4 h-4" />
                Profil utworzony
              </p>
              <div className="text-xs text-emerald-200/80 space-y-0.5">
                <p><strong>{result.displayName}</strong> · <code>{application.email}</code></p>
                <p>user_id: <code className="text-[10px]">{result.userId}</code></p>
                <p>keycloak_id: <code className="text-[10px]">{result.keycloakId}</code></p>
                <p>skills: {result.skillsCount} · bio: {result.hasBio ? 'tak' : 'nie'}</p>
                {result.emailSent ? (
                  <p>email z danymi logowania: <span className="text-emerald-400">wysłany ✓</span></p>
                ) : (
                  <p>email z danymi logowania: <span className="text-red-400">NIE WYSŁANY ✗</span></p>
                )}
              </div>
            </div>

            {!result.emailSent && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-sm font-bold text-red-300 mb-1">Email się nie wysłał</p>
                <p className="text-xs text-red-200/80 leading-relaxed">
                  {result.emailError || 'Nieznany powód.'} Profil Keycloak został utworzony — skopiuj temp hasło poniżej
                  i przekaż offline, albo użyj "Wyślij email ponownie" z listy użytkowników po odświeżeniu.
                </p>
              </div>
            )}

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <p className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
                Tymczasowe hasło {result.emailSent ? '(fallback — już w emailu)' : '(email nie wyszedł — skopiuj i przekaż)'}
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-black/30 px-3 py-2 rounded text-sm text-white font-mono select-all">
                  {result.tempPassword}
                </code>
                <button
                  onClick={copyPassword}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Skopiowano' : 'Kopiuj'}
                </button>
              </div>
              <p className="text-[11px] text-amber-200/60 mt-2">
                User będzie musiał zmienić hasło przy pierwszym loginie (Keycloak wymusi UPDATE_PASSWORD).
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={handleClose}
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

// ─── Resend invite result modal ──────────────────────────────────────────────
// Pokazuje wynik akcji "Wyślij email ponownie / reset hasła" — success status
// emaila (czy Resend go zaakceptował), nowe temp hasło jako fallback, oraz
// sugestia "spróbuj ponownie" gdy email się nie wysłał.

function ResendResultModal({
  result, onClose,
}: {
  result: {
    appId:        number;
    email:        string;
    emailSent:    boolean;
    emailError:   string | null;
    tempPassword: string;
  };
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  function copyPassword() {
    navigator.clipboard.writeText(result.tempPassword).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <div className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-950 border border-white/10 rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Mail className="w-4 h-4 text-indigo-400" />
            Wyślij email ponownie
          </h3>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className={`p-3 rounded-lg border ${
            result.emailSent
              ? 'bg-emerald-500/10 border-emerald-500/30'
              : 'bg-red-500/10 border-red-500/30'
          }`}>
            <p className={`text-sm font-bold mb-1 ${
              result.emailSent ? 'text-emerald-300' : 'text-red-300'
            }`}>
              {result.emailSent ? '✓ Email wysłany' : '✗ Email NIE wysłany'}
            </p>
            <p className={`text-xs leading-relaxed ${
              result.emailSent ? 'text-emerald-200/80' : 'text-red-200/80'
            }`}>
              Adresat: <code>{result.email}</code><br />
              Hasło tymczasowe ustawione w Keycloak (temporary=true — user musi zmienić przy logowaniu).
              {!result.emailSent && (
                <><br /><strong>Powód:</strong> {result.emailError || 'nieznany'}</>
              )}
            </p>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
            <p className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
              Nowe tymczasowe hasło
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-black/30 px-3 py-2 rounded text-sm text-white font-mono select-all">
                {result.tempPassword}
              </code>
              <button
                onClick={copyPassword}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Skopiowano' : 'Kopiuj'}
              </button>
            </div>
            {!result.emailSent && (
              <p className="text-[11px] text-amber-200/60 mt-2">
                Email się nie wysłał — skopiuj hasło i przekaż userowi innym kanałem (Discord, SMS, osobiście).
              </p>
            )}
          </div>

          <div className="flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Gotowe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
