import { motion } from 'motion/react';
import { useState } from 'react';
import {
  ClipboardList, Users, Star, Trophy, Award, Images, Mail, BarChart2,
  Building2, UserCircle, Scale, Globe, ChevronRight, ArrowDown,
  UserPlus, CheckCircle, MessageSquare, Gavel, ExternalLink, X,
} from 'lucide-react';
import platformContent from '@/data/platform-content.json';

/* ─── Feature tiles ─────────────────────────────────────────── */
const FEATURES = [
  {
    icon: ClipboardList,
    title: 'Rejestracja uczestników',
    description: 'Formularze dla zespołów, mentorów i firm sponsorujących. Automatyczne maile potwierdzające z harmonogramem.',
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    icon: Users,
    title: 'Zarządzanie zespołami',
    description: 'Profile projektów ze screenshotami, prezentacjami PDF, opisami technicznymi i historią edycji.',
    gradient: 'from-pink-500 to-purple-500',
  },
  {
    icon: Scale,
    title: 'Panel jurora',
    description: 'Dedykowany panel z tokenem dostępu — juror ocenia projekty per kategoria i zostawia prywatne notatki.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Trophy,
    title: 'Transparentne wyniki',
    description: 'Publiczny ranking z breakdownem punktowym per kategoria, wyróżnieniami specjalnymi i historią edycji.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Award,
    title: 'Certyfikaty z podpisem',
    description: 'Generowanie i weryfikacja kryptograficzna. QR code, unikalny hash — blockchain-ready od dnia zero.',
    gradient: 'from-cyan-500 to-teal-500',
  },
  {
    icon: Images,
    title: 'Galeria mediów',
    description: 'Integracja z Cloudinary: wyróżnianie zdjęć, pełnoekranowy lightbox, zarządzanie folderami.',
    gradient: 'from-teal-500 to-green-500',
  },
  {
    icon: Mail,
    title: 'Komunikacja',
    description: 'Mailing do uczestników, harmonogram wysyłek, szablony HTML z podglądem i historią wysyłek.',
    gradient: 'from-pink-500 to-red-500',
  },
  {
    icon: BarChart2,
    title: 'Analizy i raporty',
    description: 'Statystyki edycji, eksport wyników, archiwum wszystkich edycji dostępne publicznie.',
    gradient: 'from-orange-500 to-pink-500',
  },
] as const;

/* ─── Actors ─────────────────────────────────────────────────── */
const ACTORS = [
  {
    icon: Building2,
    title: 'Organizator',
    color: 'border-cyan-500/40 bg-cyan-500/5',
    badge: 'text-cyan-400 bg-cyan-400/10',
    points: [
      'Konfiguruje edycje i wyzwania',
      'Zarządza rejestracjami i zespołami',
      'Wysyła komunikaty i przypomnienia',
      'Publikuje wyniki i certyfikaty',
    ],
  },
  {
    icon: UserCircle,
    title: 'Uczestnik / Zespół',
    color: 'border-pink-500/40 bg-pink-500/5',
    badge: 'text-pink-400 bg-pink-400/10',
    points: [
      'Rejestruje się przez formularz online',
      'Uzupełnia profil projektu',
      'Otrzymuje certyfikat z podpisem',
      'Śledzi wyniki w czasie rzeczywistym',
    ],
  },
  {
    icon: Scale,
    title: 'Juror',
    color: 'border-purple-500/40 bg-purple-500/5',
    badge: 'text-purple-400 bg-purple-400/10',
    points: [
      'Dostęp przez jednorazowy token',
      'Ocenia projekty per kategoria',
      'Zostawia prywatne notatki',
      'Widzi postęp swojego oceniania',
    ],
  },
  {
    icon: Globe,
    title: 'Publiczność',
    color: 'border-gray-500/40 bg-gray-500/5',
    badge: 'text-gray-400 bg-gray-400/10',
    points: [
      'Przegląda projekty i wyniki',
      'Weryfikuje certyfikaty uczestników',
      'Dostęp do archiwum edycji',
      'Obserwuje galerię zdjęć',
    ],
  },
] as const;

