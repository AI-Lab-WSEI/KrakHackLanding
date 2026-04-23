/**
 * /panel/admin/zespoly — projekty zespołów + edit-tokens + bulk email
 * Widoczne: admin. Komponent `AdminTeamProjects` reużyty z `components/`.
 */
import { AdminTeamProjects } from '@/app/components/AdminTeamProjects';

export function AdminTeamProjectsPage() {
  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      <AdminTeamProjects />
    </div>
  );
}
