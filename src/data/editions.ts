import { Edition } from '@/types/edition';
import { edition2025 } from './editions/edition-2025/edition';
import { edition2026 } from './editions/edition-2026/edition';

export const editions: Record<string, Edition> = {
  '2025': edition2025,
  '2026': edition2026,
};
