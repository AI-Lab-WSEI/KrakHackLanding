/**
 * /panel/admin/organizacja — ustawienia organizacji (LinkedIn, kontakt, URLs)
 * Widoczne: admin. Komponent `AdminOrgSettings` reużyty z `components/`.
 */
import { AdminOrgSettings } from '@/app/components/AdminOrgSettings';

export function AdminOrgSettingsPage() {
  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      <AdminOrgSettings />
    </div>
  );
}
