/**
 * CalendarMonth — duży widok miesięczny kalendarza z kolorowymi kropkami.
 *
 * Features:
 *   • Nawigacja miesiąc←→
 *   • Sobota/niedziela wyróżnione
 *   • "Dziś" podkreślone
 *   • Kropki kategorii per dzień (max 4 widoczne, reszta '+N')
 *   • Hover na dniu → popover z listą eventów
 *   • Klik na eventcie → opcjonalny callback lub link
 *   • Filtry kategorii (pill checkboxes)
 *   • Export iCal + link Google Calendar subscribe
 */
import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Filter } from 'lucide-react';
import { CATEGORY_META, ALL_CATEGORIES, getCategoryMeta, type CalendarCategory } from './categories';
import { useCalendar, type CalendarEntry } from './useCalendar';

interface Props {
  /** Czy fetchować members-only entries (jeśli user zalogowany). Default: false. */
  includeMembersOnly?: boolean;
  /** Callback przy kliknięciu w event; jeśli brak — otwiera url / scroll do szczegółów. */
  onEventClick?: (entry: CalendarEntry) => void;
  /** Compact = mniejsze komórki dni (do embedu na stronie). */
  compact?: boolean;
}

const WEEKDAYS_PL = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'];

/**
 * Pierwszy poniedziałek <= 1st of month (żeby grid zaczynał się od pn).
 * Zwraca start of week (00:00:00).
 */
function firstMondayOfMonth(year: number, month: number): Date {
  const first = new Date(Date.UTC(year, month, 1));
  // ISO weekday: 1=Mon, 7=Sun
  const dayOfWeek = first.getUTCDay() === 0 ? 7 : first.getUTCDay();
  const offset = dayOfWeek - 1;
  first.setUTCDate(first.getUTCDate() - offset);
  return first;
}

