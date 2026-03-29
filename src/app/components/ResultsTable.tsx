import { motion } from 'motion/react';
import { Link } from 'react-router';
import { Trophy, Star, Award } from 'lucide-react';
import results from '@/data/results.json';
import { getTeamBySlug, SPECIAL_MENTIONS } from '@/data/teams';

interface ScoreBarProps {
  value: number;
  max: number;
  color: string;
  label: string;
}

function ScoreBar({ value, max, color, label }: ScoreBarProps) {
  const pct = (value / max) * 100;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-500">{label}</span>
        <span className="text-gray-300 font-bold">{value}/{max}</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

export function ResultsTable() {
  const categories = results.scoringCategories;
  const geo = results.challenges.geospatial;
  const proc = results.challenges['process-automation'];

  return (
    <section id="wyniki" className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Wyniki</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Oceny jury w czterech kategoriach: innowacyjność, wartość techniczna, użyteczność i jakość prezentacji</p>
          <div className="w-20 h-1 bg-gradient-to-r from-amber-400 to-orange-500 mx-auto mt-4" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          {/* Geospatial Challenge */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white/5 border border-blue-500/20 rounded-3xl p-6 space-y-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold">{geo.name}</h3>
                <p className="text-gray-500 text-xs">{geo.description}</p>
              </div>
            </div>

            {geo.results.map((r, idx) => {
              const team = getTeamBySlug(r.teamId);
              if (!team) return null;
              return (
                <Link key={r.teamId} to={`/zespoly/${r.teamId}`} className="block group">
                  <div className={`p-4 rounded-2xl border transition-all ${idx === 0 ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40' : 'bg-white/3 border-white/8 hover:border-white/20'}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-sm font-bold ${idx === 0 ? 'text-amber-400' : 'text-gray-400'}`}>
                        {idx === 0 && <Trophy className="w-4 h-4 inline mr-1" />}
                        {r.placement}. miejsce
                      </span>
                      <span className="text-white font-bold">{team.name}</span>
                      <span className={`ml-auto text-lg font-black ${idx === 0 ? 'text-amber-400' : 'text-cyan-400'}`}>{r.scores.total}/{geo.maxTotal}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <ScoreBar value={r.scores.innovation} max={geo.maxScorePerCategory} color="bg-gradient-to-r from-cyan-500 to-blue-500" label="Innowacyjność" />
                      <ScoreBar value={r.scores.technicalValue} max={geo.maxScorePerCategory} color="bg-gradient-to-r from-blue-500 to-indigo-500" label="Wartość techniczna" />
                      <ScoreBar value={r.scores.usefulness} max={geo.maxScorePerCategory} color="bg-gradient-to-r from-indigo-500 to-purple-500" label="Użyteczność" />
                      <ScoreBar value={r.scores.presentationQuality} max={geo.maxScorePerCategory} color="bg-gradient-to-r from-purple-500 to-pink-500" label="Jakość prezentacji" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </motion.div>

          {/* Process Challenge */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white/5 border border-purple-500/20 rounded-3xl p-6 space-y-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold">{proc.name}</h3>
                <p className="text-gray-500 text-xs">{proc.description}</p>
              </div>
            </div>

            {proc.results.map((r, idx) => {
              const team = getTeamBySlug(r.teamId);
              if (!team) return null;
              return (
                <Link key={r.teamId} to={`/zespoly/${r.teamId}`} className="block group">
                  <div className={`p-4 rounded-2xl border transition-all ${idx === 0 ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40' : 'bg-white/3 border-white/8 hover:border-white/20'}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-sm font-bold ${idx === 0 ? 'text-amber-400' : 'text-gray-400'}`}>
                        {idx === 0 && <Trophy className="w-4 h-4 inline mr-1" />}
                        {r.placement}. miejsce
                      </span>
                      <span className="text-white font-bold">{team.name}</span>
                      <span className={`ml-auto text-lg font-black ${idx === 0 ? 'text-amber-400' : 'text-cyan-400'}`}>{r.scores.total}/{proc.maxTotal}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <ScoreBar value={r.scores.innovation} max={proc.maxScorePerCategory} color="bg-gradient-to-r from-cyan-500 to-blue-500" label="Innowacyjność" />
                      <ScoreBar value={r.scores.technicalValue} max={proc.maxScorePerCategory} color="bg-gradient-to-r from-blue-500 to-indigo-500" label="Wartość techniczna" />
                      <ScoreBar value={r.scores.usefulness} max={proc.maxScorePerCategory} color="bg-gradient-to-r from-indigo-500 to-purple-500" label="Użyteczność" />
                      <ScoreBar value={r.scores.presentationQuality} max={proc.maxScorePerCategory} color="bg-gradient-to-r from-purple-500 to-pink-500" label="Jakość prezentacji" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </motion.div>
        </div>

        {/* Special Mentions */}
        {SPECIAL_MENTIONS.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h3 className="text-xl font-bold text-white text-center mb-6 flex items-center justify-center gap-2">
              <Award className="w-5 h-5 text-cyan-400" /> Wyróżnienia specjalne
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SPECIAL_MENTIONS.map((team) => (
                <Link key={team.id} to={`/zespoly/${team.id}`}
                  className="group p-5 bg-white/5 border border-cyan-500/15 rounded-2xl hover:border-cyan-500/30 transition-all text-center">
                  <Star className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                  <h4 className="text-white font-bold mb-1">{team.name}</h4>
                  <p className="text-cyan-400 text-xs font-medium mb-2">{team.specialMention}</p>
                  {team.projectName && <p className="text-gray-500 text-xs">{team.projectName}</p>}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
