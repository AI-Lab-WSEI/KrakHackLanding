import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, CheckCircle, XCircle, Clock, Search, 
  Mail, MessageSquare, Copy, ExternalLink, 
  TrendingUp
} from 'lucide-react';
import { getAttendanceData, Team } from '@/data/attendance';
import { cn } from '@/app/components/ui/utils';
import { getAdminToken } from '@/lib/adminApi';

export function AdminAttendance() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<Team['status'] | 'all'>('all');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showDiscordModal, setShowDiscordModal] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  useEffect(() => {
    const token = getAdminToken();
    getAttendanceData(token || undefined).then(setTeams);
  }, []);

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.team_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || team.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: teams.length,
    confirmed: teams.filter(t => t.status === 'confirmed').length,
    declined: teams.filter(t => t.status === 'declined').length,
    pending: teams.filter(t => t.status === 'pending').length
  };

  const confirmedRate = stats.total > 0 ? (stats.confirmed / stats.total) * 100 : 0;

  const handleCopy = (text: string, type: 'email' | 'discord') => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(type);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const getConfirmationUrl = (token: string) => {
    return `${window.location.origin}/confirm/${token}`;
  };

  const EmailTemplate = ({ team }: { team: Team }) => {
    const url = getConfirmationUrl(team.confirm_token);
    return `
Temat: [WAŻNE] Potwierdzenie udziału w AI Krak Hack 2026 - Zespół ${team.team_name}

Cześć ${team.team_name}!

Zostało niewiele czasu do startu AI Krak Hack 2026! Abyśmy mogli dopiąć logistykę i catering, prosimy o ostateczne potwierdzenie przyjazdu do jutra do godziny 12:00.

Kliknij tutaj, aby potwierdzić obecność:
${url}

Do zobaczenia w Krakowie!
Zespół AI Krak Hack
    `.trim();
  };

  const DiscordTemplate = ({ team }: { team: Team }) => {
    const url = getConfirmationUrl(team.confirm_token);
    return `
**[ATTENDANCE CHECK]** @everyone z zespołu **${team.team_name}**! 
Prosimy o szybkie potwierdzenie, czy zameldujecie się na miejscu:
🔗 ${url}
Oznaczcie osobę, która potwierdza w Waszym imieniu! 🚀
    `.trim();
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      <div className="container mx-auto max-w-7xl">
        <header className="mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Potwierdzenia Przyjazdu</h1>
              <p className="text-gray-400">Zarządzaj statusem obecności i generuj linki dla zespołów.</p>
            </div>
            <div className="flex gap-4">
            </div>
          </div>

          {/* Analytics Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard label="Wszystkie Zespoły" value={stats.total} icon={<Users />} color="text-white" />
            <StatCard label="Potwierdzone" value={stats.confirmed} icon={<CheckCircle />} color="text-cyan-400" />
            <StatCard label="Pending" value={stats.pending} icon={<Clock />} color="text-yellow-400" />
            <StatCard label="Odrzucone" value={stats.declined} icon={<XCircle />} color="text-red-400" />
          </div>

          <div className="mt-8 bg-gray-900/50 border border-white/10 p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" /> Wskaźnik Obecności
              </h3>
              <span className="text-cyan-400 font-black">{confirmedRate.toFixed(1)}%</span>
            </div>
            <div className="h-4 bg-black/50 rounded-full overflow-hidden p-1 border border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${confirmedRate}%` }}
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              />
            </div>
          </div>
        </header>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
              type="text" 
              placeholder="Szukaj zespołu lub emaila..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
          <div className="flex gap-4">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="bg-gray-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none"
            >
              <option value="all">Wszystkie statusy</option>
              <option value="confirmed">Potwierdzone</option>
              <option value="pending">Pending</option>
              <option value="declined">Odrzucone</option>
            </select>
          </div>
        </div>

        {/* Teams Table */}
        <div className="bg-gray-900/30 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500">Zespół</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500">Członkowie</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500">Status</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500">Potwierdził(a)</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500">Akcje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTeams.map((team) => (
                  <tr key={team.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-6">
                      <div className="font-bold text-white mb-1">{team.team_name}</div>
                      <div className="text-xs text-gray-500">{team.contact_email}</div>
                    </td>
                    <td className="px-6 py-6 font-mono text-xs text-gray-400">
                      {team.members?.join(', ') || 'Brak danych'}
                    </td>
                    <td className="px-6 py-6">
                      <StatusBadge status={team.status} />
                    </td>
                    <td className="px-6 py-6 text-sm text-gray-400">
                      {team.confirmed_at ? new Date(team.confirmed_at).toLocaleString() : '-'}
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => { setSelectedTeam(team); setShowEmailModal(true); }}
                          className="p-2 hover:bg-cyan-500/20 text-gray-400 hover:text-cyan-400 rounded-lg transition-colors"
                          title="Generate Email"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => { setSelectedTeam(team); setShowDiscordModal(true); }}
                          className="p-2 hover:bg-indigo-500/20 text-gray-400 hover:text-indigo-400 rounded-lg transition-colors"
                          title="Generate Discord Link"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <a 
                          href={getConfirmationUrl(team.confirm_token)} 
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-colors"
                          title="Preview Link"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showEmailModal && selectedTeam && (
          <Modal title="Szablon Email" onClose={() => setShowEmailModal(false)}>
            <div className="space-y-4">
              <pre className="bg-black/50 p-6 rounded-xl border border-white/5 text-sm text-gray-300 whitespace-pre-wrap font-mono">
                {EmailTemplate({ team: selectedTeam })}
              </pre>
              <button 
                onClick={() => handleCopy(EmailTemplate({ team: selectedTeam }), 'email')}
                className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                {copyFeedback === 'email' ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                {copyFeedback === 'email' ? 'Skopiowano!' : 'Kopiuj Treść Emaila'}
              </button>
            </div>
          </Modal>
        )}

        {showDiscordModal && selectedTeam && (
          <Modal title="Formatka Discord" onClose={() => setShowDiscordModal(false)}>
            <div className="space-y-4">
              <div className="bg-indigo-500/10 p-6 rounded-xl border border-indigo-500/20">
                <p className="text-gray-300 whitespace-pre-wrap font-sans">
                  {DiscordTemplate({ team: selectedTeam })}
                </p>
              </div>
              <button 
                onClick={() => handleCopy(DiscordTemplate({ team: selectedTeam }), 'discord')}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                {copyFeedback === 'discord' ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                {copyFeedback === 'discord' ? 'Skopiowano wiadomość!' : 'Kopiuj na Discorda'}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper Components
function StatCard({ label, value, icon, color }: any) {
  return (
    <div className="bg-gray-900 border border-white/10 p-6 rounded-2xl flex items-center gap-6">
      <div className={cn("p-3 bg-white/5 rounded-xl", color)}>{icon}</div>
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-1">{label}</p>
        <p className="text-3xl font-black">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Team['status'] }) {
  const configs = {
    confirmed: { color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20', icon: <CheckCircle className="w-3 h-3" />, label: 'Potwierdzono' },
    declined: { color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: <XCircle className="w-3 h-3" />, label: 'Odrzucono' },
    pending: { color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', icon: <Clock className="w-3 h-3" />, label: 'Oczekiwanie' }
  };
  const config = configs[status];
  return (
    <span className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase border", config.color)}>
      {config.icon} {config.label}
    </span>
  );
}

function Modal({ title, children, onClose }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-gray-900 border border-white/10 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="flex justify-between items-center px-8 py-6 border-b border-white/5">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white"><XCircle className="w-5 h-5" /></button>
        </div>
        <div className="p-8">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

