/**
 * useEdition — wspólny hook czytający aktualny edition number z URL search param.
 *
 * Edycja może być ustawiona w URL jako `?edition=N` przez ContextSwitcher /
 * sidebar Edition picker. Hook czyta z `useLocation().search` i waliduje jako
 * liczbę; fallback to CURRENT_EDITION_NUMBER z edition-registry.
 *
 * Użycie:
 *   const edition = useEdition();         // number
 *   <AdminGallery edition={edition} />
 */
import { useLocation } from 'react-router';
import { CURRENT_EDITION_NUMBER } from '@/data/edition-registry';

export function useEdition(): number {
  const { search } = useLocation();
  const raw = new URLSearchParams(search).get('edition');
  if (!raw) return CURRENT_EDITION_NUMBER;
  const n = parseInt(raw, 10);
  return Number.isNaN(n) || n <= 0 ? CURRENT_EDITION_NUMBER : n;
}
