import { useState, useEffect, useCallback } from 'react';
import { getAdminToken } from './AdminAuth';
import { motion } from 'motion/react';
import {
  Trophy, Settings, RefreshCw, Save, AlertCircle, CheckCircle,
  Plus, Trash2, ChevronDown, ChevronUp, Eye, Loader2, Users, BarChart3,
} from 'lucide-react';

interface JuryScore {
  id: number;
  edition_number: number;
  team_slug: string;
  challenge: string;
  juror_name: string;
  innovation: number;
  technical_value: number;
  usefulness: number;
  presentation_quality: number;
  notes: string;
  team_name?: string;
}

interface Challenge {
  slug: string;
  label: string;
  color: string;
}

interface SpecialMention {
  teamSlug: string;
  award: string;
  reason: string;
}

interface EditionConfig {
  id?: number;
  edition_number: number;
  name: string;
  status: string;
  visible_placements: number;
  show_scores: boolean;
  challenges: Challenge[];
  special_mentions: SpecialMention[];
  jury_members: { name: string; title: string }[];
  scoring_categories: { id: string; label: string; maxScore: number }[];
  max_score_per_category: number;
  cloudinary_collection_url: string;
}

function adminFetch(path: string, options?: RequestInit) {
  const token = getAdminToken();
  return fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(options?.headers || {}),
    },
  }).then(async r => {
    if (!r.ok) throw new Error((await r.json()).error || `HTTP ${r.status}`);
    return r.json();
  });
}

// ─── Score input cell ─────────────────────────────────────────────────────────

function ScoreCell({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <input
      type="number"
      min={0}
      max={20}
      value={value}
      onChange={e => onChange(Math.min(20, Math.max(0, parseInt(e.target.value) || 0)))}
      className="w-14 text-center bg-white/5 border border-white/10 rounded-lg px-1 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-500/50"
    />
  );
}

// ─── Jury scores tab ──────────────────────────────────────────────────────────

