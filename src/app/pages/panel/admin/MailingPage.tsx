/**
 * /panel/admin/mailing — mailing + SMS + scheduled mailings (z monolitu AdminDashboard)
 * Renderuje AdminDashboard w trybie embedded z activeTab="mailing".
 * Widoczne: admin.
 */
import { AdminDashboard } from '@/app/components/AdminDashboard';

export function AdminMailingPage() {
  return <AdminDashboard embeddedTab="mailing" embeddedDomain="hackathon" />;
}
