import { createBrowserRouter } from 'react-router';
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
import { MembershipForm } from '@/app/pages/MembershipForm';
import { Layout } from '@/app/Layout';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      {
        index: true,
        Component: Edition2026,
      },
      {
        path: '2025',
        Component: Edition2025,
      },
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
        path: 'zadania/:slug',
        Component: TaskDetail,
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
    ],
  },
]);
