import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { Trophy, ArrowRight, Users, Star } from 'lucide-react';
import { TEAMS, SPECIAL_MENTIONS } from '@/data/teams';
import staticResults from '@/data/results.json';
import { useEditionOptional } from '@/app/hooks/useEdition';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TeamResult {
  teamId: string;
  teamName: string;
  projectName?: string;
  shortDescription?: string;
  members: string[];
  placement: number;
  scores?: { innovation: number; technicalValue: number; usefulness: number; presentationQuality: number; total: number };
}

interface ChallengeData {
  slug: string;
  name: string;
  color?: string;
  results: TeamResult[];
}

interface SpecialMention {
  teamSlug: string;
  award: string;
  reason?: string;
}

interface EditionResults {
  visible_placements: number;
  challenges: Record<string, ChallengeData>;
  special_mentions: SpecialMention[];
}

// ─── Static fallback ──────────────────────────────────────────────────────────

function buildStaticResults(): EditionResults {
  const challenges: Record<string, ChallengeData> = {};
  for (const [key, ch] of Object.entries(staticResults.challenges as any)) {
    challenges[key] = {
      slug: key,
      name: (ch as any).name,
      color: key === 'geospatial' ? 'blue' : 'purple',
      results: (ch as any).results.map((r: any) => {
        const staticTeam = TEAMS.find(t => t.id === r.teamId);
        return {
          teamId: r.teamId,
          teamName: staticTeam?.name || r.teamId,
          projectName: staticTeam?.projectName,
          shortDescription: staticTeam?.shortDescription,
          members: staticTeam?.members || [],
          placement: r.placement,
          scores: r.scores,
        };
      }),
    };
  }
  return {
    visible_placements: 2,
    challenges,
    special_mentions: (staticResults.specialMentions || []).map((sm: any) => ({
      teamSlug: sm.teamId,
      award: sm.award,
      reason: sm.reason,
    })),
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreMini({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = (value / max) * 100;
  return (
    <div className="flex items-center gap-2 text-[10px]">
      <span className="text-gray-500 w-20 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
        />
      </div>
      <span className="text-gray-400 font-bold w-6 text-right">{value}</span>
    </div>
  );
}

interface WinnerCardProps {
  team: TeamResult;
  place: number;
  challengeLabel: string;
  isFirst: boolean;
  teamLink: (id: string) => string;
  maxScore: number;
}

function WinnerCard({ team, place, challengeLabel, isFirst, teamLink, maxScore }: WinnerCardProps) {
  const scores = team.scores;
  // Enrich from static data if API didn't return full details
  const staticTeam = TEAMS.find(t => t.id === team.teamId);
  const shortDesc = team.shortDescription || staticTeam?.shortDescription || '';
  const projectName = team.projectName || staticTeam?.projectName;
  const members = team.members?.length ? team.members : (staticTeam?.members || []);

  return (
    <Link to={teamLink(team.teamId)}
      className={`group flex flex-col p-6 border rounded-2xl hover:border-pink-500/40 transition-all h-full ${
        isFirst
          ? 'bg-gradient-to-br from-pink-500/5 to-purple-500/3 border-pink-500/20'
          : 'bg-white/3 border-white/10 hover:border-pink-500/30'
      }`}>
      <div className="flex items-center gap-2 mb-3">
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
          isFirst ? 'bg-pink-500/20 text-pink-400' : 'bg-white/10 text-gray-300'
        }`}>
          <Trophy className="w-3 h-3" /> {place}. miejsce — {challengeLabel}
        </span>
        {scores && <span className={`ml-auto font-black text-lg ${isFirst ? 'text-pink-400' : 'text-gray-300'}`}>{scores.total}/{maxScore * 4}</span>}
      </div>
      <h3 className="text-lg font-bold text-white mb-1">{team.teamName}</h3>
      {projectName && <p className="text-cyan-400 text-xs font-medium mb-2">{projectName}</p>}
      <p className="text-gray-400 text-sm leading-relaxed flex-1 mb-3">{shortDesc.slice(0, 140)}{shortDesc.length > 140 ? '...' : ''}</p>
      {scores && (
        <div className="space-y-1.5 mb-3">
          <ScoreMini value={scores.innovation} max={20} label="Innowacyjność" />
          <ScoreMini value={scores.technicalValue} max={20} label="Wart. techniczna" />
          <ScoreMini value={scores.usefulness} max={20} label="Użyteczność" />
          <ScoreMini value={scores.presentationQuality} max={20} label="Jakość prez." />
        </div>
      )}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
        <span className="text-gray-500 text-[10px] truncate"><Users className="w-3 h-3 inline mr-1" />{members.join(', ')}</span>
        <ArrowRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-all shrink-0 ml-2 ${isFirst ? 'text-pink-400' : 'text-gray-400'}`} />
      </div>
    </Link>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function TeamsSection({ editionNumber }: { editionNumber?: number }) {
  const edCtx = useEditionOptional();
  const edition = editionNumber ?? edCtx?.meta?.number ?? 3;
  const teamLink = (id: string) => edCtx ? edCtx.teamPath(id) : `/zespoly/${id}`;

  const [data, setData] = useState<EditionResults>(buildStaticResults());
  const [maxScore] = useState(20);

  useEffect(() => {
    fetch(`/api/editions/${edition}/results`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.challenges) setData(d); })
      .catch(() => {});
  }, [edition]);

  const visiblePlacements = data.visible_placements ?? 2;
  const challengeEntries = Object.entries(data.challenges);

  // Build top winners rows: place 1 across all challenges, place 2 across all challenges, etc.
  const topRows: TeamResult[][] = [];
  for (let place = 1; place <= visiblePlacements; place++) {
    const row = challengeEntries.map(([, ch]) =>
      ch.results.find(t => t.placement === place) || null
    ).filter(Boolean) as TeamResult[];
    if (row.length > 0) topRows.push(row);
  }

  // Challenge label per slug
  const challengeLabel = (slug: string, ch: ChallengeData) => {
    if (slug === 'geospatial') return 'Infrastructure';
    if (slug === 'process-automation') return 'Process Mining';
    return ch.name;
  };

  // Top team IDs (to exclude from "all teams")
  const topIds = new Set(topRows.flat().map(t => t.teamId));
  const specialSlugs = new Set((data.special_mentions || []).map(sm => sm.teamSlug));

  // All other teams (not in top, not special mention)
  const allTeamIds = new Set(challengeEntries.flatMap(([, ch]) => ch.results.map(t => t.teamId)));
  const otherTeamIds = [...allTeamIds].filter(id => !topIds.has(id) && !specialSlugs.has(id));

  // Enrich other teams from API + static
  const otherTeams = otherTeamIds.map(id => {
    const apiTeam = challengeEntries.flatMap(([, ch]) => ch.results).find(t => t.teamId === id);
    const staticTeam = TEAMS.find(t => t.id === id);
    return {
      teamId: id,
      teamName: apiTeam?.teamName || staticTeam?.name || id,
      projectName: apiTeam?.projectName || staticTeam?.projectName,
      shortDescription: apiTeam?.shortDescription || staticTeam?.shortDescription || '',
      members: apiTeam?.members?.length ? apiTeam.members : (staticTeam?.members || []),
      challenge: challengeEntries.find(([, ch]) => ch.results.some(t => t.teamId === id))?.[0] || '',
      scores: apiTeam?.scores,
      challengeLabel: (() => {
        const slug = challengeEntries.find(([, ch]) => ch.results.some(t => t.teamId === id))?.[0] || '';
        const ch = data.challenges[slug];
        return ch ? challengeLabel(slug, ch) : '';
      })(),
    };
  });

  // Special mentions enriched from static as fallback
  const specialMentions = (data.special_mentions || []).map(sm => {
    const staticTeam = TEAMS.find(t => t.id === sm.teamSlug);
    return { ...sm, name: staticTeam?.name || sm.teamSlug, staticMention: staticTeam?.specialMention };
  });

  // Fallback: show static SPECIAL_MENTIONS if API has none
  const displaySpecial = specialMentions.length > 0
    ? specialMentions
    : SPECIAL_MENTIONS.map(t => ({ teamSlug: t.id, name: t.name, award: t.specialMention || '', reason: '' }));

  return (
    <section id="zespoly" className="py-20 bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center justify-center gap-4">
            <Trophy className="w-10 h-10 text-pink-400" /> Zwycięzcy
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            {[...allTeamIds].length} zespołów, {challengeEntries.length} wyzwań, 24 godziny pracy
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto mt-4" />
        </motion.div>

        {/* Top N places — one row per place, one card per challenge */}
        {topRows.map((row, placeIdx) => {
          const place = placeIdx + 1;
          const isFirst = place === 1;
          return (
            <div key={place} className={`grid grid-cols-1 md:grid-cols-${row.length > 1 ? '2' : '1'} gap-6 max-w-5xl mx-auto mb-6`}>
              {row.map((team, idx) => {
                const slug = challengeEntries.find(([, ch]) => ch.results.some(t => t.teamId === team.teamId))?.[0] || '';
                const ch = data.challenges[slug];
                return (
                  <motion.div key={team.teamId} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}>
                    <WinnerCard
                      team={team}
                      place={place}
                      challengeLabel={ch ? challengeLabel(slug, ch) : ''}
                      isFirst={isFirst}
                      teamLink={teamLink}
                      maxScore={maxScore}
                    />
                  </motion.div>
                );
              })}
            </div>
          );
        })}

        {/* Special mentions */}
        {displaySpecial.length > 0 && (
          <div className={`mb-12 max-w-${displaySpecial.length === 1 ? 'md' : '2xl'} mx-auto`}>
            <div className={`grid grid-cols-1 ${displaySpecial.length > 1 ? 'md:grid-cols-2' : ''} gap-4`}>
              {displaySpecial.map((sm) => (
                <motion.div key={sm.teamSlug} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <Link to={teamLink(sm.teamSlug)}
                    className="group block p-5 bg-white/3 border border-cyan-500/15 rounded-2xl hover:border-cyan-500/30 transition-all text-center">
                    <Star className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                    <h4 className="text-white font-bold mb-1">{sm.name}</h4>
                    <p className="text-cyan-400 text-xs font-medium">{sm.award}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* All other teams */}
        {otherTeams.length > 0 && (
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 text-center mb-6">Wszystkie zespoły</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {otherTeams.map((team, idx) => (
                <motion.div key={team.teamId} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.05 }}>
                  <Link to={teamLink(team.teamId)}
                    className="group flex flex-col p-4 bg-white/3 border border-white/8 rounded-2xl hover:bg-white/5 hover:border-white/15 transition-all h-full min-h-[160px]">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        team.challenge === 'geospatial' ? 'bg-blue-500/15 text-blue-400' : 'bg-purple-500/15 text-purple-400'
                      }`}>
                        {team.challengeLabel || team.challenge}
                      </span>
                      {team.scores && <span className="ml-auto text-gray-500 text-xs font-bold">{team.scores.total}/{maxScore * 4}</span>}
                    </div>
                    <h3 className="text-white font-bold text-sm mb-1">{team.teamName}</h3>
                    {team.projectName && <p className="text-gray-500 text-[10px] mb-1">{team.projectName}</p>}
                    <p className="text-gray-500 text-xs leading-relaxed flex-1">{team.shortDescription.slice(0, 100)}{team.shortDescription.length > 100 ? '...' : ''}</p>
                    <div className="mt-2 text-[9px] text-gray-600">
                      <Users className="w-2.5 h-2.5 inline mr-0.5" />{team.members.length} os.
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
