import { useParams, useNavigate, Link } from 'react-router';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Trophy, Users, Code, Check, MapPin, Cpu, Star } from 'lucide-react';
import { getTeamBySlug, TEAMS } from '@/data/teams';
import { Footer } from '@/app/components/Footer';

export function TeamDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const team = slug ? getTeamBySlug(slug) : undefined;

  if (!team) { navigate('/'); return null; }

  const currentIdx = TEAMS.findIndex((t) => t.id === team.id);
  const prev = currentIdx > 0 ? TEAMS[currentIdx - 1] : undefined;
  const next = currentIdx < TEAMS.length - 1 ? TEAMS[currentIdx + 1] : undefined;
  const isWinner = team.placement !== undefined;
  const challengeLabel = team.challenge === 'geospatial' ? 'Smart Infrastructure Challenge' : 'Process-to-Automation Copilot';

  return (
    <div className="min-h-screen bg-black relative">
      {/* Fixed nav */}
      {prev && (
        <Link to={`/zespoly/${prev.id}`}
          className="fixed left-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center text-gray-400 hover:text-cyan-400 hover:bg-white/10 transition-all">
          <ChevronLeft className="w-6 h-6" />
        </Link>
      )}
      {next && (
        <Link to={`/zespoly/${next.id}`}
          className="fixed right-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center text-gray-400 hover:text-cyan-400 hover:bg-white/10 transition-all">
          <ChevronRight className="w-6 h-6" />
        </Link>
      )}

      {/* Hero */}
      <section className="relative pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src="/assets/marble-texture.png" alt="" className="w-full h-full object-cover" />
        </div>
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] ${isWinner ? 'bg-amber-500' : 'bg-cyan-500'} opacity-10 rounded-full blur-[120px]`} />

        <div className="container mx-auto px-4 relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors mb-8 text-sm">
            <ChevronLeft className="w-4 h-4" /> Wróć do strony głównej
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              {isWinner && (
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-400 text-sm font-bold">
                  <Trophy className="w-4 h-4" /> {team.placementLabel}
                </span>
              )}
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${team.challenge === 'geospatial' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'}`}>
                {challengeLabel}
              </span>
              {team.specialMention && (
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-cyan-400 text-sm font-bold">
                  <Star className="w-4 h-4" /> {team.specialMention}
                </span>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">{team.name}</h1>
            {team.projectName && <p className="text-xl text-cyan-400 font-medium mb-4">{team.projectName}</p>}
            <p className="text-gray-400 flex items-center gap-2 text-sm">
              <Users className="w-4 h-4" /> {team.members.join(', ')}
              {team.university && <> · <MapPin className="w-3 h-3" /> {team.university}</>}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Description */}
      <section className="py-16 bg-gradient-to-b from-black to-gray-950">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-gray-300 leading-relaxed mb-8 font-medium">{team.shortDescription}</p>
            {team.fullDescription.map((p, i) => (
              <motion.p key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="text-gray-400 leading-relaxed mb-5">
                {p}
              </motion.p>
            ))}
          </div>
        </div>
      </section>

      {/* Key features */}
      <section className="py-16 bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Kluczowe elementy</h2>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <ul className="space-y-3">
                {team.keyFeatures.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-300">
                    <Check className="w-5 h-5 shrink-0 mt-0.5 text-cyan-400" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {team.technologies && team.technologies.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Technologie</h3>
                <div className="flex flex-wrap gap-2">
                  {team.technologies.map((t) => (
                    <span key={t} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-400 font-medium">
                      <Cpu className="w-3 h-3 inline mr-1.5" />{t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Images/slides placeholder */}
      {team.images.length > 0 && (
        <section className="py-16 bg-black">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">Z prezentacji</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {team.images.map((img, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                  className="rounded-2xl overflow-hidden bg-white/5 border border-white/10">
                  <img src={img.url} alt={img.alt} className="w-full h-64 object-cover" />
                  {img.caption && <p className="p-3 text-xs text-gray-500 text-center">{img.caption}</p>}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 bg-black border-t border-white/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Zweryfikuj certyfikat</h2>
          <p className="text-gray-400 mb-6">Sprawdź certyfikat uczestnictwa lub zwycięstwa.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/verify" className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-bold transition-all hover:from-cyan-400 hover:to-blue-400">
              Weryfikacja certyfikatu
            </Link>
            <a href="https://ai.possibilitieslab.org" target="_blank" rel="noopener noreferrer"
              className="px-8 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-medium hover:bg-white/10 transition-all">
              Poznaj AI Possibilities Lab
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
