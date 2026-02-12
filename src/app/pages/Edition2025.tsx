import { Hero } from '@/app/components/Hero';
import { ValueCards } from '@/app/components/ValueCards';
import { ImageSlider } from '@/app/components/ImageSlider';
import { Timeline } from '@/app/components/Timeline';
import { Stats } from '@/app/components/Stats';
import { Gallery } from '@/app/components/Gallery';
import { StoryBlocks } from '@/app/components/StoryBlocks';
import { SuccessStory } from '@/app/components/SuccessStory';
import { Footer } from '@/app/components/Footer';
import { editions } from '@/data/editions';

export function Edition2025() {
  const edition = editions['2025'];

  return (
    <div className="min-h-screen">
      <Hero
        title={edition.heroTitle}
        subtitle={edition.heroSubtitle}
        date={edition.heroDate}
        ctaUrl={edition.ctaApplyUrl}
        isArchive={true}
      />

      <div className="bg-gradient-to-b from-gray-900 via-purple-950/20 to-black py-8 border-y border-purple-500/20">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-900/40 via-cyan-900/40 to-purple-900/40 border border-purple-500/40 rounded-full backdrop-blur-md shadow-lg shadow-purple-500/20">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            <p className="text-transparent bg-gradient-to-r from-purple-300 via-cyan-300 to-purple-300 bg-clip-text font-semibold text-lg">
              Archiwum pierwszej edycji AI Krak Hack 2025
            </p>
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      <ValueCards cards={edition.highlights} title="Co oferowaliśmy?" />

      {edition.gallery && <ImageSlider images={edition.gallery} title="Z naszego wydarzenia" />}

      <Timeline steps={edition.timelineSteps} title="Plan wydarzenia (30-31.05.2025)" />

      {edition.stats && <Stats stats={edition.stats} />}

      {edition.gallery && <Gallery images={edition.gallery} />}

      {edition.storyBlocks && <StoryBlocks blocks={edition.storyBlocks} />}

      {edition.successStory && <SuccessStory story={edition.successStory} />}

      <div className="py-20 bg-black">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Dołącz do kolejnej edycji!
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            AI Krak Hack 2026 już wkrótce. Nie przegap szansy na rozwój swoich umiejętności AI!
          </p>
          <a
            href="/"
            className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg transition-all shadow-lg hover:shadow-cyan-500/50"
          >
            Zobacz aktualną edycję
          </a>
        </div>
      </div>

      <Footer partners={edition.partners} />
    </div>
  );
}