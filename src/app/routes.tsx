import { createBrowserRouter, Navigate } from 'react-router';

// ══ Public + utility pages ═════════════════════════════════════════════════
import { Layout } from '@/app/Layout';
import { HomePage } from '@/app/pages/HomePage';
import { DemoPage } from '@/app/pages/DemoPage';
import { NotFoundPage } from '@/app/pages/NotFoundPage';
import { AuthCallback } from '@/app/pages/AuthCallback';
import { Logowanie } from '@/app/pages/Logowanie';
import { Onboarding } from '@/app/pages/Onboarding';
import { Edition2026 } from '@/app/pages/Edition2026';
import { Edition2025 } from '@/app/pages/Edition2025';
import { EditionLayout } from '@/app/pages/EditionLayout';
import { EditionPage } from '@/app/pages/EditionPage';
import { TaskDetail } from '@/app/pages/TaskDetail';
import { HackathonTimer } from '@/app/pages/HackathonTimer';
import { TeamDetailPage } from '@/app/pages/TeamDetailPage';
import { TeamEditPage } from '@/app/pages/TeamEditPage';
import { GalleryPage } from '@/app/pages/GalleryPage';
import { PlatformPage } from '@/app/pages/PlatformPage';
import { Forms } from '@/app/pages/Forms';
import { Survey } from '@/app/pages/Survey';
import { UnsubscribeConfirmation } from '@/app/pages/UnsubscribeConfirmation';
import { ConfirmAttendance } from '@/app/pages/ConfirmAttendance';
import { CertificateVerify } from '@/app/pages/CertificateVerify';
import { CertificateView } from '@/app/pages/CertificateView';
import { AboutPage } from '@/app/pages/AboutPage';
import { ValueDetailPage } from '@/app/pages/ValueDetailPage';
import { CollaborationDetailPage } from '@/app/pages/CollaborationDetailPage';
import { MembershipForm } from '@/app/pages/MembershipForm';
import { ContactPage } from '@/app/pages/ContactPage';
import { ProjectPublicView } from '@/app/pages/ProjectPublicView';
import { ParticipantsPage } from '@/app/pages/ParticipantsPage';
import { ParticipantProfile } from '@/app/pages/ParticipantProfile';
import { JuryPanel } from '@/app/pages/JuryPanel';
import { JuryResultsPage } from '@/app/pages/JuryResultsPage';
import { EventsPage } from '@/app/pages/EventsPage';

// ══ Panel layout + user-area pages ══════════════════════════════════════════
import { PanelLayout } from '@/app/pages/panel/PanelLayout';
import { PanelHome } from '@/app/pages/panel/PanelHome';
import { ProfilePage } from '@/app/pages/panel/ProfilePage';
import { ProjectsPage } from '@/app/pages/panel/ProjectsPage';
import { ProjectEditPage } from '@/app/pages/panel/ProjectEditPage';
import { TeamClaimPage } from '@/app/pages/panel/TeamClaimPage';
import { TeamCreatePage } from '@/app/pages/panel/TeamCreatePage';
import { ModeratorDashboard } from '@/app/pages/panel/ModeratorDashboard';
import { EventsAdminPage } from '@/app/pages/panel/EventsAdminPage';

// ══ /panel/admin/* — fuzja starego panelu administracyjnego ═════════════════
import { AdminOverview } from '@/app/pages/panel/admin/AdminOverview';
import { AdminApplicationsPage } from '@/app/pages/panel/admin/ApplicationsPage';
import { AdminRegistrationsPage } from '@/app/pages/panel/admin/RegistrationsPage';
import { AdminUsersPage } from '@/app/pages/panel/admin/UsersPage';
import { AdminTeamClaimsPage } from '@/app/pages/panel/admin/TeamClaimsPage';
import { AdminTeamProjectsPage } from '@/app/pages/panel/admin/TeamProjectsPage';
import { AdminResultsPage } from '@/app/pages/panel/admin/ResultsPage';
import { AdminCertificatesPage } from '@/app/pages/panel/admin/CertificatesPage';
import { AdminAttendancePage } from '@/app/pages/panel/admin/AttendancePage';
import { AdminMailingPage } from '@/app/pages/panel/admin/MailingPage';
import { AdminSurveysPage } from '@/app/pages/panel/admin/SurveysPage';
import { AdminContactSubmissionsPage } from '@/app/pages/panel/admin/ContactSubmissionsPage';
import { AdminCollaborationsPage } from '@/app/pages/panel/admin/CollaborationsPage';
import { AdminGalleryPage } from '@/app/pages/panel/admin/GalleryPage';
import { AdminOrgSettingsPage } from '@/app/pages/panel/admin/OrgSettingsPage';
import { AdminSmsPage } from '@/app/pages/panel/admin/SmsPage';
import { EditionsPage } from '@/app/pages/panel/admin/krakhack/EditionsPage';
import { KrakHackDashboardPage } from '@/app/pages/panel/admin/krakhack/DashboardPage';
import { KrakHackTeamsViewPage } from '@/app/pages/panel/admin/krakhack/TeamsViewPage';
import { AdminKompasPage } from '@/app/pages/panel/admin/lab/KompasPage';
import { IntegrationsPage } from '@/app/pages/panel/admin/IntegrationsPage';
import { MojaObecnoscPage } from '@/app/pages/panel/my/AttendancePage';
import { MyKompasPage } from '@/app/pages/panel/my/MyKompasPage';
import { GlosowaniePage } from '@/app/pages/panel/my/GlosowaniePage';

