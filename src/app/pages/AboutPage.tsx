import { motion } from 'motion/react';
import { Link } from 'react-router';
import { Footer } from '@/app/components/Footer';
import { ImageSlider } from '@/app/components/ImageSlider';
import { GraduationCap, FlaskConical, MessageCircle, Building2, Handshake, Rocket, Code, Users, Briefcase, ChevronRight, ArrowRight } from 'lucide-react';
import { BridgeLink } from '@/app/components/BridgeLink';
import { CollaborationBridge } from '@/app/components/CollaborationBridge';
import { getGalleryImages } from '@/utils/galleryLoader';
import { VALUES } from '@/data/values';
import { COLLABORATIONS } from '@/data/collaborations';

const galleryImages = getGalleryImages('2025');

// Values are now imported from src/data/values.ts

export function AboutPage() {
  return (
    <div className="min-h-screen bg-black">

      {/* ═══ HERO: Split layout ═══ */}
      <section className="relative min-h-[85vh] flex">
        {/* Left side: Logo + branding on black */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center relative bg-black px-8 py-32 lg:py-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <img
              src="/assets/logo-brain.png"
              alt="AI Possibilities Lab"
              className="w-48 md:w-64 mx-auto mb-8 drop-shadow-[0_0_40px_rgba(6,182,212,0.3)]"
            />
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="text-white">AI </span>
              <span className="text-cyan-400">POSSIBILITIES</span>
              <span className="text-pink-400"> LAB</span>
            </h1>
            <p className="text-gray-400 text-sm tracking-[0.3em] uppercase mb-8">
              Koło Naukowe AI &bull; WSEI Kraków
            </p>
            <Link
              to="/dolacz"
              className="inline-block px-8 py-3 border-2 border-cyan-400 text-cyan-400 rounded-full font-bold hover:bg-cyan-400 hover:text-black transition-all"
            >
              Dołącz do nas!
            </Link>
          </motion.div>
        </div>

        {/* Right side: Marble texture + content overlay */}
        <div className="hidden lg:block w-1/2 relative overflow-hidden">
          <img
            src="/assets/marble-texture.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover scale-110 -translate-x-8"
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          {/* Left edge gradient blend */}
          <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black to-transparent z-10" />
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-16 py-20">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h2 className="text-3xl font-bold text-white mb-6">
                Czym jest AI Possibilities Lab?
              </h2>
              <p className="text-gray-200 leading-relaxed mb-5 text-[15px]">
                Jesteśmy Kołem Naukowym AI z WSEI w Krakowie. Tworzymy przestrzeń, w której studenci rozwijają ścieżkę naukową, pasjonaci AI budują community, a firmy i organizacje znajdują talenty i partnerów do współpracy.
              </p>
              <p className="text-gray-300 leading-relaxed mb-5 text-[15px]">
                Mamy markę, kierunek, wartości i projekty — szukamy ludzi, którzy chcieliby z nami współpracować i wspólnie tworzyć wartość. Niezależnie czy jesteś studentem, profesjonalistą z branży, czy organizatorem eventów.
              </p>
              <p className="text-gray-300 leading-relaxed text-[15px]">
                Łączymy świat akademicki ze społecznością praktyków AI — od pomysłów na prace dyplomowe, przez wspólne projekty, po bridging do konferencji naukowych i branżowych.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Mobile: marble description below logo */}
        <div className="lg:hidden absolute bottom-0 left-0 right-0">
          <div className="relative overflow-hidden">
            <img
              src="/assets/marble-texture.png"
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-30"
            />
            <div className="relative z-10 px-6 py-8 bg-black/60">
              <p className="text-gray-300 text-sm leading-relaxed">
                Tworzymy przestrzeń, w której studenci rozwijają ścieżkę naukową, pasjonaci AI budują community, a firmy znajdują talenty i partnerów.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ VALUES: 6 kart — 3 filary ═══ */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute top-0 right-0 w-2/3 h-full opacity-10 pointer-events-none">
          <img src="/assets/marble-texture.png" alt="" className="w-full h-full object-cover" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Dlaczego warto?</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-cyan-400 to-pink-400 mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {VALUES.map((val, idx) => (
              <motion.div
                key={val.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
              >
                <Link
                  to={`/o-nas/${val.id}`}
                  className="group flex flex-col p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/8 hover:border-cyan-500/30 transition-all h-full min-h-[280px]"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${val.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <val.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-white font-bold mb-2">{val.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed flex-1">{val.description}</p>

                  {/* Bridge — fixed at bottom */}
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <BridgeLink
                      leftLabel={val.linkLeft.label}
                      rightLabel={val.linkRight.label}
                      color={val.color}
                      size="sm"
                    />
                  </div>

                  {/* Animated CTA */}
                  <div className="flex items-center gap-1.5 text-cyan-400 text-sm font-medium mt-3 opacity-0 group-hover:opacity-100 transition-all translate-x-0 group-hover:translate-x-1">
                    <ArrowRight className="w-4 h-4" />
                    Dowiedz się więcej
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PHOTO CAROUSEL ═══ */}
      <ImageSlider images={galleryImages} title="Z naszych wydarzeń" />

      {/* ═══ 3 FILARY: Studenci / Community / Biznes ═══ */}
      <section className="py-24 bg-black relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Dla kogo działamy?</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Trzy ścieżki, jedna społeczność</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: GraduationCap,
                title: 'Dla studentów WSEI',
                description: 'Szukasz tematu na pracę dyplomową? Potrzebujesz rady przy projekcie? Bridgujemy drogę między uczelnią a konferencjami, publikacjami i realnym światem AI.',
                color: 'from-cyan-500 to-blue-600',
              },
              {
                icon: Users,
                title: 'Community & Discord',
                description: 'Otwarta społeczność pasjonatów AI, niezależnie skąd jesteś. Dołącz do Discorda, wymieniaj się doświadczeniami, realizuj projekty i poznawaj ludzi z branży.',
                color: 'from-blue-500 to-purple-600',
              },
              {
                icon: Briefcase,
                title: 'Współpraca z biznesem',
                description: 'Jesteś z branży? Szukasz talentów? Organizujesz eventy? Mamy markę, projekty i społeczność, chętnie przyjmiemy wiedzę z Twojej strony.',
                color: 'from-purple-500 to-pink-600',
              },
            ].map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="relative overflow-hidden rounded-3xl"
              >
                <div className="absolute inset-0 opacity-15">
                  <img src="/assets/marble-texture.png" alt="" className="w-full h-full object-cover" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/90" />
                <div className="relative z-10 p-8">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 shadow-lg`}>
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WSPÓŁPRACA — Case Studies ═══ */}
      <section className="py-24 bg-gradient-to-b from-black to-gray-950 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Współpraca</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Potwierdzone wartości wniesione we współpracy z partnerami</p>
            <div className="w-16 h-1 bg-gradient-to-r from-cyan-400 to-pink-400 mx-auto mt-4" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {COLLABORATIONS.map((collab, idx) => (
              <motion.div
                key={collab.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
              >
                <Link
                  to={`/wspolpraca/${collab.id}`}
                  className="group flex flex-col relative overflow-hidden rounded-3xl h-full"
                >
                  <div className="absolute inset-0 opacity-15">
                    <img src="/assets/marble-texture.png" alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/90" />
                  <div className="relative z-10 p-8 flex flex-col flex-1">
                    {/* Logo bridge */}
                    <div className="mb-6">
                      <CollaborationBridge
                        partnerName={collab.partner}
                        partnerLogo={collab.partnerLogo}
                        color={collab.color}
                        size="sm"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{collab.tagline}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed flex-1">{collab.description}</p>
                    <div className="flex items-center gap-1.5 text-cyan-400 text-sm font-medium mt-4 opacity-60 group-hover:opacity-100 transition-all translate-x-0 group-hover:translate-x-1">
                      <ArrowRight className="w-4 h-4" />
                      Zobacz szczegóły
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WIZJA ═══ */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/assets/marble-texture.png" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/70" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">Nasza wizja</h2>
            <p className="text-lg text-gray-200 leading-relaxed mb-6">
              Budujemy most między uczelnią, społecznością pasjonatów i branżą. Niezależnie czy jesteś studentem szukającym tematu na magisterkę, developerem chcącym dołączyć do community, czy firmą szukającą partnerstwa, jest tu dla Ciebie miejsce.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed mb-6">
              Wierzymy, że najlepsze rzeczy powstają, gdy ludzie z różnych środowisk pracują razem. Dlatego łączymy studentów, profesjonalistów i organizacje wokół wspólnej pasji — sztucznej inteligencji.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed">
              Naszym celem nie jest zamknięta akademicka bańka, lecz otwarta platforma do nauki, współpracy i realnego wpływu na świat technologii.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="relative py-24 overflow-hidden bg-black">
        {/* Different visual — gradient + subtle glow instead of marble */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-black to-gray-950" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px]" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Dołącz do nas
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-cyan-400 to-pink-400 mx-auto mb-6" />
            <p className="text-gray-300 text-lg mb-10 max-w-xl mx-auto">
              Wypełnij formularz zgłoszeniowy, niezależnie czy chcesz dołączyć do koła, community, czy nawiązać współpracę.
            </p>
            <Link
              to="/dolacz"
              className="inline-flex items-center gap-2 px-10 py-4 bg-cyan-500 hover:bg-cyan-400 text-black rounded-full text-lg font-bold transition-all shadow-[0_0_30px_rgba(6,182,212,0.4)]"
            >
              Wypełnij formularz
              <ChevronRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
