/**
 * /panel/admin/wyniki?edition=N — wyniki jury + edition config per edycja.
 * Widoczne: admin. Edition z URL (sidebar picker).
 */
import { AdminResults } from '@/app/components/AdminResults';
import { useEdition } from './useEdition';

export function AdminResultsPage() {
  const edition = useEdition();
  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      <AdminResults key={edition} edition={edition} />
    </div>
  );
}
