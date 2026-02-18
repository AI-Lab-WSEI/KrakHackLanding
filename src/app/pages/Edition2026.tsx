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
import { editions } from '@/data/editions';

export function Edition2026() {
  const edition = editions['2026'];

  return (
    <div className="min-h-screen">
      <Hero
        subtitle={edition.heroSubtitle}
        ctaUrl={edition.ctaApplyUrl}
        isArchive={false}
      />

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

      <div id="archiwum" className="py-20 bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Zobacz poprzednią edycję
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Sprawdź jak wyglądał AI Krak Hack 2025 - zdjęcia, relacje i historie sukcesu uczestników
          </p>
          <a
            href="/2025"
            className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg transition-all shadow-lg hover:shadow-cyan-500/50"
          >
            Przejdź do archiwum 2025
          </a>
        </div>
      </div>


      <Footer />
    </div>
  );
}