/**
 * /panel/admin/krakhack/edycje — CRUD edycji hackathonu.
 *
 * Admin może:
 *  • Widzieć listę wszystkich edycji z tabeli edition_config
 *  • Dodać nową edycję (opcjonalnie klonując config ze wskazanej edycji)
 *  • Edytować metadata (przechodząc do AdminResults → Edition Config tab)
 *  • Archiwizować (status=archive)
 */
import { useCallback, useEffect, useState } from 'react';
import { Plus, Calendar, Archive, Loader2, AlertCircle, X, Save } from 'lucide-react';
import { adminFetch } from '@/lib/adminApi';
import { PanelCard } from '@/app/components/panel/shared/PanelCard';
import { PanelSectionHeader } from '@/app/components/panel/shared/PanelSectionHeader';

// Uwaga: backend zwraca `status` jako jeden z kilku wariantów:
//   'active' | 'archive' | 'archived' | 'placeholder' | (ewentualnie inny string).
// Trzymamy `string` + tolerancję w StatusBadge, żeby nie crashować na nowych wartościach.
interface Edition {
  number:               number;
  name:                 string;
  status:               string;
  visiblePlacements:    number;
  showScores:           boolean;
  maxScorePerCategory:  number;
  updatedAt:            string;
}

type EditionStatus = 'active' | 'archive' | 'archived' | 'placeholder';

export function EditionsPage() {
  const [editions, setEditions] = useState<Edition[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch('/api/editions');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setEditions(data.editions ?? []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function archive(n: number) {
    if (!confirm(`Zarchiwizować edycję #${n}?\nStatus zmieni się na "archive". Danych nie usuwa.`)) return;
    try {
      const res = await adminFetch(`/api/admin/editions/${n}`, { method: 'DELETE' });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        alert(d.error ?? `HTTP ${res.status}`);
        return;
      }
      load();
    } catch (e) {
      alert((e as Error).message);
    }
  }

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto">
      <PanelSectionHeader
        eyebrow="Krak Hack"
        title="Edycje"
        subtitle="Każda edycja ma własne zespoły, jurorów, wyniki i certyfikaty. Nowa edycja może klonować config z poprzedniej (oszczędza czas konfiguracji)."
        cta={
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Dodaj edycję
          </button>
        }
      />

      {loading ? (
        <PanelCard padding="lg" className="text-center text-sm text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
          Ładowanie…
        </PanelCard>
      ) : error ? (
        <PanelCard padding="lg" className="text-center">
          <AlertCircle className="w-5 h-5 text-red-400 inline mr-2" />
          <span className="text-sm text-red-400">{error}</span>
        </PanelCard>
      ) : editions.length === 0 ? (
        <PanelCard padding="lg" className="text-center text-sm text-gray-500">
          Brak zdefiniowanych edycji. Dodaj pierwszą.
        </PanelCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {editions.map(e => (
            <PanelCard key={e.number} padding="md">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  <span className="text-lg font-bold text-white tabular-nums">#{e.number}</span>
                </div>
                <StatusBadge status={e.status} />
              </div>
              <p className="text-sm text-white font-medium mb-1 truncate">{e.name || '(brak nazwy)'}</p>
              <p className="text-xs text-gray-500 mb-4">
                {e.visiblePlacements} miejsc · max {e.maxScorePerCategory} pkt/kat
                {e.showScores ? ' · punkty widoczne' : ''}
              </p>
              <div className="flex items-center gap-2">
                <a
                  href={`/panel/admin/wyniki?edition=${e.number}&ctx=krakhack`}
                  className="flex-1 text-center text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Otwórz config →
                </a>
                {e.status !== 'archive' && (
                  <button
                    onClick={() => archive(e.number)}
                    className="p-2 text-gray-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                    title="Zarchiwizuj edycję"
                  >
                    <Archive className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </PanelCard>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateEditionModal
          editions={editions}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); load(); }}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<EditionStatus, { cls: string; label: string }> = {
    active:      { cls: 'bg-green-500/15 text-green-300 border-green-500/30',  label: 'Aktywna' },
    archive:     { cls: 'bg-gray-500/15 text-gray-300 border-gray-500/30',     label: 'Archiwum' },
    archived:    { cls: 'bg-gray-500/15 text-gray-300 border-gray-500/30',     label: 'Archiwum' },
    placeholder: { cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30',  label: 'Placeholder' },
  };
  const fallback = { cls: 'bg-white/5 text-gray-400 border-white/10', label: status || '—' };
  const m = map[status as EditionStatus] ?? fallback;
  return (
    <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border ${m.cls}`}>
      {m.label}
    </span>
  );
}

// ─── Create modal ─────────────────────────────────────────────────────────────

function CreateEditionModal({
  editions, onClose, onCreated,
}: {
  editions: Edition[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const nextNumber = editions.length > 0
    ? Math.max(...editions.map(e => e.number)) + 1
    : 1;

  const [form, setForm] = useState({
    number:    String(nextNumber),
    name:      '',
    status:    'placeholder' as EditionStatus,
    cloneFrom: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    const number = parseInt(form.number, 10);
    if (!Number.isInteger(number) || number <= 0) {
      setError('Numer edycji musi być dodatnią liczbą całkowitą');
      return;
    }
    if (!form.name.trim()) {
      setError('Nazwa wymagana');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await adminFetch('/api/admin/editions', {
        method: 'POST',
        body: JSON.stringify({
          number,
          name:      form.name.trim(),
          status:    form.status,
          cloneFrom: form.cloneFrom ? parseInt(form.cloneFrom, 10) : undefined,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? `HTTP ${res.status}`);
      }
      onCreated();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls =
    'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/30';

  return (
    <div className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-950 border border-white/10 rounded-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Dodaj edycję hackathonu</h3>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-400 uppercase tracking-wider">Numer *</span>
              <input
                type="number"
                min="1"
                value={form.number}
                onChange={e => setForm(f => ({ ...f, number: e.target.value }))}
                required
                className={inputCls}
              />
              <span className="text-[10px] text-gray-600">Kolejny wolny: #{nextNumber}</span>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-400 uppercase tracking-wider">Status</span>
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value as EditionStatus }))}
                className={inputCls}
              >
                <option value="placeholder">placeholder (draft)</option>
                <option value="active">active (aktywna)</option>
                <option value="archive">archive</option>
              </select>
            </label>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Nazwa *</span>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="AI Krak Hack 2027"
              required
              className={inputCls}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Klonuj config z</span>
            <select
              value={form.cloneFrom}
              onChange={e => setForm(f => ({ ...f, cloneFrom: e.target.value }))}
              className={inputCls}
            >
              <option value="">— od zera (bez klonowania) —</option>
              {editions.map(e => (
                <option key={e.number} value={e.number}>
                  #{e.number} · {e.name}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-gray-600">
              Klonuje scoring_categories, challenges, special_mentions, jury (jako stuby — emaile czyszczone).
            </span>
          </label>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 text-center">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={submitting || !form.name.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Utwórz
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