import { ProtectedRoute } from '@/app/components/ProtectedRoute';
import { createElement } from 'react';

// Helper: wrap a Component in ProtectedRoute with required roles.
function guarded(Component: React.ComponentType, roles: string[]) {
  return () => createElement(ProtectedRoute, { roles }, createElement(Component));
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      // ══ Homepage ══════════════════════════════════════════════════════════
      { index: true, Component: HomePage },

      // Faza 11.6 — podgląd nowej strony głównej koła (bez przekierowań, parkowany)
      { path: 'demo', Component: DemoPage },

      // ══ Edition routes (stable permanent links) ══════════════════════════
      {
        path: 'edycja/:editionId',
        Component: EditionLayout,
        children: [
          { index: true,                           Component: EditionPage },
          { path: 'zespoly/:slug',                 Component: TeamDetailPage },
          { path: 'zespoly/:slug/edytuj/:token',   Component: TeamEditPage },
          { path: 'galeria',                       Component: GalleryPage },
          { path: 'zadania/:slug',                 Component: TaskDetail },
        ],
      },

      // ══ Legacy routes — backward compat ═══════════════════════════════════
      { path: 'hackathon',                       Component: Edition2026 },
      { path: '2025',                            Component: Edition2025 },
      { path: 'zespoly/:slug',                   Component: TeamDetailPage },
      { path: 'zespoly/:slug/edytuj/:token',     Component: TeamEditPage },
      { path: 'zadania/:slug',                   Component: TaskDetail },

      // ══ Platform + utility ═══════════════════════════════════════════════
      { path: 'platforma',                       Component: PlatformPage },
      { path: 'forms',                           Component: Forms },
      { path: 'timer',                           Component: HackathonTimer },
      { path: 'confirm/:id',                     Component: ConfirmAttendance },
      { path: 'feedback',                        Component: Survey },
      { path: 'survey',                          Component: Survey },
      { path: 'verify',                          Component: CertificateVerify },
      { path: 'verify/:hash',                    Component: CertificateView },
      { path: 'unsubscribe-confirmation',        Component: UnsubscribeConfirmation },
      { path: 'o-nas',                           Component: AboutPage },
      { path: 'o-nas/:slug',                     Component: ValueDetailPage },
      { path: 'wspolpraca/:slug',                Component: CollaborationDetailPage },
      { path: 'dolacz',                          Component: MembershipForm },
      { path: 'kontakt',                         Component: ContactPage },

      // ══ Legacy /admin → /panel/admin redirect ═════════════════════════════
      { path: 'admin',            element: <Navigate to="/panel/admin" replace /> },
      { path: 'admin/attendance', element: <Navigate to="/panel/admin/obecnosc" replace /> },

      // ══ Auth ═════════════════════════════════════════════════════════════
      { path: 'logowanie',                       Component: Logowanie },
      { path: 'login',                           Component: Logowanie },   // alias EN
      { path: 'onboarding',                      Component: Onboarding },

      // ══ Panel — unified role-based hub ═══════════════════════════════════
      {
        path: 'panel',
        Component: PanelLayout,
        children: [
          // ── MÓJ OBSZAR (każdy zalogowany) ─────────────────────────────────
          { index: true,                         Component: PanelHome },
          { path: 'profil',                      Component: ProfilePage },
          { path: 'projekty',                    Component: ProjectsPage },
          { path: 'projekty/nowy',               Component: ProjectEditPage },
          { path: 'projekty/:id/edytuj',         Component: ProjectEditPage },
          { path: 'moj-zespol',                  Component: TeamClaimPage },
          { path: 'moja-obecnosc',               Component: guarded(MojaObecnoscPage, ['admin', 'hackathon-participant']) },
          { path: 'moj-kompas',                  Component: guarded(MyKompasPage,     ['admin', 'scienceclub-participant']) },
          { path: 'glosowanie',                  Component: GlosowaniePage },
          { path: 'zespoly/nowy',                Component: TeamCreatePage },

          // ── Legacy moderator alias (zostaje dla starych linków) ──────────
          { path: 'moderator',                   Component: guarded(ModeratorDashboard, ['admin', 'moderator']) },

          // ── ADMINISTRACJA (admin/moderator) ──────────────────────────────
          { path: 'admin',                       Component: guarded(AdminOverview,              ['admin']) },
          { path: 'admin/aplikacje',             Component: guarded(AdminApplicationsPage,      ['admin', 'moderator']) },
          { path: 'admin/rejestracje',           Component: guarded(AdminRegistrationsPage,     ['admin', 'moderator']) },
          { path: 'admin/uzytkownicy',           Component: guarded(AdminUsersPage,             ['admin', 'moderator']) },
          { path: 'admin/team-claims',           Component: guarded(AdminTeamClaimsPage,        ['admin', 'moderator']) },
          { path: 'admin/zespoly',               Component: guarded(AdminTeamProjectsPage,      ['admin']) },
          { path: 'admin/wyniki',                Component: guarded(AdminResultsPage,           ['admin']) },
          { path: 'admin/certyfikaty',           Component: guarded(AdminCertificatesPage,      ['admin']) },
          { path: 'admin/obecnosc',              Component: guarded(AdminAttendancePage,        ['admin']) },
          { path: 'admin/wydarzenia',            Component: guarded(EventsAdminPage,            ['admin']) },
          { path: 'admin/mailing',               Component: guarded(AdminMailingPage,           ['admin']) },
          { path: 'admin/ankiety',               Component: guarded(AdminSurveysPage,           ['admin']) },
          { path: 'admin/zapytania',             Component: guarded(AdminContactSubmissionsPage,['admin']) },
          { path: 'admin/wspolprace',            Component: guarded(AdminCollaborationsPage,    ['admin']) },
          { path: 'admin/galeria',               Component: guarded(AdminGalleryPage,           ['admin']) },
          { path: 'admin/organizacja',           Component: guarded(AdminOrgSettingsPage,       ['admin']) },
          { path: 'admin/sms',                   Component: guarded(AdminSmsPage,               ['admin']) },

          // ── KrakHack context (ctx=krakhack) — 1:1 port HACKATHON_NAV_GROUPS ──
          { path: 'admin/krakhack/dashboard',    Component: guarded(KrakHackDashboardPage,      ['admin']) },
          { path: 'admin/krakhack/edycje',       Component: guarded(EditionsPage,               ['admin']) },
          { path: 'admin/krakhack/zespoly-view', Component: guarded(KrakHackTeamsViewPage,      ['admin']) },

          // ── AI Lab context (ctx=lab) ─────────────────────────────────────
          { path: 'admin/lab/kompas',            Component: guarded(AdminKompasPage,            ['admin']) },

          // ── System context (ctx=system) — integracje zewnętrzne ──────────
          { path: 'admin/integracje',            Component: guarded(IntegrationsPage,           ['admin']) },
        ],
      },

      // ══ Public views (no auth) ═══════════════════════════════════════════
      { path: 'projekty/:slug',                  Component: ProjectPublicView },
      { path: 'wydarzenia',                      Component: EventsPage },
      { path: 'uczestnicy',                      Component: ParticipantsPage },
      { path: 'uczestnicy/:slug',                Component: ParticipantProfile },
      { path: 'wyniki/:edition',                 Component: JuryResultsPage },

      // Catch-all — wszystkie nieznane ścieżki pod Layout.
      // Bez tego React Router pokazuje default "Hey developer 👋" 404 UI.
      { path: '*', Component: NotFoundPage },
    ],
  },

  // Auth callback — outside Layout (full-screen, no navbar)
  { path: '/auth/callback', Component: AuthCallback },

  // Jury panel — magic-link, no Keycloak (standalone)
  { path: '/jury/:token',   Component: JuryPanel },
]);
