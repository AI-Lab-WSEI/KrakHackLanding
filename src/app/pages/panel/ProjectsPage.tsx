/**
 * ProjectsPage — /panel/projekty
 * Lista własnych projektów uczestnika + przycisk tworzenia.
 */
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';

interface Project {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  status: string;
  visibility: string;
  projectType: string;
  techStack: string[];
  githubUrl: string | null;
  demoUrl: string | null;
  thumbnailUrl: string | null;
  createdAt: string;
}

const STATUS_LABEL: Record<string, string> = {
  draft:      '⬜ Szkic',
  active:     '🟡 Aktywny',
  published:  '🟢 Opublikowany',
  maintained: '🔵 Utrzymywany',
  archived:   '⚫ Archiwum',
};

const VISIBILITY_LABEL: Record<string, string> = {
  private:      '🔒 Prywatny',
  members_only: '👥 Dla członków',
  public:       '🌍 Publiczny',
};

export function ProjectsPage() {
  const { token } = useAuth();
  const navigate  = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/panel/projects', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setProjects(data.projects ?? []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id: string) {
    if (!token || !confirm('Usunąć projekt? Tej operacji nie można cofnąć.')) return;
    try {
      const res = await fetch(`/api/panel/projects/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Błąd usuwania');
      await load();
    } catch (e) {
      alert((e as Error).message);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Moje projekty</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {projects.length} {projects.length === 1 ? 'projekt' : 'projektów'}
          </p>
        </div>
        <button
          onClick={() => navigate('/panel/projekty/nowy')}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Nowy projekt
        </button>
      </div>

      {/* List */}
      {loading ? (
        <p className="text-gray-500 text-sm py-8 text-center">Ładowanie…</p>
      ) : error ? (
        <p className="text-red-400 text-sm py-8 text-center">{error}</p>
      ) : projects.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center flex flex-col gap-3 items-center">
          <span className="text-4xl">📁</span>
          <p className="font-medium">Brak projektów</p>
          <p className="text-gray-500 text-sm">Stwórz swój pierwszy projekt i pokaż go światu.</p>
          <button
            onClick={() => navigate('/panel/projekty/nowy')}
            className="mt-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg transition-colors"
          >
            Utwórz projekt →
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {projects.map(p => (
            <div
              key={p.id}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-start gap-4"
            >
              {/* Thumbnail placeholder */}
              {p.thumbnailUrl ? (
                <img
                  src={p.thumbnailUrl}
                  alt={p.title}
                  className="w-14 h-14 rounded-lg object-cover shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-gray-800 flex items-center justify-center shrink-0 text-2xl">
                  📦
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-sm truncate">{p.title}</h3>
                  <span className="text-xs text-gray-500">{STATUS_LABEL[p.status] ?? p.status}</span>
                  <span className="text-xs text-gray-500">{VISIBILITY_LABEL[p.visibility] ?? p.visibility}</span>
                </div>
                {p.description && (
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{p.description}</p>
                )}
                {p.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {p.techStack.slice(0, 5).map(t => (
                      <span key={t} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1.5 shrink-0">
                <button
                  onClick={() => navigate(`/panel/projekty/${p.id}/edytuj`)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Edytuj
                </button>
                {p.visibility === 'public' && (
                  <a
                    href={`/projekty/${p.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    Podgląd ↗
                  </a>
                )}
                <button
                  onClick={() => handleDelete(p.id)}
                  className="text-xs text-red-800 hover:text-red-500 transition-colors"
                >
                  Usuń
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
