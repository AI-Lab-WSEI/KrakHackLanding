/**
 * /panel/admin/aplikacje — membership_applications CRUD + CompetencyCompass
 * Widoczne: admin, moderator. Komponent `AdminApplications` reużyty z `components/`.
 */
import { AdminApplications } from '@/app/components/AdminApplications';

export function AdminApplicationsPage() {
  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      <AdminApplications />
    </div>
  );
}
