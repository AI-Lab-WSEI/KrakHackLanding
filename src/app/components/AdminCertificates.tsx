import { useState, useEffect } from 'react';
import { getAdminToken } from './AdminAuth';
import { motion, AnimatePresence } from 'motion/react';
import {
  Award,
  Search,
  RefreshCw,
  Download,
  Send,
  Check,
  X,
  Edit3,
  Trash2,
  QrCode,
  Shield,
  ShieldCheck,
  ShieldX,
  FileText,
  Mail,
  Trophy,
  Users,
  Copy,
  ExternalLink,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface Certificate {
  id: string;
  hash: string | null;
  signature: string | null;
  participant_name: string;
  team_name: string;
  project_name: string;
  university: string;
  certificate_type: 'participation' | 'winner';
  event_name: string;
  event_dates: string;
  status: 'draft' | 'approved' | 'issued' | 'revoked';
  approved_at: string | null;
  issued_at: string | null;
  metadata: Record<string, unknown>;
  submission_id: number | null;
  created_at: string;
  updated_at: string;
}

async function certFetch(path: string, options?: RequestInit) {
  const token = getAdminToken();
  const res = await fetch(path, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(data.error || 'API error');
  }
  return res.json();
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'Szkic' },
  approved: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Zatwierdzony' },
  issued: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Wydany' },
  revoked: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Cofniety' },
};

const TYPE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  participation: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', label: 'Uczestnictwo' },
  winner: { bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'Zwyciezca' },
};

