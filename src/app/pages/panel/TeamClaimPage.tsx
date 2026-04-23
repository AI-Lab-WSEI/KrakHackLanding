/**
 * TeamClaimPage — /panel/moj-zespol
 *
 * Uczestnik może zgłosić przynależność do jednego z hackathonowych zespołów.
 * Admin potwierdza claim → team_members jest uzupełniany po Fazie 4 migracji.
 */
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { adminFetch } from '@/lib/adminApi';

interface LegacyTeam {
  id: number;
  slug: string;
  name: string;
  projectName: string;
  challenge: string;
  members: string[];
  editionNumber: number;
  placement: number | null;
  placementLabel: string | null;
}

interface ClaimStatus {
  slug: string;
  status: 'pending' | 'confirmed' | 'rejected';
}

const CHALLENGE_LABEL: Record<string, string> = {
  ai_ml:       '🤖 AI/ML',
  web:         '🌐 Web',
  mobile:      '📱 Mobile',
  iot:         '🔌 IoT',
  data:        '📊 Data',
  cybersec:    '🔒 Cybersec',
};

export function TeamClaimPage() {
  const { token } = useAuth();
  const [teams,   setTeams]   = useState<LegacyTeam[]>([]);
  const [claims,  setClaims]  = useState<ClaimStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [claiming, setClaiming] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [teamsRes, claimsRes] = await Promise.all([
        fetch('/api/hackathon/teams?edition=3'),     // public endpoint, no auth
        adminFetch('/api/hackathon/my-claims'),
      ]);
      const teamsData  = await teamsRes.json();
      const claimsData = await claimsRes.json();
      setTeams(teamsData.teams ?? []);
      setClaims(claimsData.claims ?? []);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  async function handleClaim(slug: string) {
    if (!token) return;
    setClaiming(slug);
    try {
      const res = await adminFetch('/api/hackathon/teams/claim', {
        method: 'POST',
        body: JSON.stringify({ teamSlug: slug, editionNumber: 3 }),
      });
      if (!res.ok) throw new Error('Błąd zgłoszenia');
      await load();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setClaiming(null);
    }
  }

  async function handleUnclaim(slug: string) {
    if (!token || !confirm('Cofnąć zgłoszenie?')) return;
    setClaiming(slug);
    try {
      await adminFetch('/api/hackathon/teams/claim', {
        method: 'DELETE',
        body: JSON.stringify({ teamSlug: slug, editionNumber: 3 }),
      });
      await load();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setClaiming(null);
    }
  }

  const claimMap = new Map(claims.map(c => [c.slug, c.status]));
  const filtered = teams.filter(t =>
    !search ||
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.projectName.toLowerCase().includes(search.toLowerCase()) ||
    t.members.some(m => m.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500 text-sm">Ładowanie zespołów…</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold">Mój zespół</h1>
          <p className="text-gray-400 text-sm mt-1">
            Znajdź swój zespół z Hackathonu 2026 i zgłoś przynależność.
            Admin potwierdzi Twoje zgłoszenie.
          </p>
        </div>
        <a
          href="/panel/zespoly/nowy"
          className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
        >
          + Utwórz nowy zespół
        </a>
      </div>

      {/* Active claims */}
      {claims.filter(c => c.status !== 'rejected').length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-2">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Twoje zgłoszenia</p>
          {claims
            .filter(c => c.status !== 'rejected')
            .map(c => {
              const team = teams.find(t => t.slug === c.slug);
              return (
                <div key={c.slug} className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">{team?.name ?? c.slug}</span>
                    {team?.projectName && team.projectName !== team.name && (
                      <span className="text-xs text-gray-500 ml-2">{team.projectName}</span>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    c.status === 'confirmed'
                      ? 'bg-green-900/40 text-green-400'
                      : 'bg-amber-900/30 text-amber-400'
                  }`}>
                    {c.status === 'confirmed' ? '✓ Potwierdzono' : '⏳ Oczekuje'}
                  </span>
                </div>
              );
            })}
        </div>
      )}

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Szukaj po nazwie zespołu, projektu lub imieniu…"
        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
      />

      {/* Teams list */}
      <div className="flex flex-col gap-3">
        {filtered.map(team => {
          const claimStatus = claimMap.get(team.slug);
          const isClaiming  = claiming === team.slug;

          return (
            <div
              key={team.slug}
              className={`bg-gray-900 border rounded-xl p-4 flex items-start gap-4 transition-colors
                ${claimStatus === 'confirmed'
                  ? 'border-green-900/60'
                  : claimStatus === 'pending'
                  ? 'border-amber-800/40'
                  : 'border-gray-800'}`}
            >
              {/* Placement badge */}
              {team.placementLabel && (
                <div className="text-lg shrink-0 mt-0.5">
                  {team.placement === 1 ? '🥇' : team.placement === 2 ? '🥈' : team.placement === 3 ? '🥉' : '🏆'}
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{team.name}</p>
                {team.projectName && team.projectName !== team.name && (
                  <p className="text-xs text-gray-400 mt-0.5">{team.projectName}</p>
                )}
                <p className="text-xs text-gray-600 mt-0.5">
                  {CHALLENGE_LABEL[team.challenge] ?? team.challenge}
                  {team.placementLabel && ` · ${team.placementLabel}`}
                </p>
                {team.members.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {team.members.join(' · ')}
                  </p>
                )}
              </div>

              {/* Claim button */}
              <div className="shrink-0">
                {claimStatus === 'confirmed' ? (
                  <span className="text-xs text-green-400">✓ Twój zespół</span>
                ) : claimStatus === 'pending' ? (
                  <button
                    onClick={() => handleUnclaim(team.slug)}
                    disabled={isClaiming}
                    className="text-xs text-amber-400 hover:text-red-400 transition-colors"
                  >
                    Cofnij zgłoszenie
                  </button>
                ) : (
                  <button
                    onClick={() => handleClaim(team.slug)}
                    disabled={isClaiming}
                    className="text-xs bg-gray-800 hover:bg-indigo-900/50 border border-gray-700 hover:border-indigo-700 text-gray-300 hover:text-indigo-300 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isClaiming ? '…' : 'To mój zespół'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
