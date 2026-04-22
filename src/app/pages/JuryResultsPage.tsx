/**
 * JuryResultsPage — /wyniki/:edition
 *
 * Publiczny scoreboard ocen jury dla danej edycji.
 * Podium (top 3) + pełna tabela z breakdown per kryterium.
 *
 * Dane z: GET /api/public/results/:edition
 * (auto-odświeżanie nie jest potrzebne — po hackathonie wyniki są stałe)
 */
import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router';

interface TeamResult {
  slug: string;
  name: string;
  projectName: string;
  challenge: string | null;
  placement: number | null;
  placementLabel: string | null;
  specialMention: string | null;
  jurorCount: number;
  avgTotal: number;
  breakdown: {
    innovation:   number;
    technical:    number;
    usefulness:   number;
    presentation: number;
  };
}

interface ApiResponse {
  edition: number;
  teams: TeamResult[];
}

const MAX_PER_CRITERION = 20;          // backend: 4 × 20 = 80 max
const CRITERIA = [
  { key: 'innovation',   label: 'Innowacyjność' },
  { key: 'technical',    label: 'Wartość techniczna' },
  { key: 'usefulness',   label: 'Użyteczność' },
  { key: 'presentation', label: 'Jakość prezentacji' },
] as const;

function placementStyle(placement: number | null) {
  switch (placement) {
    case 1: return { icon: '🥇', ring: 'ring-yellow-500/60', bg: 'bg-yellow-500/10', text: 'text-yellow-400' };
    case 2: return { icon: '🥈', ring: 'ring-gray-400/60',   bg: 'bg-gray-400/10',   text: 'text-gray-300'   };
    case 3: return { icon: '🥉', ring: 'ring-amber-700/60',  bg: 'bg-amber-700/10',  text: 'text-amber-500'  };
    default: return null;
  }
}

