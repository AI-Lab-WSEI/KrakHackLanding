import { useState, useEffect } from 'react';
import { getAdminToken } from './AdminAuth';
import { motion, AnimatePresence } from 'motion/react';
import {
  Handshake, Plus, Edit3, Trash2, Save, X, Eye, EyeOff,
  ChevronDown, ChevronUp, GripVertical, ExternalLink,
} from 'lucide-react';
import { COLLABORATIONS as FALLBACK_COLLABS } from '@/data/collaborations';

interface Collaboration {
  id: number;
  slug: string;
  partner: string;
  partner_full: string;
  partner_logo: string;
  tagline: string;
  description: string;
  full_content: string[];
  outcomes: string[];
  color: string;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

const GRADIENT_OPTIONS = [
  'from-blue-500 to-cyan-600',
  'from-purple-500 to-pink-600',
  'from-green-500 to-teal-600',
  'from-orange-500 to-red-600',
  'from-indigo-500 to-purple-600',
  'from-cyan-500 to-blue-600',
  'from-pink-500 to-rose-600',
  'from-amber-500 to-orange-600',
];

const EMPTY_FORM = {
  slug: '', partner: '', partner_full: '', partner_logo: '', tagline: '',
  description: '', full_content: [''], outcomes: [''], color: GRADIENT_OPTIONS[0],
  sort_order: 0, is_published: true,
};

async function collabFetch(path: string, options?: RequestInit) {
  const token = getAdminToken();
  const apiBase = import.meta.env.DEV ? 'http://localhost:3000' : '';
  const res = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', ...options?.headers },
  });
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('Serwer nie zwrócił JSON — endpoint może nie istnieć (restart serwera?)');
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(data.error || 'API error');
  }
  return res.json();
}

const FALLBACK_DATA: Collaboration[] = FALLBACK_COLLABS.map((c, i) => ({
  id: i + 1, slug: c.id, partner: c.partner, partner_full: c.partnerFull,
  partner_logo: c.partnerLogo, tagline: c.tagline, description: c.description,
  full_content: c.fullContent, outcomes: c.outcomes, color: c.color,
  sort_order: i + 1, is_published: true,
  created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
}));

