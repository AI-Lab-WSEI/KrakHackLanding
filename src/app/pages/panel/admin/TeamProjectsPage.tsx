/**
 * /panel/admin/zespoly?edition=N — projekty zespołów per edycja.
 * Widoczne: admin. Edition z URL (sidebar picker).
 */
import { AdminTeamProjects } from '@/app/components/AdminTeamProjects';
import { useEdition } from './useEdition';

export function AdminTeamProjectsPage() {
  const edition = useEdition();
  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      <AdminTeamProjects key={edition} edition={edition} />
    </div>
  );
}
