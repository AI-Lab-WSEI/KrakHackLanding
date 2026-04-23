/**
 * /panel/admin/wyniki — jury scores + edition config (kategorie, jury list, status)
 * Widoczne: admin. Komponent `AdminResults` reużyty z `components/`.
 */
import { AdminResults } from '@/app/components/AdminResults';

export function AdminResultsPage() {
  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      <AdminResults />
    </div>
  );
}