/* ─── Process flow ───────────────────────────────────────────── */
const STEPS = [
  {
    icon: UserPlus,
    title: 'Rejestracja',
    description: 'Zgłoszenie zespołu lub uczestnika indywidualnego przez formularz online. Automatyczne potwierdzenie emailem.',
    color: 'bg-cyan-500',
    ring: 'ring-cyan-500/30',
  },
  {
    icon: CheckCircle,
    title: 'Akceptacja',
    description: 'Admin weryfikuje i akceptuje zgłoszenia, wysyła potwierdzenie. Możliwość komunikacji z zespołem.',
    color: 'bg-blue-500',
    ring: 'ring-blue-500/30',
  },
  {
    icon: MessageSquare,
    title: 'Komunikacja',
    description: 'Automatyczne przypomnienia, harmonogram eventu, linki do materiałów i wymagań technicznych.',
    color: 'bg-purple-500',
    ring: 'ring-purple-500/30',
  },
  {
    icon: Gavel,
    title: 'Ocenianie',
    description: 'Jurorzy oceniają projekty przez dedykowany panel z tokenem dostępu — bez potrzeby konta.',
    color: 'bg-pink-500',
    ring: 'ring-pink-500/30',
  },
  {
    icon: BarChart2,
    title: 'Wyniki',
    description: 'Transparentny ranking publikowany na stronie z breakdownem punktowym per kategorię oceniania.',
    color: 'bg-rose-500',
    ring: 'ring-rose-500/30',
  },
  {
    icon: Award,
    title: 'Certyfikaty',
    description: 'Uczestnicy otrzymują certyfikaty z kryptograficznym podpisem, QR kodem i możliwością weryfikacji online.',
    color: 'bg-amber-500',
    ring: 'ring-amber-500/30',
  },
] as const;

