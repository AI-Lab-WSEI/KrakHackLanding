import { useParams, useNavigate, Link } from 'react-router';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Trophy, Users, Code, Check, MapPin, Cpu, Star, Download } from 'lucide-react';
import { getTeamBySlug, TEAMS } from '@/data/teams';
import { Footer } from '@/app/components/Footer';
import results from '@/data/results.json';

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
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] ${isWinner ? 'bg-pink-500' : 'bg-cyan-500'} opacity-10 rounded-full blur-[120px]`} />

        <div className="container mx-auto px-4 relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors mb-8 text-sm">
            <ChevronLeft className="w-4 h-4" /> Wróć do strony głównej
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              {isWinner && (
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-pink-500/20 border border-pink-500/30 rounded-full text-pink-400 text-sm font-bold">
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
            <p className="text-gray-400 flex items-center gap-2 text-sm mb-4">
              <Users className="w-4 h-4" /> {team.members.join(', ')}
              {team.university && <> · <MapPin className="w-3 h-3" /> {team.university}</>}
            </p>
            {team.presentationFile && (
              <a href={team.presentationFile} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-300 text-sm hover:bg-white/10 transition-colors">
                <Download className="w-4 h-4" /> Pobierz prezentację
              </a>
            )}
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

      {/* Scores — if team has results */}
      {(() => {
        let scores: any = null;
        for (const ch of Object.values(results.challenges)) {
          const r = (ch as any).results?.find((r: any) => r.teamId === team.id);
          if (r) { scores = r.scores; break; }
        }
        const sm = results.specialMentions.find((s) => s.teamId === team.id);
        if (sm && (sm as any).scores) scores = (sm as any).scores;
        if (!scores) return null;
        const max = 20;
        const cats = [
          { key: 'innovation', label: 'Innowacyjność', color: 'from-cyan-500 to-blue-500' },
          { key: 'technicalValue', label: 'Wartość techniczna', color: 'from-blue-500 to-indigo-500' },
          { key: 'usefulness', label: 'Użyteczność', color: 'from-indigo-500 to-purple-500' },
          { key: 'presentationQuality', label: 'Jakość prezentacji', color: 'from-purple-500 to-pink-500' },
        ];
        return (
          <section className="py-16 bg-black">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-pink-400" /> Ocena jury
                  <span className="ml-auto text-3xl font-black text-pink-400">{scores.total}/80</span>
                </h2>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                  {cats.map((cat) => {
                    const val = scores[cat.key];
                    const pct = (val / max) * 100;
                    return (
                      <div key={cat.key}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="text-gray-400">{cat.label}</span>
                          <span className="text-white font-bold">{val}/{max}</span>
                        </div>
                        <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${pct}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className={`h-full rounded-full bg-gradient-to-r ${cat.color}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* Presentation PDF viewer */}
      {team.presentationFile && (
        <section className="py-16 bg-gray-950">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Prezentacja</h2>
                <a href={team.presentationFile} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-300 text-sm hover:bg-white/10 transition-colors">
                  <Download className="w-4 h-4" /> Pobierz PDF
                </a>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <iframe
                  src={team.presentationFile}
                  className="w-full border-0"
                  style={{ height: '80vh', minHeight: '500px' }}
                  title={`Prezentacja ${team.name}`}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Event photos placeholder */}
      {team.images.length > 0 && (
        <section className="py-16 bg-black">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">Zdjęcia z wydarzenia</h2>
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