export function AdminCollaborations() {
  const [collabs, setCollabs] = useState<Collaboration[]>(FALLBACK_DATA);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [editingId, setEditingId] = useState<number | 'new' | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const load = async () => {
    try {
      const data = await collabFetch('/api/admin/collaborations');
      if (Array.isArray(data) && data.length >= 0) {
        setCollabs(data.length > 0 ? data : FALLBACK_DATA);
        setUsingFallback(data.length === 0);
      }
    } catch {
      setUsingFallback(true);
      // Keep fallback data, don't show error since data is still visible
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const showStatus = (type: 'success' | 'error', msg: string) => {
    setStatus({ type, msg });
    setTimeout(() => setStatus(null), 4000);
  };

  const startEdit = (c: Collaboration) => {
    setEditingId(c.id);
    setForm({
      slug: c.slug, partner: c.partner, partner_full: c.partner_full, partner_logo: c.partner_logo,
      tagline: c.tagline, description: c.description,
      full_content: c.full_content.length > 0 ? c.full_content : [''],
      outcomes: c.outcomes.length > 0 ? c.outcomes : [''],
      color: c.color, sort_order: c.sort_order, is_published: c.is_published,
    });
  };

  const startNew = () => {
    setEditingId('new');
    setForm({ ...EMPTY_FORM, sort_order: collabs.length + 1, full_content: [''], outcomes: [''] });
  };

  const handleSave = async () => {
    try {
      if (editingId === 'new') {
        await collabFetch('/api/admin/collaborations', { method: 'POST', body: JSON.stringify(form) });
        showStatus('success', 'Współpraca dodana');
      } else {
        await collabFetch(`/api/admin/collaborations/${editingId}`, { method: 'PATCH', body: JSON.stringify(form) });
        showStatus('success', 'Współpraca zaktualizowana');
      }
      setEditingId(null);
      load();
    } catch (err) {
      showStatus('error', err instanceof Error ? err.message : 'Błąd zapisu');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Na pewno usunąć tę współpracę?')) return;
    try {
      await collabFetch(`/api/admin/collaborations/${id}`, { method: 'DELETE' });
      showStatus('success', 'Usunięto');
      load();
    } catch (err) {
      showStatus('error', err instanceof Error ? err.message : 'Błąd usuwania');
    }
  };

  const updateArrayField = (field: 'full_content' | 'outcomes', idx: number, value: string) => {
    const arr = [...form[field]];
    arr[idx] = value;
    setForm({ ...form, [field]: arr });
  };

  const addArrayItem = (field: 'full_content' | 'outcomes') => {
    setForm({ ...form, [field]: [...form[field], ''] });
  };

  const removeArrayItem = (field: 'full_content' | 'outcomes', idx: number) => {
    const arr = form[field].filter((_, i) => i !== idx);
    setForm({ ...form, [field]: arr.length > 0 ? arr : [''] });
  };

  if (loading) return <div className="text-center text-gray-500 py-12">Ładowanie współprac...</div>;

  const inputClass = 'w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500 transition-colors';
  const labelClass = 'text-xs font-bold uppercase text-gray-500 mb-1 block';

  return (
    <motion.div key="collaborations" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
          <Handshake className="w-5 h-5 text-purple-400" /> Współprace
        </h2>
        <button onClick={startNew} className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-xl text-xs font-bold hover:bg-purple-500/30 transition-all">
          <Plus className="w-4 h-4" /> Dodaj współpracę
        </button>
      </div>

      {/* Fallback warning */}
      {usingFallback && (
        <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400 text-xs text-center">
          Dane z pliku lokalnego (serwer nie odpowiada na /api/admin/collaborations). Edycja niedostępna do restartu serwera.
        </div>
      )}

      {/* Status */}
      <AnimatePresence>
        {status && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`p-3 rounded-xl text-sm font-bold text-center ${status.type === 'success' ? 'bg-green-500/15 text-green-400 border border-green-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'}`}>
            {status.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit/Create Form */}
      <AnimatePresence>
        {editingId !== null && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="bg-white/5 border border-purple-500/20 rounded-2xl p-6 space-y-4 overflow-hidden">
            <h3 className="text-sm font-black uppercase text-purple-400">
              {editingId === 'new' ? 'Nowa współpraca' : 'Edytuj współpracę'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Slug (URL)</label>
                <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className={inputClass} placeholder="np. nazwa-firmy" />
              </div>
              <div>
                <label className={labelClass}>Nazwa partnera</label>
                <input value={form.partner} onChange={e => setForm({ ...form, partner: e.target.value })} className={inputClass} placeholder="Np. ZTP Kraków" />
              </div>
              <div>
                <label className={labelClass}>Pełna nazwa</label>
                <input value={form.partner_full} onChange={e => setForm({ ...form, partner_full: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Logo (URL/ścieżka)</label>
                <input value={form.partner_logo} onChange={e => setForm({ ...form, partner_logo: e.target.value })} className={inputClass} placeholder="/assets/logo.png" />
              </div>
            </div>

            <div>
              <label className={labelClass}>Tagline</label>
              <input value={form.tagline} onChange={e => setForm({ ...form, tagline: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Opis (krótki)</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={`${inputClass} resize-none`} rows={2} />
            </div>

            {/* Full content paragraphs */}
            <div>
              <label className={labelClass}>Pełny opis (akapity)</label>
              {form.full_content.map((p, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <textarea value={p} onChange={e => updateArrayField('full_content', i, e.target.value)}
                    className={`${inputClass} flex-1 resize-none`} rows={2} placeholder={`Akapit ${i + 1}...`} />
                  <button onClick={() => removeArrayItem('full_content', i)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg shrink-0"><X className="w-4 h-4" /></button>
                </div>
              ))}
              <button onClick={() => addArrayItem('full_content')} className="text-xs text-purple-400 hover:text-purple-300 font-bold">+ Dodaj akapit</button>
            </div>

            {/* Outcomes */}
            <div>
              <label className={labelClass}>Wyniki współpracy</label>
              {form.outcomes.map((o, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input value={o} onChange={e => updateArrayField('outcomes', i, e.target.value)}
                    className={`${inputClass} flex-1`} placeholder={`Wynik ${i + 1}...`} />
                  <button onClick={() => removeArrayItem('outcomes', i)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg shrink-0"><X className="w-4 h-4" /></button>
                </div>
              ))}
              <button onClick={() => addArrayItem('outcomes')} className="text-xs text-purple-400 hover:text-purple-300 font-bold">+ Dodaj wynik</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Gradient</label>
                <select value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className={inputClass}>
                  {GRADIENT_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Kolejność</label>
                <input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} className={inputClass} />
              </div>
              <div className="flex items-end gap-2 pb-1">
                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                  <input type="checkbox" checked={form.is_published} onChange={e => setForm({ ...form, is_published: e.target.checked })}
                    className="w-4 h-4 rounded bg-white/10 border-white/20" />
                  Opublikowany
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-xl text-xs font-bold hover:bg-purple-500/30">
                <Save className="w-4 h-4" /> Zapisz
              </button>
              <button onClick={() => setEditingId(null)} className="px-5 py-2 bg-white/5 text-gray-400 rounded-xl text-xs font-bold hover:bg-white/10">
                Anuluj
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      <div className="space-y-3">
        {collabs.length === 0 ? (
          <div className="text-center py-12 text-gray-600">Brak współprac. Kliknij "Dodaj współpracę" aby zacząć.</div>
        ) : collabs.map(c => (
          <div key={c.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4 hover:bg-white/[0.07] transition-all">
            {c.partner_logo && (
              <img src={c.partner_logo} alt={c.partner} className="w-12 h-12 object-contain rounded-xl bg-white/10 p-1 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-white font-bold text-sm">{c.partner}</h3>
                {!c.is_published && (
                  <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-[9px] font-bold rounded-full border border-yellow-500/30">UKRYTY</span>
                )}
                <span className="text-[9px] text-gray-600 font-mono">/{c.slug}</span>
              </div>
              <p className="text-gray-500 text-xs truncate">{c.tagline}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a href={`/wspolpraca/${c.slug}`} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white/10 rounded-lg transition-all">
                <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
              </a>
              <button onClick={() => startEdit(c)} className="p-2 hover:bg-purple-500/10 rounded-lg transition-all">
                <Edit3 className="w-3.5 h-3.5 text-purple-400" />
              </button>
              <button onClick={() => handleDelete(c.id)} className="p-2 hover:bg-red-500/10 rounded-lg transition-all">
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
