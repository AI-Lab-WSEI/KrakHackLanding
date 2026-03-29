import { useParams, useNavigate, Outlet } from 'react-router';
import { useEffect } from 'react';
import { resolveEditionParam } from '@/data/edition-registry';
import { editions } from '@/data/editions';
import { EditionProvider, type EditionContextValue } from '@/app/hooks/useEdition';

// Import edition-specific data
import { TEAMS as teams2026 } from '@/data/teams';
import results2026 from '@/data/results.json';

function getEditionData(editionNumber: number): Omit<EditionContextValue, 'meta' | 'basePath' | 'teamPath' | 'taskPath'> | null {
  switch (editionNumber) {
    case 2:
      return { edition: editions['2025'], teams: [], results: null };
    case 3:
      return { edition: editions['2026'], teams: teams2026, results: results2026 };
    default:
      return null;
  }
}

export function EditionLayout() {
  const { editionId } = useParams<{ editionId: string }>();
  const navigate = useNavigate();

  const resolved = editionId ? resolveEditionParam(editionId) : null;

  useEffect(() => {
    if (!resolved) {
      navigate('/', { replace: true });
      return;
    }
    if (resolved.isYearInput) {
      navigate(`/edycja/${resolved.meta.number}`, { replace: true });
    }
  }, [resolved, navigate]);

  if (!resolved || resolved.isYearInput) return null;

  const data = getEditionData(resolved.meta.number);
  if (!data) {
    // Placeholder edition
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Edycja {resolved.meta.number}</h1>
          <p className="text-gray-400">Dane tej edycji nie są jeszcze dostępne.</p>
        </div>
      </div>
    );
  }

  const basePath = `/edycja/${resolved.meta.number}`;
  const value: EditionContextValue = {
    meta: resolved.meta,
    ...data,
    basePath,
    teamPath: (slug: string) => `${basePath}/zespoly/${slug}`,
    taskPath: (slug: string) => `${basePath}/zadania/${slug}`,
  };

  return (
    <EditionProvider value={value}>
      <Outlet />
    </EditionProvider>
  );
}
