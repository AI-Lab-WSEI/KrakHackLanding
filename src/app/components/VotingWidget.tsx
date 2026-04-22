/**
 * VotingWidget — People's Choice vote on the hackathon page.
 * Shows all teams with live vote bars + allows logged-in participants to cast a vote.
 *
 * Props:
 *   editionNumber — hackathon edition (default 3)
 */
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';

interface TeamVote {
  team_slug: string;
  vote_count: number;
}

interface Team {
  slug: string;
  name: string;
}

interface Props {
  editionNumber?: number;
  teams: Team[];
}

function useVotes(edition: number) {
  const [votes, setVotes]   = useState<TeamVote[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res  = await fetch(`/api/public/votes/${edition}`);
      const data = await res.json();
      setVotes(data.votes ?? []);
    } catch {
      // silently ignore — no votes yet
    } finally {
      setLoading(false);
    }
  }, [edition]);

  useEffect(() => { load(); }, [load]);

  return { votes, loading, reload: load };
}

function useMyVote(edition: number, token: string | null) {
  const [myVote, setMyVote] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    if (!token) { setLoaded(true); return; }
    try {
      const res  = await fetch(`/api/hackathon/my-vote?edition=${edition}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMyVote(data.vote ?? null);
    } catch {
      // ignore
    } finally {
      setLoaded(true);
    }
  }, [edition, token]);

  useEffect(() => { load(); }, [load]);

  return { myVote, loaded, refreshMyVote: load };
}

export function VotingWidget({ editionNumber = 3, teams }: Props) {
  const { user, token } = useAuth();
  const { votes, loading: votesLoading, reload: reloadVotes } = useVotes(editionNumber);
  const { myVote, loaded: myVoteLoaded, refreshMyVote } = useMyVote(editionNumber, token);
  const [voting, setVoting] = useState(false);
  const [optimisticVote, setOptimisticVote] = useState<string | null>(null);

  // The "active" vote: use optimistic UI while request is in flight, else myVote
  const activeVote = optimisticVote ?? myVote;

  const totalVotes = votes.reduce((sum, v) => sum + v.vote_count, 0);

  function voteCountFor(slug: string) {
    const entry = votes.find(v => v.team_slug === slug);
    return entry?.vote_count ?? 0;
  }

  async function castVote(teamSlug: string) {
    if (!token || voting) return;
    setVoting(true);
    setOptimisticVote(teamSlug);
    try {
      const res = await fetch('/api/hackathon/vote', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teamSlug, editionNumber }),
      });
      if (!res.ok) throw new Error('vote failed');
      await Promise.all([reloadVotes(), refreshMyVote()]);
    } catch {
      // revert optimistic
      setOptimisticVote(null);
    } finally {
      setVoting(false);
      setOptimisticVote(null);
    }
  }

  if (votesLoading || (user && !myVoteLoaded)) {
    return (
      <div className="py-12 text-center text-gray-500 text-sm">
        Ładowanie głosowania…
      </div>
    );
  }

  const isParticipant = user?.keycloakRoles.some(r =>
    ['admin', 'hackathon-participant', 'scienceclub-participant'].includes(r)
  );

  return (
    <section className="py-16 bg-gray-950">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Nagroda Publiczności
          </h2>
          <p className="text-gray-400">
            Zagłosuj na swój ulubiony projekt.{' '}
            {totalVotes > 0 && (
              <span className="text-gray-500">
                Oddano już {totalVotes} {totalVotes === 1 ? 'głos' : totalVotes < 5 ? 'głosy' : 'głosów'}.
              </span>
            )}
          </p>
        </div>

        {/* Auth prompt */}
        {!user && (
          <div className="mb-8 bg-indigo-900/20 border border-indigo-700/40 rounded-xl px-5 py-4 text-sm text-indigo-300 text-center">
            <Link to="/logowanie" className="font-medium underline underline-offset-2 hover:text-indigo-200">
              Zaloguj się
            </Link>{' '}
            by oddać głos.
          </div>
        )}
        {user && !isParticipant && (
          <div className="mb-8 bg-amber-900/20 border border-amber-700/40 rounded-xl px-5 py-4 text-sm text-amber-300 text-center">
            Głosowanie dostępne wyłącznie dla uczestników.
          </div>
        )}

        {/* Teams list */}
        <div className="flex flex-col gap-3">
          {teams.map(team => {
            const count     = voteCountFor(team.slug);
            const pct       = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
            const isVoted   = activeVote === team.slug;
            const canVote   = !!user && isParticipant && !voting;

            return (
              <button
                key={team.slug}
                disabled={!canVote}
                onClick={() => canVote && castVote(team.slug)}
                className={`relative w-full rounded-xl border px-5 py-4 text-left transition-all overflow-hidden
                  ${isVoted
                    ? 'border-indigo-500 bg-indigo-900/20'
                    : canVote
                      ? 'border-gray-700 bg-gray-900 hover:border-indigo-600 hover:bg-gray-800/60 cursor-pointer'
                      : 'border-gray-800 bg-gray-900 cursor-default'
                  }`}
              >
                {/* Progress bar */}
                <div
                  className={`absolute inset-y-0 left-0 transition-all duration-500 rounded-xl
                    ${isVoted ? 'bg-indigo-900/40' : 'bg-gray-800/60'}`}
                  style={{ width: `${pct}%` }}
                />

                {/* Content */}
                <div className="relative flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {isVoted && (
                      <span className="text-indigo-400 text-lg leading-none">✓</span>
                    )}
                    <span className={`font-semibold text-sm ${isVoted ? 'text-indigo-200' : 'text-white'}`}>
                      {team.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">
                    {count} {count === 1 ? 'głos' : count < 5 && count > 1 ? 'głosy' : 'głosów'}
                    {totalVotes > 0 && <> · {pct}%</>}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Voted state */}
        {user && activeVote && (
          <p className="mt-6 text-center text-xs text-gray-500">
            Twój głos: <span className="text-indigo-400 font-medium">{teams.find(t => t.slug === activeVote)?.name ?? activeVote}</span>.
            Możesz zmienić głos klikając inny zespół.
          </p>
        )}
      </div>
    </section>
  );
}
