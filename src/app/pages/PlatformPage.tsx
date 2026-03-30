import { motion } from 'motion/react';
import { useState } from 'react';
import {
  ClipboardList, Users, Scale, Trophy, Award, Images, Mail, BarChart2,
  Building2, UserCircle, Globe, ChevronRight, ArrowDown,
  UserPlus, CheckCircle, MessageSquare, Gavel, X, Lightbulb,
  Puzzle, Rocket, GraduationCap, CalendarDays, Medal,
} from 'lucide-react';
import platformContent from '@/data/platform-content.json';

/* ─── Feature / module tiles ────────────────────────────────── */
const MODULES = [
  {
    icon: ClipboardList,
    title: 'Rejestracja uczestników',
    description: 'Formularze dla zespołów, prelegentów, mentorów i sponsorów. Automatyczne potwierdzenia, lista mailingowa, zarządzanie statusami.',
    gradient: 'from-cyan-500 to-blue-500',
    tag: 'moduł',
  },
  {
    icon: Users,
    title: 'Profile zgłoszeń',
    description: 'Każdy zespół lub zgłoszenie ma publiczny profil: opis, technologie, screenshoty, prezentacja PDF, historia edycji.',
    gradient: 'from-pink-500 to-purple-500',
    tag: 'moduł',
  },
  {
    icon: Scale,
    title: 'Panel oceniający',
    description: 'Jurorzy, komisja lub recenzenci dostają jednorazowy link. Oceniają per kategoria, zostawiają notatki — bez zakładania konta.',
    gradient: 'from-blue-500 to-cyan-500',
    tag: 'moduł',
  },
  {
    icon: Trophy,
    title: 'Wyniki i ranking',
    description: 'Publiczny ranking z pełnym breakdownem punktowym, wyróżnieniami specjalnymi i archiwum poprzednich edycji.',
    gradient: 'from-purple-500 to-pink-500',
    tag: 'moduł',
  },
  {
    icon: Award,
    title: 'Certyfikaty z weryfikacją',
    description: 'Personalizowane certyfikaty z kryptograficznym podpisem i QR kodem. Każdy może zweryfikować autentyczność online.',
    gradient: 'from-cyan-500 to-teal-500',
    tag: 'moduł',
  },
  {
    icon: Mail,
    title: 'Komunikacja',
    description: 'Mailing do uczestników, harmonogram wysyłek, szablony HTML. Scentralizowana komunikacja zamiast rozsypanych emaili.',
    gradient: 'from-pink-500 to-red-500',
    tag: 'moduł',
  },
  {
    icon: Images,
    title: 'Galeria i media',
    description: 'Integracja z Cloudinary, wyróżnianie zdjęć, pełnoekranowy lightbox. Dokumentacja wizualna wydarzenia.',
    gradient: 'from-teal-500 to-green-500',
    tag: 'moduł',
  },
  {
    icon: BarChart2,
    title: 'Statystyki i archiwum',
    description: 'Przegląd edycji, eksport danych, historia wszystkich wydarzeń. Wszystko dostępne publicznie po wydarzeniu.',
    gradient: 'from-orange-500 to-pink-500',
    tag: 'moduł',
  },
] as const;

