/**
 * /panel/admin/wspolprace — CRUD partnerów/kolaboracji
 * Widoczne: admin. Komponent `AdminCollaborations` reużyty z `components/`.
 */
import { AdminCollaborations } from '@/app/components/AdminCollaborations';

export function AdminCollaborationsPage() {
  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      <AdminCollaborations />
    </div>
  );
}