/* ─── Page ───────────────────────────────────────────────────── */
export function PlatformPage() {
  const [lightbox, setLightbox] = useState<null | { file: string; title: string; description: string }>(null);

  return (
    <div className="bg-black min-h-screen">

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Animated background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/20 blur-[120px] rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.25, 0.1] }}
            transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
            className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-pink-500/20 blur-[120px] rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.08, 0.18, 0.08] }}
            transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
            className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-purple-500/20 blur-[100px] rounded-full"
          />
        </div>

        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

        <div className="container mx-auto px-4 text-center relative z-10 py-24">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-sm font-medium mb-8"
          >
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            Platforma open-source dla organizatorów eventów
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-white uppercase tracking-tight mb-6 leading-none"
          >
            Otwarta platforma{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
              dla hackatonów
            </span>
          </motion.h1>

          {/* Subline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-8 leading-relaxed"
          >
            Zarządzaj zgłoszeniami, oceniaj projekty, wydawaj certyfikaty —{' '}
            <span className="text-gray-200">wszystko w jednym miejscu.</span>
          </motion.p>

          {/* SEO keyword badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="flex flex-wrap justify-center gap-2 mb-10"
          >
            {['platforma eventowa', 'system certyfikatów', 'zarządzanie hackatonem', 'platforma konkursowa', 'ocenianie jury'].map(tag => (
              <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-400">
                {tag}
              </span>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a
              href="#jak-dziala"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-2xl font-bold text-lg transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
            >
              Zobacz jak działa
              <ArrowDown className="w-5 h-5" />
            </a>
            <a
              href="mailto:kontakt@krakhack.info?subject=Platforma%20-%20zapytanie"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white rounded-2xl font-bold text-lg transition-all"
            >
              Skontaktuj się
              <ExternalLink className="w-4 h-4 opacity-60" />
            </a>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-8 mt-16"
          >
            {[
              { value: '3+', label: 'Edycje hackathonu' },
              { value: '200+', label: 'Uczestników' },
              { value: '60+', label: 'Certyfikatów' },
              { value: '8', label: 'Modułów platformy' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">{s.value}</div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────── */}
      <section id="jak-dziala" className="py-24 bg-gradient-to-b from-black via-gray-950 to-black relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.12, 0.05] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/2 left-0 w-96 h-96 bg-cyan-500/20 blur-[100px] rounded-full"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-cyan-400 text-sm font-bold uppercase tracking-widest mb-3">Funkcjonalności</p>
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">
              Co oferuje platforma?
            </h2>
            <div className="w-20 h-1.5 bg-gradient-to-r from-cyan-400 to-pink-400 mx-auto rounded-full" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-7xl mx-auto">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.07 }}
                className="group"
              >
                <div className="bg-white/4 backdrop-blur-md p-6 rounded-2xl border border-white/8 hover:border-cyan-500/40 hover:bg-white/8 transition-all h-full flex flex-col">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <f.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed flex-grow">{f.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ACTORS ────────────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-b from-black via-purple-950/10 to-black overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-pink-400 text-sm font-bold uppercase tracking-widest mb-3">Ekosystem</p>
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">
              Aktorzy systemu
            </h2>
            <div className="w-20 h-1.5 bg-gradient-to-r from-pink-400 to-cyan-400 mx-auto rounded-full" />
          </motion.div>

          {/* Horizontal flow */}
          <div className="flex flex-col lg:flex-row items-stretch gap-4 max-w-6xl mx-auto">
            {ACTORS.map((actor, i) => (
              <div key={actor.title} className="flex flex-col lg:flex-row items-center gap-4 flex-1">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className={`flex-1 w-full p-6 rounded-2xl border ${actor.color} transition-all`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/8 flex items-center justify-center">
                      <actor.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${actor.badge}`}>
                      {actor.title}
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {actor.points.map(p => (
                      <li key={p} className="flex items-start gap-2 text-sm text-gray-400">
                        <ChevronRight className="w-3.5 h-3.5 text-gray-600 mt-0.5 shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </motion.div>
                {i < ACTORS.length - 1 && (
                  <div className="hidden lg:flex text-gray-600 text-2xl font-thin shrink-0">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FLOW / PROCESS ────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-b from-black to-gray-950 overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-cyan-400 text-sm font-bold uppercase tracking-widest mb-3">Proces</p>
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">
              Jak to działa?
            </h2>
            <div className="w-20 h-1.5 bg-gradient-to-r from-cyan-400 to-amber-400 mx-auto rounded-full" />
          </motion.div>

          <div className="max-w-3xl mx-auto relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-cyan-500 via-pink-500 to-amber-500 opacity-30 hidden sm:block" />

            <div className="space-y-6">
              {STEPS.map((step, i) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex gap-5 items-start"
                >
                  {/* Circle */}
                  <div className={`shrink-0 w-12 h-12 rounded-full ${step.color} ring-4 ${step.ring} flex items-center justify-center z-10`}>
                    <step.icon className="w-5 h-5 text-white" />
                  </div>

                  {/* Card */}
                  <div className="flex-1 bg-white/4 backdrop-blur-md border border-white/8 hover:border-white/15 rounded-2xl p-5 transition-all">
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                        Krok {i + 1}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1.5">{step.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SCREENSHOTS ───────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-b from-gray-950 to-black overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-purple-400 text-sm font-bold uppercase tracking-widest mb-3">Widoki</p>
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">
              Platforma w akcji
            </h2>
            <div className="w-20 h-1.5 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto rounded-full" />
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
            {platformContent.screenshots.map((s, i) => (
              <motion.button
                key={s.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                onClick={() => setLightbox(s)}
                className="group relative rounded-2xl overflow-hidden border border-white/8 hover:border-cyan-500/40 bg-white/3 transition-all text-left"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={s.file}
                    alt={s.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                  {/* Number badge */}
                  <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-[10px] font-bold text-gray-400">
                    {i + 1}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-bold text-white mb-1">{s.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{s.description}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-pink-500/10" />
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyan-500/15 blur-[120px] rounded-full"
          />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-6">
              Organizujesz{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                hackathon?
              </span>
            </h2>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              Platforma KrakHack jest budowana jako otwarte rozwiązanie eventowe.
              Jeśli chcesz zaadaptować ją dla swojego wydarzenia — skontaktuj się z nami.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:kontakt@krakhack.info?subject=Platforma%20-%20wspolpraca"
                className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-2xl font-bold text-lg transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
              >
                Napisz do nas
                <Mail className="w-5 h-5" />
              </a>
              <a
                href="/"
                className="flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white rounded-2xl font-bold text-lg transition-all"
              >
                Zobacz AI Krak Hack
                <ChevronRight className="w-5 h-5" />
              </a>
            </div>

            {/* Tech stack note */}
            <p className="text-gray-600 text-sm mt-8">
              Zbudowane na: React · TypeScript · Node.js/Express · PostgreSQL · Cloudinary · Railway
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── LIGHTBOX ──────────────────────────────────────────── */}
      {lightbox && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-5xl w-full"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={lightbox.file}
              alt={lightbox.title}
              className="w-full rounded-2xl border border-white/10 shadow-2xl"
            />
            <div className="mt-4 flex items-start justify-between">
              <div>
                <h3 className="text-white font-bold text-lg">{lightbox.title}</h3>
                <p className="text-gray-400 text-sm mt-1">{lightbox.description}</p>
              </div>
              <button
                onClick={() => setLightbox(null)}
                className="ml-4 shrink-0 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
