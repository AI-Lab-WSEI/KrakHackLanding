import { Hero } from '@/app/components/Hero';
import { ValueCards } from '@/app/components/ValueCards';
import { ImageSlider } from '@/app/components/ImageSlider';
import { Timeline } from '@/app/components/Timeline';
import { Program } from '@/app/components/Program';
import { RegistrationForm } from '@/app/components/RegistrationForm';
import { Footer } from '@/app/components/Footer';
import { Categories } from '@/app/components/Categories';
import { ChallengesSection } from '@/app/components/ChallengesSection';
import { SponsorSection } from '@/app/components/SponsorSection';
import { MentorSection } from '@/app/components/MentorSection';
import { PartnersSection } from '@/app/components/PartnersSection';
import { TeamsSection } from '@/app/components/TeamsSection';
import { ResultsTable } from '@/app/components/ResultsTable';
import { CollapsibleSection } from '@/app/components/CollapsibleSection';
import { editions } from '@/data/editions';
import { Link } from 'react-router';
import { motion } from 'motion/react';

export function Edition2026() {
  const edition = editions['2026'];
  const isPostHackathon = new Date() >= new Date('2026-03-28T18:00:00');

  return (
    <div className="min-h-screen relative">
      <Hero
        subtitle={edition.heroSubtitle}
        ctaUrl={edition.ctaApplyUrl}
        isArchive={false}
      />

      <div className="relative z-20">
        {isPostHackathon ? (
          <>
            {/* ══ POST-HACKATHON LAYOUT ══ */}

            {/* 1. Gallery slider — right after hero */}
            {edition.gallery && <ImageSlider images={edition.gallery} title="Atmosfera AI Krak Hack" />}

            {/* 2. Teams + Results (unified, top priority) */}
            <TeamsSection />

            {/* 3. CTA */}
            <section className="py-16 bg-gradient-to-br from-black via-purple-950/40 to-black relative overflow-hidden">
              <div className="absolute inset-0">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute top-1/3 right-1/4 w-80 h-80 bg-pink-500/15 blur-[100px] rounded-full"
                />
              </div>
              <div className="container mx-auto px-4 text-center relative z-10">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Dziękujemy za Twój udział!</h2>
                  <p className="text-gray-400 mb-8 max-w-xl mx-auto">Podziel się opinią w ankiecie i dołącz do koła naukowego AI Possibilities Lab.</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/feedback"
                      className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-xl transition-all shadow-lg shadow-cyan-500/20 text-lg font-bold">
                      Wypełnij ankietę
                    </Link>
                    <Link to="/dolacz"
                      className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white rounded-xl transition-all shadow-lg shadow-pink-500/20 text-lg font-bold">
                      Działaj z nami
                    </Link>
                  </div>
                </motion.div>
              </div>
            </section>

            {/* 4. Partners — always visible */}
            <PartnersSection />

            {/* 5. Archive sections — collapsed */}
            <div className="bg-gray-950">
              <div className="container mx-auto px-4 max-w-5xl">
                <div className="py-8">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-gray-600 text-center">Archiwum wydarzenia</h2>
                </div>

                <CollapsibleSection title="Wyzwania">
                  {edition.challenges && <ChallengesSection challenges={edition.challenges} />}
                </CollapsibleSection>

                <CollapsibleSection title="Dlaczego warto wziąć udział?">
                  <ValueCards cards={edition.highlights} title="" />
                </CollapsibleSection>

                <CollapsibleSection title="Harmonogram wydarzeń">
                  <Timeline steps={edition.timelineSteps} title="" />
                </CollapsibleSection>

                <CollapsibleSection title="Jak to działa?">
                  {edition.program && (
                    <Program
                      title=""
                      description={edition.program.description}
                      faqs={edition.program.faqs}
                    />
                  )}
                </CollapsibleSection>

                <CollapsibleSection title="Zostań sponsorem / mentorem">
                  <SponsorSection />
                  <MentorSection />
                </CollapsibleSection>

                <CollapsibleSection title="Formularz rejestracyjny">
                  <RegistrationForm />
                </CollapsibleSection>
              </div>
            </div>

            {/* 6. Archive 2025 link */}
            <div id="archiwum" className="py-16 bg-gray-900">
              <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold text-white mb-4">Zobacz poprzednią edycję</h2>
                <p className="text-gray-400 mb-6">Sprawdź jak wyglądał AI Krak Hack 2025</p>
                <a href="/2025"
                  className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg transition-all shadow-lg">
                  Przejdź do archiwum 2025
                </a>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* ══ PRE-HACKATHON LAYOUT (original) ══ */}
            <ValueCards cards={edition.highlights} title="Dlaczego warto wziąć udział?" />
            {edition.gallery && <ImageSlider images={edition.gallery} title="Atmosfera AI Krak Hack" />}
            {edition.categories && <Categories categories={edition.categories} />}
            {edition.challenges && <ChallengesSection challenges={edition.challenges} />}
            <Timeline steps={edition.timelineSteps} title="Harmonogram wydarzeń" />
            {edition.program && (
              <Program
                title={edition.program.title}
                description={edition.program.description}
                faqs={edition.program.faqs}
              />
            )}
            <PartnersSection />
            <SponsorSection />
            <MentorSection />
            <RegistrationForm />

            <section className="py-20 bg-gradient-to-br from-black via-purple-950/40 to-black relative overflow-hidden">
              <div className="container mx-auto px-4 text-center relative z-10">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Działaj z nami!</h2>
                  <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                    Dołącz do koła naukowego AI Possibilities Lab i rozwijaj się z nami!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/o-nas"
                      className="px-8 py-4 bg-white/10 border border-white/20 hover:bg-white/15 text-white rounded-xl transition-all text-lg font-semibold">
                      Poznaj nasze koło
                    </Link>
                    <Link to="/dolacz"
                      className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white rounded-xl transition-all shadow-lg shadow-pink-500/20 text-lg font-bold">
                      Zgłoś się do koła
                    </Link>
                  </div>
                </motion.div>
              </div>
            </section>

            <div id="archiwum" className="py-20 bg-gray-900">
              <div className="container mx-auto px-4 text-center">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Zobacz poprzednią edycję</h2>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                  Sprawdź jak wyglądał AI Krak Hack 2025
                </p>
                <a href="/2025" className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg transition-all shadow-lg hover:shadow-cyan-500/50">
                  Przejdź do archiwum 2025
                </a>
              </div>
            </div>
          </>
        )}

        <Footer />
      </div>
    </div>
  );
}
