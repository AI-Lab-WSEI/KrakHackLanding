/**
 * /panel/glosowanie — user-side strona z głosowaniem People's Choice.
 *
 * Reużywa VotingWidget z komponentów hackathonowych. Tylko aktywna edycja.
 */
import { useEffect, useState } from 'react';
import { VotingWidget } from '@/app/components/VotingWidget';
import { CURRENT_EDITION_NUMBER, EDITIONS_META } from '@/data/edition-registry';
import { PanelSectionHeader } from '@/app/components/panel/shared/PanelSectionHeader';
import { PanelCard } from '@/app/components/panel/shared/PanelCard';

interface Team {
  slug: string;
  name: string;
}

export function GlosowaniePage() {
  const [teams, setTeams]     = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const active = EDITIONS_META.find(e => e.status === 'active');

  useEffect(() => {
    const editionNumber = active?.number ?? CURRENT_EDITION_NUMBER;
    fetch(`/api/hackathon/teams?edition=${editionNumber}`)
      .then(r => r.json())
      .then(data => setTeams(data.teams ?? []))
      .catch(() => { /* soft-fail */ })
      .finally(() => setLoading(false));
  }, [active]);

  return (
    <div className="p-6 sm:p-8 max-w-3xl mx-auto">
      <PanelSectionHeader
        eyebrow="Mój obszar · People's Choice"
        title="Głosowanie"
        subtitle={
          active
            ? `Głosowanie trwa — wybierz jeden zespół z edycji ${active.name ?? active.year}. Możesz zmienić głos do końca głosowania.`
            : 'Nie ma obecnie aktywnej edycji z głosowaniem.'
        }
      />

      {loading ? (
        <PanelCard padding="lg" className="text-center text-sm text-gray-400">Ładowanie zespołów…</PanelCard>
      ) : teams.length === 0 ? (
        <PanelCard padding="lg" className="text-center text-sm text-gray-500">
          Brak zespołów do głosowania w tej edycji.
        </PanelCard>
      ) : (
        <VotingWidget
          teams={teams}
          editionNumber={active?.number ?? CURRENT_EDITION_NUMBER}
        />
      )}
    </div>
  );
}
