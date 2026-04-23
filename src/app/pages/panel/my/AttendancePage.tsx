/**
 * /panel/moja-obecnosc — user potwierdza "pracuję nad projektem" w danej edycji.
 *
 * Warunek (razem ze zgłoszonym projektem) do wystawienia certyfikatu uczestnictwa.
 * Widoczne: hackathon-participant + admin.
 */
import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Circle, Calendar, Loader2 } from 'lucide-react';
import { adminFetch } from '@/lib/adminApi';
import { PanelCard } from '@/app/components/panel/shared/PanelCard';
import { PanelSectionHeader } from '@/app/components/panel/shared/PanelSectionHeader';
import { CURRENT_EDITION_NUMBER, EDITIONS_META } from '@/data/edition-registry';

export function MojaObecnoscPage() {
  const [edition, setEdition]       = useState<number>(CURRENT_EDITION_NUMBER);
  const [confirmed, setConfirmed]   = useState(false);
  const [confirmedAt, setConfirmedAt] = useState<string | null>(null);
  const [note, setNote]             = useState('');
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const activeEditions = EDITIONS_META.filter(e => e.status === 'active');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch(`/api/panel/my-attendance?edition=${edition}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setConfirmed(data.confirmed);
      setConfirmedAt(data.confirmedAt);
      setNote(data.note ?? '');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [edition]);

  useEffect(() => { load(); }, [load]);

  async function toggleConfirmed() {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      const res = await adminFetch('/api/panel/my-attendance', {
        method: 'POST',
        body: JSON.stringify({
          editionNumber: edition,
          confirmed:     !confirmed,
          note:          !confirmed ? note.trim() || null : null,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? `HTTP ${res.status}`);
      }
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const editionLabel = EDITIONS_META.find(e => e.number === edition);

  return (
    <div className="p-6 sm:p-8 max-w-2xl mx-auto">
      <PanelSectionHeader
        eyebrow="Mój obszar · Hackathon"
        title="Moja obecność"
        subtitle="Potwierdź, że pracujesz nad projektem w tej edycji. Warunek do wystawienia certyfikatu uczestnictwa po hackathonie."
      />

      {activeEditions.length > 1 && (
        <PanelCard padding="sm" className="mb-4">
          <label className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-400 uppercase tracking-wider">Edycja</span>
            <select
              value={edition}
              onChange={e => setEdition(parseInt(e.target.value, 10))}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-white/30"
            >
              {activeEditions.map(e => (
                <option key={e.number} value={e.number}>
                  #{e.number} · {e.year} ({e.status})
                </option>
              ))}
            </select>
          </label>
        </PanelCard>
      )}

      {loading ? (
        <PanelCard padding="lg" className="text-center">
          <Loader2 className="w-5 h-5 animate-spin text-gray-500 inline" />
        </PanelCard>
      ) : (
        <PanelCard padding="lg">
          <div className="flex items-start gap-4">
            <button
              onClick={toggleConfirmed}
              disabled={saving}
              className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors disabled:opacity-50 ${
                confirmed
                  ? 'bg-green-500/20 border-green-500/60 text-green-400 hover:bg-green-500/30'
                  : 'bg-white/5 border-white/20 text-gray-500 hover:border-white/40'
              }`}
              title={confirmed ? 'Cofnij potwierdzenie' : 'Potwierdź obecność'}
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : confirmed ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                <Circle className="w-6 h-6" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <p className="text-base text-white font-medium mb-1">
                {confirmed
                  ? `Potwierdzone — pracujesz nad projektem w edycji #${edition}`
                  : `Potwierdź że pracujesz nad projektem w ${editionLabel?.name ?? `edycji #${edition}`}`}
              </p>
              {confirmed && confirmedAt && (
                <p className="text-xs text-gray-500">
                  Potwierdzone: {new Date(confirmedAt).toLocaleString('pl-PL')}
                </p>
              )}
              {!confirmed && (
                <p className="text-xs text-gray-500">
                  Kliknij okrąg obok żeby potwierdzić. Możesz też dodać notatkę (np. link do repo, nazwa zespołu) przed potwierdzeniem.
                </p>
              )}
            </div>
          </div>

          {!confirmed && (
            <div className="mt-5">
              <label className="text-xs text-gray-400 uppercase tracking-wider">Notatka (opcjonalna)</label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={2}
                placeholder="Link do repozytorium, nazwa zespołu, krótki opis…"
                className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/30 resize-none"
              />
            </div>
          )}

          {confirmed && note && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Twoja notatka</p>
              <p className="text-sm text-gray-300 whitespace-pre-wrap">{note}</p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
              {error}
            </div>
          )}
        </PanelCard>
      )}

      <div className="mt-6 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
        <p className="text-xs text-blue-300/80 leading-relaxed">
          <strong className="text-blue-300">Dlaczego to ma znaczenie?</strong><br />
          Jeśli potwierdzisz obecność <em>i</em> zgłosisz projekt (w sekcji "Moje projekty"),
          po zakończeniu hackathonu otrzymasz certyfikat uczestnictwa. Bez potwierdzenia
          obecności certyfikat nie zostanie wygenerowany.
        </p>
      </div>
    </div>
  );
}
