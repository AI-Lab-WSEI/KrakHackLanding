/**
 * PanelHome — /panel landing dla zalogowanego usera.
 *
 * Widok "MÓJ OBSZAR" — welcome + role badges + onboarding nudge + skróty.
 * + analityka BI (skille ja vs koło, stats tiles, nadchodzące wydarzenia).
 * Admin dostaje dodatkowo KPI panelu administracyjnego.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  FolderKanban, Users2, Calendar, Award, Shield, Compass, Vote,
  TrendingUp, ClipboardList, UserCheck, MessageSquare, CalendarCheck, Mail,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { adminFetch } from '@/lib/adminApi';
import { PanelCard } from '@/app/components/panel/shared/PanelCard';
import { usePreviewScope } from './usePreviewScope';

const ROLE_LABEL: Record<string, { label: string; cls: string }> = {
  admin:                    { label: 'Admin',      cls: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
  moderator:                { label: 'Moderator',  cls: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' },
  'hackathon-participant':  { label: 'Hackathon',  cls: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' },
  'scienceclub-participant':{ label: 'Koło',       cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  jury:                     { label: 'Jury',       cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
};

interface Stats {
  myProjects:    number;
  myTeams:       number;
  myVotes:       number;
  mySkillsCount: number;
  clubSize:      number;
  clubAvgSkills: number;
  topClubSkills: { skill: string; count: number }[];
  upcomingEvents: {
    id:        string;
    title:     string;
    startsAt:  string;
    eventType: string | null;
  }[];
  adminKpis?: {
    applicationsNew: number;
    claimsPending:   number;
    certsDraft:      number;
    contactNew:      number;
  };
}

export function PanelHome() {
  const { user }             = useAuth();
  const [stats, setStats]    = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await adminFetch('/api/panel/my-stats');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const d = await res.json();
        if (!cancelled) setStats(d);
      } catch {
        // soft fail — dashboard pokazuje się bez stats
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Hook MUSI być przed early return (React rules of hooks — stabilne wywołania).
  const { previewScope, isPreviewActive } = usePreviewScope();

  if (!user) return null;

  const realIsAdmin       = user.keycloakRoles.includes('admin');
  const realIsModerator   = user.keycloakRoles.includes('moderator');
  const realIsHackathon   = user.keycloakRoles.includes('hackathon-participant');
  const realIsScienceclub = user.keycloakRoles.includes('scienceclub-participant');
  const realIsJury        = user.keycloakRoles.includes('jury');

  // Effective flags — uwzględniają preview scope. Preview DODAJE scope (nie podmienia),
  // żeby admin w podglądzie widział obie perspektywy (np. admin-shortcut + user-side).
  const isAdmin           = realIsAdmin;
  const isModerator       = realIsModerator;
  const isHackathon       = realIsHackathon   || previewScope === 'hackathon';
  const isScienceclub     = realIsScienceclub || previewScope === 'scienceclub';
  const isJury            = realIsJury        || previewScope === 'jury';
  const hasAnyParticipant = isHackathon || isScienceclub || isJury;
  const userSkills        = new Set(user.skills.map(s => s.toLowerCase()));

  /**
   * Role-aware missing integrations — tylko dla hackathon + scienceclub (jury
   * nie korzysta z Discord/ClickUp — używa standalone magic linka).
   */
  const needsIntegrations = isHackathon || isScienceclub;
  const missingIntegrations: string[] = [];
  if (needsIntegrations) {
    if (!user.discordUsername?.trim()) missingIntegrations.push('Discord');
    if (isScienceclub && !user.clickupEmail?.trim()) missingIntegrations.push('ClickUp');
  }

  /**
   * Quick links — budowane dynamicznie na podstawie RZECZYWISTYCH ról usera.
   *
   * Admin, który nie jest jednocześnie hackathon-participantem, NIE widzi
   * "Mój zespół" (bo nie ma zespołu — admin zarządza zespołami przez panel admin,
   * nie przez user-side). Żeby przetestować user-side, admin musi mieć rolę
   * uczestnika explicit w Keycloak.
   */
  type QuickLink = { label: string; icon: LucideIcon; href: string; hint?: string };
  const quickLinks: QuickLink[] = [
    { label: 'Mój profil',    icon: Users2,       href: '/panel/profil' },
    { label: 'Moje projekty', icon: FolderKanban, href: '/panel/projekty' },
  ];
  if (isHackathon) {
    quickLinks.push({ label: 'Mój zespół',    icon: Users2,        href: '/panel/moj-zespol', hint: 'Hackathon' });
    quickLinks.push({ label: 'Moja obecność', icon: CalendarCheck, href: '/panel/moja-obecnosc', hint: 'Hackathon' });
  }
  if (isScienceclub) {
    quickLinks.push({ label: 'Mój kompas',    icon: Compass, href: '/panel/moj-kompas', hint: 'Koło' });
  }
  if (hasAnyParticipant) {
    quickLinks.push({ label: 'Głosowanie',    icon: Vote, href: '/panel/glosowanie' });
  }
  quickLinks.push({ label: 'Wydarzenia', icon: Calendar, href: '/wydarzenia' });

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto flex flex-col gap-6">
      {/* Welcome */}
      <PanelCard padding="md">
        <h1 className="text-2xl font-semibold text-white">
          Cześć{user.displayName ? `, ${user.displayName}` : ''}!
        </h1>
        <p className="text-sm text-gray-400 mt-1">{user.email}</p>
        <div className="flex flex-wrap gap-2 mt-4">
          {user.keycloakRoles
            .filter(r => r in ROLE_LABEL)
            .map(r => (
              <span
                key={r}
                className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border ${ROLE_LABEL[r].cls}`}
              >
                {ROLE_LABEL[r].label}
              </span>
            ))}
        </div>
      </PanelCard>

      {/* Onboarding nudge — tylko dla hackathon/scienceclub (publiczny profil).
          Jury nie ma widoczności publicznej — używa magic linka. Admin/moderator
          mają inne odpowiedzialności niż publiczny profil. Pokazujemy TYLKO gdy
          nie ma Missing integrations (żeby nie spamować 2 amber cards).
      */}
      {!user.onboardingCompleted && needsIntegrations && missingIntegrations.length === 0 && (
        <PanelCard padding="md" className="!bg-amber-500/10 !border-amber-500/30">
          <p className="text-amber-300 font-medium text-sm">Uzupełnij swój profil</p>
          <p className="text-amber-200/70 text-xs mt-1">
            Dodaj bio, GitHub i umiejętności, żeby pojawić się w katalogu uczestników.
          </p>
          <Link
            to="/panel/profil"
            className="inline-block mt-3 text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 px-4 py-2 rounded-lg transition-colors"
          >
            Uzupełnij profil →
          </Link>
        </PanelCard>
      )}

      {/* Missing integrations nudge (Discord / ClickUp) — scope-aware */}
      {missingIntegrations.length > 0 && (
        <PanelCard padding="md" className="!bg-amber-500/5 !border-amber-500/20">
          <div className="flex items-start gap-3">
            <Mail className="w-4 h-4 text-amber-300 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-amber-300 font-medium text-sm">
                Brakuje {missingIntegrations.join(' + ')} w Twoim profilu
              </p>
              <p className="text-amber-200/70 text-xs mt-1 leading-relaxed">
                {isScienceclub && 'Jako członek koła potrzebujemy te dane żeby zaprosić Cię do Discord i workspace ClickUp.'}
                {!isScienceclub && isHackathon && 'Dodaj nick na Discordzie żebyśmy mogli zaprosić Cię do serwera hackathonu.'}
              </p>
              <Link
                to="/panel/profil"
                className="inline-block mt-2 text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 px-3 py-1.5 rounded-lg transition-colors"
              >
                Uzupełnij integracje →
              </Link>
            </div>
          </div>
        </PanelCard>
      )}

      {/* Jury-only welcome — kierujemy do magic linka. Dajmy CTA do admina
          jeśli jury zgubił link. */}
      {isJury && !isAdmin && !isModerator && (
        <PanelCard padding="md" className="!bg-amber-500/5 !border-amber-500/20">
          <p className="text-sm font-medium text-amber-200 mb-1">Jesteś jurorem — użyj magic linka</p>
          <p className="text-xs text-amber-200/70 leading-relaxed">
            Panel oceny projektów jest na osobnym URL-u (<code>/jury/&lt;token&gt;</code>),
            który dostałeś/aś mailem od organizatorów. Ten panel główny nie jest potrzebny
            do oceny projektów.
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <a
              href="mailto:knai@wsei.edu.pl?subject=Zgubiłem%20magic%20link%20jury%20%E2%80%94%20AI%20Krak%20Hack&body=Cześć,%0A%0AZgubiłem/am%20magic%20link%20do%20panelu%20jury.%20Poproszę%20o%20ponowne%20wysłanie.%0A%0AMój%20email%20konta%3A%20..."
              className="text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 px-3 py-1.5 rounded-lg transition-colors"
            >
              Poproś admina o nowy link →
            </a>
            <Link
              to="/wyniki/3"
              className="text-xs bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 px-3 py-1.5 rounded-lg transition-colors"
            >
              Zobacz wyniki edycji (publiczne)
            </Link>
          </div>
        </PanelCard>
      )}

      {/* No role — user zalogowany ale nie jest jeszcze przypisany do żadnego trybu */}
      {!hasAnyParticipant && !isAdmin && !isModerator && (
        <PanelCard padding="md" className="!bg-blue-500/5 !border-blue-500/20">
          <p className="text-sm font-medium text-blue-200 mb-1">Konto czeka na przypisanie</p>
          <p className="text-xs text-blue-200/70 leading-relaxed">
            Jesteś zalogowany/a, ale nie masz jeszcze przypisanej roli uczestnika.
            Administrator musi potwierdzić Twoją aplikację — skontaktuj się z{' '}
            <a href="mailto:knai@wsei.edu.pl" className="underline">knai@wsei.edu.pl</a>{' '}
            jeśli zaproszenie zaginęło.
          </p>
        </PanelCard>
      )}

      {/* Admin shortcut */}
      {(isAdmin || isModerator) && (
        <PanelCard padding="md" className="!bg-purple-500/5 !border-purple-500/20">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-purple-300" />
              <div>
                <p className="text-sm text-white font-medium">Panel administracyjny</p>
                <p className="text-xs text-gray-400">
                  {isAdmin ? 'Pełny dostęp admin' : 'Dostęp moderator'} — aplikacje, claims, mailing i więcej
                </p>
              </div>
            </div>
            <Link
              to="/panel/admin"
              className="text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/40 px-4 py-2 rounded-lg transition-colors"
            >
              Otwórz panel →
            </Link>
          </div>
        </PanelCard>
      )}

      {/* Admin KPI tiles (tylko admin, tylko jeśli są liczby) */}
      {isAdmin && stats?.adminKpis && (
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Administracja — pending</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <AdminKpi
              label="Aplikacje nowe"
              value={stats.adminKpis.applicationsNew}
              href="/panel/admin/aplikacje"
              icon={ClipboardList}
            />
            <AdminKpi
              label="Claims pending"
              value={stats.adminKpis.claimsPending}
              href="/panel/admin/team-claims"
              icon={UserCheck}
            />
            <AdminKpi
              label="Certyfikaty draft"
              value={stats.adminKpis.certsDraft}
              href="/panel/admin/certyfikaty"
              icon={Award}
            />
            <AdminKpi
              label="Zapytania nowe"
              value={stats.adminKpis.contactNew}
              href="/panel/admin/zapytania"
              icon={MessageSquare}
            />
          </div>
        </div>
      )}

      {/* My stats — scope-aware (zespoły tylko dla hackathon, głos dla tych którzy mogą głosować) */}
      {stats && (
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Twoje statystyki</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MyStatTile label="Moje projekty"  value={stats.myProjects}    icon={FolderKanban} />
            {isHackathon && (
              <MyStatTile label="Moje zespoły"   value={stats.myTeams}       icon={Users2} />
            )}
            {hasAnyParticipant && (
              <MyStatTile label="Oddany głos"    value={stats.myVotes}       icon={TrendingUp} />
            )}
            <MyStatTile label="Umiejętności"   value={stats.mySkillsCount} icon={Award} />
          </div>
        </div>
      )}

      {/* Skills: ty vs koło */}
      {stats && stats.topClubSkills.length > 0 && (
        <PanelCard padding="md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium text-white">Ty vs koło — umiejętności</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Top 8 skilli w kole ({stats.clubSize} aktywnych userów). Podświetlone = masz je w profilu.
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {stats.topClubSkills.map(sk => {
              const iHave = userSkills.has(sk.skill.toLowerCase());
              const pct   = stats.clubSize > 0 ? Math.min(100, Math.round((sk.count / stats.clubSize) * 100)) : 0;
              return (
                <div key={sk.skill} className="flex items-center gap-3">
                  <div className={`text-xs w-40 shrink-0 truncate ${iHave ? 'text-indigo-300 font-medium' : 'text-gray-400'}`}>
                    {iHave && <span className="mr-1">✓</span>}
                    {sk.skill}
                  </div>
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${iHave ? 'bg-indigo-400' : 'bg-white/30'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 w-16 text-right">{sk.count} · {pct}%</div>
                </div>
              );
            })}
          </div>

          <p className="text-[10px] text-gray-600 mt-4">
            Średnia ilość skilli / user w kole: {stats.clubAvgSkills}.
            {stats.mySkillsCount < stats.clubAvgSkills && (
              <> Ty masz {stats.mySkillsCount} — warto dopisać więcej w profilu.</>
            )}
          </p>
        </PanelCard>
      )}

      {/* Upcoming events */}
      {stats && stats.upcomingEvents.length > 0 && (
        <PanelCard padding="md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-white">Nadchodzące wydarzenia</h3>
            <Link to="/wydarzenia" className="text-xs text-gray-400 hover:text-white transition-colors">
              Zobacz wszystkie →
            </Link>
          </div>
          <div className="space-y-2">
            {stats.upcomingEvents.map(ev => (
              <div key={ev.id} className="flex items-center gap-3 px-3 py-2 bg-white/5 border border-white/10 rounded-lg">
                <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{ev.title}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(ev.startsAt).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {ev.eventType && <> · {ev.eventType}</>}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </PanelCard>
      )}

      {/* Quick links — scope-aware (budowane dynamicznie na podstawie roli) */}
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Szybki dostęp</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickLinks.map(l => (
            <Link
              key={l.href}
              to={l.href}
              className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 flex flex-col gap-2 transition-colors"
            >
              <l.icon className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <span className="text-sm text-white block">{l.label}</span>
                {l.hint && (
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">{l.hint}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {loading && !stats && (
        <p className="text-xs text-gray-600 text-center py-4">Ładowanie statystyk…</p>
      )}
    </div>
  );
}

function AdminKpi({
  label, value, href, icon: Icon,
}: {
  label: string;
  value: number;
  href: string;
  icon: typeof ClipboardList;
}) {
  return (
    <Link
      to={href}
      className="group bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-colors"
    >
      <div className="flex items-start justify-between mb-2">
        <Icon className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
      </div>
      <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
      <p className="text-[11px] text-gray-400 mt-0.5 truncate">{label}</p>
    </Link>
  );
}

function MyStatTile({
  label, value, icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof ClipboardList;
}) {
  return (
    <PanelCard padding="sm">
      <Icon className="w-4 h-4 text-gray-500 mb-2" />
      <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
      <p className="text-[11px] text-gray-400 mt-0.5 truncate">{label}</p>
    </PanelCard>
  );
}