function JuryScoresTab({ edition }: { edition: number }) {
  const [scores, setScores] = useState<JuryScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Set<number>>(new Set());
  const [saved, setSaved] = useState<Set<number>>(new Set());
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [expandedChallenge, setExpandedChallenge] = useState<string | null>(null);
  const [pendingEdits, setPendingEdits] = useState<Record<number, Partial<JuryScore>>>({});

  const load = useCallback(() => {
    setLoading(true);
    adminFetch(`/api/admin/jury-scores/${edition}`)
      .then(setScores)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [edition]);

  useEffect(() => { load(); }, [load]);

  const challenges = [...new Set(scores.map(s => s.challenge))];
  if (expandedChallenge === null && challenges.length > 0) {
    // auto-expand first on load
  }

  const editScore = (id: number, field: keyof JuryScore, value: number | string) => {
    setPendingEdits(prev => ({ ...prev, [id]: { ...(prev[id] || {}), [field]: value } }));
  };

  const getVal = (score: JuryScore, field: keyof JuryScore) => {
    const edit = pendingEdits[score.id];
    if (edit && field in edit) return edit[field] as any;
    return score[field];
  };

  const saveScore = async (score: JuryScore) => {
    const edits = pendingEdits[score.id];
    if (!edits || Object.keys(edits).length === 0) return;
    setSaving(prev => new Set(prev).add(score.id));
    setErrors(prev => { const n = { ...prev }; delete n[score.id]; return n; });
    try {
      await adminFetch(`/api/admin/jury-scores/${score.id}`, {
        method: 'PATCH',
        body: JSON.stringify(edits),
      });
      setScores(prev => prev.map(s => s.id === score.id ? { ...s, ...edits } : s));
      setPendingEdits(prev => { const n = { ...prev }; delete n[score.id]; return n; });
      setSaved(prev => { const n = new Set(prev); n.add(score.id); return n; });
      setTimeout(() => setSaved(prev => { const n = new Set(prev); n.delete(score.id); return n; }), 2000);
    } catch (err: unknown) {
      setErrors(prev => ({ ...prev, [score.id]: err instanceof Error ? err.message : 'Błąd zapisu' }));
    } finally {
      setSaving(prev => { const n = new Set(prev); n.delete(score.id); return n; });
    }
  };

  const total = (score: JuryScore) =>
    (getVal(score, 'innovation') as number) +
    (getVal(score, 'technical_value') as number) +
    (getVal(score, 'usefulness') as number) +
    (getVal(score, 'presentation_quality') as number);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">{scores.length} wpisów · zmiany zapisywane osobno</p>
        <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg text-xs transition-all">
          <RefreshCw className="w-3 h-3" /> Odśwież
        </button>
      </div>

      {challenges.map(ch => {
        const chScores = scores.filter(s => s.challenge === ch).sort((a, b) => total(b) - total(a));
        const isOpen = expandedChallenge === ch || expandedChallenge === null;
        return (
          <div key={ch} className="bg-white/3 border border-white/10 rounded-2xl overflow-hidden">
            <button
              onClick={() => setExpandedChallenge(isOpen && expandedChallenge === ch ? null : ch)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Trophy className="w-4 h-4 text-pink-400" />
                <span className="text-white font-bold text-sm">{ch}</span>
                <span className="text-gray-500 text-xs">{chScores.length} zespołów</span>
              </div>
              {isOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
            </button>

            {(expandedChallenge === ch || expandedChallenge === null) && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-sm">
                  <thead>
                    <tr className="border-t border-white/5 text-[10px] uppercase tracking-widest text-gray-600">
                      <th className="px-4 py-2 text-left">Zespół</th>
                      <th className="px-2 py-2 text-center">Jur.</th>
                      <th className="px-2 py-2 text-center">Inn.</th>
                      <th className="px-2 py-2 text-center">Tech.</th>
                      <th className="px-2 py-2 text-center">Użyt.</th>
                      <th className="px-2 py-2 text-center">Prez.</th>
                      <th className="px-2 py-2 text-center">Suma</th>
                      <th className="px-3 py-2 text-center">Akcja</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chScores.map((score, idx) => {
                      const hasEdit = !!(pendingEdits[score.id] && Object.keys(pendingEdits[score.id]).length);
                      return (
                        <tr key={score.id} className={`border-t border-white/5 ${idx < 2 ? 'bg-white/3' : ''}`}>
                          <td className="px-4 py-2">
                            <span className="text-white font-medium">{score.team_name || score.team_slug}</span>
                            {errors[score.id] && <p className="text-red-400 text-[10px] mt-0.5">{errors[score.id]}</p>}
                          </td>
                          <td className="px-2 py-2 text-center">
                            <input
                              type="text"
                              value={getVal(score, 'juror_name') as string}
                              onChange={e => editScore(score.id, 'juror_name', e.target.value)}
                              className="w-20 text-center bg-white/5 border border-white/10 rounded-lg px-1 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-cyan-500/50"
                            />
                          </td>
                          <td className="px-2 py-2 text-center">
                            <ScoreCell value={getVal(score, 'innovation') as number} onChange={v => editScore(score.id, 'innovation', v)} />
                          </td>
                          <td className="px-2 py-2 text-center">
                            <ScoreCell value={getVal(score, 'technical_value') as number} onChange={v => editScore(score.id, 'technical_value', v)} />
                          </td>
                          <td className="px-2 py-2 text-center">
                            <ScoreCell value={getVal(score, 'usefulness') as number} onChange={v => editScore(score.id, 'usefulness', v)} />
                          </td>
                          <td className="px-2 py-2 text-center">
                            <ScoreCell value={getVal(score, 'presentation_quality') as number} onChange={v => editScore(score.id, 'presentation_quality', v)} />
                          </td>
                          <td className="px-2 py-2 text-center">
                            <span className={`font-black text-sm ${idx < 2 ? 'text-pink-400' : 'text-gray-300'}`}>{total(score)}</span>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              onClick={() => saveScore(score)}
                              disabled={!hasEdit || saving.has(score.id)}
                              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                                saved.has(score.id)
                                  ? 'bg-green-500/20 text-green-400'
                                  : hasEdit
                                    ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400'
                                    : 'bg-white/5 text-gray-600'
                              }`}
                            >
                              {saving.has(score.id) ? <Loader2 className="w-3 h-3 animate-spin" />
                                : saved.has(score.id) ? <CheckCircle className="w-3 h-3" />
                                : <Save className="w-3 h-3" />}
                              {saving.has(score.id) ? '' : saved.has(score.id) ? 'OK' : 'Zapisz'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Edition config tab ────────────────────────────────────────────────────────

function EditionConfigTab({ edition }: { edition: number }) {
  const [config, setConfig] = useState<EditionConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'ok' | 'error'>('idle');

  const load = useCallback(() => {
    setLoading(true);
    adminFetch(`/api/admin/edition-config/${edition}`)
      .then(setConfig)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [edition]);

  useEffect(() => { load(); }, [load]);

  const update = (field: keyof EditionConfig, value: unknown) => {
    setConfig(prev => prev ? { ...prev, [field]: value } : prev);
  };

  const save = async () => {
    if (!config) return;
    setSaving(true);
    setSaveStatus('idle');
    try {
      await adminFetch(`/api/admin/edition-config/${edition}`, {
        method: 'PATCH',
        body: JSON.stringify(config),
      });
      setSaveStatus('ok');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const addSpecialMention = () => {
    update('special_mentions', [...(config?.special_mentions || []), { teamSlug: '', award: 'Wyróżnienie specjalne', reason: '' }]);
  };

  const removeSpecialMention = (idx: number) => {
    update('special_mentions', (config?.special_mentions || []).filter((_, i) => i !== idx));
  };

  const addJuror = () => {
    update('jury_members', [...(config?.jury_members || []), { name: '', title: '' }]);
  };

  const removeJuror = (idx: number) => {
    update('jury_members', (config?.jury_members || []).filter((_, i) => i !== idx));
  };

  const addScoringCategory = () => {
    update('scoring_categories', [...(config?.scoring_categories || []), { id: '', label: '', maxScore: 20 }]);
  };

  const removeScoringCategory = (idx: number) => {
    update('scoring_categories', (config?.scoring_categories || []).filter((_, i) => i !== idx));
  };

  const slugify = (label: string) =>
    label.toLowerCase().replace(/ą/g,'a').replace(/ę/g,'e').replace(/ó/g,'o').replace(/ś/g,'s').replace(/ł/g,'l').replace(/ż|ź/g,'z').replace(/ć/g,'c').replace(/ń/g,'n')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (!config) {
    return <div className="text-red-400 text-sm py-10 text-center">Brak konfiguracji edycji {edition}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Basic settings */}
      <div className="bg-white/3 border border-white/10 rounded-2xl p-5 space-y-4">
        <h3 className="text-white font-bold text-sm flex items-center gap-2"><Settings className="w-4 h-4 text-gray-400" /> Ustawienia podstawowe</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">Nazwa edycji</label>
            <input
              type="text"
              value={config.name}
              onChange={e => update('name', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">Status</label>
            <select
              value={config.status}
              onChange={e => update('status', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50"
            >
              <option value="upcoming">Nadchodząca</option>
              <option value="active">Aktywna (po evencie)</option>
              <option value="archive">Archiwum</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">
              Widoczne miejsca (top N)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={5}
                value={config.visible_placements}
                onChange={e => update('visible_placements', parseInt(e.target.value))}
                className="flex-1 accent-pink-500"
              />
              <span className="text-white font-black text-lg w-6 text-center">{config.visible_placements}</span>
            </div>
            <p className="text-[10px] text-gray-600 mt-1">Ile najlepszych miejsc pokazywać wyróżnionych na stronie</p>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">Maks. pkt / kategoria</label>
            <input
              type="number"
              min={1}
              max={100}
              value={config.max_score_per_category}
              onChange={e => update('max_score_per_category', parseInt(e.target.value) || 20)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">Pokaż wyniki szczegółowe</label>
            <button
              onClick={() => update('show_scores', !config.show_scores)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                config.show_scores
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-white/5 text-gray-500 border border-white/10'
              }`}
            >
              {config.show_scores ? 'Widoczne' : 'Ukryte'}
            </button>
          </div>
        </div>
      </div>

      {/* Special mentions */}
      <div className="bg-white/3 border border-white/10 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-bold text-sm flex items-center gap-2"><Trophy className="w-4 h-4 text-cyan-400" /> Wyróżnienia specjalne</h3>
          <button onClick={addSpecialMention} className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg text-xs font-bold transition-all">
            <Plus className="w-3 h-3" /> Dodaj
          </button>
        </div>

        {config.special_mentions.length === 0 && (
          <p className="text-gray-600 text-xs text-center py-4">Brak wyróżnień — kliknij Dodaj</p>
        )}

        {config.special_mentions.map((sm, idx) => (
          <div key={idx} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 items-start">
            <div>
              <label className="block text-[10px] text-gray-600 mb-1">Slug zespołu</label>
              <input
                type="text"
                value={sm.teamSlug}
                onChange={e => {
                  const updated = [...config.special_mentions];
                  updated[idx] = { ...updated[idx], teamSlug: e.target.value };
                  update('special_mentions', updated);
                }}
                placeholder="np. konrad-podstawski"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <div>
              <label className="block text-[10px] text-gray-600 mb-1">Tytuł nagrody</label>
              <input
                type="text"
                value={sm.award}
                onChange={e => {
                  const updated = [...config.special_mentions];
                  updated[idx] = { ...updated[idx], award: e.target.value };
                  update('special_mentions', updated);
                }}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <div>
              <label className="block text-[10px] text-gray-600 mb-1">Opis (opcjonalnie)</label>
              <input
                type="text"
                value={sm.reason}
                onChange={e => {
                  const updated = [...config.special_mentions];
                  updated[idx] = { ...updated[idx], reason: e.target.value };
                  update('special_mentions', updated);
                }}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <button onClick={() => removeSpecialMention(idx)} className="mt-5 p-2 text-red-400/60 hover:text-red-400 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Scoring categories */}
      <div className="bg-white/3 border border-white/10 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-pink-400" /> Kategorie oceniania
            </h3>
            <p className="text-[10px] text-gray-600 mt-0.5">Definiują co jury ocenia — używane w panelu jurora i przy wyświetlaniu wyników</p>
          </div>
          <button onClick={addScoringCategory} className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 rounded-lg text-xs font-bold transition-all">
            <Plus className="w-3 h-3" /> Dodaj
          </button>
        </div>

        {(config.scoring_categories || []).length === 0 && (
          <p className="text-gray-600 text-xs text-center py-4">Brak kategorii — kliknij Dodaj</p>
        )}

        <div className="space-y-2">
          {(config.scoring_categories || []).map((cat, idx) => (
            <div key={idx} className="grid grid-cols-[1fr_2fr_100px_auto] gap-3 items-center">
              <div>
                {idx === 0 && <label className="block text-[10px] text-gray-600 mb-1">ID (slug)</label>}
                <input
                  type="text"
                  value={cat.id}
                  onChange={e => {
                    const updated = [...(config.scoring_categories || [])];
                    updated[idx] = { ...updated[idx], id: e.target.value };
                    update('scoring_categories', updated);
                  }}
                  placeholder="np. innovation"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-pink-500/50"
                />
              </div>
              <div>
                {idx === 0 && <label className="block text-[10px] text-gray-600 mb-1">Nazwa wyświetlana</label>}
                <input
                  type="text"
                  value={cat.label}
                  onChange={e => {
                    const updated = [...(config.scoring_categories || [])];
                    const newLabel = e.target.value;
                    // Auto-fill ID from label if ID is empty or was auto-generated
                    const autoId = !updated[idx].id || updated[idx].id === slugify(cat.label);
                    updated[idx] = { ...updated[idx], label: newLabel, id: autoId ? slugify(newLabel) : updated[idx].id };
                    update('scoring_categories', updated);
                  }}
                  placeholder="np. Innowacyjność"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500/50"
                />
              </div>
              <div>
                {idx === 0 && <label className="block text-[10px] text-gray-600 mb-1">Maks. pkt</label>}
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={cat.maxScore}
                  onChange={e => {
                    const updated = [...(config.scoring_categories || [])];
                    updated[idx] = { ...updated[idx], maxScore: parseInt(e.target.value) || 20 };
                    update('scoring_categories', updated);
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500/50"
                />
              </div>
              <button onClick={() => removeScoringCategory(idx)} className={`p-2 text-red-400/60 hover:text-red-400 transition-colors ${idx === 0 ? 'mt-4' : ''}`}>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {(config.scoring_categories || []).length > 0 && (
          <div className="flex items-start gap-2 border-t border-white/5 pt-3">
            <AlertCircle className="w-3.5 h-3.5 text-yellow-500/70 shrink-0 mt-0.5" />
            <p className="text-[10px] text-gray-600">
              Zmiana kategorii po zebraniu ocen nie przelicza istniejących wyników — edycja 3 używa stałych kolumn (innovation, technicalValue, usefulness, presentationQuality). Nowe kategorie będą używane przez panel jurora w kolejnych edycjach.
            </p>
          </div>
        )}
      </div>

      {/* Jury members */}
      <div className="bg-white/3 border border-white/10 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" /> Jurorzy
            </h3>
            <p className="text-[10px] text-gray-600 mt-0.5">Widoczni na stronie i używani przy uśrednianiu ocen w kolejnych edycjach</p>
          </div>
          <button onClick={addJuror} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg text-xs font-bold transition-all">
            <Plus className="w-3 h-3" /> Dodaj jurora
          </button>
        </div>

        {(config.jury_members || []).length === 0 && (
          <p className="text-gray-600 text-xs text-center py-4">Brak jurorów — kliknij Dodaj jurora</p>
        )}

        <div className="space-y-2">
          {(config.jury_members || []).map((juror, idx) => (
            <div key={idx} className="grid grid-cols-[1fr_1fr_auto] gap-3 items-center">
              <div>
                {idx === 0 && <label className="block text-[10px] text-gray-600 mb-1">Imię i nazwisko</label>}
                <input
                  type="text"
                  value={juror.name}
                  onChange={e => {
                    const updated = [...(config.jury_members || [])];
                    updated[idx] = { ...updated[idx], name: e.target.value };
                    update('jury_members', updated);
                  }}
                  placeholder="np. Jan Kowalski"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50"
                />
              </div>
              <div>
                {idx === 0 && <label className="block text-[10px] text-gray-600 mb-1">Tytuł / rola</label>}
                <input
                  type="text"
                  value={juror.title}
                  onChange={e => {
                    const updated = [...(config.jury_members || [])];
                    updated[idx] = { ...updated[idx], title: e.target.value };
                    update('jury_members', updated);
                  }}
                  placeholder="np. CTO @ Firma / AI Researcher"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50"
                />
              </div>
              <button onClick={() => removeJuror(idx)} className={`p-2 text-red-400/60 hover:text-red-400 transition-colors ${idx === 0 ? 'mt-4' : ''}`}>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {(config.jury_members || []).length > 0 && (
          <p className="text-[10px] text-gray-600 border-t border-white/5 pt-3">
            W przyszłych edycjach z wieloma jurorami system automatycznie uśredni ich oceny — każdy juror będzie miał osobny wiersz w tabeli Oceny jury.
          </p>
        )}
      </div>

      {/* Cloudinary gallery URL */}
      <div className="bg-white/3 border border-white/10 rounded-2xl p-5 space-y-4">
        <div>
          <h3 className="text-white font-bold text-sm flex items-center gap-2">
            <Eye className="w-4 h-4 text-cyan-400" /> Galeria zdjęć — Cloudinary
          </h3>
          <p className="text-[10px] text-gray-600 mt-0.5">Link do kolekcji Cloudinary — zdjęcia będą widoczne w karuzeli i galerii tej edycji</p>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">URL kolekcji Cloudinary</label>
          <input
            type="url"
            value={config.cloudinary_collection_url || ''}
            onChange={e => update('cloudinary_collection_url', e.target.value)}
            placeholder="https://collection.cloudinary.com/cloud-name/token"
            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500/50"
          />
        </div>
      </div>

      {/* Save button */}
      <div className="flex items-center gap-4">
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-black rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Zapisz konfigurację
        </button>
        {saveStatus === 'ok' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-green-400 text-sm font-bold">
            <CheckCircle className="w-4 h-4" /> Zapisano
          </motion.div>
        )}
        {saveStatus === 'error' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-red-400 text-sm font-bold">
            <AlertCircle className="w-4 h-4" /> Błąd zapisu
          </motion.div>
        )}
        <a
          href={`/api/editions/${config.edition_number}/results`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-400 rounded-xl text-xs font-bold transition-all"
        >
          <Eye className="w-3.5 h-3.5" /> Podgląd API
        </a>
      </div>
    </div>
  );
}

// ─── Main AdminResults component ──────────────────────────────────────────────

interface AdminResultsProps {
  edition?: number;
}

export function AdminResults({ edition = 3 }: AdminResultsProps) {
  const [activeTab, setActiveTab] = useState<'scores' | 'config'>('scores');

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-pink-500/20">
            <Trophy className="w-5 h-5 text-pink-400" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white uppercase italic tracking-wide">Wyniki i jury</h1>
            <p className="text-gray-500 text-xs">Edycja {edition}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-white/10 pb-2">
        {(['scores', 'config'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wide transition-all ${
              activeTab === tab
                ? 'bg-white/10 text-white'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            {tab === 'scores' ? 'Oceny jury' : 'Konfiguracja edycji'}
          </button>
        ))}
      </div>

      {activeTab === 'scores' && <JuryScoresTab edition={edition} />}
      {activeTab === 'config' && <EditionConfigTab edition={edition} />}
    </div>
  );
}
