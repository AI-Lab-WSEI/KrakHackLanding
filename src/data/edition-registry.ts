export interface EditionMeta {
  number: number;
  year: string;
  status: 'active' | 'archive' | 'placeholder';
  hasTeams: boolean;
  hasResults: boolean;
}

export const EDITIONS_META: EditionMeta[] = [
  { number: 1, year: '2024', status: 'placeholder', hasTeams: false, hasResults: false },
  { number: 2, year: '2025', status: 'archive', hasTeams: false, hasResults: false },
  { number: 3, year: '2026', status: 'active', hasTeams: true, hasResults: true },
];

export const CURRENT_EDITION_NUMBER = 3;

export function getEditionByNumber(num: number): EditionMeta | undefined {
  return EDITIONS_META.find((e) => e.number === num);
}

export function getEditionByYear(year: string): EditionMeta | undefined {
  return EDITIONS_META.find((e) => e.year === year);
}

export function getCurrentEdition(): EditionMeta {
  return EDITIONS_META.find((e) => e.number === CURRENT_EDITION_NUMBER)!;
}

/**
 * Accepts either edition number ('3') or year ('2026').
 * Returns { meta, isYearInput } so callers can redirect year→number.
 */
export function resolveEditionParam(param: string): { meta: EditionMeta; isYearInput: boolean } | null {
  const asNumber = parseInt(param, 10);

  // Try as edition number first (1-99 range)
  if (asNumber > 0 && asNumber < 100) {
    const meta = getEditionByNumber(asNumber);
    if (meta) return { meta, isYearInput: false };
  }

  // Try as year (2024+)
  const meta = getEditionByYear(param);
  if (meta) return { meta, isYearInput: true };

  return null;
}

/** All editions that should show in the UI (non-placeholder). */
export function getVisibleEditions(): EditionMeta[] {
  return EDITIONS_META.filter((e) => e.status !== 'placeholder');
}
