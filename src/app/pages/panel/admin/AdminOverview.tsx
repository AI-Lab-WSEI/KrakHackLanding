/**
 * /panel/admin — overview dashboard dla admina.
 *
 * KPI tiles (counts z backendu) + skróty do najczęstszych sekcji.
 * Bez wykresów — Analityka BI wchodzi dopiero w sprincie 2.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  ClipboardList,
  Award,
  Briefcase,
  MessageSquare,
  Trophy,
  Calendar,
  UserCheck,
  Users,
} from 'lucide-react';
import { adminFetch } from '@/lib/adminApi';
import { PanelCard } from '@/app/components/panel/shared/PanelCard';
import { PanelSectionHeader } from '@/app/components/panel/shared/PanelSectionHeader';

interface Kpis {
  applicationsNew: number;
  applicationsPending: number;
  claimsPending: number;
  teamProjectsTotal: number;
  contactNew: number;
  certificatesDraft: number;
  eventsUpcoming: number;
  usersTotal: number;
}

const EMPTY: Kpis = {
  applicationsNew:     0,
  applicationsPending: 0,
  claimsPending:       0,
  teamProjectsTotal:   0,
  contactNew:          0,
  certificatesDraft:   0,
  eventsUpcoming:      0,
  usersTotal:          0,
};

export function AdminOverview() {
  const [kpis, setKpis]       = useState<Kpis>(EMPTY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      // Wszystkie endpointy są już admin-gated. Zbieramy w paraleli, ignorujemy błędy na per-endpoint basis.
      const endpoints: Array<[keyof Kpis, string, (d: unknown) => number]> = [
        ['applicationsNew',     '/api/membership-applications?status=nowe',        d => Array.isArray(d) ? d.length : ((d as { applications?: unknown[] }).applications?.length ?? 0)],
        ['applicationsPending', '/api/membership-applications?status=w_kontakcie', d => Array.isArray(d) ? d.length : ((d as { applications?: unknown[] }).applications?.length ?? 0)],
        ['claimsPending',       '/api/panel/claims?status=pending',                 d => ((d as { claims?: unknown[] }).claims?.length ?? 0)],
        ['teamProjectsTotal',   '/api/admin/team-projects',                         d => Array.isArray(d) ? d.length : ((d as { projects?: unknown[] }).projects?.length ?? 0)],
        ['contactNew',          '/api/submissions?type=org_contact&status=new',    d => Array.isArray(d) ? d.length : ((d as { submissions?: unknown[] }).submissions?.length ?? 0)],
        ['certificatesDraft',   '/api/certificates?status=draft',                  d => Array.isArray(d) ? d.length : ((d as { certificates?: unknown[] }).certificates?.length ?? 0)],
        ['eventsUpcoming',      '/api/events?all=1',                                d => {
          const events = Array.isArray(d) ? d : ((d as { events?: unknown[] }).events ?? []);
          return events.filter((e: unknown) => {
            const ev = e as { starts_at?: string; startsAt?: string };
            const start = ev.starts_at ?? ev.startsAt;
            return start && new Date(start) > new Date();
          }).length;
        }],
        ['usersTotal',          '/api/panel/users',                                 d => ((d as { users?: unknown[] }).users?.length ?? 0)],
      ];

      const results = await Promise.allSettled(
        endpoints.map(async ([key, url, extract]) => {
          const res = await adminFetch(url);
          if (!res.ok) throw new Error(`${key}: ${res.status}`);
          const data = await res.json();
          return [key, extract(data)] as const;
        })
      );

      if (cancelled) return;

      const next: Kpis = { ...EMPTY };
      results.forEach(r => {
        if (r.status === 'fulfilled') {
          const [key, value] = r.value;
          next[key] = value;
        }
      });
      setKpis(next);
      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const tiles: Array<{
    label: string;
    value: number;
    icon: typeof ClipboardList;
    href: string;
    accent: string;
  }> = [
    { label: 'Nowe aplikacje',         value: kpis.applicationsNew,     icon: ClipboardList, href: '/panel/admin/aplikacje',   accent: 'bg-purple-500/15 text-purple-300 border-purple-500/20' },
    { label: 'Aplikacje w kontakcie',  value: kpis.applicationsPending, icon: ClipboardList, href: '/panel/admin/aplikacje',   accent: 'bg-blue-500/15 text-blue-300 border-blue-500/20' },
    { label: 'Claims oczekujące',      value: kpis.claimsPending,       icon: UserCheck,     href: '/panel/admin/team-claims', accent: 'bg-amber-500/15 text-amber-300 border-amber-500/20' },
    { label: 'Projekty zespołów',      value: kpis.teamProjectsTotal,   icon: Briefcase,     href: '/panel/admin/zespoly',     accent: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/20' },
    { label: 'Nowe zapytania',         value: kpis.contactNew,          icon: MessageSquare, href: '/panel/admin/zapytania',   accent: 'bg-rose-500/15 text-rose-300 border-rose-500/20' },
    { label: 'Certyfikaty draft',      value: kpis.certificatesDraft,   icon: Award,         href: '/panel/admin/certyfikaty', accent: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20' },
    { label: 'Nadchodzące wydarzenia', value: kpis.eventsUpcoming,      icon: Calendar,      href: '/panel/admin/wydarzenia',  accent: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/20' },
    { label: 'Użytkowników',           value: kpis.usersTotal,          icon: Users,         href: '/panel/admin/uzytkownicy', accent: 'bg-white/10 text-white border-white/15' },
  ];

  const quickLinks: Array<{ label: string; href: string; icon: typeof Trophy }> = [
    { label: 'Wyniki & Jury',     href: '/panel/admin/wyniki',      icon: Trophy },
    { label: 'Certyfikaty',       href: '/panel/admin/certyfikaty', icon: Award },
    { label: 'Wydarzenia',        href: '/panel/admin/wydarzenia',  icon: Calendar },
    { label: 'Mailing',           href: '/panel/admin/mailing',     icon: MessageSquare },
  ];

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      <PanelSectionHeader
        eyebrow="Panel administracyjny"
        title="Dashboard"
        subtitle="Skrót tego co się dzieje w systemie — kliknij kafelek żeby przejść do sekcji."
      />

      {/* KPI grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
        {tiles.map(t => (
          <Link
            key={t.label}
            to={t.href}
            className="group"
          >
            <PanelCard padding="sm" className={`border transition-colors group-hover:bg-white/[0.08] ${t.accent.replace('text-', 'hover:text-')}`}>
              <div className="flex items-start justify-between mb-3">
                <t.icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              </div>
              <p className="text-3xl font-bold text-white tabular-nums">
                {loading ? '—' : t.value}
              </p>
              <p className="text-xs text-gray-400 mt-1 truncate">{t.label}</p>
            </PanelCard>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <PanelCard padding="md">
        <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider mb-4">
          Szybki dostęp
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickLinks.map(l => (
            <Link
              key={l.href}
              to={l.href}
              className="flex items-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 hover:text-white transition-colors"
            >
              <l.icon className="w-4 h-4" />
              <span className="truncate">{l.label}</span>
            </Link>
          ))}
        </div>
      </PanelCard>
    </div>
  );
}
