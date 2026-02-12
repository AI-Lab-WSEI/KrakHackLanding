import { createBrowserRouter } from 'react-router';
import { Edition2026 } from '@/app/pages/Edition2026';
import { Edition2025 } from '@/app/pages/Edition2025';
import { Forms } from '@/app/pages/Forms';
import { AdminPanel } from '@/app/pages/AdminPanel';
import { TaskDetail } from '@/app/pages/TaskDetail';
import { HackathonTimer } from '@/app/pages/HackathonTimer';
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
        path: 'zadania/:slug',
        Component: TaskDetail,
      },
    ],
  },
]);
