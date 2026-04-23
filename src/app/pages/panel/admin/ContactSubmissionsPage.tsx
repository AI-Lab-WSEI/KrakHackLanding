/**
 * /panel/admin/zapytania — zapytania z formularza kontaktowego (contact form)
 * Widoczne: admin. Komponent `AdminContactSubmissions` reużyty z `components/`.
 */
import { AdminContactSubmissions } from '@/app/components/AdminContactSubmissions';

export function AdminContactSubmissionsPage() {
  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      <AdminContactSubmissions />
    </div>
  );
}