/* ─── Event types ────────────────────────────────────────────── */
const EVENT_TYPES = [
  {
    icon: Rocket,
    title: 'Hackathony',
    description: 'Rejestracja zespołów, ocenianie projektów przez jury, wyniki, certyfikaty uczestnictwa — to jest nasz pierwotny przypadek użycia.',
    accent: 'border-cyan-500/40 bg-cyan-500/5',
    label: 'sprawdzone w praktyce',
    labelColor: 'text-cyan-400 bg-cyan-400/10',
  },
  {
    icon: Medal,
    title: 'Konkursy i olimpiady',
    description: 'Panel oceniający, transparentne wyniki, certyfikaty dla zwycięzców. Możliwe wieloetapowe ocenianie z różnymi kategoriami.',
    accent: 'border-pink-500/40 bg-pink-500/5',
    label: 'dobry fit',
    labelColor: 'text-pink-400 bg-pink-400/10',
  },
  {
    icon: CalendarDays,
    title: 'Konferencje studenckie',
    description: 'Rejestracja uczestników i prelegentów, program, materiały, galeria, certyfikaty obecności. Wszystko w jednym miejscu.',
    accent: 'border-purple-500/40 bg-purple-500/5',
    label: 'możliwe',
    labelColor: 'text-purple-400 bg-purple-400/10',
  },
  {
    icon: GraduationCap,
    title: 'Projekty i prezentacje',
    description: 'Obrony projektów, przeglądy prac, demo days. Profile zgłoszeń, ocenianie komisji, publiczne wyniki.',
    accent: 'border-gray-500/40 bg-gray-500/5',
    label: 'do zbadania',
    labelColor: 'text-gray-400 bg-gray-400/10',
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
      'Konfiguruje wydarzenie i moduły',
      'Zarządza rejestracjami',
      'Wysyła komunikaty i harmonogram',
      'Publikuje wyniki i certyfikaty',
    ],
  },
  {
    icon: UserCircle,
    title: 'Uczestnik',
    color: 'border-pink-500/40 bg-pink-500/5',
    badge: 'text-pink-400 bg-pink-400/10',
    points: [
      'Rejestruje się online',
      'Uzupełnia profil / zgłoszenie',
      'Śledzi wyniki i komunikaty',
      'Pobiera certyfikat z weryfikacją',
    ],
  },
  {
    icon: Scale,
    title: 'Oceniający / Komisja',
    color: 'border-purple-500/40 bg-purple-500/5',
    badge: 'text-purple-400 bg-purple-400/10',
    points: [
      'Dostęp przez jednorazowy link',
      'Ocenia per kategoria kryteriów',
      'Prywatne notatki i komentarze',
      'Widzi postęp oceniania',
    ],
  },
  {
    icon: Globe,
    title: 'Publiczność',
    color: 'border-gray-500/40 bg-gray-500/5',
    badge: 'text-gray-400 bg-gray-400/10',
    points: [
      'Przegląda projekty i wyniki',
      'Weryfikuje certyfikaty online',
      'Archiwum poprzednich edycji',
      'Galeria zdjęć z wydarzenia',
    ],
  },
] as const;

/* ─── Process flow ───────────────────────────────────────────── */
const STEPS = [
  { icon: UserPlus,      title: 'Rejestracja',   color: 'bg-cyan-500',   ring: 'ring-cyan-500/30',   desc: 'Zgłoszenia online — zespoły, uczestnicy, prelegenci. Automatyczne potwierdzenia emailem.' },
  { icon: CheckCircle,   title: 'Akceptacja',    color: 'bg-blue-500',   ring: 'ring-blue-500/30',   desc: 'Organizator weryfikuje i akceptuje zgłoszenia, komunikuje się z uczestnikami.' },
  { icon: MessageSquare, title: 'Komunikacja',   color: 'bg-purple-500', ring: 'ring-purple-500/30', desc: 'Scentralizowany mailing: harmonogram, przypomnienia, linki do materiałów.' },
  { icon: Gavel,         title: 'Ocenianie',     color: 'bg-pink-500',   ring: 'ring-pink-500/30',   desc: 'Komisja / jury ocenia przez dedykowany panel z linkiem dostępu — bez konta.' },
  { icon: BarChart2,     title: 'Wyniki',        color: 'bg-rose-500',   ring: 'ring-rose-500/30',   desc: 'Transparentny ranking publikowany na stronie. Pełny breakdown punktowy.' },
  { icon: Award,         title: 'Certyfikaty',   color: 'bg-amber-500',  ring: 'ring-amber-500/30',  desc: 'Certyfikaty z kryptograficznym podpisem i QR kodem. Weryfikacja online.' },
] as const;

/* ─── Ideas / roadmap ────────────────────────────────────────── */
const IDEAS = [
  { icon: Puzzle,      title: 'Moduły à la carte',       desc: 'Każda część platformy mogłaby działać niezależnie — tylko rejestracja, tylko certyfikaty, tylko ocenianie.' },
  { icon: Lightbulb,   title: 'Biała etykieta',           desc: 'Własna domena, własne logo, własny motyw kolorystyczny. Platforma działa pod marką Twojego wydarzenia.' },
  { icon: CalendarDays,title: 'Multi-event',              desc: 'Jedno konto, wiele wydarzeń. Archiwum edycji, porównania rok do roku, globalne statystyki.' },
  { icon: GraduationCap, title: 'Integracje uczelniane', desc: 'USOS, systemy rejestracyjne, email uczelniane. Potencjał do głębszej integracji z ekosystemem akademickim.' },
] as const;

