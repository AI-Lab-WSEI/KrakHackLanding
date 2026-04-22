import { createBrowserRouter, redirect } from 'react-router';
import { Logowanie } from '@/app/pages/Logowanie';
import { AuthCallback } from '@/app/pages/AuthCallback';
import { Onboarding } from '@/app/pages/Onboarding';
import { PanelLayout } from '@/app/pages/panel/PanelLayout';
import { PanelHome } from '@/app/pages/panel/PanelHome';
import { AdminDashboard } from '@/app/pages/panel/AdminDashboard';
import { ModeratorDashboard } from '@/app/pages/panel/ModeratorDashboard';
import { ProfilePage } from '@/app/pages/panel/ProfilePage';
import { ProjectsPage } from '@/app/pages/panel/ProjectsPage';
import { ProjectEditPage } from '@/app/pages/panel/ProjectEditPage';
import { ProjectPublicView } from '@/app/pages/ProjectPublicView';
import { JuryPanel } from '@/app/pages/JuryPanel';
import { TeamClaimPage } from '@/app/pages/panel/TeamClaimPage';
import { TeamCreatePage } from '@/app/pages/panel/TeamCreatePage';
import { EventsPage } from '@/app/pages/EventsPage';
import { EventsAdminPage } from '@/app/pages/panel/EventsAdminPage';
import { ParticipantsPage } from '@/app/pages/ParticipantsPage';
import { ParticipantProfile } from '@/app/pages/ParticipantProfile';
import { JuryResultsPage } from '@/app/pages/JuryResultsPage';
import { HomePage } from '@/app/pages/HomePage';
import { Edition2026 } from '@/app/pages/Edition2026';
import { Edition2025 } from '@/app/pages/Edition2025';
import { Forms } from '@/app/pages/Forms';
import { AdminPanel } from '@/app/pages/AdminPanel';
import { TaskDetail } from '@/app/pages/TaskDetail';
import { HackathonTimer } from '@/app/pages/HackathonTimer';
import { Survey } from '@/app/pages/Survey';
import { UnsubscribeConfirmation } from '@/app/pages/UnsubscribeConfirmation';
import { AdminAttendance } from '@/app/pages/AdminAttendance';
import { ConfirmAttendance } from '@/app/pages/ConfirmAttendance';
import { CertificateVerify } from '@/app/pages/CertificateVerify';
import { CertificateView } from '@/app/pages/CertificateView';
import { AboutPage } from '@/app/pages/AboutPage';
import { ValueDetailPage } from '@/app/pages/ValueDetailPage';
import { CollaborationDetailPage } from '@/app/pages/CollaborationDetailPage';
import { TeamDetailPage } from '@/app/pages/TeamDetailPage';
import { TeamEditPage } from '@/app/pages/TeamEditPage';
import { GalleryPage } from '@/app/pages/GalleryPage';
import { MembershipForm } from '@/app/pages/MembershipForm';
import { ContactPage } from '@/app/pages/ContactPage';
import { PlatformPage } from '@/app/pages/PlatformPage';
import { Layout } from '@/app/Layout';
import { EditionLayout } from '@/app/pages/EditionLayout';
import { EditionPage } from '@/app/pages/EditionPage';
import { CURRENT_EDITION_NUMBER, getEditionByYear } from '@/data/edition-registry';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      // ══ Homepage — renders current edition inline ══
      {
        index: true,
        Component: HomePage,
      },

      // ══ Edition routes (NEW — stable, permanent links) ══
      {
        path: 'edycja/:editionId',
        Component: EditionLayout,
        children: [
          {
            index: true,
            Component: EditionPage,
          },
          {
            path: 'zespoly/:slug',
            Component: TeamDetailPage,
          },
          {
            path: 'zespoly/:slug/edytuj/:token',
            Component: TeamEditPage,
          },
          {
            path: 'galeria',
            Component: GalleryPage,
          },
          {
            path: 'zadania/:slug',
            Component: TaskDetail,
          },
        ],
      },

      // ══ Legacy routes — kept for backward compatibility ══
      // These ALL still work exactly as before.
      {
        path: 'hackathon',
        Component: Edition2026,
      },
      {
        path: '2025',
        Component: Edition2025,
      },
      {
        path: 'zespoly/:slug',
        Component: TeamDetailPage,
      },
      {
        path: 'zespoly/:slug/edytuj/:token',
        Component: TeamEditPage,
      },
      {
        path: 'zadania/:slug',
        Component: TaskDetail,
      },

      // ══ Platform marketing page ══
      {
        path: 'platforma',
        Component: PlatformPage,
      },

      // ══ Utility routes (edition-independent) ══
      {
        path: 'forms',
        Component: Forms,
      },
      {
        path: 'timer',
        Component: HackathonTimer,
      },
      {
        path: 'admin',
        // Legacy password-gated admin panel stays accessible (backdoor for ops)
        // but new users should be sent to /login + Keycloak role-based flow.
        Component: AdminPanel,
      },
      {
        path: 'admin/attendance',
        Component: AdminAttendance,
      },
      {
        path: 'confirm/:id',
        Component: ConfirmAttendance,
      },
      {
        path: 'feedback',
        Component: Survey,
      },
      {
        path: 'survey',
        Component: Survey,
      },
      {
        path: 'verify',
        Component: CertificateVerify,
      },
      {
        path: 'verify/:hash',
        Component: CertificateView,
      },
      {
        path: 'unsubscribe-confirmation',
        Component: UnsubscribeConfirmation,
      },
      {
        path: 'o-nas',
        Component: AboutPage,
      },
      {
        path: 'o-nas/:slug',
        Component: ValueDetailPage,
      },
      {
        path: 'wspolpraca/:slug',
        Component: CollaborationDetailPage,
      },
      {
        path: 'dolacz',
        Component: MembershipForm,
      },
      {
        path: 'kontakt',
        Component: ContactPage,
      },

      // ══ Auth & Panel (Faza 1-2) ══
      {
        path: 'logowanie',
        Component: Logowanie,
      },
      {
        // English alias — same component, same Keycloak PKCE flow.
        path: 'login',
        Component: Logowanie,
      },
      {
        path: 'onboarding',
        Component: Onboarding,
      },

      // Panel — nested layout with sidebar
      {
        path: 'panel',
        Component: PanelLayout,
        children: [
          { index: true,                         Component: PanelHome },
          { path: 'profil',                      Component: ProfilePage },
          { path: 'projekty',                    Component: ProjectsPage },
          { path: 'projekty/nowy',               Component: ProjectEditPage },
          { path: 'projekty/:id/edytuj',         Component: ProjectEditPage },
          { path: 'moj-zespol',                  Component: TeamClaimPage },
          { path: 'zespoly/nowy',                Component: TeamCreatePage },
          { path: 'admin',                       Component: AdminDashboard },
          { path: 'admin/wydarzenia',            Component: EventsAdminPage },
          { path: 'moderator',                   Component: ModeratorDashboard },
        ],
      },

      // Public project view (no auth required)
      {
        path: 'projekty/:slug',
        Component: ProjectPublicView,
      },

      // Events calendar
      {
        path: 'wydarzenia',
        Component: EventsPage,
      },

      // Participants directory & profiles
      {
        path: 'uczestnicy',
        Component: ParticipantsPage,
      },
      {
        path: 'uczestnicy/:slug',
        Component: ParticipantProfile,
      },

      // Jury results (public scoreboard)
      {
        path: 'wyniki/:edition',
        Component: JuryResultsPage,
      },
    ],
  },

  // Auth callback lives OUTSIDE Layout (full-screen, no navbar)
  {
    path: '/auth/callback',
    Component: AuthCallback,
  },

  // Jury panel — magic-link, no Keycloak, full-screen standalone
  {
    path: '/jury/:token',
    Component: JuryPanel,
  },
]);
