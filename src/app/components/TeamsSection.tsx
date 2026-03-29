import { motion } from 'motion/react';
import { Link } from 'react-router';
import { Trophy, ArrowRight, Users, MapPin } from 'lucide-react';
import { TEAMS, WINNERS } from '@/data/teams';

export function TeamsSection() {
  return (
    <section id="zespoly" className="py-20 bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Projekty zespołów</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Poznaj rozwiązania stworzone podczas AI Krak Hack 2026</p>
          <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 to-pink-400 mx-auto mt-4" />
        </motion.div>

        {/* Winners highlight */}
        {WINNERS.length > 0 && (
          <div className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {WINNERS.map((team, idx) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.15 }}
                >
                  <Link
                    to={`/zespoly/${team.id}`}
                    className="group block p-6 bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-3xl hover:border-amber-500/40 transition-all"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Trophy className="w-5 h-5 text-amber-400" />
                      <span className="text-amber-400 font-bold text-sm">{team.placementLabel}</span>
                      <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold ${team.challenge === 'geospatial' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                        {team.challenge === 'geospatial' ? 'Infrastructure' : 'Process Mining'}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{team.name}</h3>
                    {team.projectName && <p className="text-cyan-400 text-sm font-medium mb-2">{team.projectName}</p>}
                    <p className="text-gray-400 text-sm leading-relaxed mb-3">{team.shortDescription}</p>
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-3">
                      <Users className="w-3 h-3" /> {team.members.join(', ')}
                    </div>
                    <div className="flex items-center gap-1.5 text-amber-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-all">
                      <ArrowRight className="w-4 h-4" /> Zobacz szczegóły
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* All teams grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {TEAMS.filter((t) => !t.placement).map((team, idx) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
            >
              <Link
                to={`/zespoly/${team.id}`}
                className="group flex flex-col p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/8 hover:border-cyan-500/30 transition-all h-full"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${team.challenge === 'geospatial' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                    {team.challenge === 'geospatial' ? 'Infrastructure' : 'Process'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{team.name}</h3>
                {team.projectName && <p className="text-cyan-400 text-xs font-medium mb-2">{team.projectName}</p>}
                <p className="text-gray-400 text-xs leading-relaxed flex-1 mb-3">{team.shortDescription.slice(0, 120)}...</p>
                <div className="text-gray-500 text-[10px] mb-2">
                  <Users className="w-3 h-3 inline mr-1" />{team.members.length} os.
                  {team.university && <> · <MapPin className="w-3 h-3 inline mr-0.5" />{team.university}</>}
                </div>
                <div className="flex items-center gap-1 text-cyan-400 text-xs font-medium opacity-0 group-hover:opacity-100 transition-all">
                  <ArrowRight className="w-3 h-3" /> Szczegóły
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
