/**
 * useCalendar — fetch calendar entries z backendu + filter + group-by-day.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CalendarCategory } from './categories';

export interface CalendarEntry {
  id:               string;
  title:            string;
  description:      string | null;
  category:         CalendarCategory;
  startsAt:         string;
  endsAt:           string | null;
  allDay:           boolean;
  location:         string | null;
  url:              string | null;
  linkedProjectId:  string | null;
  linkedEventId:    string | null;
  linkedUpdateId:   string | null;
  visibility:       'public' | 'members_only' | 'admin_only';
  colorHex:         string | null;
}

interface UseCalendarOptions {
  from?:        Date;
  to?:          Date;
  categories?:  CalendarCategory[];
  /** Jeśli true — próbuje dodać Bearer token (gdy user zalogowany). */
  includeMembersOnly?: boolean;
}

export function useCalendar(opts: UseCalendarOptions = {}) {
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const fromISO = opts.from ? opts.from.toISOString() : '';
  const toISO   = opts.to   ? opts.to.toISOString()   : '';
  const catsKey = (opts.categories ?? []).slice().sort().join(',');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (fromISO) params.set('from', fromISO);
      if (toISO)   params.set('to',   toISO);
      if (catsKey) params.set('categories', catsKey);

      const headers: Record<string, string> = {};
      if (opts.includeMembersOnly && typeof window !== 'undefined') {
        const token = sessionStorage.getItem('kc_access_token');
        if (token) headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(`/api/calendar?${params.toString()}`, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setEntries(data.entries ?? []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [fromISO, toISO, catsKey, opts.includeMembersOnly]);

  useEffect(() => { load(); }, [load]);

  /** Mapa "YYYY-MM-DD" → CalendarEntry[] dla szybkiego lookupu w siatce miesiąca. */
  const byDay = useMemo(() => {
    const m = new Map<string, CalendarEntry[]>();
    for (const e of entries) {
      const key = e.startsAt.slice(0, 10); // 'YYYY-MM-DD'
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(e);
    }
    return m;
  }, [entries]);

  return { entries, byDay, loading, error, reload: load };
}
