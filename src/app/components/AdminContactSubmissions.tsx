import { useState, useEffect } from 'react';
import { getAdminToken } from '@/lib/adminApi';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageCircle, ChevronDown, ChevronUp, Building2, Mail, Calendar,
  ExternalLink, RefreshCw,
} from 'lucide-react';

interface ContactSubmission {
  id: number;
  name: string;
  email: string;
  data: {
    organizationName?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    howToCollaborate?: string;
  };
  status: string;
  created_at: string;
}

const STATUS_OPTIONS = [
  { value: 'new', label: 'Nowe', bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  { value: 'in_progress', label: 'W toku', bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  { value: 'replied', label: 'Odpowiedziano', bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
  { value: 'archived', label: 'Archiwum', bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30' },
];

export function AdminContactSubmissions() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const apiBase = import.meta.env.DEV ? 'http://localhost:3000' : '';

  const load = async () => {
    try {
      const token = getAdminToken();
      const res = await fetch(`${apiBase}/api/submissions?type=org_contact`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSubmissions(data);
    } catch {
      setStatus({ type: 'error', msg: 'Błąd ładowania' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      const token = getAdminToken();
      await fetch(`${apiBase}/api/submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
    } catch {
      setStatus({ type: 'error', msg: 'Błąd aktualizacji statusu' });
    }
  };

  if (loading) return <div className="text-center text-gray-500 py-12">Ładowanie zapytań...</div>;

  return (
    <motion.div key="contact_submissions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
          <MessageCircle className="w-5 h-5 text-purple-400" /> Zapytania o współpracę
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">{submissions.length} zapytań</span>
          <button onClick={load} className="p-2 hover:bg-white/10 rounded-lg transition-all">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {status && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className={`p-3 rounded-xl text-sm font-bold text-center ${status.type === 'success' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
            {status.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {submissions.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Brak zapytań. Kiedy ktoś wypełni formularz kontaktowy, pojawi się tutaj.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map(sub => {
            const isExpanded = expandedId === sub.id;
            const statusInfo = STATUS_OPTIONS.find(s => s.value === sub.status) || STATUS_OPTIONS[0];
            return (
              <div key={sub.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <button onClick={() => setExpandedId(isExpanded ? null : sub.id)}
                  className="w-full p-5 flex items-center gap-4 text-left hover:bg-white/[0.03] transition-all">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-sm">{sub.name}</span>
                      {sub.data.organizationName && (
                        <span className="text-gray-500 text-xs">z {sub.data.organizationName}</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 truncate mt-0.5">
                      {sub.email} · {new Date(sub.created_at).toLocaleDateString('pl-PL')}
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
                    {statusInfo.label}
                  </span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                </button>

                {isExpanded && (
                  <div className="border-t border-white/5 p-5 space-y-4">
                    <div className="bg-white/5 rounded-xl p-4">
                      <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Wiadomość</h4>
                      <p className="text-gray-300 text-sm whitespace-pre-wrap break-words">{sub.data.howToCollaborate || '(brak treści)'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 text-xs">Email:</span>
                        <a href={`mailto:${sub.email}`} className="text-purple-400 hover:text-purple-300 block">{sub.email}</a>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs">Organizacja:</span>
                        <p className="text-gray-300">{sub.data.organizationName || '—'}</p>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase text-gray-500 mb-2 block">Status</span>
                      <div className="flex gap-2 flex-wrap">
                        {STATUS_OPTIONS.map(opt => (
                          <button key={opt.value} onClick={() => updateStatus(sub.id, opt.value)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                              sub.status === opt.value
                                ? `${opt.bg} ${opt.text} ${opt.border}`
                                : 'bg-white/5 text-gray-500 border-white/10 hover:bg-white/10'
                            }`}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
