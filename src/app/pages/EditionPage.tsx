import { useEdition } from '@/app/hooks/useEdition';
import { Edition2026 as Edition2026Content } from './Edition2026';
import { Edition2025 as Edition2025Content } from './Edition2025';

export function EditionPage() {
  const { meta } = useEdition();

  // Active edition uses the 2026 layout (with pre/post hackathon logic)
  if (meta.status === 'active') {
    return <Edition2026Content />;
  }

  // Archive editions use the 2025 layout
  if (meta.status === 'archive') {
    return <Edition2025Content />;
  }

  // Placeholder
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Edycja {meta.number} ({meta.year})</h1>
        <p className="text-gray-400">Dane tej edycji nie są jeszcze dostępne.</p>
      </div>
    </div>
  );
}
