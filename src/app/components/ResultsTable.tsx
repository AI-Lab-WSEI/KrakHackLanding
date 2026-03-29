import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { Trophy } from 'lucide-react';
import staticResults from '@/data/results.json';
import { getTeamBySlug } from '@/data/teams';
import { useEditionOptional } from '@/app/hooks/useEdition';

interface ScoreRow {
  teamId: string;
  teamName?: string;
  placement: number;
  scores: { innovation: number; technicalValue: number; usefulness: number; presentationQuality: number; total: number };
  note?: string;
}

interface ChallengeData {
  slug?: string;
  name: string;
  color?: string;
  results: ScoreRow[];
}

interface EditionResults {
  visible_placements: number;
  show_scores: boolean;
  max_score_per_category: number;
  challenges: Record<string, ChallengeData>;
}

const GRID_COLS = 'grid grid-cols-[40px_1fr_repeat(4,minmax(50px,80px))_60px]';

function HeaderRow() {
  return (
    <div className={`${GRID_COLS} border-b border-white/5 text-[9px] uppercase tracking-widest text-gray-600`}>
      <div className="px-2 py-2 text-center">#</div>
      <div className="px-3 py-2">Zespół</div>
      <div className="px-1 py-2 text-center">
        <div>Inn.</div>
        <div className="text-[7px] normal-case tracking-normal text-gray-700">innowacyjność</div>
      </div>
      <div className="px-1 py-2 text-center">
        <div>Tech.</div>
        <div className="text-[7px] normal-case tracking-normal text-gray-700">wart. techniczna</div>
      </div>
      <div className="px-1 py-2 text-center">
        <div>Użyt.</div>
        <div className="text-[7px] normal-case tracking-normal text-gray-700">użyteczność</div>
      </div>
      <div className="px-1 py-2 text-center">
        <div>Prez.</div>
        <div className="text-[7px] normal-case tracking-normal text-gray-700">jakość prezentacji</div>
      </div>
      <div className="px-2 py-2 text-center">Suma</div>
    </div>
  );
}

