/**
 * /panel/admin/certyfikaty — CRUD certyfikatów, QR, issue/approve/revoke/reissue
 * Widoczne: admin. Komponent `AdminCertificates` reużyty z `components/`.
 */
import { AdminCertificates } from '@/app/components/AdminCertificates';

export function AdminCertificatesPage() {
  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      <AdminCertificates />
    </div>
  );
}
