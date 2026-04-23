/**
 * ProjectEditPage — /panel/projekty/nowy + /panel/projekty/:id/edytuj
 *
 * Wspólny formularz do tworzenia i edycji projektu.
 * Gdy `id === 'nowy'` — tworzy, gdy UUID — edytuje.
 */
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { adminFetch } from '@/lib/adminApi';
import { ProjectUpdatesAdmin } from '@/app/components/project/ProjectUpdatesAdmin';

interface ProjectForm {
  title: string;
  description: string;
  projectType: 'personal' | 'team' | 'hackathon';
  visibility: 'private' | 'members_only' | 'public';
  status: 'draft' | 'active' | 'published' | 'maintained' | 'archived';
  techStack: string;      // comma-separated
  tags: string;           // comma-separated
  githubUrl: string;
  demoUrl: string;
}

const EMPTY_FORM: ProjectForm = {
  title:        '',
  description:  '',
  projectType:  'personal',
  visibility:   'private',
  status:       'draft',
  techStack:    '',
  tags:         '',
  githubUrl:    '',
  demoUrl:      '',
};

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 50);
}

export function ProjectEditPage() {
  const { id } = useParams<{ id: string }>();
  const isNew   = id === 'nowy' || !id;
  const { token } = useAuth();
  const navigate  = useNavigate();

  const [form,    setForm]    = useState<ProjectForm>(EMPTY_FORM);
  const [saving,  setSaving]  = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [error,   setError]   = useState<string | null>(null);

  // Load existing project for edit
  useEffect(() => {
    if (isNew || !token) return;
    (async () => {
      setLoading(true);
      try {
        const res = await adminFetch(`/api/panel/projects/${id}`);
        if (!res.ok) throw new Error(`Nie znaleziono projektu (${res.status})`);
        const p = await res.json();
        setForm({
          title:       p.title       ?? '',
          description: p.description ?? '',
          projectType: p.projectType ?? 'personal',
          visibility:  p.visibility  ?? 'private',
          status:      p.status      ?? 'draft',
          techStack:   (p.techStack ?? []).join(', '),
          tags:        (p.tags      ?? []).join(', '),
          githubUrl:   p.githubUrl   ?? '',
          demoUrl:     p.demoUrl     ?? '',
        });
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isNew, token]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !form.title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const body = {
        title:       form.title.trim(),
        description: form.description.trim() || undefined,
        projectType: form.projectType,
        visibility:  form.visibility,
        status:      form.status,
        techStack:   form.techStack.split(',').map(s => s.trim()).filter(Boolean),
        tags:        form.tags.split(',').map(s => s.trim()).filter(Boolean),
        githubUrl:   form.githubUrl.trim()  || undefined,
        demoUrl:     form.demoUrl.trim()    || undefined,
        ...(isNew ? { slug: `${slugify(form.title)}-${Math.random().toString(36).slice(2, 7)}` } : {}),
      };

      const url    = isNew ? '/api/panel/projects' : `/api/panel/projects/${id}`;
      const method = isNew ? 'POST' : 'PATCH';

      const res = await adminFetch(url, {
        method,
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? 'Błąd zapisu');
      }
      navigate('/panel/projekty');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }, [form, id, isNew, token, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500 text-sm">Ładowanie projektu…</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-10 flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/panel/projekty')}
          className="text-gray-500 hover:text-white text-sm transition-colors"
        >
          ← Projekty
        </button>
        <h1 className="text-xl font-bold">
          {isNew ? 'Nowy projekt' : 'Edytuj projekt'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-4">
        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-gray-400">Tytuł *</label>
          <input
            required
            type="text"
            value={form.title}
            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            placeholder="Mój super projekt"
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-gray-400">Opis</label>
          <textarea
            value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            placeholder="Krótki opis projektu…"
            rows={4}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 resize-none"
          />
        </div>

        {/* Row: type + visibility */}
        <div className="grid grid-cols-2 gap-3">
          <SelectField
            label="Typ"
            value={form.projectType}
            onChange={v => setForm(p => ({ ...p, projectType: v as ProjectForm['projectType'] }))}
            options={[
              { value: 'personal',  label: 'Osobisty' },
              { value: 'team',      label: 'Zespołowy' },
              { value: 'hackathon', label: 'Hackathon' },
            ]}
          />
          <SelectField
            label="Widoczność"
            value={form.visibility}
            onChange={v => setForm(p => ({ ...p, visibility: v as ProjectForm['visibility'] }))}
            options={[
              { value: 'private',      label: '🔒 Prywatny' },
              { value: 'members_only', label: '👥 Dla członków' },
              { value: 'public',       label: '🌍 Publiczny' },
            ]}
          />
        </div>

        {/* Status */}
        <SelectField
          label="Status"
          value={form.status}
          onChange={v => setForm(p => ({ ...p, status: v as ProjectForm['status'] }))}
          options={[
            { value: 'draft',      label: '⬜ Szkic' },
            { value: 'active',     label: '🟡 Aktywny' },
            { value: 'published',  label: '🟢 Opublikowany' },
            { value: 'maintained', label: '🔵 Utrzymywany' },
            { value: 'archived',   label: '⚫ Archiwum' },
          ]}
        />

        {/* Tech stack */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-gray-400">Tech stack (po przecinku)</label>
          <input
            type="text"
            value={form.techStack}
            onChange={e => setForm(p => ({ ...p, techStack: e.target.value }))}
            placeholder="React, TypeScript, FastAPI, PostgreSQL"
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Tags */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-gray-400">Tagi (po przecinku)</label>
          <input
            type="text"
            value={form.tags}
            onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
            placeholder="AI, ML, web, mobile"
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400">GitHub URL</label>
            <input
              type="url"
              value={form.githubUrl}
              onChange={e => setForm(p => ({ ...p, githubUrl: e.target.value }))}
              placeholder="https://github.com/…"
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400">Demo URL</label>
            <input
              type="url"
              value={form.demoUrl}
              onChange={e => setForm(p => ({ ...p, demoUrl: e.target.value }))}
              placeholder="https://demo.example.com"
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-400 bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={() => navigate('/panel/projekty')}
            className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-white text-sm transition-colors"
          >
            Anuluj
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            {saving ? 'Zapisywanie…' : isNew ? 'Utwórz projekt' : 'Zapisz zmiany'}
          </button>
        </div>
      </form>

      {/* Oś czasu — changelog projektu (Faza 11.3).
          Widoczne tylko dla istniejącego projektu (wymaga UUID). */}
      {!isNew && id && (
        <div className="mt-8 pt-8 border-t border-white/10">
          <ProjectUpdatesAdmin projectId={id} />
        </div>
      )}
    </div>
  );
}

function SelectField({
  label, value, onChange, options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-gray-400">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
