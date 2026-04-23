/**
 * /panel/admin/sms — bulk SMS wysyłka do uczestników (SMSgate integration).
 * Reużywa AdminDashboard embedded mode z tabem 'sms'.
 */
import { AdminDashboard } from '@/app/components/AdminDashboard';

export function AdminSmsPage() {
  return <AdminDashboard embeddedTab="sms" embeddedDomain="hackathon" />;
}