/* ─── Page ───────────────────────────────────────────────────── */
export function PlatformPage() {
  const [lightbox, setLightbox] = useState<null | { file: string; title: string; description: string }>(null);

  return (
    <div className="bg-black min-h-screen">

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.3, 0.15] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/20 blur-[120px] rounded-full" />
          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.25, 0.1] }} transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
            className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-pink-500/20 blur-[120px] rounded-full" />
          <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.08, 0.18, 0.08] }} transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
            className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-purple-500/20 blur-[100px] rounded-full" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

        <div className="container mx-auto px-4 text-center relative z-10 py-24">
          {/* Origin badge */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            Zbudowane na potrzeby AI KrakHack · otwarte na szersze zastosowanie
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-white uppercase tracking-tight mb-6 leading-none">
            Platforma eventowa{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
              dla organizatorów
            </span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-6 leading-relaxed">
            Hackathony, konkursy, konferencje studenckie — jedno narzędzie do rejestracji,
            oceniania, komunikacji i certyfikatów.
          </motion.p>

          {/* Honest subtext */}
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }}
            className="text-base text-gray-600 max-w-2xl mx-auto mb-8 italic">
            „Stworzyliśmy to na własne potrzeby. Widzimy potencjał na coś więcej.
            Jeśli organizujesz wydarzenie i szukasz nowoczesnego narzędzia — porozmawiajmy."
          </motion.p>

          {/* SEO keyword badges */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.35 }}
            className="flex flex-wrap justify-center gap-2 mb-10">
            {['hackathon', 'konkurs studencki', 'konferencja', 'platforma eventowa', 'system certyfikatów', 'ocenianie jury'].map(tag => (
              <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-400">{tag}</span>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.45 }}
            className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#jak-dziala"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-2xl font-bold text-lg transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40">
              Zobacz jak działa
              <ArrowDown className="w-5 h-5" />
            </a>
            <a href="#kontakt"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white rounded-2xl font-bold text-lg transition-all">
              Porozmawiajmy
              <ChevronRight className="w-5 h-5" />
            </a>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-8 mt-16">
            {[
              { value: '3+', label: 'Edycje hackathonu' },
              { value: '200+', label: 'Uczestników' },
              { value: '60+', label: 'Certyfikatów' },
              { value: '8', label: 'Modułów' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">{s.value}</div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FOR WHAT EVENTS ───────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-b from-black via-gray-950 to-black overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-cyan-400 text-sm font-bold uppercase tracking-widest mb-3">Dla kogo</p>
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">
              Jakie wydarzenia obsługuje?
            </h2>
            <div className="w-20 h-1.5 bg-gradient-to-r from-cyan-400 to-pink-400 mx-auto rounded-full" />
            <p className="text-gray-500 text-sm mt-4 max-w-xl mx-auto">
              Pierwotnie zbudowane dla hackathonu — ale architektura pozwala na adaptację do innych formatów.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
            {EVENT_TYPES.map((e, i) => (
              <motion.div key={e.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`p-6 rounded-2xl border ${e.accent} transition-all`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white/8 flex items-center justify-center">
                    <e.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${e.labelColor}`}>{e.label}</span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">{e.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{e.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MODULES ───────────────────────────────────────────── */}
      <section id="jak-dziala" className="py-24 bg-gradient-to-b from-black via-gray-950 to-black overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.12, 0.05] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/2 left-0 w-96 h-96 bg-cyan-500/20 blur-[100px] rounded-full" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-pink-400 text-sm font-bold uppercase tracking-widest mb-3">Architektura</p>
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">
              Niezależne moduły
            </h2>
            <div className="w-20 h-1.5 bg-gradient-to-r from-pink-400 to-cyan-400 mx-auto rounded-full" />
            <p className="text-gray-500 text-sm mt-4 max-w-xl mx-auto">
              Każda z tych funkcjonalności to odrębna część systemu — można je łączyć lub wdrażać osobno.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-7xl mx-auto">
            {MODULES.map((m, i) => (
              <motion.div key={m.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.07 }} className="group">
                <div className="bg-white/4 backdrop-blur-md p-6 rounded-2xl border border-white/8 hover:border-cyan-500/40 hover:bg-white/8 transition-all h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${m.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <m.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest border border-white/10 rounded px-1.5 py-0.5">{m.tag}</span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{m.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed flex-grow">{m.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ACTORS ────────────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-b from-black via-purple-950/10 to-black overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-purple-400 text-sm font-bold uppercase tracking-widest mb-3">Ekosystem</p>
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">
              Wszyscy aktorzy w jednym miejscu
            </h2>
            <div className="w-20 h-1.5 bg-gradient-to-r from-purple-400 to-cyan-400 mx-auto rounded-full" />
            <p className="text-gray-500 text-sm mt-4 max-w-xl mx-auto">
              Organizator, uczestnik, komisja i publiczność — każdy ma swój widok i dostęp do tego, czego potrzebuje.
            </p>
          </motion.div>

          <div className="flex flex-col lg:flex-row items-stretch gap-4 max-w-6xl mx-auto">
            {ACTORS.map((actor, i) => (
              <div key={actor.title} className="flex flex-col lg:flex-row items-center gap-4 flex-1">
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className={`flex-1 w-full p-6 rounded-2xl border ${actor.color}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/8 flex items-center justify-center">
                      <actor.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${actor.badge}`}>{actor.title}</span>
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
                  <div className="hidden lg:flex text-gray-700 text-2xl shrink-0">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FLOW ──────────────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-b from-black to-gray-950 overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-cyan-400 text-sm font-bold uppercase tracking-widest mb-3">Przepływ</p>
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">
              Jak to działa?
            </h2>
            <div className="w-20 h-1.5 bg-gradient-to-r from-cyan-400 to-amber-400 mx-auto rounded-full" />
          </motion.div>

          <div className="max-w-3xl mx-auto relative">
            <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-cyan-500 via-pink-500 to-amber-500 opacity-30 hidden sm:block" />
            <div className="space-y-6">
              {STEPS.map((step, i) => (
                <motion.div key={step.title} initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} className="flex gap-5 items-start">
                  <div className={`shrink-0 w-12 h-12 rounded-full ${step.color} ring-4 ${step.ring} flex items-center justify-center z-10`}>
                    <step.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 bg-white/4 backdrop-blur-md border border-white/8 hover:border-white/15 rounded-2xl p-5 transition-all">
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Krok {i + 1}</span>
                    <h3 className="text-lg font-bold text-white mb-1.5 mt-0.5">{step.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
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
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-purple-400 text-sm font-bold uppercase tracking-widest mb-3">Widoki</p>
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">
              Platforma w akcji
            </h2>
            <div className="w-20 h-1.5 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto rounded-full" />
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
            {platformContent.screenshots.map((s, i) => (
              <motion.button key={s.id} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.07 }}
                onClick={() => setLightbox(s)}
                className="group relative rounded-2xl overflow-hidden border border-white/8 hover:border-cyan-500/40 bg-white/3 transition-all text-left">
                <div className="aspect-video relative overflow-hidden">
                  <img src={s.file} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
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

      {/* ── IDEAS / POSSIBILITIES ─────────────────────────────── */}
      <section className="py-24 bg-gradient-to-b from-black via-gray-950 to-black overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-amber-400 text-sm font-bold uppercase tracking-widest mb-3">Możliwości</p>
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">
              Gdzie to może pójść?
            </h2>
            <div className="w-20 h-1.5 bg-gradient-to-r from-amber-400 to-pink-400 mx-auto rounded-full" />
            <p className="text-gray-500 text-sm mt-4 max-w-xl mx-auto">
              Pomysły na dalszy rozwój — nie obietnice, ale kierunki, które widzimy jako wartościowe.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
            {IDEAS.map((idea, i) => (
              <motion.div key={idea.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 hover:border-amber-500/40 transition-all">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center mb-4">
                  <idea.icon className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{idea.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{idea.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section id="kontakt" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-pink-500/10" />
          <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyan-500/15 blur-[120px] rounded-full" />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-6">
              Zainteresowany?{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                Porozmawiajmy.
              </span>
            </h2>

            <p className="text-gray-400 text-lg mb-4 leading-relaxed">
              Nie wiemy jeszcze, czy jest zapotrzebowanie na taką platformę poza naszym ekosystemem.
              Ale jeśli organizujesz wydarzenie studenckie i szukasz czegoś nowocześniejszego
              i bardziej scentralizowanego — chętnie porozmawiamy o możliwościach.
            </p>
            <p className="text-gray-600 text-sm mb-10">
              Hackathon, konkurs, konferencja, demo day — jeśli masz pomysł, piszemy.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="mailto:kontakt@krakhack.info?subject=Platforma%20-%20zapytanie"
                className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-2xl font-bold text-lg transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40">
                Napisz do nas
                <Mail className="w-5 h-5" />
              </a>
              <a href="/"
                className="flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white rounded-2xl font-bold text-lg transition-all">
                Zobacz AI KrakHack
                <ChevronRight className="w-5 h-5" />
              </a>
            </div>

            <p className="text-gray-700 text-sm mt-8">
              Zbudowane na: React · TypeScript · Node.js · PostgreSQL · Cloudinary · Railway
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── LIGHTBOX ──────────────────────────────────────────── */}
      {lightbox && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="max-w-5xl w-full" onClick={e => e.stopPropagation()}>
            <img src={lightbox.file} alt={lightbox.title} className="w-full rounded-2xl border border-white/10 shadow-2xl" />
            <div className="mt-4 flex items-start justify-between">
              <div>
                <h3 className="text-white font-bold text-lg">{lightbox.title}</h3>
                <p className="text-gray-400 text-sm mt-1">{lightbox.description}</p>
              </div>
              <button onClick={() => setLightbox(null)}
                className="ml-4 shrink-0 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

