/**
 * EventsPage — /wydarzenia
 *
 * Publiczny kalendarz konkursów, konferencji i warsztatów.
 * Wyświetla eventy z visibility='public' lub 'members_only' (dla zalogowanych).
 */
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface Event {
  id: string;
  title: string;
  description: string | null;
  eventType: string | null;
  startsAt: string;
  endsAt: string | null;
  deadlineAt: string | null;
  location: string | null;
  url: string | null;
  organizer: string | null;
  isFeatured: boolean;
  tags: string[];
  visibility: string;
}

const TYPE_LABEL: Record<string, string> = {
  hackathon:   '🏆 Hackathon',
  conference:  '🎤 Konferencja',
  competition: '🥊 Konkurs',
  workshop:    '🛠 Warsztat',
  deadline:    '⏰ Deadline',
  other:       '📌 Inne',
};

const TYPE_COLOR: Record<string, string> = {
  hackathon:   'bg-indigo-900/40 text-indigo-300 border-indigo-800/40',
  conference:  'bg-blue-900/30 text-blue-300 border-blue-800/40',
  competition: 'bg-orange-900/30 text-orange-300 border-orange-800/40',
  workshop:    'bg-teal-900/30 text-teal-300 border-teal-800/40',
  deadline:    'bg-red-900/30 text-red-300 border-red-800/40',
  other:       'bg-gray-800/60 text-gray-400 border-gray-700/40',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pl-PL', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export function EventsPage() {
  const { user } = useAuth();
  const [events,  setEvents]  = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState<string>('all');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/public/events');
        const data = await res.json();
        setEvents(data.events ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const now = new Date();
  const upcoming = events.filter(e => new Date(e.startsAt) >= now);
  const past     = events.filter(e => new Date(e.startsAt) < now);

  const visible = events.filter(e => {
    if (e.visibility === 'members_only' && !user) return false;
    if (filter !== 'all' && e.eventType !== filter) return false;
    return true;
  });

  const types = [...new Set(events.map(e => e.eventType).filter(Boolean))];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Kalendarz wydarzeń</h1>
        <p className="text-gray-400 mt-2">
          Konkursy AI, hackathony, warsztaty i konferencje
        </p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {['all', ...types].map(t => (
          <button
            key={t ?? 'all'}
            onClick={() => setFilter(t ?? 'all')}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors
              ${filter === t
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'}`}
          >
            {t === 'all' ? '🗓 Wszystkie' : (TYPE_LABEL[t ?? ''] ?? t)}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm text-center py-12">Ładowanie…</p>
      ) : visible.length === 0 ? (
        <div className="text-center py-16 flex flex-col gap-3 items-center">
          <span className="text-4xl">📭</span>
          <p className="text-gray-400">Brak nadchodzących wydarzeń.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {visible
            .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
            .map(event => {
              const days = daysUntil(event.deadlineAt ?? event.startsAt);
              const isPast = new Date(event.startsAt) < now;
              const typeKey = event.eventType ?? 'other';

              return (
                <div
                  key={event.id}
                  className={`bg-gray-900 border rounded-2xl p-5 flex flex-col gap-3
                    ${event.isFeatured ? 'border-indigo-700/50' : 'border-gray-800'}
                    ${isPast ? 'opacity-60' : ''}`}
                >
                  {/* Type + featured */}
                  <div className="flex items-center gap-2">
                    <span className={`text-xs border px-2.5 py-0.5 rounded-full ${TYPE_COLOR[typeKey] ?? TYPE_COLOR.other}`}>
                      {TYPE_LABEL[typeKey] ?? typeKey}
                    </span>
                    {event.isFeatured && (
                      <span className="text-xs text-yellow-400">⭐ Wyróżnione</span>
                    )}
                    {!isPast && days <= 7 && days >= 0 && (
                      <span className="text-xs text-red-400 font-medium">
                        {days === 0 ? '⚡ Dziś!' : `⚡ Za ${days} ${days === 1 ? 'dzień' : 'dni'}`}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <div>
                    <h3 className="font-semibold text-base">{event.title}</h3>
                    {event.organizer && (
                      <p className="text-xs text-gray-500 mt-0.5">{event.organizer}</p>
                    )}
                  </div>

                  {/* Description */}
                  {event.description && (
                    <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">
                      {event.description}
                    </p>
                  )}

                  {/* Meta */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                    <span>📅 {formatDate(event.startsAt)}</span>
                    {event.deadlineAt && (
                      <span>⏰ Deadline: {formatDate(event.deadlineAt)}</span>
                    )}
                    {event.location && (
                      <span>📍 {event.location}</span>
                    )}
                  </div>

                  {/* Tags */}
                  {event.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {event.tags.map(tag => (
                        <span key={tag} className="text-xs text-gray-600 border border-gray-800 px-2 py-0.5 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* CTA */}
                  {event.url && !isPast && (
                    <div>
                      <a
                        href={event.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs bg-indigo-900/40 hover:bg-indigo-900/70 border border-indigo-800/50 text-indigo-300 px-4 py-2 rounded-lg transition-colors"
                      >
                        Dowiedz się więcej ↗
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
