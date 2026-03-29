import { motion } from 'motion/react';
import { Link } from 'react-router';
import { Trophy, ArrowRight, Users, Star, Award, FileText, Download } from 'lucide-react';
import { TEAMS, WINNERS, SPECIAL_MENTIONS, GEOSPATIAL_TEAMS, PROCESS_TEAMS } from '@/data/teams';
import results from '@/data/results.json';

function getScores(teamId: string) {
  for (const challenge of Object.values(results.challenges)) {
    const r = (challenge as any).results?.find((r: any) => r.teamId === teamId);
    if (r) return r.scores;
  }
  const sm = results.specialMentions.find((s) => s.teamId === teamId);
  if (sm && (sm as any).scores) return (sm as any).scores;
  return null;
}

function ScoreMini({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = (value / max) * 100;
  return (
    <div className="flex items-center gap-2 text-[10px]">
      <span className="text-gray-500 w-16 shrink-0">{label}</span>
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

export function TeamsSection() {
  return (
    <section id="zespoly" className="py-20 bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Zwycięzcy</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">9 zespołów, 2 wyzwania, setki godzin pracy</p>
          <div className="w-20 h-1 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto mt-4" />
        </motion.div>

        {/* Winners */}
        <div className="mb-12">
          <h3 className="text-sm font-bold uppercase tracking-widest text-pink-400 text-center mb-6 flex items-center justify-center gap-2">
            <Trophy className="w-4 h-4" /> Zwycięzcy
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {WINNERS.map((team, idx) => {
              const scores = getScores(team.id);
              return (
                <motion.div key={team.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}>
                  <Link to={`/zespoly/${team.id}`}
                    className="group block p-6 bg-gradient-to-br from-pink-500/5 to-purple-500/3 border border-pink-500/20 rounded-2xl hover:border-pink-500/40 transition-all h-full">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-pink-500/20 rounded-full text-pink-400 text-xs font-bold">
                        <Trophy className="w-3 h-3" /> {team.placementLabel}
                      </span>
                      {scores && <span className="ml-auto text-pink-400 font-black text-lg">{scores.total}/80</span>}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">{team.name}</h3>
                    {team.projectName && <p className="text-cyan-400 text-xs font-medium mb-2">{team.projectName}</p>}
                    <p className="text-gray-400 text-sm leading-relaxed mb-3">{team.shortDescription.slice(0, 150)}...</p>
                    {scores && (
                      <div className="space-y-1.5 mb-3">
                        <ScoreMini value={scores.innovation} max={20} label="Innowacja" />
                        <ScoreMini value={scores.technicalValue} max={20} label="Technika" />
                        <ScoreMini value={scores.usefulness} max={20} label="Użyteczność" />
                        <ScoreMini value={scores.presentationQuality} max={20} label="Prezentacja" />
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-[10px]"><Users className="w-3 h-3 inline mr-1" />{team.members.join(', ')}</span>
                      <ArrowRight className="w-4 h-4 text-pink-400 opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Special mentions */}
        {SPECIAL_MENTIONS.length > 0 && (
          <div className="mb-12">
            <h3 className="text-sm font-bold uppercase tracking-widest text-cyan-400 text-center mb-6 flex items-center justify-center gap-2">
              <Award className="w-4 h-4" /> Wyróżnienia specjalne
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {SPECIAL_MENTIONS.map((team) => (
                <Link key={team.id} to={`/zespoly/${team.id}`}
                  className="group p-4 bg-white/3 border border-cyan-500/15 rounded-2xl hover:border-cyan-500/30 transition-all text-center">
                  <Star className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
                  <h4 className="text-white font-bold text-sm mb-1">{team.name}</h4>
                  <p className="text-cyan-400 text-[10px] font-medium">{team.specialMention}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* All other teams */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 text-center mb-6">Wszystkie zespoły</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {TEAMS.filter((t) => !t.placement).map((team, idx) => {
              const scores = getScores(team.id);
              return (
                <motion.div key={team.id} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.05 }}>
                  <Link to={`/zespoly/${team.id}`}
                    className="group flex flex-col p-4 bg-white/3 border border-white/8 rounded-2xl hover:bg-white/5 hover:border-white/15 transition-all h-full min-h-[180px]">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${team.challenge === 'geospatial' ? 'bg-blue-500/15 text-blue-400' : 'bg-purple-500/15 text-purple-400'}`}>
                        {team.challenge === 'geospatial' ? 'Infrastructure' : 'Process'}
                      </span>
                      {team.specialMention && (
                        <Star className="w-3 h-3 text-cyan-400" />
                      )}
                      {scores && <span className="ml-auto text-gray-500 text-xs font-bold">{scores.total}/80</span>}
                      {team.presentationFile && <FileText className="w-3 h-3 text-gray-600" />}
                    </div>
                    <h3 className="text-white font-bold text-sm mb-1">{team.name}</h3>
                    {team.projectName && <p className="text-gray-500 text-[10px] mb-1">{team.projectName}</p>}
                    <p className="text-gray-500 text-xs leading-relaxed flex-1">{team.shortDescription.slice(0, 100)}...</p>
                    <div className="mt-2 text-[9px] text-gray-600">
                      <Users className="w-2.5 h-2.5 inline mr-0.5" />{team.members.length} os.
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
