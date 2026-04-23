/**
 * /panel/admin/kalendarz — admin CRUD calendar_entries.
 *
 * Admin dodaje spotkania koła, deadline'y hackathonu, warsztaty, wydarzenia
 * wewnętrzne itp. Entries pojawiają się w:
 *   • publicznym kalendarzu (/wydarzenia) — gdy visibility=public
 *   • panelu uczestnika (CalendarMini) — gdy members_only (wymaga loginu)
 *   • tylko admin view — gdy admin_only
 *
 * Obok public events (z tabeli events) + project milestones (z project_updates)
 * — wszystkie trzy źródła agreguje GET /api/calendar.
 */
import { useEffect, useState } from 'react';
import { Plus, Calendar, Edit3, Trash2, ExternalLink, MapPin, Clock, X, Save, Loader2 } from 'lucide-react';
import { adminFetch } from '@/lib/adminApi';
import { PanelSectionHeader } from '@/app/components/panel/shared/PanelSectionHeader';
import { PanelCard } from '@/app/components/panel/shared/PanelCard';
import { InfoBar } from '@/app/components/panel/shared/InfoBar';
import { CATEGORY_META, ALL_CATEGORIES, type CalendarCategory } from '@/app/components/calendar/categories';

type Visibility = 'public' | 'members_only' | 'admin_only';

interface CalendarEntry {
  id:              string;
  title:           string;
  description:     string | null;
  category:        string;
  startsAt:        string;
  endsAt:          string | null;
  allDay:          boolean;
  location:        string | null;
  url:             string | null;
  visibility:      Visibility;
  colorHex:        string | null;
  linkedProjectId: string | null;
  linkedEventId:   string | null;
  createdAt:       string;
  updatedAt:       string;
}

const VISIBILITY_OPTIONS: { value: Visibility; label: string; hint: string }[] = [
  { value: 'public',       label: 'Publiczne',      hint: 'Wszyscy (strona /wydarzenia + panel uczestnika)' },
  { value: 'members_only', label: 'Tylko członkowie', hint: 'Widoczne po zalogowaniu (panel, ukryte publicznie)' },
  { value: 'admin_only',   label: 'Tylko admin',    hint: 'Notatka wewnętrzna — widać tylko tutaj' },
];