export function AdminCertificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Certificate>>({});
  const [actionStatus, setActionStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const loadCertificates = async () => {
    setLoading(true);
    try {
      const data = await certFetch('/api/certificates');
      setCertificates(data);
    } catch {
      setActionStatus({ type: 'error', message: 'Blad ladowania certyfikatow' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCertificates(); }, []);

  const showStatus = (type: 'success' | 'error', message: string) => {
    setActionStatus({ type, message });
    setTimeout(() => setActionStatus(null), 4000);
  };

  const generateCertificates = async () => {
    setIsGenerating(true);
    try {
      const result = await certFetch('/api/certificates/generate', { method: 'POST' });
      showStatus('success', `Wygenerowano ${result.created} certyfikatow (pominieto ${result.skipped} istniejacych)`);
      loadCertificates();
    } catch (err: unknown) {
      showStatus('error', err instanceof Error ? err.message : 'Blad generowania');
    } finally {
      setIsGenerating(false);
    }
  };

  const approveCert = async (id: string) => {
    try {
      await certFetch(`/api/certificates/${id}/approve`, { method: 'POST' });
      showStatus('success', 'Certyfikat zatwierdzony');
      loadCertificates();
    } catch (err: unknown) {
      showStatus('error', err instanceof Error ? err.message : 'Blad zatwierdzania');
    }
  };

  const issueCert = async (id: string) => {
    try {
      await certFetch(`/api/certificates/${id}/issue`, { method: 'POST' });
      showStatus('success', 'Certyfikat wydany i podpisany kryptograficznie');
      loadCertificates();
    } catch (err: unknown) {
      showStatus('error', err instanceof Error ? err.message : 'Blad wydawania');
    }
  };

  const revokeCert = async (id: string) => {
    try {
      await certFetch(`/api/certificates/${id}/revoke`, { method: 'POST' });
      showStatus('success', 'Certyfikat cofniety');
      loadCertificates();
    } catch (err: unknown) {
      showStatus('error', err instanceof Error ? err.message : 'Blad cofania');
    }
  };

  const deleteCert = async (id: string) => {
    try {
      await certFetch(`/api/certificates/${id}`, { method: 'DELETE' });
      showStatus('success', 'Certyfikat usuniety');
      loadCertificates();
    } catch (err: unknown) {
      showStatus('error', err instanceof Error ? err.message : 'Blad usuwania');
    }
  };

  const deleteTeam = async (teamName: string) => {
    try {
      const result = await certFetch(`/api/certificates/team/${encodeURIComponent(teamName)}`, { method: 'DELETE' });
      showStatus('success', `Usunieto ${result.deleted} certyfikatow zespolu "${teamName}"`);
      loadCertificates();
    } catch (err: unknown) {
      showStatus('error', err instanceof Error ? err.message : 'Blad usuwania zespolu');
    }
  };

  const bulkApprove = async () => {
    try {
      const result = await certFetch('/api/certificates/bulk-approve', { method: 'POST' });
      showStatus('success', `Zatwierdzono ${result.count} certyfikatow`);
      loadCertificates();
    } catch (err: unknown) {
      showStatus('error', err instanceof Error ? err.message : 'Blad');
    }
  };

  const bulkIssue = async () => {
    try {
      const result = await certFetch('/api/certificates/bulk-issue', { method: 'POST' });
      showStatus('success', `Wydano ${result.issued} certyfikatow`);
      loadCertificates();
    } catch (err: unknown) {
      showStatus('error', err instanceof Error ? err.message : 'Blad');
    }
  };

  const bulkSendEmail = async () => {
    try {
      const result = await certFetch('/api/certificates/bulk-send-email', { method: 'POST' });
      showStatus('success', `Wyslano ${result.sent}/${result.total} emaili`);
    } catch (err: unknown) {
      showStatus('error', err instanceof Error ? err.message : 'Blad');
    }
  };

  const sendCertEmail = async (id: string) => {
    try {
      await certFetch(`/api/certificates/${id}/send-email`, { method: 'POST' });
      showStatus('success', 'Email wyslany');
    } catch (err: unknown) {
      showStatus('error', err instanceof Error ? err.message : 'Blad');
    }
  };

  const startEdit = (cert: Certificate) => {
    setEditingId(cert.id);
    setEditForm({
      participant_name: cert.participant_name,
      team_name: cert.team_name,
      project_name: cert.project_name,
      university: cert.university,
      certificate_type: cert.certificate_type,
      metadata: cert.metadata,
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      await certFetch(`/api/certificates/${editingId}`, {
        method: 'PATCH',
        body: JSON.stringify(editForm),
      });
      showStatus('success', 'Certyfikat zaktualizowany');
      setEditingId(null);
      loadCertificates();
    } catch (err: unknown) {
      showStatus('error', err instanceof Error ? err.message : 'Blad zapisu');
    }
  };

  const downloadQR = async (id: string, hash: string) => {
    const token = getAdminToken();
    const res = await fetch(`/api/certificates/${id}/qr`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) {
      showStatus('error', 'Blad pobierania QR');
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-${hash?.slice(0, 8) || id.slice(0, 8)}.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCerts = async () => {
    try {
      const data = await certFetch('/api/certificates/export');
      const csv = [
        'Imie i Nazwisko;Zespol;Projekt;Uczelnia;Typ;Data wydania;Hash;Link weryfikacji',
        ...data.map((c: Record<string, string>) =>
          `"${c.participant_name}";"${c.team_name}";"${c.project_name}";"${c.university}";"${c.certificate_type}";"${c.issued_at}";"${c.hash}";"${c.verify_url}"`
        ),
      ].join('\n');
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'certyfikaty_ai_krak_hack_2026.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      showStatus('error', err instanceof Error ? err.message : 'Blad eksportu');
    }
  };

  const copyVerifyUrl = (hash: string) => {
    const baseUrl = window.location.origin;
    navigator.clipboard.writeText(`${baseUrl}/verify/${hash}`);
    showStatus('success', 'Link skopiowany');
  };

  // Filtering
  const filtered = certificates.filter(c => {
    const matchesSearch =
      c.participant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.team_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.project_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    total: certificates.length,
    draft: certificates.filter(c => c.status === 'draft').length,
    approved: certificates.filter(c => c.status === 'approved').length,
    issued: certificates.filter(c => c.status === 'issued').length,
    revoked: certificates.filter(c => c.status === 'revoked').length,
    winners: certificates.filter(c => c.certificate_type === 'winner').length,
  };

  return (
    <motion.div key="certificates" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Status notification */}
      <AnimatePresence>
        {actionStatus && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-2xl font-bold text-sm shadow-lg ${
              actionStatus.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}
          >
            {actionStatus.type === 'success' ? <CheckCircle className="w-4 h-4 inline mr-2" /> : <AlertCircle className="w-4 h-4 inline mr-2" />}
            {actionStatus.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header & Stats */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-black uppercase italic flex items-center gap-3">
          <Award className="w-6 h-6 text-amber-400" /> Certyfikaty
        </h2>
        <div className="flex gap-2">
          <button onClick={loadCertificates} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold flex items-center gap-2 transition-all">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Odswiez
          </button>
          <button onClick={generateCertificates} disabled={isGenerating} className="px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 rounded-xl text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50">
            <FileText className="w-3.5 h-3.5" /> {isGenerating ? 'Generowanie...' : 'Generuj certyfikaty'}
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: 'Razem', value: stats.total, color: 'text-white' },
          { label: 'Szkice', value: stats.draft, color: 'text-gray-400' },
          { label: 'Zatwierdzone', value: stats.approved, color: 'text-blue-400' },
          { label: 'Wydane', value: stats.issued, color: 'text-green-400' },
          { label: 'Cofniete', value: stats.revoked, color: 'text-red-400' },
          { label: 'Zwyciezcy', value: stats.winners, color: 'text-amber-400' },
        ].map(s => (
          <div key={s.label} className="bg-white/5 rounded-2xl p-4 text-center border border-white/5">
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Bulk Actions */}
      <div className="flex flex-wrap gap-2">
        <button onClick={bulkApprove} className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-xl text-xs font-bold flex items-center gap-2 transition-all">
          <Check className="w-3.5 h-3.5" /> Zatwierdz wszystkie szkice
        </button>
        <button onClick={bulkIssue} className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-xl text-xs font-bold flex items-center gap-2 transition-all">
          <ShieldCheck className="w-3.5 h-3.5" /> Wydaj wszystkie zatwierdzone
        </button>
        <button onClick={bulkSendEmail} className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-xl text-xs font-bold flex items-center gap-2 transition-all">
          <Mail className="w-3.5 h-3.5" /> Wyslij emaile (wydane)
        </button>
        <button onClick={exportCerts} className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-xl text-xs font-bold flex items-center gap-2 transition-all">
          <Download className="w-3.5 h-3.5" /> Eksport CSV
        </button>
        <a
          href={`${import.meta.env.DEV ? 'http://localhost:3000' : ''}/api/certificates/bulk-qr`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
          onClick={(e) => {
            e.preventDefault();
            const pw = prompt('Podaj hasło admina:');
            if (!pw) return;
            const base = import.meta.env.DEV ? 'http://localhost:3000' : '';
            window.open(`${base}/api/certificates/bulk-qr?pw=${encodeURIComponent(pw)}`, '_blank');
          }}
        >
          <QrCode className="w-3.5 h-3.5" /> Drukuj QR kody
        </a>
      </div>

      {/* Delete by Team */}
      {certificates.length > 0 && (() => {
        const teams = [...new Set(certificates.map(c => c.team_name))].sort();
        return (
          <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-3 flex items-center gap-2">
              <Trash2 className="w-3 h-3" /> Usun zespol (nie zjawil sie)
            </p>
            <div className="flex flex-wrap gap-2">
              {teams.map(t => (
                <button
                  key={t}
                  onClick={() => { if (confirm(`Usunac wszystkie certyfikaty zespolu "${t}"?`)) deleteTeam(t); }}
                  className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all"
                >
                  <X className="w-3 h-3" /> {t}
                </button>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Szukaj po imieniu, zespole, projekcie..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 pl-11 pr-4 py-3 rounded-2xl text-xs font-bold"
          />
        </div>
        <div className="flex gap-1">
          {['all', 'draft', 'approved', 'issued', 'revoked'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                statusFilter === s ? 'bg-indigo-500 text-white' : 'bg-white/5 text-gray-500 hover:bg-white/10'
              }`}
            >
              {s === 'all' ? 'Wszystkie' : STATUS_STYLES[s]?.label || s}
            </button>
          ))}
        </div>
      </div>

      {/* Certificate List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Ladowanie...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {certificates.length === 0
              ? 'Brak certyfikatow. Uzyj "Generuj certyfikaty" aby utworzyc szkice z potwierdzonych uczestnikow.'
              : 'Brak wynikow dla podanych filtrow.'}
          </div>
        ) : (
          filtered.map(cert => {
            const statusStyle = STATUS_STYLES[cert.status] || STATUS_STYLES.draft;
            const typeStyle = TYPE_STYLES[cert.certificate_type] || TYPE_STYLES.participation;
            const isEditing = editingId === cert.id;

            return (
              <motion.div
                key={cert.id}
                layout
                className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all"
              >
                {isEditing ? (
                  /* Edit Mode */
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 block">Imie i nazwisko</label>
                        <input
                          value={editForm.participant_name || ''}
                          onChange={e => setEditForm({ ...editForm, participant_name: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 block">Zespol</label>
                        <input
                          value={editForm.team_name || ''}
                          onChange={e => setEditForm({ ...editForm, team_name: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 block">Nazwa projektu</label>
                        <input
                          value={editForm.project_name || ''}
                          onChange={e => setEditForm({ ...editForm, project_name: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm"
                          placeholder="Wpisz nazwe projektu..."
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 block">Uczelnia</label>
                        <input
                          value={editForm.university || ''}
                          onChange={e => setEditForm({ ...editForm, university: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Typ certyfikatu</label>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setEditForm({ ...editForm, certificate_type: 'participation' })}
                          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                            editForm.certificate_type === 'participation' ? 'bg-cyan-500/30 text-cyan-400 border border-cyan-500/50' : 'bg-white/5 text-gray-500'
                          }`}
                        >
                          <Users className="w-3.5 h-3.5" /> Uczestnictwo
                        </button>
                        <button
                          onClick={() => setEditForm({ ...editForm, certificate_type: 'winner' })}
                          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                            editForm.certificate_type === 'winner' ? 'bg-amber-500/30 text-amber-400 border border-amber-500/50' : 'bg-white/5 text-gray-500'
                          }`}
                        >
                          <Trophy className="w-3.5 h-3.5" /> Zwyciezca
                        </button>
                      </div>
                    </div>
                    {editForm.certificate_type === 'winner' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 block">Miejsce</label>
                          <input
                            value={String((editForm.metadata as Record<string, unknown>)?.placement || '')}
                            onChange={e => setEditForm({ ...editForm, metadata: { ...editForm.metadata as Record<string, unknown>, placement: e.target.value } })}
                            placeholder="np. 1, 2, 3"
                            className="w-full bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 block">Wyzwanie</label>
                          <input
                            value={String((editForm.metadata as Record<string, unknown>)?.challenge_name || '')}
                            onChange={e => setEditForm({ ...editForm, metadata: { ...editForm.metadata as Record<string, unknown>, challenge_name: e.target.value } })}
                            placeholder="np. Smart Infrastructure"
                            className="w-full bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm"
                          />
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <button onClick={saveEdit} className="px-5 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-xl text-xs font-bold flex items-center gap-2">
                        <Check className="w-3.5 h-3.5" /> Zapisz
                      </button>
                      <button onClick={() => setEditingId(null)} className="px-5 py-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-xl text-xs font-bold flex items-center gap-2">
                        <X className="w-3.5 h-3.5" /> Anuluj
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-bold text-sm truncate">{cert.participant_name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${statusStyle.bg} ${statusStyle.text}`}>
                          {statusStyle.label}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${typeStyle.bg} ${typeStyle.text}`}>
                          {cert.certificate_type === 'winner' && <Trophy className="w-2.5 h-2.5 inline mr-1" />}
                          {typeStyle.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-500">
                        <span>Zespol: <span className="text-gray-300">{cert.team_name}</span></span>
                        {cert.project_name && <span>Projekt: <span className="text-gray-300">{cert.project_name}</span></span>}
                        {cert.university && <span>Uczelnia: <span className="text-gray-300">{cert.university}</span></span>}
                        {cert.hash && (
                          <span className="font-mono">
                            Hash: <span className="text-indigo-400">{cert.hash.slice(0, 8)}...{cert.hash.slice(-4)}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1.5 flex-wrap shrink-0">
                      {cert.status === 'draft' && (
                        <>
                          <button onClick={() => startEdit(cert)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all" title="Edytuj">
                            <Edit3 className="w-3.5 h-3.5 text-gray-400" />
                          </button>
                          <button onClick={() => approveCert(cert.id)} className="p-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-all" title="Zatwierdz">
                            <Shield className="w-3.5 h-3.5 text-blue-400" />
                          </button>
                          <button onClick={() => deleteCert(cert.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-all" title="Usun">
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        </>
                      )}
                      {cert.status === 'approved' && (
                        <>
                          <button onClick={() => startEdit(cert)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all" title="Edytuj">
                            <Edit3 className="w-3.5 h-3.5 text-gray-400" />
                          </button>
                          <button onClick={() => issueCert(cert.id)} className="p-2 bg-green-500/10 hover:bg-green-500/20 rounded-lg transition-all" title="Wydaj">
                            <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
                          </button>
                        </>
                      )}
                      {cert.status === 'issued' && cert.hash && (
                        <>
                          <button onClick={() => copyVerifyUrl(cert.hash!)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all" title="Kopiuj link">
                            <Copy className="w-3.5 h-3.5 text-gray-400" />
                          </button>
                          <a href={`/verify/${cert.hash}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all" title="Podglad">
                            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                          </a>
                          <button onClick={() => downloadQR(cert.id, cert.hash!)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all" title="Pobierz QR">
                            <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                          </button>
                          <button onClick={() => sendCertEmail(cert.id)} className="p-2 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg transition-all" title="Wyslij email">
                            <Send className="w-3.5 h-3.5 text-purple-400" />
                          </button>
                          <button onClick={() => revokeCert(cert.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-all" title="Cofnij">
                            <ShieldX className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        </>
                      )}
                      {cert.status === 'revoked' && (
                        <button onClick={() => deleteCert(cert.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-all" title="Usun">
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
