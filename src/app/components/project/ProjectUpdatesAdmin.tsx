/**
 * ProjectUpdatesAdmin — CRUD aktualizacji (changelog) dla projektu.
 * Renderowany w ProjectEditPage (jako osobna sekcja pod formularzem).
 *
 * Właściciel projektu / admin może:
 *   • dodać nową aktualizację (title, typ, body markdown, zdjęcie URL)
 *   • edytować istniejącą
 *   • przełączyć published (widoczność publiczna)
 *   • usunąć
 */
import { useCallback, useEffect, useState } from 'react';
import { Plus, Edit3, Trash2, Save, X, Eye, EyeOff, Loader2, GitCommit, Sparkles, Play, Users, Package, Circle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { adminFetch } from '@/lib/adminApi';

interface Update {
  id:           string;
  title:        string;
  body_md:      string | null;
  update_type:  string;
  image_url:    string | null;
  video_url:    string | null;
  happened_at:  string;
  published:    boolean;
  created_at:   string;
}

const TYPE_OPTIONS = [
  { value: 'milestone',   label: 'Milestone',    icon: GitCommit },
  { value: 'feature',     label: 'Nowa funkcja', icon: Sparkles },
  { value: 'demo',        label: 'Demo',         icon: Play },
  { value: 'team_change', label: 'Zmiana zespołu', icon: Users },
  { value: 'release',     label: 'Release',      icon: Package },
  { value: 'other',       label: 'Inne',         icon: Circle },
] as const;

interface Props {
  projectId: string;
}

export function ProjectUpdatesAdmin({ projectId }: Props) {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Update | 'new' | null>(null);

  const load = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const res = await adminFetch(`/api/panel/projects/${projectId}/updates`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setUpdates(data.updates ?? []);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  async function remove(id: string) {
    if (!confirm('Usunąć aktualizację?')) return;
    await adminFetch(`/api/panel/project-updates/${id}`, { method: 'DELETE' });
    load();
  }

  async function togglePublished(u: Update) {
    await adminFetch(`/api/panel/project-updates/${u.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ published: !u.published }),
    });
    load();
  }

  if (!projectId) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center text-sm text-gray-500">
        Zapisz projekt żeby móc dodać aktualizacje.
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-white">Oś czasu projektu</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Changelog — milestone'y, demo, release'y. Widoczny publicznie na karcie projektu.
          </p>
        </div>
        <button
          onClick={() => setEditing('new')}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Nowa aktualizacja
        </button>
      </div>

      {loading ? (
        <div className="text-xs text-gray-500 py-4 text-center">Ładowanie…</div>
      ) : updates.length === 0 ? (
        <div className="text-xs text-gray-500 py-8 text-center bg-white/5 border border-white/10 rounded-xl">
          Brak aktualizacji. Dodaj pierwszą (np. "Start projektu", "Pierwsze demo", "Dołączył X").
        </div>
      ) : (
        <ul className="space-y-2">
          {updates.map(u => {
            const meta = TYPE_OPTIONS.find(t => t.value === u.update_type) ?? TYPE_OPTIONS[5];
            const Icon = meta.icon;
            return (
              <li key={u.id} className={`bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3 ${!u.published ? 'opacity-60' : ''}`}>
                <Icon className="w-4 h-4 text-indigo-300 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{u.title}</p>
                  <p className="text-[10px] text-gray-500">
                    {new Date(u.happened_at).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {' · '}
                    {meta.label}
                    {!u.published ? ' · niepublikowane' : ''}
                  </p>
                </div>
                <button
                  onClick={() => togglePublished(u)}
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                  title={u.published ? 'Ukryj publicznie' : 'Opublikuj'}
                >
                  {u.published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => setEditing(u)}
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                  title="Edytuj"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => remove(u.id)}
                  className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                  title="Usuń"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {editing && (
        <UpdateEditModal
          update={editing === 'new' ? null : editing}
          projectId={projectId}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
    </div>
  );
}

// ─── Modal edycji update'u ────────────────────────────────────────────────────

function UpdateEditModal({
  update, projectId, onClose, onSaved,
}: {
  update: Update | null;
  projectId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    title:       update?.title       ?? '',
    body_md:     update?.body_md     ?? '',
    update_type: update?.update_type ?? 'milestone',
    image_url:   update?.image_url   ?? '',
    video_url:   update?.video_url   ?? '',
    happened_at: update?.happened_at
      ? new Date(update.happened_at).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
    published:   update?.published !== false,
  });
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving || !form.title.trim()) return;
    setSaving(true);
    try {
      const body = {
        title:       form.title.trim(),
        bodyMd:      form.body_md || null,
        updateType:  form.update_type,
        imageUrl:    form.image_url.trim() || null,
        videoUrl:    form.video_url.trim() || null,
        happenedAt:  new Date(form.happened_at).toISOString(),
        published:   form.published,
      };
      if (update) {
        await adminFetch(`/api/panel/project-updates/${update.id}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        });
      } else {
        await adminFetch(`/api/panel/projects/${projectId}/updates`, {
          method: 'POST',
          body: JSON.stringify(body),
        });
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/30';

  return (
    <div className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gray-950 border border-white/10 rounded-2xl w-full max-w-2xl my-8 flex flex-col max-h-[calc(100vh-4rem)]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 sticky top-0 bg-gray-950">
          <h3 className="text-lg font-semibold text-white">
            {update ? 'Edytuj aktualizację' : 'Nowa aktualizacja'}
          </h3>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} id="update-form" className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 sm:col-span-2">
              <span className="text-xs text-gray-400 uppercase tracking-wider">Tytuł *</span>
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                required
                placeholder="Np. 'Pierwsze demo na spotkaniu koła'"
                className={inputCls}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-400 uppercase tracking-wider">Typ</span>
              <select
                value={form.update_type}
                onChange={e => setForm(f => ({ ...f, update_type: e.target.value }))}
                className={inputCls}
              >
                {TYPE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-400 uppercase tracking-wider">Kiedy</span>
              <input
                type="datetime-local"
                value={form.happened_at}
                onChange={e => setForm(f => ({ ...f, happened_at: e.target.value }))}
                className={inputCls}
              />
            </label>
          </div>

          <label className="flex flex-col gap-1">
            <span className="flex items-center justify-between">
              <span className="text-xs text-gray-400 uppercase tracking-wider">Opis (Markdown)</span>
              <button
                type="button"
                onClick={() => setPreview(p => !p)}
                className="text-[10px] text-indigo-400 hover:text-indigo-300"
              >
                {preview ? 'Edycja' : 'Podgląd'}
              </button>
            </span>
            {preview ? (
              <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 min-h-[120px] text-sm text-gray-300 prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{form.body_md || '_(brak treści)_'}</ReactMarkdown>
              </div>
            ) : (
              <textarea
                value={form.body_md}
                onChange={e => setForm(f => ({ ...f, body_md: e.target.value }))}
                rows={6}
                placeholder="**Co nowego?** Markdown supported — `code`, [linki](url), listy, etc."
                className={`${inputCls} resize-none font-mono text-xs`}
              />
            )}
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Zdjęcie (URL)</span>
            <input
              type="url"
              value={form.image_url}
              onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
              placeholder="https://…"
              className={inputCls}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Wideo (URL, opcjonalne)</span>
            <input
              type="url"
              value={form.video_url}
              onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))}
              placeholder="https://youtube.com/…"
              className={inputCls}
            />
          </label>

          <label className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              checked={form.published}
              onChange={e => setForm(f => ({ ...f, published: e.target.checked }))}
              className="w-4 h-4 accent-indigo-500"
            />
            <span className="text-xs text-gray-300">
              Opublikowane (widoczne publicznie na stronie projektu)
            </span>
          </label>
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
            form="update-form"
            disabled={saving || !form.title.trim()}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Zapisz
          </button>
        </div>
      </div>
    </div>
  );
}
