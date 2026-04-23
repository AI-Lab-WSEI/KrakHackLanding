/**
 * /panel/admin/galeria?edition=N — Cloudinary photos management per edycja.
 * Widoczne: admin. Edition z URL (propagowane przez sidebar edition picker).
 */
import { AdminGallery } from '@/app/components/AdminGallery';
import { useEdition } from './useEdition';

export function AdminGalleryPage() {
  const edition = useEdition();
  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      <AdminGallery edition={edition} />
    </div>
  );
}
