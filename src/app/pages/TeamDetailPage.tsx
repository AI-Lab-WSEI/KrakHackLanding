import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Trophy, Users, Code, Check, MapPin, Cpu, Star, Download, X, Monitor } from 'lucide-react';
import { getTeamBySlug, TEAMS, type TeamProject } from '@/data/teams';
import { Footer } from '@/app/components/Footer';
import results from '@/data/results.json';
import { useEditionOptional } from '@/app/hooks/useEdition';

interface CarouselImage {
  url: string;
  alt: string;
  caption?: string;
}

function ScreenshotCarousel({ images, teamName }: { images: CarouselImage[]; teamName: string }) {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const goTo = useCallback((idx: number) => {
    setCurrent(((idx % images.length) + images.length) % images.length);
  }, [images.length]);

  return (
    <>
      <section className="py-16 bg-black">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-white mb-2 text-center flex items-center justify-center gap-2">
            <Monitor className="w-5 h-5 text-cyan-400" /> Screenshoty z platformy
          </h2>
          <p className="text-gray-500 text-sm text-center mb-8">{teamName} — galeria aplikacji</p>

          <div className="max-w-5xl mx-auto relative group">
            {/* Main image */}
            <div className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 cursor-pointer" onClick={() => setLightbox(current)}>
              <AnimatePresence mode="wait">
                <motion.img
                  key={current}
                  src={images[current].url}
                  alt={images[current].alt}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25 }}
                  className="w-full aspect-video object-contain bg-gray-950"
                />
              </AnimatePresence>
              {images[current].caption && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent px-6 py-4">
                  <p className="text-sm text-gray-300">{images[current].caption}</p>
                </div>
              )}
            </div>

            {/* Nav arrows */}
            {images.length > 1 && (
              <>
                <button onClick={() => goTo(current - 1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 border border-white/10 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={() => goTo(current + 1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 border border-white/10 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Counter */}
            <div className="absolute top-3 right-3 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-xs text-gray-300 border border-white/10">
              {current + 1} / {images.length}
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="max-w-5xl mx-auto mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`shrink-0 w-24 h-14 rounded-lg overflow-hidden border-2 transition-all ${i === current ? 'border-cyan-400 opacity-100' : 'border-transparent opacity-50 hover:opacity-80'}`}
                >
                  <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            onClick={() => setLightbox(null)}
          >
            <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10">
              <X className="w-5 h-5" />
            </button>
            {images.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); const n = ((lightbox - 1) % images.length + images.length) % images.length; setLightbox(n); setCurrent(n); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10">
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); const n = (lightbox + 1) % images.length; setLightbox(n); setCurrent(n); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10">
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
            <motion.img
              key={lightbox}
              src={images[lightbox].url}
              alt={images[lightbox].alt}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            {images[lightbox].caption && (
              <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-gray-400 bg-black/60 px-4 py-2 rounded-full backdrop-blur-sm">
                {images[lightbox].caption}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/** Map API snake_case row to TeamProject interface */
function apiToTeamProject(row: any): TeamProject {
  return {
    id: row.slug,
    name: row.name,
    placement: row.placement ?? undefined,
    placementLabel: row.placement_label ?? undefined,
    specialMention: row.special_mention ?? undefined,
    challenge: row.challenge,
    members: row.members ?? [],
    university: row.university ?? undefined,
    projectName: row.project_name ?? undefined,
    shortDescription: row.short_description ?? '',
    fullDescription: row.full_description ?? [],
    keyFeatures: row.key_features ?? [],
    technologies: row.technologies ?? [],
    images: row.images ?? [],
    presentationFile: row.presentation_file ?? undefined,
    presentationSlides: row.presentation_slides ?? undefined,
  };
}

export function TeamDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const edCtx = useEditionOptional();
  const [apiTeam, setApiTeam] = useState<TeamProject | null>(null);

  const editionNumber = edCtx?.meta.number ?? 3;

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/teams/edition/${editionNumber}/${slug}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setApiTeam(apiToTeamProject(data)); })
      .catch(() => {});
  }, [slug, editionNumber]);

  const allTeams = edCtx?.teams ?? TEAMS;
  const staticTeam = slug ? (allTeams.find(t => t.id === slug) ?? getTeamBySlug(slug)) : undefined;
  const team = apiTeam ?? staticTeam;

  if (!team) { navigate('/'); return null; }

  const currentIdx = allTeams.findIndex((t) => t.id === team.id);
  const prev = currentIdx > 0 ? allTeams[currentIdx - 1] : undefined;
  const next = currentIdx < allTeams.length - 1 ? allTeams[currentIdx + 1] : undefined;
  const teamLink = (id: string) => edCtx ? edCtx.teamPath(id) : `/zespoly/${id}`;
  const backLink = edCtx ? edCtx.basePath : '/';
  const isWinner = team.placement !== undefined;
  const challengeLabel = team.challenge === 'geospatial' ? 'Smart Infrastructure Challenge' : 'Process-to-Automation Copilot';

  return (
    <div className="min-h-screen bg-black relative">
      {/* Fixed nav */}
      {prev && (
        <Link to={teamLink(prev.id)}
          className="fixed left-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center text-gray-400 hover:text-cyan-400 hover:bg-white/10 transition-all">
          <ChevronLeft className="w-6 h-6" />
        </Link>
      )}
      {next && (
        <Link to={teamLink(next.id)}
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
          <Link to={backLink} className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors mb-8 text-sm">
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

      {/* Presentation — at the top, right after hero */}
      {team.presentationFile && team.presentationFile.endsWith('.pdf') && (
        <section className="py-12 bg-gray-950">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Prezentacja</h2>
                <a href={team.presentationFile} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-cyan-500/20 rounded-xl text-gray-300 text-sm hover:bg-white/8 transition-colors shadow-[0_0_10px_rgba(6,182,212,0.05)]">
                  <Download className="w-4 h-4" /> Pobierz PDF
                </a>
              </div>
              <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
                <iframe
                  src={`${team.presentationFile}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                  className="w-full border-0"
                  style={{ height: '75vh', minHeight: '500px' }}
                  title={`Prezentacja ${team.name}`}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Non-PDF presentation — just download button */}
      {team.presentationFile && !team.presentationFile.endsWith('.pdf') && (
        <section className="py-8 bg-gray-950">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <a href={team.presentationFile} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-4 p-5 bg-white/5 border border-cyan-500/20 rounded-2xl hover:bg-white/8 hover:border-cyan-500/30 transition-all shadow-[0_0_15px_rgba(6,182,212,0.05)] group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shrink-0">
                  <Download className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold">Pobierz prezentację</p>
                  <p className="text-gray-500 text-sm">Oryginalna prezentacja zespołu</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 transition-colors" />
              </a>
            </div>
          </div>
        </section>
      )}

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

      {/* (presentation is now at the top) */}

      {/* Screenshot carousel */}
      {team.images.length > 0 && <ScreenshotCarousel images={team.images} teamName={team.name} />}

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