export function JuryResultsPage() {
  const { edition: editionParam } = useParams<{ edition: string }>();
  const edition = parseInt(editionParam ?? '3');

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/public/results/${edition}`)
      .then(r => {
        if (!r.ok) throw new Error('Nie udało się pobrać wyników');
        return r.json();
      })
      .then((d: ApiResponse) => { if (!cancelled) setData(d); })
      .catch(e => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [edition]);

  const podium = useMemo(() => {
    if (!data) return { first: null, second: null, third: null };
    return {
      first:  data.teams.find(t => t.placement === 1) ?? null,
      second: data.teams.find(t => t.placement === 2) ?? null,
      third:  data.teams.find(t => t.placement === 3) ?? null,
    };
  }, [data]);

  // Teams sorted for the main table: placement first, then avg score desc
  const sortedTeams = useMemo(() => {
    if (!data) return [];
    return [...data.teams].sort((a, b) => {
      // placement known → highest rank first (1 beats 2)
      if (a.placement && b.placement) return a.placement - b.placement;
      if (a.placement) return -1;
      if (b.placement) return 1;
      // neither placed: by avg total desc
      return b.avgTotal - a.avgTotal;
    });
  }, [data]);

  const maxAvgScore = useMemo(() => {
    if (!sortedTeams.length) return 1;
    return Math.max(...sortedTeams.map(t => t.avgTotal || 0), 1);
  }, [sortedTeams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-500">Ładowanie wyników…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <p className="text-red-400 mb-4">{error ?? 'Brak danych'}</p>
          <Link to="/" className="text-indigo-400 underline underline-offset-2 text-sm">
            Wróć na stronę główną
          </Link>
        </div>
      </div>
    );
  }

  if (data.teams.length === 0) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-white mb-3">
            Wyniki jury — edycja {data.edition}
          </h1>
          <p className="text-gray-400 mb-6">
            Brak opublikowanych wyników dla tej edycji.
          </p>
          <Link to="/" className="text-indigo-400 underline underline-offset-2 text-sm">
            Wróć na stronę główną
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 py-16 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <p className="text-indigo-400 text-sm uppercase tracking-widest mb-2">
            AI Krak Hack {data.edition === 3 ? '2026' : `edycja ${data.edition}`}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Wyniki jury
          </h1>
          <p className="text-gray-400">
            Oficjalny ranking. {data.teams.length} zespołów · maksymalna ocena: 80 pkt.
          </p>
        </div>

        {/* Podium */}
        {(podium.first || podium.second || podium.third) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 md:items-end">
            {[podium.second, podium.first, podium.third].map((t, idx) => {
              if (!t) return <div key={idx} />;
              const style = placementStyle(t.placement);
              const heightClass =
                t.placement === 1 ? 'md:py-10' : t.placement === 2 ? 'md:py-8' : 'md:py-6';
              return (
                <div
                  key={t.slug}
                  className={`rounded-2xl border border-gray-800 ${style?.bg ?? ''} ring-1 ${style?.ring ?? 'ring-transparent'} p-6 ${heightClass} text-center transition-transform hover:-translate-y-1`}
                >
                  <div className="text-5xl mb-3">{style?.icon}</div>
                  <p className={`text-xs uppercase tracking-widest mb-1 ${style?.text}`}>
                    {t.placementLabel ?? `Miejsce ${t.placement}`}
                  </p>
                  <h3 className="text-xl font-bold text-white mb-1">{t.name}</h3>
                  {t.projectName && t.projectName !== t.name && (
                    <p className="text-sm text-gray-400 mb-3">{t.projectName}</p>
                  )}
                  {t.challenge && (
                    <p className="text-xs text-gray-500 mb-3">
                      Challenge: {t.challenge}
                    </p>
                  )}
                  <p className="text-3xl font-bold text-white">
                    {t.avgTotal.toFixed(1)}<span className="text-sm text-gray-500 font-normal">/80</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {t.jurorCount} jurorów
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Full table */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-white font-semibold text-lg">Pełny ranking</h2>
            <span className="text-xs text-gray-500">
              Średnia z {data.teams[0]?.jurorCount ?? 0} jurorów
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-950/50 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-5 py-3">#</th>
                  <th className="px-5 py-3">Zespół</th>
                  <th className="px-5 py-3 hidden md:table-cell">Challenge</th>
                  <th className="px-5 py-3 text-right whitespace-nowrap">Średnia</th>
                </tr>
              </thead>
              <tbody>
                {sortedTeams.map((t, i) => {
                  const style = placementStyle(t.placement);
                  const avgPct = Math.round((t.avgTotal / maxAvgScore) * 100);
                  return (
                    <tr
                      key={t.slug}
                      className={`border-t border-gray-800 hover:bg-gray-800/30 transition-colors ${
                        t.placement && t.placement <= 3 ? 'bg-gray-800/20' : ''
                      }`}
                    >
                      <td className="px-5 py-4 text-sm">
                        {style?.icon ? (
                          <span className="text-lg">{style.icon}</span>
                        ) : (
                          <span className="text-gray-500">{i + 1}</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium text-white">{t.name}</div>
                        {t.projectName && t.projectName !== t.name && (
                          <div className="text-xs text-gray-500">{t.projectName}</div>
                        )}
                        {t.specialMention && (
                          <div className="mt-1 inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-purple-900/40 text-purple-300">
                            ✨ {t.specialMention}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-400 hidden md:table-cell">
                        {t.challenge || <span className="text-gray-600">—</span>}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-3">
                          {/* Score bar */}
                          <div className="w-24 md:w-32 bg-gray-800 rounded-full h-1.5 hidden sm:block">
                            <div
                              className="bg-indigo-500 h-1.5 rounded-full transition-all"
                              style={{ width: `${avgPct}%` }}
                            />
                          </div>
                          <span className="font-mono font-semibold text-white whitespace-nowrap">
                            {t.avgTotal.toFixed(1)}
                            <span className="text-gray-500 text-xs font-normal"> / 80</span>
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Criteria breakdown (top 3 only, collapsed on mobile) */}
        <details className="mt-8 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <summary className="px-5 py-4 cursor-pointer text-white font-semibold flex items-center justify-between hover:bg-gray-800/30">
            <span>Breakdown per kryterium (top 3)</span>
            <span className="text-xs text-gray-500">kliknij by rozwinąć</span>
          </summary>
          <div className="px-5 py-4 border-t border-gray-800">
            {[podium.first, podium.second, podium.third].filter(Boolean).map(t => {
              if (!t) return null;
              const jurorCount = t.jurorCount || 1;
              return (
                <div key={t.slug} className="mb-6 last:mb-0">
                  <h3 className="text-white font-semibold mb-3">
                    {placementStyle(t.placement)?.icon} {t.name}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {CRITERIA.map(c => {
                      const sum = t.breakdown[c.key as keyof typeof t.breakdown];
                      const avg = sum / jurorCount;
                      const pct = Math.round((avg / MAX_PER_CRITERION) * 100);
                      return (
                        <div key={c.key} className="bg-gray-950 rounded-lg p-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400">{c.label}</span>
                            <span className="text-gray-300 font-mono">
                              {avg.toFixed(1)} / {MAX_PER_CRITERION}
                            </span>
                          </div>
                          <div className="bg-gray-800 rounded-full h-1.5">
                            <div
                              className="bg-indigo-500 h-1.5 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </details>

        {/* Footer nav */}
        <div className="mt-12 text-center">
          <Link
            to={`/edycja/${edition === 3 ? '2026' : data.edition}`}
            className="text-indigo-400 hover:text-indigo-300 text-sm underline underline-offset-2"
          >
            ← Wróć do strony edycji
          </Link>
        </div>
      </div>
    </div>
  );
}
