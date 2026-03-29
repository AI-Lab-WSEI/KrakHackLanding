import { motion } from 'motion/react';
import { Link } from 'react-router';
import { Trophy, Star } from 'lucide-react';
import results from '@/data/results.json';
import { getTeamBySlug } from '@/data/teams';

export function ResultsTable() {
  const geo = results.challenges.geospatial;
  const proc = results.challenges['process-automation'];

  function Row({ teamId, placement, scores, note }: { teamId: string; placement: number; scores: any; note?: string }) {
    const team = getTeamBySlug(teamId);
    const name = team?.name || teamId;
    const isTop = placement <= 2;

    return (
      <Link to={`/zespoly/${teamId}`} className="group">
        <tr className={`border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${isTop ? 'bg-white/3' : ''}`}>
          <td className="px-4 py-3 text-center">
            {placement <= 2 ? (
              <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black ${placement === 1 ? 'bg-gradient-to-br from-pink-500 to-purple-500 text-white' : 'bg-white/10 text-gray-300'}`}>
                {placement}
              </span>
            ) : (
              <span className="text-gray-500 text-sm">{placement}</span>
            )}
          </td>
          <td className="px-4 py-3">
            <span className={`font-bold text-sm ${isTop ? 'text-white' : 'text-gray-300'}`}>{name}</span>
            {note && <span className="text-gray-600 text-[10px] ml-2">{note}</span>}
          </td>
          <td className="px-4 py-3 text-center text-sm text-gray-400">{scores.innovation}</td>
          <td className="px-4 py-3 text-center text-sm text-gray-400">{scores.technicalValue}</td>
          <td className="px-4 py-3 text-center text-sm text-gray-400">{scores.usefulness}</td>
          <td className="px-4 py-3 text-center text-sm text-gray-400">{scores.presentationQuality}</td>
          <td className="px-4 py-3 text-center">
            <span className={`font-black text-sm ${isTop ? 'text-pink-400' : 'text-gray-300'}`}>{scores.total}</span>
          </td>
        </tr>
      </Link>
    );
  }

  return (
    <section id="wyniki" className="py-16 bg-black">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Left: Smart Infrastructure Challenge */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white/3 border border-blue-500/20 rounded-2xl overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">{geo.name}</h3>
                <p className="text-gray-500 text-[10px]">7 zespołów</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left table-fixed">
                <thead>
                  <tr className="border-b border-white/5 text-[9px] uppercase tracking-widest text-gray-600">
                    <th className="px-3 py-2 text-center w-[40px]">#</th>
                    <th className="px-3 py-2 w-[30%]">Zespół</th>
                    <th className="px-2 py-2 text-center">
                      <div>Inn.</div>
                      <div className="text-[7px] normal-case tracking-normal text-gray-700">innowacyjność</div>
                    </th>
                    <th className="px-2 py-2 text-center">
                      <div>Tech.</div>
                      <div className="text-[7px] normal-case tracking-normal text-gray-700">wart. techniczna</div>
                    </th>
                    <th className="px-2 py-2 text-center">
                      <div>Użyt.</div>
                      <div className="text-[7px] normal-case tracking-normal text-gray-700">użyteczność</div>
                    </th>
                    <th className="px-2 py-2 text-center">
                      <div>Prez.</div>
                      <div className="text-[7px] normal-case tracking-normal text-gray-700">jakość prezentacji</div>
                    </th>
                    <th className="px-3 py-2 text-center w-[50px]">Suma</th>
                  </tr>
                </thead>
                <tbody>
                  {geo.results.map((r: any) => (
                    <Row key={r.teamId} teamId={r.teamId} placement={r.placement} scores={r.scores} note={r.note} />
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-2 border-t border-white/5 text-[9px] text-gray-600 text-right">
              Maks. 20 pkt / kategoria · 80 pkt łącznie
            </div>
          </motion.div>

          {/* Right: Process-to-Automation Copilot */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white/3 border border-purple-500/20 rounded-2xl overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">{proc.name}</h3>
                <p className="text-gray-500 text-[10px]">3 zespoły</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left table-fixed">
                <thead>
                  <tr className="border-b border-white/5 text-[9px] uppercase tracking-widest text-gray-600">
                    <th className="px-3 py-2 text-center w-[40px]">#</th>
                    <th className="px-3 py-2 w-[30%]">Zespół</th>
                    <th className="px-2 py-2 text-center">
                      <div>Inn.</div>
                      <div className="text-[7px] normal-case tracking-normal text-gray-700">innowacyjność</div>
                    </th>
                    <th className="px-2 py-2 text-center">
                      <div>Tech.</div>
                      <div className="text-[7px] normal-case tracking-normal text-gray-700">wart. techniczna</div>
                    </th>
                    <th className="px-2 py-2 text-center">
                      <div>Użyt.</div>
                      <div className="text-[7px] normal-case tracking-normal text-gray-700">użyteczność</div>
                    </th>
                    <th className="px-2 py-2 text-center">
                      <div>Prez.</div>
                      <div className="text-[7px] normal-case tracking-normal text-gray-700">jakość prezentacji</div>
                    </th>
                    <th className="px-3 py-2 text-center w-[50px]">Suma</th>
                  </tr>
                </thead>
                <tbody>
                  {proc.results.map((r: any) => (
                    <Row key={r.teamId + '-proc'} teamId={r.teamId} placement={r.placement} scores={r.scores} note={r.note} />
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-2 border-t border-white/5 text-[9px] text-gray-600 text-right">
              Maks. 20 pkt / kategoria · 80 pkt łącznie
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
