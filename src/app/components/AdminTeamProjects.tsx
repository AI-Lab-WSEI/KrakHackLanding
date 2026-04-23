import { useState, useEffect } from 'react';
import { getAdminToken } from '@/lib/adminApi';
import { motion, AnimatePresence } from 'motion/react';
import {
  FolderEdit,
  Search,
  RefreshCw,
  Send,
  Copy,
  ExternalLink,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Mail,
  Users,
  Clock,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';
import { EmailPreviewModal } from './EmailPreviewModal';

interface TeamProject {
  id: number;
  edition_number: number;
  slug: string;
  name: string;
  placement: number | null;
  challenge: string;
  members: string[];
  project_name: string;
  short_description: string;
  technologies: string[];
  edit_token: string | null;
  edit_token_created_at: string | null;
  edit_password: string | null;
  email_last_sent_at: string | null;
  updated_at: string;
  created_at: string;
}

interface SendResult {
  name: string;
  slug: string;
  emails_found: string[];
  sent: boolean;
  edit_link: string;
}

async function teamFetch(path: string, options?: RequestInit) {
  const { adminFetch } = await import('@/lib/adminApi');
  const res = await adminFetch(path, options);
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(data.error || 'API error');
  }
  return res.json();
}

const CHALLENGE_COLOR_PALETTE: { bg: string; text: string }[] = [
  { bg: 'bg-cyan-500/20', text: 'text-cyan-400' },
  { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
  { bg: 'bg-orange-500/20', text: 'text-orange-400' },
  { bg: 'bg-pink-500/20', text: 'text-pink-400' },
  { bg: 'bg-indigo-500/20', text: 'text-indigo-400' },
];

function getChallengeStyle(challenge: string, allChallenges: string[]): { bg: string; text: string; label: string } {
  const idx = allChallenges.indexOf(challenge);
  const colors = CHALLENGE_COLOR_PALETTE[idx % CHALLENGE_COLOR_PALETTE.length] ?? CHALLENGE_COLOR_PALETTE[0];
  const label = challenge.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return { ...colors, label };
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' });
}

function getEditLink(slug: string, token: string): string {
  return `${window.location.origin}/zespoly/${slug}/edytuj/${token}`;
}

export function AdminTeamProjects({ edition = 3 }: { edition?: number }) {
  const [teams, setTeams] = useState<TeamProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [challengeFilter, setChallengeFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [actionStatus, setActionStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [regeneratingId, setRegeneratingId] = useState<number | null>(null);
  const [isBulkSending, setIsBulkSending] = useState(false);
  const [bulkResult, setBulkResult] = useState<{ sent: number; failed: number; details: SendResult[] } | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewData, setPreviewData] = useState<{ subject: string; html: string; team_name: string; id: number } | null>(null);

  const loadTeams = async () => {
    setLoading(true);
    try {
      const data = await teamFetch(`/api/admin/team-projects?edition=${edition}`);
      setTeams(data);
    } catch {
      showStatus('error', 'Błąd ładowania zespołów');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTeams(); }, [edition]);

  const showStatus = (type: 'success' | 'error', message: string) => {
    setActionStatus({ type, message });
    setTimeout(() => setActionStatus(null), 5000);
  };

  const copyEditLink = (slug: string, token: string) => {
    navigator.clipboard.writeText(getEditLink(slug, token));
    showStatus('success', 'Link skopiowany do schowka');
  };

  const regenerateToken = async (team: TeamProject) => {
    if (!confirm(`Czy na pewno wygenerować nowy token dla zespołu "${team.name}"?\n\nStary link edycji przestanie działać.`)) return;
    setRegeneratingId(team.id);
    try {
      const result = await teamFetch(`/api/admin/team-projects/${team.id}/regenerate-token`, { method: 'POST' });
      showStatus('success', `Nowy token wygenerowany dla ${team.name}`);
      setTeams(prev => prev.map(t => t.id === team.id ? { ...t, edit_token: result.edit_token, edit_token_created_at: result.edit_token_created_at } : t));
    } catch (err: unknown) {
      showStatus('error', err instanceof Error ? err.message : 'Błąd generowania tokenu');
    } finally {
      setRegeneratingId(null);
    }
  };

  const sendEditLink = async (team: TeamProject) => {
    if (!team.edit_token) {
      showStatus('error', 'Brak tokenu — wygeneruj go najpierw');
      return;
    }
    setSendingId(team.id);
    try {
      const result = await teamFetch(`/api/admin/team-projects/${team.id}/send-edit-link`, { method: 'POST' });
      if (result.email_sent) {
        showStatus('success', `Email wysłany do ${result.emails_found.join(', ')}`);
        setTeams(prev => prev.map(t => t.id === team.id ? { ...t, email_last_sent_at: new Date().toISOString() } : t));
      } else if (result.emails_found.length === 0) {
        showStatus('error', `Nie znaleziono emaili dla ${team.name} — skopiuj link ręcznie`);
      } else {
        showStatus('error', `Znaleziono adresy (${result.emails_found.join(', ')}), ale wysyłka nie powiodła się`);
      }
    } catch (err: unknown) {
      showStatus('error', err instanceof Error ? err.message : 'Błąd wysyłki');
    } finally {
      setSendingId(null);
    }
  };

  const openBulkSendPreview = async () => {
    try {
      const data = await teamFetch('/api/admin/team-projects/preview-email');
      setPreviewData(data);
      setShowPreviewModal(true);
    } catch (err: unknown) {
      showStatus('error', err instanceof Error ? err.message : 'Błąd ładowania podglądu emaila');
    }
  };

  const handleSendTest = async (email: string) => {
    if (!previewData) return { success: false, message: 'Brak danych podglądu' };
    try {
      const result = await teamFetch(`/api/admin/team-projects/${previewData.id}/send-test-email`, {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      return { success: result.success, message: result.message || 'Wysłano' };
    } catch (err: unknown) {
      return { success: false, message: err instanceof Error ? err.message : 'Błąd wysyłki testowej' };
    }
  };

  const handleSendAll = async () => {
    setIsBulkSending(true);
    setBulkResult(null);
    try {
      const result = await teamFetch('/api/admin/team-projects/bulk-send-edit-links', { method: 'POST' });
      setBulkResult(result);
      showStatus('success', `Wysłano ${result.sent}/${result.total} emaili`);
      setShowPreviewModal(false);
      loadTeams();
      return { sent: result.sent, failed: result.failed, details: result.details };
    } catch (err: unknown) {
      showStatus('error', err instanceof Error ? err.message : 'Błąd wysyłki zbiorczej');
      return { sent: 0, failed: 0 };
    } finally {
      setIsBulkSending(false);
    }
  };

  const filtered = teams.filter(t => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = !q ||
      t.name.toLowerCase().includes(q) ||
      t.slug.toLowerCase().includes(q) ||
      t.project_name.toLowerCase().includes(q) ||
      t.members.some(m => m.toLowerCase().includes(q));
    const matchesChallenge = challengeFilter === 'all' || t.challenge === challengeFilter;
    return matchesSearch && matchesChallenge;
  });

  const uniqueChallenges = [...new Set(teams.map(t => t.challenge))].sort();

  const stats = {
    total: teams.length,
    withToken: teams.filter(t => t.edit_token).length,
    emailSent: teams.filter(t => t.email_last_sent_at).length,
    withProject: teams.filter(t => t.project_name).length,
  };

  return (
    <motion.div key="projekty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Status notification */}
      <AnimatePresence>
        {actionStatus && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-2xl font-bold text-sm shadow-lg ${
              actionStatus.type === 'success'
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}
          >
            {actionStatus.type === 'success'
              ? <CheckCircle className="w-4 h-4 inline mr-2" />
              : <AlertCircle className="w-4 h-4 inline mr-2" />}
            {actionStatus.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-black uppercase italic flex items-center gap-3">
          <FolderEdit className="w-6 h-6 text-cyan-400" /> Projekty Zespołów
        </h2>
        <div className="flex gap-2">
          <button
            onClick={loadTeams}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Odśwież
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Zespołów', value: stats.total, color: 'text-white' },
          { label: 'Z tokenem', value: stats.withToken, color: 'text-cyan-400' },
          { label: 'Email wysłany', value: stats.emailSent, color: 'text-green-400' },
          { label: 'Z projektem', value: stats.withProject, color: 'text-blue-400' },
        ].map(s => (
          <div key={s.label} className="bg-white/5 rounded-2xl p-4 text-center border border-white/5">
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Bulk Actions */}
      <div className="flex flex-wrap gap-2 items-center">
        <button
          onClick={openBulkSendPreview}
          disabled={isBulkSending || stats.withToken === 0}
          className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-xl text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Mail className="w-3.5 h-3.5" />
          {isBulkSending ? 'Wysyłanie...' : `Wyślij do wszystkich (${stats.withToken})`}
        </button>
        <div className="flex items-center gap-1.5 px-3 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
          <Info className="w-3 h-3 text-yellow-400 shrink-0" />
          <span className="text-[10px] text-yellow-400 font-bold">Emaile wyszukiwane po imieniu i nazwisku z bazy zgłoszeń</span>
        </div>
      </div>

      {/* Bulk result */}
      <AnimatePresence>
        {bulkResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-black">
                Wynik zbiorczej wysyłki: <span className="text-green-400">{bulkResult.sent} wysłano</span>
                {bulkResult.failed > 0 && <span className="text-red-400 ml-2">{bulkResult.failed} nie wysłano</span>}
              </p>
              <button onClick={() => setBulkResult(null)} className="text-gray-500 hover:text-white">✕</button>
            </div>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {bulkResult.details.map(d => (
                <div key={d.slug} className="flex items-center gap-3 text-xs">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${d.sent ? 'bg-green-400' : 'bg-red-400'}`} />
                  <span className="text-gray-300 font-bold w-36 truncate">{d.name}</span>
                  {d.emails_found.length > 0
                    ? <span className="text-gray-500">{d.emails_found.join(', ')}</span>
                    : <span className="text-red-400">brak emaila w bazie</span>
                  }
                  {!d.sent && (
                    <button
                      onClick={() => { navigator.clipboard.writeText(d.edit_link); showStatus('success', 'Link skopiowany'); }}
                      className="ml-auto px-2 py-0.5 bg-white/5 hover:bg-white/10 rounded text-gray-400 flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" /> Kopiuj link
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Szukaj po nazwie, slug, projekcie, członku..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 pl-11 pr-4 py-3 rounded-2xl text-xs font-bold"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => setChallengeFilter('all')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
              challengeFilter === 'all' ? 'bg-indigo-500 text-white' : 'bg-white/5 text-gray-500 hover:bg-white/10'
            }`}
          >
            Wszystkie
          </button>
          {uniqueChallenges.map((challenge) => {
            const style = getChallengeStyle(challenge, uniqueChallenges);
            return (
              <button
                key={challenge}
                onClick={() => setChallengeFilter(challenge)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                  challengeFilter === challenge ? 'bg-indigo-500 text-white' : 'bg-white/5 text-gray-500 hover:bg-white/10'
                }`}
              >
                {style.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Team list */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Ładowanie...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {teams.length === 0
              ? 'Brak projektów w bazie. Użyj "Seed" w panelu aby załadować dane z teams.ts.'
              : 'Brak wyników dla podanych filtrów.'}
          </div>
        ) : (
          filtered.map(team => {
            const challengeStyle = getChallengeStyle(team.challenge, uniqueChallenges);
            const isExpanded = expandedId === team.id;
            const isSending = sendingId === team.id;
            const isRegenerating = regeneratingId === team.id;

            return (
              <motion.div
                key={team.id}
                layout
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all"
              >
                {/* Row header */}
                <div className="flex flex-col md:flex-row md:items-center gap-4 p-5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <span className="font-bold text-sm">{team.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${challengeStyle.bg} ${challengeStyle.text}`}>
                        {challengeStyle.label}
                      </span>
                      {team.placement && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-500/20 text-amber-400">
                          #{team.placement}
                        </span>
                      )}
                      {team.email_last_sent_at && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-green-500/10 text-green-400 flex items-center gap-1">
                          <Mail className="w-2.5 h-2.5" /> Email wysłany
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-500">
                      <span>Slug: <span className="text-gray-400 font-mono">{team.slug}</span></span>
                      {team.project_name && <span>Projekt: <span className="text-gray-300">{team.project_name}</span></span>}
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" /> {team.members.length} os.
                      </span>
                      {team.email_last_sent_at && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Wysłano: {formatDate(team.email_last_sent_at)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1.5 flex-wrap shrink-0 items-center">
                    {team.edit_token ? (
                      <>
                        <button
                          onClick={() => copyEditLink(team.slug, team.edit_token!)}
                          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                          title="Kopiuj link edycji"
                        >
                          <Copy className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                        <a
                          href={getEditLink(team.slug, team.edit_token)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                          title="Otwórz stronę edycji"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                        </a>
                        <button
                          onClick={() => sendEditLink(team)}
                          disabled={isSending}
                          className="px-3 py-2 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg transition-all disabled:opacity-50 text-[10px] font-black text-purple-400 flex items-center gap-1.5"
                          title="Wyślij link email"
                        >
                          <Send className="w-3 h-3" />
                          {isSending ? 'Wysyłanie...' : 'Wyślij'}
                        </button>
                        <button
                          onClick={() => regenerateToken(team)}
                          disabled={isRegenerating}
                          className="p-2 bg-orange-500/10 hover:bg-orange-500/20 rounded-lg transition-all disabled:opacity-50"
                          title="Regeneruj token (stary link przestanie działać)"
                        >
                          <RotateCcw className={`w-3.5 h-3.5 text-orange-400 ${isRegenerating ? 'animate-spin' : ''}`} />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => regenerateToken(team)}
                        disabled={isRegenerating}
                        className="px-3 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-lg transition-all disabled:opacity-50 text-[10px] font-black text-cyan-400 flex items-center gap-1.5"
                      >
                        <RotateCcw className={`w-3 h-3 ${isRegenerating ? 'animate-spin' : ''}`} />
                        Generuj token
                      </button>
                    )}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : team.id)}
                      className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                      title="Rozwiń szczegóły"
                    >
                      {isExpanded
                        ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                        : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                    </button>
                  </div>
                </div>

                {/* Expanded details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/5 px-5 pb-5 pt-4 space-y-3 overflow-hidden"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Członkowie</p>
                          <ul className="space-y-0.5">
                            {team.members.map((m, i) => (
                              <li key={i} className="text-gray-300">{m}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Technologie</p>
                          <div className="flex flex-wrap gap-1">
                            {team.technologies.length > 0
                              ? team.technologies.map((t, i) => (
                                <span key={i} className="px-2 py-0.5 bg-white/5 rounded text-gray-400 text-[10px] font-bold">{t}</span>
                              ))
                              : <span className="text-gray-600">Brak</span>
                            }
                          </div>
                        </div>
                        {team.short_description && (
                          <div className="md:col-span-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Krótki opis</p>
                            <p className="text-gray-400">{team.short_description}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Token edycji</p>
                          {team.edit_token
                            ? (
                              <div className="flex items-center gap-2">
                                <code className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">
                                  {team.edit_token.slice(0, 8)}...{team.edit_token.slice(-4)}
                                </code>
                                <span className="text-gray-600 text-[10px]">wygenerowany {formatDate(team.edit_token_created_at)}</span>
                              </div>
                            )
                            : <span className="text-gray-600">Brak tokenu</span>
                          }
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Hasło edycji</p>
                          {team.edit_password
                            ? (
                              <div className="flex items-center gap-2">
                                <code className="text-sm font-mono text-amber-400 bg-amber-500/10 px-3 py-1 rounded font-black tracking-widest">
                                  {team.edit_password}
                                </code>
                                <button
                                  onClick={() => { navigator.clipboard.writeText(team.edit_password!); showStatus('success', 'Hasło skopiowane'); }}
                                  className="p-1.5 bg-white/5 hover:bg-white/10 rounded transition-all"
                                  title="Kopiuj hasło"
                                >
                                  <Copy className="w-3 h-3 text-gray-400" />
                                </button>
                              </div>
                            )
                            : <span className="text-gray-600">Brak hasła</span>
                          }
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Ostatnia aktualizacja</p>
                          <span className="text-gray-400">{formatDate(team.updated_at)}</span>
                        </div>
                      </div>
                      {team.edit_token && (
                        <div className="bg-white/5 rounded-xl p-3">
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Link edycji</p>
                          <div className="flex items-center gap-2">
                            <code className="text-[10px] font-mono text-cyan-400 flex-1 truncate">
                              {getEditLink(team.slug, team.edit_token)}
                            </code>
                            <button
                              onClick={() => copyEditLink(team.slug, team.edit_token!)}
                              className="p-1.5 bg-white/5 hover:bg-white/10 rounded transition-all shrink-0"
                            >
                              <Copy className="w-3 h-3 text-gray-400" />
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Email Preview Modal */}
      {previewData && (
        <EmailPreviewModal
          open={showPreviewModal}
          subject={previewData.subject}
          previewHtml={previewData.html}
          previewLabel={previewData.team_name}
          sendAllLabel={`Wyślij do ${stats.withToken} zespołów`}
          onClose={() => setShowPreviewModal(false)}
          onSendTest={handleSendTest}
          onSendAll={handleSendAll}
        />
      )}
    </motion.div>
  );
}