function formatMonthYear(d: Date) {
  return d.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });
}

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function CalendarMonth({ includeMembersOnly = false, onEventClick, compact = false }: Props) {
  const [cursor, setCursor] = useState(() => {
    const n = new Date();
    return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), 1));
  });
  const [activeCats, setActiveCats] = useState<Set<CalendarCategory>>(new Set(ALL_CATEGORIES));
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  const firstDay = useMemo(() => firstMondayOfMonth(cursor.getUTCFullYear(), cursor.getUTCMonth()), [cursor]);
  const days     = useMemo(() => {
    const arr: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(firstDay);
      d.setUTCDate(d.getUTCDate() + i);
      arr.push(d);
    }
    return arr;
  }, [firstDay]);

  const rangeFrom = firstDay;
  const rangeTo   = useMemo(() => {
    const d = new Date(firstDay);
    d.setUTCDate(d.getUTCDate() + 42);
    return d;
  }, [firstDay]);

  const { entries, byDay, loading, error } = useCalendar({
    from:               rangeFrom,
    to:                 rangeTo,
    includeMembersOnly,
  });

  // Filter entries po aktywnych kategoriach
  const filteredByDay = useMemo(() => {
    const m = new Map<string, CalendarEntry[]>();
    for (const [day, list] of byDay.entries()) {
      const filtered = list.filter(e => activeCats.has(e.category));
      if (filtered.length > 0) m.set(day, filtered);
    }
    return m;
  }, [byDay, activeCats]);

  const todayKey = dayKey(new Date());
  const hoveredEntries = hoveredDay ? filteredByDay.get(hoveredDay) ?? [] : [];

  function toggleCat(c: CalendarCategory) {
    setActiveCats(prev => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c); else next.add(c);
      return next;
    });
  }

  function shiftMonth(delta: number) {
    setCursor(c => new Date(Date.UTC(c.getUTCFullYear(), c.getUTCMonth() + delta, 1)));
  }

  const cellH = compact ? 'h-14' : 'h-24';

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => shiftMonth(-1)}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Poprzedni miesiąc"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h2 className="text-lg font-semibold text-white min-w-[180px] text-center capitalize">
            {formatMonthYear(cursor)}
          </h2>
          <button
            onClick={() => shiftMonth(1)}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Następny miesiąc"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCursor(() => {
              const n = new Date();
              return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), 1));
            })}
            className="ml-2 text-xs text-gray-500 hover:text-white transition-colors"
          >
            Dziś
          </button>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/calendar.ics"
            download
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors px-3 py-1.5 border border-white/10 rounded-lg hover:bg-white/5"
            title="Pobierz jako plik iCal (.ics) — zaimportuj do Google/Apple Calendar"
          >
            <Download className="w-3.5 h-3.5" />
            Eksport iCal
          </a>
        </div>
      </div>

      {/* Filtry kategorii */}
      {!compact && (
        <div className="flex items-center gap-2 flex-wrap mb-4 pb-4 border-b border-white/10">
          <Filter className="w-3.5 h-3.5 text-gray-500 shrink-0" />
          {ALL_CATEGORIES.map(c => {
            const meta   = CATEGORY_META[c];
            const active = activeCats.has(c);
            const Icon   = meta.icon;
            return (
              <button
                key={c}
                onClick={() => toggleCat(c)}
                className={`flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-full border transition-colors ${
                  active
                    ? `${meta.text} ${meta.border} bg-white/5`
                    : 'text-gray-600 border-white/10 hover:text-gray-400'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${active ? meta.dot : 'bg-gray-700'}`} />
                <Icon className="w-3 h-3" />
                {meta.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS_PL.map((w, i) => (
          <div
            key={w}
            className={`text-[10px] uppercase tracking-widest text-center py-1 ${
              i >= 5 ? 'text-gray-600' : 'text-gray-500'
            }`}
          >
            {w}
          </div>
        ))}
      </div>

      {/* Grid dni */}
      <div className="grid grid-cols-7 gap-1 relative">
        {days.map(d => {
          const key        = dayKey(d);
          const isCurMonth = d.getUTCMonth() === cursor.getUTCMonth();
          const isToday    = key === todayKey;
          const isWeekend  = d.getUTCDay() === 0 || d.getUTCDay() === 6;
          const dayEntries = filteredByDay.get(key) ?? [];
          const dotsVisible = dayEntries.slice(0, 4);
          const moreCount   = dayEntries.length - dotsVisible.length;

          return (
            <div
              key={key}
              onMouseEnter={() => setHoveredDay(key)}
              onMouseLeave={() => setHoveredDay(null)}
              className={`${cellH} rounded-lg border relative p-1.5 transition-colors ${
                isCurMonth
                  ? 'bg-white/[0.03] border-white/10'
                  : 'bg-transparent border-white/[0.04]'
              } ${isToday ? '!border-indigo-500/60 bg-indigo-500/5' : ''} ${
                dayEntries.length > 0 ? 'hover:bg-white/[0.08]' : ''
              }`}
            >
              <div className={`text-xs ${isCurMonth ? (isWeekend ? 'text-gray-500' : 'text-gray-300') : 'text-gray-700'} ${isToday ? '!text-indigo-300 font-bold' : ''}`}>
                {d.getUTCDate()}
              </div>

              {/* Kropki kategorii */}
              {dotsVisible.length > 0 && (
                <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center gap-1 flex-wrap">
                  {dotsVisible.map(e => (
                    <span
                      key={e.id}
                      className={`w-1.5 h-1.5 rounded-full ${getCategoryMeta(e.category).dot}`}
                      style={e.colorHex ? { backgroundColor: e.colorHex } : undefined}
                    />
                  ))}
                  {moreCount > 0 && (
                    <span className="text-[9px] text-gray-500 ml-0.5">+{moreCount}</span>
                  )}
                </div>
              )}

              {/* Popover z listą */}
              {hoveredDay === key && dayEntries.length > 0 && !compact && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-gray-950 border border-white/20 rounded-xl p-3 shadow-2xl min-w-[240px] text-left pointer-events-auto"
                  onMouseEnter={() => setHoveredDay(key)}
                >
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">
                    {d.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                  <ul className="space-y-1.5">
                    {dayEntries.map(e => {
                      const meta = getCategoryMeta(e.category);
                      const Icon = meta.icon;
                      return (
                        <li key={e.id}>
                          <button
                            onClick={() => onEventClick?.(e)}
                            className="w-full text-left flex items-start gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors"
                          >
                            <span className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${meta.dot}`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <Icon className={`w-3 h-3 ${meta.text} shrink-0`} />
                                <span className="text-xs text-white font-medium truncate">{e.title}</span>
                              </div>
                              <div className="text-[10px] text-gray-500 mt-0.5">
                                {e.allDay
                                  ? 'Cały dzień'
                                  : new Date(e.startsAt).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                                {e.location ? ` · ${e.location}` : ''}
                              </div>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Status */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10 text-[10px] text-gray-500">
        <span>{entries.length} wydarzeń w widoku</span>
        {loading && <span>Ładowanie…</span>}
        {error   && <span className="text-red-400">{error}</span>}
      </div>
    </div>
  );
}
