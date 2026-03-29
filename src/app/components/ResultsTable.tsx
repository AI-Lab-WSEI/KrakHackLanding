import { motion } from 'motion/react';
import { Link } from 'react-router';
import { Trophy } from 'lucide-react';
import results from '@/data/results.json';
import { getTeamBySlug } from '@/data/teams';
import { useEditionOptional } from '@/app/hooks/useEdition';

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

function Row({ teamId, placement, scores, note, teamLink }: { teamId: string; placement: number; scores: any; note?: string; teamLink: (id: string) => string }) {
  const team = getTeamBySlug(teamId);
  const name = team?.name || teamId;
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

function ChallengeTable({
  challenge,
  color,
  gradientFrom,
  gradientTo,
  borderColor,
  teamCount,
  animateFrom,
  teamLink,
}: {
  challenge: any;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  borderColor: string;
  teamCount: string;
  animateFrom: 'left' | 'right';
  teamLink: (id: string) => string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: animateFrom === 'left' ? -20 : 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className={`bg-white/3 border ${borderColor} rounded-2xl overflow-hidden`}
    >
      <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradientFrom} ${gradientTo} flex items-center justify-center`}>
          <Trophy className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-white font-bold text-sm">{challenge.name}</h3>
          <p className="text-gray-500 text-[10px]">{teamCount}</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[500px]">
          <HeaderRow />
          {challenge.results.map((r: any) => (
            <Row key={r.teamId} teamId={r.teamId} placement={r.placement} scores={r.scores} note={r.note} teamLink={teamLink} />
          ))}
        </div>
      </div>
      <div className="px-5 py-2 border-t border-white/5 text-[9px] text-gray-600 text-right">
        Maks. 20 pkt / kategoria · 80 pkt łącznie
      </div>
    </motion.div>
  );
}

export function ResultsTable() {
  const edCtx = useEditionOptional();
  const teamLink = (id: string) => edCtx ? edCtx.teamPath(id) : `/zespoly/${id}`;
  const geo = results.challenges.geospatial;
  const proc = results.challenges['process-automation'];

  return (
    <section id="wyniki" className="py-16 bg-black">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          <ChallengeTable
            challenge={geo}
            color="blue"
            gradientFrom="from-blue-500"
            gradientTo="to-cyan-600"
            borderColor="border-blue-500/20"
            teamCount="7 zespołów"
            animateFrom="left"
            teamLink={teamLink}
          />
          <ChallengeTable
            challenge={proc}
            color="purple"
            gradientFrom="from-purple-500"
            gradientTo="to-pink-600"
            borderColor="border-purple-500/20"
            teamCount="3 zespoły"
            animateFrom="right"
            teamLink={teamLink}
          />
        </div>
      </div>
    </section>
  );
}
