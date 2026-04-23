/**
 * /panel/admin/krakhack/dashboard — stats + challenge resource links per edycja.
 * Reużywa AdminDashboard embedded mode z tabem 'regs' (oryginalny dashboard
 * starego admina ze statistykami rejestracji + challenge resource config).
 */
import { AdminDashboard } from '@/app/components/AdminDashboard';

export function KrakHackDashboardPage() {
  return <AdminDashboard embeddedTab="regs" embeddedDomain="hackathon" />;
}