function Row({ teamId, teamName, placement, scores, note, teamLink }: {
  teamId: string; teamName?: string; placement: number; scores: ScoreRow['scores']; note?: string;
  teamLink: (id: string) => string;
}) {
  const staticTeam = getTeamBySlug(teamId);
  const name = teamName || staticTeam?.name || teamId;
  const isTop = placement <= 2;

  return (
    <Link to={teamLink(teamId)} className="group">
      <div className={`${GRID_COLS} items-center border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${isTop ? 'bg-white/3' : ''}`}>
        <div className="px-2 py-3 text-center">
          {placement <= 2 ? (
            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black ${placement === 1 ? 'bg-gradient-to-br from-pink-500 to-purple-500 text-white' : 'bg-white/10 text-gray-300'}`}>
              {placement}
            </span>
          ) : (
            <span className="text-gray-500 text-sm">{placement}</span>
          )}
        </div>
        <div className="px-3 py-3">
          <span className={`font-bold text-sm ${isTop ? 'text-white' : 'text-gray-300'}`}>{name}</span>
          {note && <span className="text-gray-600 text-[10px] ml-2">{note}</span>}
        </div>
        <div className="px-1 py-3 text-center text-sm text-gray-400">{scores.innovation}</div>
        <div className="px-1 py-3 text-center text-sm text-gray-400">{scores.technicalValue}</div>
        <div className="px-1 py-3 text-center text-sm text-gray-400">{scores.usefulness}</div>
        <div className="px-1 py-3 text-center text-sm text-gray-400">{scores.presentationQuality}</div>
        <div className="px-2 py-3 text-center">
          <span className={`font-black text-sm ${isTop ? 'text-pink-400' : 'text-gray-300'}`}>{scores.total}</span>
        </div>
      </div>
    </Link>
  );
}

function ChallengeTable({ challenge, colorClass, borderColor, animateFrom, maxScore, teamLink }: {
  challenge: ChallengeData; colorClass: string; borderColor: string; animateFrom: 'left' | 'right';
  maxScore: number; teamLink: (id: string) => string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: animateFrom === 'left' ? -20 : 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className={`bg-white/3 border ${borderColor} rounded-2xl overflow-hidden`}
    >
      <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colorClass} flex items-center justify-center`}>
          <Trophy className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-white font-bold text-sm">{challenge.name}</h3>
          <p className="text-gray-500 text-[10px]">{challenge.results.length} {challenge.results.length === 1 ? 'zespół' : challenge.results.length < 5 ? 'zespoły' : 'zespołów'}</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[500px]">
          <HeaderRow />
          {challenge.results.map((r) => (
            <Row key={r.teamId} teamId={r.teamId} teamName={r.teamName} placement={r.placement} scores={r.scores} note={r.note} teamLink={teamLink} />
          ))}
        </div>
      </div>
      <div className="px-5 py-2 border-t border-white/5 text-[9px] text-gray-600 text-right">
        Maks. {maxScore} pkt / kategoria · {maxScore * 4} pkt łącznie
      </div>
    </motion.div>
  );
}

// Convert static results.json to unified shape
function staticToEditionResults(): EditionResults {
  const challengeOrder = ['geospatial', 'process-automation'] as const;
  const challenges: Record<string, ChallengeData> = {};
  for (const key of challengeOrder) {
    const ch = (staticResults.challenges as any)[key];
    if (!ch) continue;
    challenges[key] = {
      slug: key,
      name: ch.name,
      color: key === 'geospatial' ? 'blue' : 'purple',
      results: ch.results.map((r: any) => ({
        teamId: r.teamId,
        placement: r.placement,
        note: r.note,
        scores: { ...r.scores },
      })),
    };
  }
  return { visible_placements: 2, show_scores: true, max_score_per_category: 20, challenges };
}

const CHALLENGE_STYLES: Record<string, { colorClass: string; borderColor: string }> = {
  geospatial: { colorClass: 'from-blue-500 to-cyan-600', borderColor: 'border-blue-500/20' },
  'process-automation': { colorClass: 'from-purple-500 to-pink-600', borderColor: 'border-purple-500/20' },
};

function getStyle(slug: string, color?: string) {
  if (CHALLENGE_STYLES[slug]) return CHALLENGE_STYLES[slug];
  const colorMap: Record<string, { colorClass: string; borderColor: string }> = {
    blue: { colorClass: 'from-blue-500 to-cyan-600', borderColor: 'border-blue-500/20' },
    purple: { colorClass: 'from-purple-500 to-pink-600', borderColor: 'border-purple-500/20' },
    green: { colorClass: 'from-green-500 to-teal-600', borderColor: 'border-green-500/20' },
    orange: { colorClass: 'from-orange-500 to-red-600', borderColor: 'border-orange-500/20' },
  };
  return colorMap[color || ''] || { colorClass: 'from-gray-500 to-gray-600', borderColor: 'border-gray-500/20' };
}

export function ResultsTable({ editionNumber }: { editionNumber?: number }) {
  const edCtx = useEditionOptional();
  const edition = editionNumber ?? edCtx?.meta?.number ?? 3;
  const teamLink = (id: string) => edCtx ? edCtx.teamPath(id) : `/zespoly/${id}`;

  const [data, setData] = useState<EditionResults>(staticToEditionResults());

  useEffect(() => {
    fetch(`/api/editions/${edition}/results`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.challenges) setData(d); })
      .catch(() => {});
  }, [edition]);

  const challengeEntries = Object.entries(data.challenges);

  return (
    <section id="wyniki" className="py-16 bg-black">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {challengeEntries.map(([slug, challenge], idx) => {
            const style = getStyle(slug, challenge.color);
            return (
              <ChallengeTable
                key={slug}
                challenge={challenge}
                colorClass={style.colorClass}
                borderColor={style.borderColor}
                animateFrom={idx % 2 === 0 ? 'left' : 'right'}
                maxScore={data.max_score_per_category}
                teamLink={teamLink}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
