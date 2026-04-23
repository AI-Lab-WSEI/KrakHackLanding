/**
 * /panel/admin/ankiety — ankiety feedback (z monolitu AdminDashboard)
 * Renderuje AdminDashboard w trybie embedded z activeTab="surveys".
 * Widoczne: admin.
 */
import { AdminDashboard } from '@/app/components/AdminDashboard';

export function AdminSurveysPage() {
  return <AdminDashboard embeddedTab="surveys" embeddedDomain="hackathon" />;
}
