/**
 * CalendarMini — mini wersja kalendarza (agenda list, nie month grid).
 * Do embedu w profilach uczestników, kartach projektów, sidebarach.
 *
 * Domyślnie pokazuje 5 najbliższych wydarzeń publicznych.
 */
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { getCategoryMeta } from './categories';
import { useCalendar } from './useCalendar';

interface Props {
  /** Ile wydarzeń pokazać (default 5). */
  limit?: number;
  /** Tytuł mini-widoku (default 'Nadchodzące wydarzenia'). */
  title?: string;
  /** Link "zobacz wszystkie" — default /demo#calendar, można zmienić. */
  seeAllHref?: string;
}

export function CalendarMini({ limit = 5, title = 'Nadchodzące wydarzenia', seeAllHref = '/demo#calendar' }: Props) {
  const from = new Date();
  const to   = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
  const { entries, loading } = useCalendar({ from, to });
  const visible = entries.slice(0, limit);

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-white">{title}</h3>
        <Link
          to={seeAllHref}
          className="text-[11px] text-gray-400 hover:text-white transition-colors flex items-center gap-1"
        >
          Wszystkie
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {loading && visible.length === 0 ? (
        <p className="text-xs text-gray-500 py-4 text-center">Ładowanie…</p>
      ) : visible.length === 0 ? (
        <p className="text-xs text-gray-500 py-4 text-center">Brak nadchodzących wydarzeń</p>
      ) : (
        <ul className="space-y-1.5">
          {visible.map(e => {
            const meta = getCategoryMeta(e.category);
            const Icon = meta.icon;
            const d    = new Date(e.startsAt);
            return (
              <li key={e.id} className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-white/5 transition-colors">
                <div className="shrink-0 w-10 text-center">
                  <p className="text-[10px] text-gray-500 uppercase">
                    {d.toLocaleDateString('pl-PL', { month: 'short' })}
                  </p>
                  <p className="text-lg font-bold text-white tabular-nums leading-none">
                    {d.getUTCDate()}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Icon className={`w-3 h-3 ${meta.text} shrink-0`} />
                    <span className="text-xs text-white font-medium truncate">{e.title}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 truncate">
                    {e.allDay
                      ? 'Cały dzień'
                      : d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                    {e.location ? ` · ${e.location}` : ''}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
