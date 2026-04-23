/**
 * /panel/admin/galeria — Cloudinary photos management (starred, visible, hidden)
 * Widoczne: admin. Komponent `AdminGallery` reużyty z `components/`.
 */
import { AdminGallery } from '@/app/components/AdminGallery';

export function AdminGalleryPage() {
  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      <AdminGallery />
    </div>
  );
}
