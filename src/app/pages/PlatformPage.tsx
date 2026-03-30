import { motion } from 'motion/react';
import { useState } from 'react';
import {
  ClipboardList, Users, Scale, Trophy, Award, Images, Mail, BarChart2,
  Building2, UserCircle, Globe, ChevronRight, ArrowDown,
  UserPlus, CheckCircle, MessageSquare, Gavel, X, Lightbulb,
  Puzzle, Rocket, GraduationCap, CalendarDays, Medal, Send, Loader2,
} from 'lucide-react';
import platformContent from '@/data/platform-content.json';

/* ─── FAQ data (mirrors JSON-LD in server.js) ───────────────── */
const FAQ = [
  {
    q: 'Co to jest platforma KrakHack?',
    a: 'KrakHack to otwarta platforma eventowa zbudowana na potrzeby hackathonu AI KrakHack organizowanego przez AI Possibilities Lab przy WSEI w Krakowie. Obsługuje rejestrację uczestników, ocenianie projektów przez jury, generowanie certyfikatów z podpisem kryptograficznym, galerię mediów i komunikację mailową.',
  },
  {
    q: 'Dla jakich wydarzeń nadaje się platforma?',
    a: 'Platforma nadaje się do organizacji hackathonów, konkursów studenckich, olimpiad, konferencji studenckich oraz demo days i przeglądów projektów. Każdy moduł może działać niezależnie — można wdrożyć tylko rejestrację, tylko certyfikaty, lub pełen zestaw.',
  },
  {
    q: 'Jak działa system certyfikatów?',
    a: 'Certyfikaty są generowane z unikalnym hashem kryptograficznym i kodem QR. Każdy certyfikat można zweryfikować online pod adresem krakhack.info/verify/{hash}. System jest blockchain-ready i nie wymaga centralnej bazy do weryfikacji.',
  },
  {
    q: 'Czy platforma jest open source?',
    a: 'Platforma powstała jako projekt wewnętrzny AI Possibilities Lab. Jeśli jesteś zainteresowany adaptacją do własnych potrzeb — hackathon, konkurs, konferencja — skontaktuj się bezpośrednio z autorem przez michalmadejski2@gmail.com lub LinkedIn.',
  },
  {
    q: 'Na czym jest zbudowana platforma?',
    a: 'Stack technologiczny: React + TypeScript (frontend), Node.js/Express (backend), PostgreSQL (baza danych), Cloudinary (media), Railway (hosting). Architektura modułowa pozwala na wdrażanie poszczególnych funkcji niezależnie.',
  },
] as const;

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
function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="border border-white/8 rounded-2xl overflow-hidden bg-white/3 hover:border-cyan-500/30 transition-colors">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-4 text-left gap-4"
        aria-expanded={open}>
        <span className="text-white font-semibold text-sm leading-snug">{q}</span>
        <ChevronRight className={`w-4 h-4 text-gray-500 shrink-0 transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && (
        <div className="px-6 pb-5">
          <p className="text-gray-400 text-sm leading-relaxed">{a}</p>
        </div>
      )}
    </motion.div>
  );
}

export function PlatformPage() {
  const [lightbox, setLightbox] = useState<null | { file: string; title: string; description: string }>(null);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSending(true);
    try {
      const r = await fetch('/api/platform-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (d.ok) {
        setSent(true);
        setForm({ name: '', email: '', message: '' });
      } else {
        setFormError(d.error || 'Coś poszło nie tak');
      }
    } catch {
      setFormError('Błąd połączenia — spróbuj ponownie');
    } finally {
      setSending(false);
    }
  };

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

      {/* ── CTA / CONTACT ─────────────────────────────────────── */}
      <section id="kontakt" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-pink-500/10" />
          <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyan-500/15 blur-[120px] rounded-full" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">
                Zainteresowany?{' '}
                <span className="bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                  Porozmawiajmy.
                </span>
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto">
                Bezpośredni kontakt do developera, który to stworzył.
                Hackathon, konkurs, konferencja, demo day — napisz, co planujesz.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Left — personal info */}
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                className="space-y-5">
                <div className="bg-white/4 border border-white/10 rounded-2xl p-6">
                  <p className="text-[11px] text-gray-500 uppercase tracking-widest font-bold mb-4">Twórca platformy</p>
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-xl shrink-0">
                      M
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg">Michał Madejski</p>
                      <p className="text-gray-500 text-sm">Developer · AI Possibilities Lab</p>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <a href="mailto:michalmadejski2@gmail.com"
                      className="flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/8 rounded-xl text-sm text-gray-300 hover:text-white transition-all">
                      <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="font-mono text-xs">michalmadejski2@gmail.com</span>
                    </a>
                    <a href="https://www.linkedin.com/in/micha%C5%82-madejski-671b60134/"
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/8 hover:border-blue-500/40 rounded-xl text-sm text-gray-300 hover:text-white transition-all group">
                      <svg className="w-4 h-4 text-blue-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      <span>LinkedIn — Michał Madejski</span>
                      <ChevronRight className="w-3 h-3 ml-auto opacity-40 group-hover:opacity-100 transition-all" />
                    </a>
                  </div>
                </div>

                <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
                  <p className="text-gray-500 text-sm leading-relaxed italic">
                    „Nie wiemy jeszcze, czy jest zapotrzebowanie na taką platformę poza naszym ekosystemem.
                    Ale jeśli masz wydarzenie i szukasz czegoś bardziej scentralizowanego —
                    chętnie porozmawiam."
                  </p>
                </div>

                <a href="/"
                  className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white rounded-xl text-sm font-medium transition-all">
                  Zobacz AI KrakHack 2026 <ChevronRight className="w-4 h-4" />
                </a>
              </motion.div>

              {/* Right — contact form */}
              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <div className="bg-white/4 border border-white/10 rounded-2xl p-6">
                  <p className="text-[11px] text-gray-500 uppercase tracking-widest font-bold mb-5">Wyślij wiadomość</p>
                  {sent ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                      <div className="w-12 h-12 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-400" />
                      </div>
                      <p className="text-white font-bold">Wiadomość wysłana!</p>
                      <p className="text-gray-500 text-sm">Odezwę się możliwie szybko.</p>
                      <button onClick={() => setSent(false)} className="mt-2 text-xs text-gray-600 hover:text-gray-400 transition-colors underline">
                        Wyślij kolejną
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="text-[11px] text-gray-500 font-medium mb-1.5 block">Imię lub nazwa organizacji</label>
                        <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                          placeholder="Jan Kowalski / WSEI Kraków"
                          className="w-full bg-black/40 border border-white/10 focus:border-cyan-500/50 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-gray-600 focus:outline-none transition-colors" />
                      </div>
                      <div>
                        <label className="text-[11px] text-gray-500 font-medium mb-1.5 block">Twój email</label>
                        <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                          placeholder="jan@uczelnia.edu.pl"
                          className="w-full bg-black/40 border border-white/10 focus:border-cyan-500/50 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-gray-600 focus:outline-none transition-colors" />
                      </div>
                      <div>
                        <label className="text-[11px] text-gray-500 font-medium mb-1.5 block">Opisz swoje wydarzenie i potrzeby</label>
                        <textarea required rows={4} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                          placeholder="Organizuję hackathon dla 80 osób, szukam platformy do rejestracji i certyfikatów..."
                          className="w-full bg-black/40 border border-white/10 focus:border-cyan-500/50 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-gray-600 focus:outline-none transition-colors resize-none" />
                      </div>
                      {formError && <p className="text-red-400 text-xs">{formError}</p>}
                      <button type="submit" disabled={sending}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-60 text-white rounded-xl font-bold transition-all shadow-lg shadow-cyan-500/20">
                        {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Wysyłanie…</> : <><Send className="w-4 h-4" /> Wyślij wiadomość</>}
                      </button>
                    </form>
                  )}
                </div>
              </motion.div>
            </div>

            <p className="text-center text-gray-700 text-xs mt-8">
              Zbudowane na: React · TypeScript · Node.js · PostgreSQL · Cloudinary · Railway
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-b from-black via-gray-950 to-black overflow-hidden" aria-label="Najczęściej zadawane pytania o platformę hackatonową">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-cyan-400 text-sm font-bold uppercase tracking-widest mb-3">FAQ</p>
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">
              Najczęstsze pytania
            </h2>
            <div className="w-20 h-1.5 bg-gradient-to-r from-cyan-400 to-blue-400 mx-auto rounded-full" />
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {FAQ.map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── SHADOW SEO — crawlable keyword-rich content ────────── */}
      {/* Visible to crawlers, visually de-emphasised footer text */}
      <aside aria-label="O platformie — informacje dla wyszukiwarek" className="bg-black border-t border-white/5 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <p className="text-gray-700 text-xs leading-relaxed mb-4">
            <strong className="text-gray-600">Platforma hackatonowa KrakHack</strong> to kompleksowe narzędzie do organizacji wydarzeń studenckich —
            hackathonów, konkursów, olimpiad programistycznych i konferencji akademickich.
            System został zaprojektowany z myślą o pełnej transparentności procesu:
            od <em>rejestracji uczestników</em> przez <em>ocenianie projektów przez jury</em>,
            aż po <em>publikację wyników</em> i <em>wydawanie certyfikatów z weryfikacją kryptograficzną</em>.
          </p>
          <p className="text-gray-700 text-xs leading-relaxed mb-4">
            Każdy z modułów platformy może działać niezależnie: <strong className="text-gray-600">moduł rejestracji</strong> obsługuje
            formularze zgłoszeń i automatyczne potwierdzenia emailem;
            <strong className="text-gray-600"> panel jury</strong> umożliwia ocenianie projektów przez komisję za pomocą jednorazowego tokenu dostępu bez zakładania konta;
            <strong className="text-gray-600"> system certyfikatów</strong> generuje personalizowane dokumenty z podpisem cyfrowym, kodem QR i unikalnym hashem możliwym do weryfikacji online;
            <strong className="text-gray-600"> galeria mediów</strong> integruje się z Cloudinary i umożliwia zarządzanie zdjęciami z wydarzenia.
          </p>
          <p className="text-gray-700 text-xs leading-relaxed mb-4">
            <strong className="text-gray-600">Hackathon management system</strong> zbudowany na stack technologicznym:
            React, TypeScript, Node.js, Express, PostgreSQL, Cloudinary, Railway.
            Architektura SPA z serwerem Express obsługującym API REST.
            Platforma działa w modelu multi-edition — każde wydarzenie ma własną konfigurację kategorii oceniania,
            harmonogram, listę jurorów i wyniki dostępne publicznie po zakończeniu.
          </p>
          <p className="text-gray-700 text-xs leading-relaxed mb-4">
            Platforma sprawdzona w praktyce podczas <strong className="text-gray-600">AI KrakHack 2025</strong> i
            <strong className="text-gray-600"> AI KrakHack 2026</strong> — hackathon sztucznej inteligencji
            organizowany przez <strong className="text-gray-600">AI Possibilities Lab przy WSEI Kraków</strong>.
            Ponad 200 uczestników, 30+ zespołów, 60+ wydanych certyfikatów, pełna dokumentacja projektów dostępna online.
          </p>
          <p className="text-gray-700 text-xs leading-relaxed">
            Kontakt w sprawie <em>adaptacji platformy</em> na potrzeby własnego wydarzenia:
            <a href="mailto:michalmadejski2@gmail.com" className="text-gray-600 hover:text-gray-400 transition-colors ml-1">michalmadejski2@gmail.com</a> ·
            <a href="https://www.linkedin.com/in/micha%C5%82-madejski-671b60134/" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-400 transition-colors ml-1">LinkedIn</a> ·
            <a href="https://krakhack.info" className="text-gray-600 hover:text-gray-400 transition-colors ml-1">krakhack.info</a>
          </p>
        </div>
      </aside>

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

