/**
 * ProfilePage — /panel/profil
 * Edycja własnego profilu: bio, GitHub, LinkedIn, uczelnia, skills.
 * Używa istniejącego endpointu PATCH /api/panel/me.
 */
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function ProfilePage() {
  const { user, token, refreshUser } = useAuth();

  const [form, setForm] = useState({
    displayName:    user?.displayName    ?? '',
    bio:            user?.bio            ?? '',
    githubUrl:      user?.githubUrl      ?? '',
    linkedinUrl:    user?.linkedinUrl    ?? '',
    university:     user?.university     ?? '',
    graduationYear: user?.graduationYear?.toString() ?? '',
    skills:         user?.skills?.join(', ')  ?? '',
  });
  const [saving, setSaving]   = useState(false);
  const [saved,  setSaved]    = useState(false);
  const [error,  setError]    = useState<string | null>(null);

  if (!user) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const body = {
        displayName:    form.displayName.trim()    || undefined,
        bio:            form.bio.trim()            || undefined,
        githubUrl:      form.githubUrl.trim()      || undefined,
        linkedinUrl:    form.linkedinUrl.trim()    || undefined,
        university:     form.university.trim()     || undefined,
        graduationYear: form.graduationYear ? Number(form.graduationYear) : undefined,
        skills: form.skills
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
      };
      const res = await fetch('/api/panel/me', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? 'Błąd zapisu');
      }
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  function field(
    key: keyof typeof form,
    label: string,
    opts?: { placeholder?: string; type?: string; multiline?: boolean }
  ) {
    const cls =
      'bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 w-full';
    return (
      <div key={key} className="flex flex-col gap-1.5">
        <label className="text-xs text-gray-400">{label}</label>
        {opts?.multiline ? (
          <textarea
            value={form[key]}
            onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
            placeholder={opts.placeholder}
            rows={3}
            className={`${cls} resize-none`}
          />
        ) : (
          <input
            type={opts?.type ?? 'text'}
            value={form[key]}
            onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
            placeholder={opts?.placeholder}
            className={cls}
          />
        )}
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-10 flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-bold">Mój profil</h1>
        <p className="text-gray-400 text-sm mt-1">{user.email}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-4">
        {field('displayName', 'Imię i nazwisko', { placeholder: 'Jan Kowalski' })}
        {field('bio', 'Bio', {
          placeholder: 'Frontend dev, AI entuzjasta, student AGH',
          multiline: true,
        })}
        {field('githubUrl', 'GitHub URL', { placeholder: 'https://github.com/jankowalski', type: 'url' })}
        {field('linkedinUrl', 'LinkedIn URL', { placeholder: 'https://linkedin.com/in/jankowalski', type: 'url' })}
        {field('university', 'Uczelnia', { placeholder: 'AGH, UJ, PK, …' })}
        {field('graduationYear', 'Rok ukończenia', { placeholder: '2026', type: 'number' })}
        {field('skills', 'Umiejętności (po przecinku)', {
          placeholder: 'React, TypeScript, Python, ML',
        })}

        {error && (
          <p className="text-xs text-red-400 bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        {saved && (
          <p className="text-xs text-green-400 bg-green-900/20 border border-green-800/40 rounded-lg px-3 py-2">
            ✓ Zapisano!
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50"
        >
          {saving ? 'Zapisywanie…' : 'Zapisz zmiany'}
        </button>
      </form>
    </div>
  );
}
