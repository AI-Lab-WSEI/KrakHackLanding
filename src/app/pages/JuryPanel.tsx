/**
 * JuryPanel — /jury/:token
 *
 * Standalone jury scoring panel accessible via magic link.
 * No Keycloak account required — auth via magic_token from URL.
 *
 * Flow:
 *   1. Juror receives email with link /jury/<magic_token>
 *   2. Page verifies token → fetches project list + own scores
 *   3. Juror scores each project → submit
 */
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';

// ─── Types ───────────────────────────────────────────────────────────────────

interface JurorInfo {
  id: string;
  name: string;
  title: string | null;
  company: string | null;
  editionNumber: number;
}

interface ScoredProject {
  id: number;
  slug: string;
  name: string;
  projectName: string;
  challenge: string;
  members: string[];
  shortDescription: string;
  technologies: string[];
  // current juror's scores (null if not scored yet)
  scores: ScoreValues | null;
  notes: string;
}

interface ScoreValues {
  innovation: number;
  technical_value: number;
  usefulness: number;
  presentation_quality: number;
}

const SCORE_FIELDS: { key: keyof ScoreValues; label: string }[] = [
  { key: 'innovation',            label: 'Innowacyjność' },
  { key: 'technical_value',       label: 'Wartość techniczna' },
  { key: 'usefulness',            label: 'Użyteczność' },
  { key: 'presentation_quality',  label: 'Jakość prezentacji' },
];

// ─── Scoring form ─────────────────────────────────────────────────────────────

function ScoreForm({
  project,
  token,
  onScored,
}: {
  project: ScoredProject;
  token: string;
  onScored: (slug: string, scores: ScoreValues, notes: string) => void;
}) {
  const [scores, setScores] = useState<ScoreValues>(
    project.scores ?? { innovation: 0, technical_value: 0, usefulness: 0, presentation_quality: 0 }
  );
  const [notes,   setNotes]   = useState(project.notes ?? '');
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const total = Object.values(scores).reduce((a, b) => a + b, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/jury/scores', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teamSlug: project.slug, scores, notes }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? 'Błąd zapisu');
      }
      setSaved(true);
      onScored(project.slug, scores, notes);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-800 mt-3 pt-4 flex flex-col gap-4">
      {/* Score sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SCORE_FIELDS.map(({ key, label }) => (
          <div key={key} className="flex flex-col gap-1">
            <div className="flex justify-between">
              <label className="text-xs text-gray-400">{label}</label>
              <span className="text-xs font-mono text-indigo-400">{scores[key]} / 20</span>
            </div>
            <input
              type="range"
              min={0}
              max={20}
              value={scores[key]}
              onChange={e => setScores(s => ({ ...s, [key]: Number(e.target.value) }))}
              className="accent-indigo-500"
            />
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="text-right">
        <span className="text-sm font-semibold">
          Suma: <span className="text-indigo-400">{total}</span> / 80
        </span>
      </div>

      {/* Notes */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-gray-400">Notatki (opcjonalne)</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
          placeholder="Komentarz do oceny…"
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 resize-none"
        />
      </div>

      {error && (
        <p className="text-xs text-red-400 bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="self-end bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors disabled:opacity-50"
      >
        {saving ? 'Zapisywanie…' : saved ? '✓ Zapisano!' : 'Zapisz ocenę'}
      </button>
    </form>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function JuryPanel() {
  const { token } = useParams<{ token: string }>();
  const [juror,    setJuror]    = useState<JurorInfo | null>(null);
  const [projects, setProjects] = useState<ScoredProject[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        // Verify token + get juror info
        const authRes = await fetch(`/api/jury/verify?token=${encodeURIComponent(token)}`);
        if (!authRes.ok) throw new Error('Nieprawidłowy lub wygasły link jury.');
        const jurorData = await authRes.json();
        setJuror(jurorData);

        // Load projects + own scores
        const projRes = await fetch(
          `/api/jury/projects?edition=${jurorData.editionNumber}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!projRes.ok) throw new Error('Nie można załadować projektów.');
        const projData = await projRes.json();
        setProjects(projData.projects ?? []);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const handleScored = useCallback((slug: string, scores: ScoreValues, notes: string) => {
    setProjects(prev =>
      prev.map(p => p.slug === slug ? { ...p, scores, notes } : p)
    );
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <p className="text-gray-400 text-sm">Ładowanie panelu jury…</p>
      </div>
    );
  }

  if (error || !juror) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white gap-4 px-4">
        <span className="text-4xl">🔒</span>
        <h1 className="text-xl font-bold">Brak dostępu</h1>
        <p className="text-gray-400 text-sm text-center max-w-sm">
          {error ?? 'Link jest nieprawidłowy lub wygasł. Skontaktuj się z organizatorami.'}
        </p>
      </div>
    );
  }

  const scored   = projects.filter(p => p.scores !== null).length;
  const total    = projects.length;
  const progress = total > 0 ? Math.round((scored / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-4 py-4 flex items-center justify-between sticky top-0 bg-gray-950/90 backdrop-blur-sm z-10">
        <div>
          <h1 className="font-bold text-base">AI Krak Hack — Panel Jury</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Edycja {juror.editionNumber} · {juror.name}
            {juror.title ? ` · ${juror.title}` : ''}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Postęp</p>
          <p className="text-sm font-semibold">
            <span className="text-indigo-400">{scored}</span>/{total}
          </p>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-gray-800">
        <div
          className="h-full bg-indigo-600 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Projects */}
      <main className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-3">
        {projects.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-12">Brak projektów do oceny.</p>
        ) : (
          projects.map(project => {
            const isExpanded = expanded === project.slug;
            return (
              <div
                key={project.slug}
                className={`bg-gray-900 border rounded-xl p-4 transition-colors
                  ${project.scores !== null
                    ? 'border-green-900/50'
                    : 'border-gray-800'}`}
              >
                {/* Project header */}
                <button
                  onClick={() => setExpanded(isExpanded ? null : project.slug)}
                  className="w-full text-left flex items-start justify-between gap-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {project.scores !== null && (
                        <span className="text-green-400 text-xs">✓</span>
                      )}
                      <h3 className="font-semibold text-sm">
                        {project.projectName || project.name}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {project.name} · {project.challenge}
                    </p>
                    {project.scores !== null && (
                      <p className="text-xs text-indigo-400 mt-0.5">
                        Suma: {Object.values(project.scores).reduce((a, b) => a + b, 0)} / 80
                      </p>
                    )}
                  </div>
                  <span className="text-gray-600 text-lg mt-0.5">
                    {isExpanded ? '▲' : '▼'}
                  </span>
                </button>

                {/* Expandable content */}
                {isExpanded && (
                  <div className="mt-3 flex flex-col gap-2">
                    {project.shortDescription && (
                      <p className="text-sm text-gray-400 leading-relaxed">
                        {project.shortDescription}
                      </p>
                    )}
                    {project.members.length > 0 && (
                      <p className="text-xs text-gray-600">
                        Zespół: {project.members.join(', ')}
                      </p>
                    )}
                    {project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.map(t => (
                          <span key={t} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    {token && (
                      <ScoreForm
                        project={project}
                        token={token}
                        onScored={handleScored}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </main>
    </div>
  );
}
