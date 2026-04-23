/**
 * /panel/admin/rejestracje — uczestnicy hackathonu (add/edit/delete)
 * Renderuje AdminDashboard w trybie embedded z activeTab="participants".
 * Widoczne: admin, moderator.
 */
import { AdminDashboard } from '@/app/components/AdminDashboard';

export function AdminRegistrationsPage() {
  return <AdminDashboard embeddedTab="participants" embeddedDomain="hackathon" />;
}