export function AdminCalendarPage() {
  const [entries, setEntries]   = useState<CalendarEntry[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [editing, setEditing]   = useState<CalendarEntry | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [filterCat, setFilterCat] = useState<string>('all');
  const [filterVis, setFilterVis] = useState<string>('all');

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res  = await adminFetch('/api/admin/calendar');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setEntries(data.entries ?? []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(entry: CalendarEntry) {
    if (!confirm(`Usunąć wpis "${entry.title}"?\n\nTej operacji nie można cofnąć.`)) return;
    try {
      const res = await adminFetch(`/api/admin/calendar/${entry.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        alert(d.error ?? `HTTP ${res.status}`);
        return;
      }
      load();
    } catch (e) {
      alert((e as Error).message);
    }
  }

  const filtered = entries.filter(e => {
    if (filterCat !== 'all' && e.category !== filterCat) return false;
    if (filterVis !== 'all' && e.visibility !== filterVis) return false;
    return true;
  });

  // Podział na nadchodzące + przeszłe
  const now = Date.now();
  const upcoming = filtered.filter(e => new Date(e.startsAt).getTime() >= now);
  const past     = filtered.filter(e => new Date(e.startsAt).getTime() < now);

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto">
      <PanelSectionHeader
        eyebrow="System · Kalendarz"
        title="Kalendarz koła + hackathonu"
        subtitle="Spotkania, deadline'y, warsztaty. Publiczne wpisy pojawiają się na /wydarzenia oraz w panelu uczestnika."
        cta={
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Dodaj wpis
          </button>
        }
      />

      <InfoBar
        tone="info"
        title="Jak to działa"
        description={<>Kalendarz agreguje 3 źródła: wpisy z tej strony, publiczne wydarzenia (z <code>events</code>) oraz milestones projektów (<code>project_updates</code>). Tylko wpisy stąd można edytować ręcznie. <code>.ics</code> export: <a href="/api/calendar.ics" className="underline">/api/calendar.ics</a>.</>}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4 mt-4">
        <select
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 [&>option]:bg-gray-900"
        >
          <option value="all">Wszystkie kategorie</option>
          {ALL_CATEGORIES.map(c => (
            <option key={c} value={c}>{CATEGORY_META[c].label}</option>
          ))}
        </select>
        <select
          value={filterVis}
          onChange={e => setFilterVis(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 [&>option]:bg-gray-900"
        >
          <option value="all">Wszystkie widoczności</option>
          {VISIBILITY_OPTIONS.map(v => (
            <option key={v.value} value={v.value}>{v.label}</option>
          ))}
        </select>
        <span className="ml-auto text-xs text-gray-500 self-center">
          {filtered.length} / {entries.length}
        </span>
      </div>

      {error && (
        <PanelCard padding="md" className="!bg-red-500/10 !border-red-500/30 mb-4">
          <p className="text-sm text-red-300">{error}</p>
        </PanelCard>
      )}

      {loading ? (
        <PanelCard padding="lg" className="text-center text-sm text-gray-400">Ładowanie…</PanelCard>
      ) : (
        <div className="space-y-6">
          {upcoming.length > 0 && (
            <section>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Nadchodzące ({upcoming.length})
              </h3>
              <div className="space-y-2">
                {upcoming.map(e => (
                  <EntryRow
                    key={e.id}
                    entry={e}
                    onEdit={() => setEditing(e)}
                    onDelete={() => handleDelete(e)}
                  />
                ))}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Przeszłe ({past.length})
              </h3>
              <div className="space-y-2 opacity-60">
                {past.slice(0, 20).map(e => (
                  <EntryRow
                    key={e.id}
                    entry={e}
                    onEdit={() => setEditing(e)}
                    onDelete={() => handleDelete(e)}
                  />
                ))}
                {past.length > 20 && (
                  <p className="text-center text-[11px] text-gray-600 py-2">
                    (pokazuję 20 najnowszych z {past.length} przeszłych)
                  </p>
                )}
              </div>
            </section>
          )}

          {filtered.length === 0 && (
            <PanelCard padding="lg" className="text-center text-sm text-gray-500">
              Brak wpisów. Kliknij "Dodaj wpis" powyżej.
            </PanelCard>
          )}
        </div>
      )}

      {(showCreate || editing) && (
        <EntryModal
          initial={editing}
          onClose={() => { setShowCreate(false); setEditing(null); }}
          onSaved={() => { setShowCreate(false); setEditing(null); load(); }}
        />
      )}
    </div>
  );
}

// ─── Row ─────────────────────────────────────────────────────────────────────

function EntryRow({
  entry, onEdit, onDelete,
}: {
  entry:    CalendarEntry;
  onEdit:   () => void;
  onDelete: () => void;
}) {
  const meta = CATEGORY_META[(entry.category as CalendarCategory)] ?? CATEGORY_META.other;
  const Icon = meta.icon;
  const date = new Date(entry.startsAt);
  const dateStr = date.toLocaleDateString('pl-PL', { weekday: 'short', day: 'numeric', month: 'long' });
  const timeStr = entry.allDay ? 'cały dzień' : date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  const visBadge: Record<Visibility, { label: string; cls: string }> = {
    public:       { label: 'Publiczne',      cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
    members_only: { label: 'Dla członków',   cls: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' },
    admin_only:   { label: 'Tylko admin',    cls: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
  };
  const vb = visBadge[entry.visibility];

  return (
    <PanelCard padding="md" className="hover:bg-white/5 transition-colors">
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${meta.border} ${meta.dot}/20`}>
          <Icon className={`w-4 h-4 ${meta.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="text-sm font-medium text-white truncate">{entry.title}</h4>
            <span className={`text-[10px] uppercase tracking-widest border px-2 py-0.5 rounded-full shrink-0 ${vb.cls}`}>
              {vb.label}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-gray-500 flex-wrap">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{dateStr}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeStr}</span>
            {entry.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{entry.location}</span>}
            {entry.url && (
              <a href={entry.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300">
                <ExternalLink className="w-3 h-3" /> link
              </a>
            )}
            <span className={`ml-auto ${meta.text}`}>{meta.label}</span>
          </div>
          {entry.description && (
            <p className="text-xs text-gray-400 mt-1.5 line-clamp-2">{entry.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Edytuj"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-md text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Usuń"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </PanelCard>
  );
}

// ─── Modal ───────────────────────────────────────────────────────────────────

function EntryModal({
  initial, onClose, onSaved,
}: {
  initial: CalendarEntry | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!initial;
  const [form, setForm] = useState({
    title:       initial?.title       ?? '',
    description: initial?.description ?? '',
    category:    (initial?.category as CalendarCategory) ?? 'meeting' as CalendarCategory,
    startsAt:    initial ? toLocalInput(initial.startsAt) : '',
    endsAt:      initial?.endsAt ? toLocalInput(initial.endsAt) : '',
    allDay:      initial?.allDay   ?? false,
    location:    initial?.location ?? '',
    url:         initial?.url      ?? '',
    visibility:  initial?.visibility ?? 'public' as Visibility,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  function update<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    if (!form.title.trim() || !form.category || !form.startsAt) {
      setError('Tytuł, kategoria i data rozpoczęcia są wymagane.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const body = {
        title:       form.title.trim(),
        description: form.description.trim() || null,
        category:    form.category,
        startsAt:    new Date(form.startsAt).toISOString(),
        endsAt:      form.endsAt ? new Date(form.endsAt).toISOString() : null,
        allDay:      form.allDay,
        location:    form.location.trim() || null,
        url:         form.url.trim() || null,
        visibility:  form.visibility,
      };
      const path = isEdit ? `/api/admin/calendar/${initial!.id}` : '/api/admin/calendar';
      const method = isEdit ? 'PATCH' : 'POST';
      const res = await adminFetch(path, {
        method,
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? `HTTP ${res.status}`);
      }
      onSaved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/30';

  return (
    <div className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gray-950 border border-white/10 rounded-2xl w-full max-w-2xl my-8 flex flex-col max-h-[calc(100vh-4rem)]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">
            {isEdit ? 'Edytuj wpis' : 'Nowy wpis kalendarza'}
          </h3>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4" id="cal-entry-form">
          <Field label="Tytuł *">
            <input
              value={form.title}
              onChange={e => update('title', e.target.value)}
              placeholder="np. Spotkanie koła — AI w medycynie"
              className={inputCls}
              required
            />
          </Field>

          <Field label="Opis" hint="Markdown: **bold**, *italic*, linki. Pokazywany w szczegółach wydarzenia.">
            <textarea
              value={form.description}
              onChange={e => update('description', e.target.value)}
              rows={3}
              placeholder="Agenda, prowadzący, co zabrać ze sobą…"
              className={`${inputCls} resize-none`}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Kategoria *">
              <select
                value={form.category}
                onChange={e => update('category', e.target.value as CalendarCategory)}
                className={`${inputCls} [&>option]:bg-gray-900`}
                required
              >
                {ALL_CATEGORIES.map(c => (
                  <option key={c} value={c}>{CATEGORY_META[c].label}</option>
                ))}
              </select>
            </Field>
            <Field label="Widoczność">
              <select
                value={form.visibility}
                onChange={e => update('visibility', e.target.value as Visibility)}
                className={`${inputCls} [&>option]:bg-gray-900`}
              >
                {VISIBILITY_OPTIONS.map(v => (
                  <option key={v.value} value={v.value}>{v.label}</option>
                ))}
              </select>
              <span className="text-[10px] text-gray-600 block mt-1">
                {VISIBILITY_OPTIONS.find(v => v.value === form.visibility)?.hint}
              </span>
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Start *">
              <input
                type="datetime-local"
                value={form.startsAt}
                onChange={e => update('startsAt', e.target.value)}
                className={inputCls}
                required
              />
            </Field>
            <Field label="Koniec" hint="Opcjonalne. Zostaw puste jeśli to deadline / pojedyncze wydarzenie.">
              <input
                type="datetime-local"
                value={form.endsAt}
                onChange={e => update('endsAt', e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>

          <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={form.allDay}
              onChange={e => update('allDay', e.target.checked)}
              className="accent-indigo-500"
            />
            Cały dzień (ignoruj godzinę przy wyświetlaniu)
          </label>

          <Field label="Lokalizacja" hint="Adres, sala, link do Meet/Teams">
            <input
              value={form.location}
              onChange={e => update('location', e.target.value)}
              placeholder="WSEI, sala 3.12 / Google Meet link"
              className={inputCls}
            />
          </Field>

          <Field label="URL" hint="Dodatkowy link (Meet, zapisy, agenda)">
            <input
              type="url"
              value={form.url}
              onChange={e => update('url', e.target.value)}
              placeholder="https://meet.google.com/..."
              className={inputCls}
            />
          </Field>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
              {error}
            </div>
          )}
        </form>

        <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            Anuluj
          </button>
          <button
            type="submit"
            form="cal-entry-form"
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEdit ? 'Zapisz' : 'Utwórz'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-gray-400 uppercase tracking-wider">{label}</span>
      {children}
      {hint && <span className="text-[10px] text-gray-600">{hint}</span>}
    </label>
  );
}

/**
 * ISO → string dla input type="datetime-local".
 * datetime-local expects 'YYYY-MM-DDTHH:mm' w lokalnej strefie (bez Z).
 */
function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
