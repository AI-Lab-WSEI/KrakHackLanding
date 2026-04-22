/**
 * EventsAdminPage — /panel/admin/wydarzenia
 * Admin management of events. Requires 'admin' role.
 *
 * Features:
 *  - Table of all events (all visibilities)
 *  - Inline visibility toggle (admin_only ↔ public)
 *  - Quick add form
 *  - Delete
 */
import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Event {
  id:          string;
  title:       string;
  eventType:   string;
  startsAt:    string | null;
  deadlineAt:  string | null;
  visibility:  string;
  organizer:   string | null;
  url:         string | null;
  isFeatured:  boolean;
}

const EVENT_TYPE_LABEL: Record<string, string> = {
  hackathon:   '🏆 Hackathon',
  workshop:    '🛠 Warsztaty',
  meetup:      '👥 Meetup',
  competition: '🥊 Konkurs',
  conference:  '🎤 Konferencja',
  other:       '📌 Inne',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pl-PL', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

function useEvents(token: string | null) {
  const [events, setEvents]   = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res  = await fetch('/api/events?all=1', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setEvents(
        (data.events ?? []).map((e: Record<string, unknown>) => ({
          id:         e.id,
          title:      e.title,
          eventType:  e.event_type ?? e.eventType,
          startsAt:   e.starts_at  ?? e.startsAt  ?? null,
          deadlineAt: e.deadline_at ?? e.deadlineAt ?? null,
          visibility: e.visibility,
          organizer:  e.organizer ?? null,
          url:        e.url ?? null,
          isFeatured: e.is_featured ?? e.isFeatured ?? false,
        }))
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  return { events, loading, error, reload: load };
}

// ─── Add Event Form ────────────────────────────────────────────────────────

function AddEventForm({ token, onAdded }: { token: string; onAdded: () => void }) {
  const blank = {
    title: '', eventType: 'hackathon', startsAt: '', deadlineAt: '',
    description: '', url: '', organizer: '', visibility: 'admin_only',
  };
  const [form, setForm]     = useState(blank);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  function set(field: string, val: string) {
    setForm(f => ({ ...f, [field]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title:       form.title.trim(),
          eventType:   form.eventType,
          startsAt:    form.startsAt   || null,
          deadlineAt:  form.deadlineAt || null,
          description: form.description.trim() || null,
          url:         form.url.trim()         || null,
          organizer:   form.organizer.trim()   || null,
          visibility:  form.visibility,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? 'Błąd serwera');
      }
      setForm(blank);
      onAdded();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const inputCls = 'bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 w-full';

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-700 rounded-xl p-5 flex flex-col gap-4">
      <h3 className="font-semibold text-sm">Dodaj wydarzenie</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2 flex flex-col gap-1">
          <label className="text-xs text-gray-400">Tytuł *</label>
          <input value={form.title} onChange={e => set('title', e.target.value)} required placeholder="Hackathon XYZ 2026" className={inputCls} />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400">Typ</label>
          <select value={form.eventType} onChange={e => set('eventType', e.target.value)} className={inputCls}>
            {Object.entries(EVENT_TYPE_LABEL).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400">Widoczność</label>
          <select value={form.visibility} onChange={e => set('visibility', e.target.value)} className={inputCls}>
            <option value="admin_only">admin_only</option>
            <option value="members_only">members_only</option>
            <option value="public">public</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400">Data rozpoczęcia</label>
          <input type="datetime-local" value={form.startsAt} onChange={e => set('startsAt', e.target.value)} className={inputCls} />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400">Deadline rejestracji</label>
          <input type="datetime-local" value={form.deadlineAt} onChange={e => set('deadlineAt', e.target.value)} className={inputCls} />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400">URL</label>
          <input value={form.url} onChange={e => set('url', e.target.value)} placeholder="https://…" className={inputCls} />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400">Organizator</label>
          <input value={form.organizer} onChange={e => set('organizer', e.target.value)} placeholder="AI Krak Hack" className={inputCls} />
        </div>

        <div className="sm:col-span-2 flex flex-col gap-1">
          <label className="text-xs text-gray-400">Opis (opcjonalnie)</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} className={`${inputCls} resize-none`} />
        </div>
      </div>

      {error && <p className="text-xs text-red-400 bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="self-end px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
      >
        {saving ? 'Dodawanie…' : '+ Dodaj'}
      </button>
    </form>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function EventsAdminPage() {
  const { user, token } = useAuth();
  const { events, loading, error, reload } = useEvents(token);
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  if (!user) return null;
  if (!user.keycloakRoles.includes('admin')) return <Navigate to="/panel" replace />;

  async function toggleVisibility(ev: Event) {
    if (!token || toggling) return;
    const next = ev.visibility === 'public' ? 'admin_only' : 'public';
    setToggling(ev.id);
    try {
      await fetch(`/api/events/${ev.id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ visibility: next }),
      });
      reload();
    } finally {
      setToggling(null);
    }
  }

  async function deleteEvent(id: string) {
    if (!token || !confirm('Usunąć wydarzenie?')) return;
    setDeleting(id);
    try {
      await fetch(`/api/events/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      reload();
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/panel/admin" className="text-gray-600 hover:text-gray-300 text-sm transition-colors">
          ← Admin
        </Link>
        <span className="text-gray-700">/</span>
        <h1 className="text-xl font-bold">Wydarzenia</h1>
        <span className="ml-auto text-xs text-gray-500">{events.length} wydarzeń</span>
      </div>

      {/* Add form */}
      {token && <AddEventForm token={token} onAdded={reload} />}

      {/* Table */}
      {loading ? (
        <p className="text-gray-500 text-sm py-8 text-center">Ładowanie…</p>
      ) : error ? (
        <p className="text-red-400 text-sm py-8 text-center">{error}</p>
      ) : events.length === 0 ? (
        <p className="text-gray-500 text-sm py-8 text-center">Brak wydarzeń</p>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-xs text-gray-500">
                <th className="text-left px-4 py-3 font-medium">Tytuł</th>
                <th className="text-left px-4 py-3 font-medium">Typ</th>
                <th className="text-left px-4 py-3 font-medium">Start</th>
                <th className="text-left px-4 py-3 font-medium">Widoczność</th>
                <th className="text-right px-4 py-3 font-medium">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev, i) => (
                <tr
                  key={ev.id}
                  className={`border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors
                    ${i === events.length - 1 ? 'border-b-0' : ''}`}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-white line-clamp-1">{ev.title}</p>
                    {ev.organizer && <p className="text-xs text-gray-500">{ev.organizer}</p>}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {EVENT_TYPE_LABEL[ev.eventType] ?? ev.eventType}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {fmtDate(ev.startsAt)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleVisibility(ev)}
                      disabled={toggling === ev.id}
                      className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
                        ev.visibility === 'public'
                          ? 'bg-green-900/40 text-green-400 hover:bg-green-900/60'
                          : ev.visibility === 'members_only'
                            ? 'bg-blue-900/40 text-blue-400 hover:bg-blue-900/60'
                            : 'bg-gray-800 text-gray-500 hover:bg-gray-700'
                      } disabled:opacity-50`}
                    >
                      {ev.visibility}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {ev.url && (
                        <a
                          href={ev.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-indigo-400 hover:text-indigo-300"
                        >
                          Link ↗
                        </a>
                      )}
                      <button
                        onClick={() => deleteEvent(ev.id)}
                        disabled={deleting === ev.id}
                        className="text-xs text-red-500 hover:text-red-400 transition-colors disabled:opacity-50"
                      >
                        {deleting === ev.id ? '…' : 'Usuń'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
