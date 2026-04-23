/**
 * /demo — podgląd docelowego układu strony głównej koła AI Possibilities Lab.
 *
 * Parkowane tu żeby właściciel mógł zweryfikować całość przed podmianą na
 * prod homepage. Elementy:
 *   • Hero (co oferujemy, CTA zapisz się / zaloguj)
 *   • Kalendarz (CalendarMonth z filtrami + link "pobierz iCal")
 *   • Uczestnicy showcase (5 publicznych profili z /api/public/participants)
 *   • Projekty showcase (5 najnowszych aktywnych z /api/projects, backend
 *     niezależny od admin panel)
 *   • Publiczne wydarzenia (nadchodzące) — via CalendarMini
 *   • Stopka z linkami: Dołącz do koła / Zaloguj / Kontakt
 *
 * Brak przekierowań zewnętrznych, brak scroll-linków. To standalone page.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Calendar, Users, FolderKanban, Sparkles, LogIn, Mail } from 'lucide-react';
import { CalendarMonth } from '@/app/components/calendar/CalendarMonth';
import { CalendarMini } from '@/app/components/calendar/CalendarMini';

interface Participant {
  profileSlug:    string;
  displayName:    string | null;
  avatarUrl:      string | null;
  bio:            string | null;
  university:     string | null;
  skills:         string[];
  githubUrl:      string | null;
  linkedinUrl:    string | null;
  role:           string;
}

interface Project {
  id:               string;
  slug:             string;
  title:            string;
  shortDescription: string | null;
  thumbnailUrl:     string | null;
  technologies:     string[];
}

export function DemoPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Demo banner */}
      <div className="bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-emerald-500/20 border-b border-white/10 py-2 px-4 text-center text-xs text-gray-300">
        <Sparkles className="w-3 h-3 inline mr-1.5 text-amber-300" />
        <strong>Demo</strong> — podgląd nowej strony głównej koła. Linki wewnętrzne działają, zewnętrzne
        są zablokowane. <Link to="/" className="underline hover:text-white ml-1">Wróć do aktualnej strony</Link>
      </div>

      {/* Hero */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-5xl mx-auto text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-purple-300 mb-4">
            AI Possibilities Lab · WSEI Kraków
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent mb-6">
            Koło naukowe, które faktycznie coś robi
          </h1>
          <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto mb-10">
            Projekty AI, hackathony, community. Spotkania w każdy poniedziałek.
            Portfolio, które możesz pokazać w CV. Wszystko otwarte dla studentów.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/dolacz"
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white rounded-full font-semibold transition-all shadow-lg shadow-pink-500/20"
            >
              Dołącz do koła
              <ArrowRight className="w-4 h-4 inline ml-2" />
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white rounded-full font-medium transition-colors"
            >
              <LogIn className="w-4 h-4 inline mr-2" />
              Zaloguj się
            </Link>
          </div>

          {/* Mini-stats */}
          <div className="grid grid-cols-3 gap-6 max-w-xl mx-auto mt-14 pt-10 border-t border-white/10">
            <Stat icon={Users}        label="Członków" value="30+" />
            <Stat icon={FolderKanban} label="Projektów aktywnych" value="8" />
            <Stat icon={Calendar}     label="Spotkań w semestrze" value="14" />
          </div>
        </div>
      </section>

      {/* Kalendarz — full month view */}
      <section id="calendar" className="py-16 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            eyebrow="Kalendarz"
            title="Co się dzieje w kole"
            subtitle="Spotkania, warsztaty, hackathony, deadline'y. Filtrowane, z eksportem iCal."
          />
          <CalendarMonth />
        </div>
      </section>

      {/* Uczestnicy showcase */}
      <section className="py-16 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            eyebrow="Społeczność"
            title="Członkowie koła"
            subtitle="Ludzie którzy tworzą AI Possibilities Lab. Każdy ma swoje portfolio, projekty i obszary ekspertyzy."
            cta={{ label: 'Wszyscy uczestnicy', to: '/uczestnicy' }}
          />
          <ParticipantsShowcase />
        </div>
      </section>

      {/* Projekty showcase */}
      <section className="py-16 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            eyebrow="Projekty"
            title="Co aktualnie budujemy"
            subtitle="Aktywne projekty koła z osi czasu. Klik w kartę → szczegóły, oś czasu zmian, stack technologiczny."
          />
          <ProjectsShowcase />
        </div>
      </section>

      {/* Upcoming events mini */}
      <section className="py-16 px-4 border-t border-white/10 bg-white/[0.02]">
        <div className="max-w-3xl mx-auto">
          <SectionHeader
            eyebrow="Nadchodzące"
            title="Zaplanuj sobie tydzień"
            subtitle="5 najbliższych wydarzeń z naszego kalendarza — otwarte dla wszystkich / tylko członków."
          />
          <CalendarMini limit={5} title="Zbliżają się" seeAllHref="#calendar" />
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 px-4 border-t border-white/10 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">Chcesz być częścią tego?</h2>
          <p className="text-gray-400 mb-8">
            Rekrutacja otwarta. Zgłoś się — rozmowa kwalifikacyjna, 10 minut. Potem dostajesz email
            z loginem, hasłem i masz swój panel z profilem, projektami i kalendarzem.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/dolacz"
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full font-semibold transition-all shadow-lg"
            >
              Zgłoś się
            </Link>
            <Link to="/kontakt" className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full transition-colors">
              <Mail className="w-4 h-4 inline mr-2" />
              Kontakt
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Pomocnicze komponenty ────────────────────────────────────────────────────

function Stat({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <div>
      <Icon className="w-5 h-5 text-purple-300 mx-auto mb-2" />
      <p className="text-3xl font-bold text-white tabular-nums">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function SectionHeader({
  eyebrow, title, subtitle, cta,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  cta?: { label: string; to: string };
}) {
  return (
    <div className="flex items-end justify-between gap-6 flex-wrap mb-10">
      <div className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.25em] text-purple-300 mb-2">{eyebrow}</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">{title}</h2>
        <p className="text-sm text-gray-400 leading-relaxed">{subtitle}</p>
      </div>
      {cta && (
        <Link
          to={cta.to}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors border border-white/10 hover:border-white/30 px-4 py-2 rounded-full"
        >
          {cta.label}
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
}

function ParticipantsShowcase() {
  const [items, setItems] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/public/participants')
      .then(r => r.json())
      .then(d => setItems((d.participants ?? []).slice(0, 6)))
      .catch(() => { /* soft-fail */ })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-xs text-gray-500 text-center py-8">Ładowanie uczestników…</p>;
  if (items.length === 0) return (
    <div className="bg-white/5 border border-dashed border-white/20 rounded-2xl p-12 text-center">
      <Users className="w-8 h-8 text-gray-500 mx-auto mb-3" />
      <p className="text-sm text-gray-400 mb-1">Społeczność buduje się</p>
      <p className="text-xs text-gray-600">Pierwsze publiczne profile pojawią się po onboardingu nowych członków.</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map(p => (
        <Link
          key={p.profileSlug}
          to={`/uczestnicy/${p.profileSlug}`}
          className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl p-5 transition-colors group"
        >
          <div className="flex items-start gap-3 mb-3">
            <div className="shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/30 to-cyan-500/30 border border-white/10 flex items-center justify-center overflow-hidden">
              {p.avatarUrl ? (
                <img src={p.avatarUrl} alt={p.displayName ?? ''} className="w-full h-full object-cover" />
              ) : (
                <Users className="w-5 h-5 text-purple-300" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate group-hover:text-purple-200 transition-colors">
                {p.displayName ?? '—'}
              </p>
              {p.university && <p className="text-[11px] text-gray-500 truncate">{p.university}</p>}
            </div>
          </div>
          {p.bio && (
            <p className="text-xs text-gray-400 line-clamp-2 mb-3">{p.bio}</p>
          )}
          {p.skills && p.skills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {p.skills.slice(0, 4).map(s => (
                <span key={s} className="text-[10px] bg-white/10 text-gray-300 px-2 py-0.5 rounded-full">
                  {s}
                </span>
              ))}
              {p.skills.length > 4 && (
                <span className="text-[10px] text-gray-500">+{p.skills.length - 4}</span>
              )}
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}

function ProjectsShowcase() {
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/public/participants')
      .then(r => r.json())
      .then(d => {
        // Agreguj projekty ze wszystkich uczestników (via /api/public/participants/:slug
        // zwracającego też projects — alternatywa: stub showcase projektów)
        const allSlugs = (d.participants ?? []).slice(0, 10).map((p: Participant) => p.profileSlug);
        return Promise.all(
          allSlugs.map((slug: string) =>
            fetch(`/api/public/participants/${slug}`).then(r => r.ok ? r.json() : null).catch(() => null)
          )
        );
      })
      .then((results: unknown[]) => {
        const seen = new Set<string>();
        const projects: Project[] = [];
        for (const r of results) {
          if (!r) continue;
          const profile = r as { projects?: Project[] };
          for (const p of profile.projects ?? []) {
            if (!seen.has(p.slug)) {
              seen.add(p.slug);
              projects.push(p);
            }
          }
        }
        setItems(projects.slice(0, 6));
      })
      .catch(() => { /* soft-fail */ })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-xs text-gray-500 text-center py-8">Ładowanie projektów…</p>;
  if (items.length === 0) return (
    <div className="bg-white/5 border border-dashed border-white/20 rounded-2xl p-12 text-center">
      <FolderKanban className="w-8 h-8 text-gray-500 mx-auto mb-3" />
      <p className="text-sm text-gray-400 mb-1">Projekty ładują się</p>
      <p className="text-xs text-gray-600">Publiczne projekty pojawią się po zgłoszeniu przez członków koła.</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map(p => (
        <Link
          key={p.id}
          to={`/projekty/${p.slug}`}
          className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl overflow-hidden transition-colors group flex flex-col"
        >
          {p.thumbnailUrl ? (
            <img src={p.thumbnailUrl} alt={p.title} className="w-full aspect-video object-cover border-b border-white/10" />
          ) : (
            <div className="w-full aspect-video bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border-b border-white/10 flex items-center justify-center">
              <FolderKanban className="w-8 h-8 text-white/30" />
            </div>
          )}
          <div className="p-5 flex-1 flex flex-col">
            <h3 className="text-sm font-semibold text-white group-hover:text-cyan-200 transition-colors mb-2">
              {p.title}
            </h3>
            {p.shortDescription && (
              <p className="text-xs text-gray-400 line-clamp-3 mb-3 flex-1">{p.shortDescription}</p>
            )}
            {p.technologies && p.technologies.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-auto">
                {p.technologies.slice(0, 4).map(t => (
                  <span key={t} className="text-[10px] bg-white/10 text-gray-300 px-2 py-0.5 rounded-full">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
