import { createBrowserRouter, redirect } from 'react-router';
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
    ],
  },
]);
