/**
 * TeamCreatePage — /panel/zespoly/nowy
 *
 * Formularz rejestracji nowego zespołu przez uczestnika.
 * Twórca staje się captainem; dodatkowi członkowie dołączają przez claim flow
 * (/panel/moj-zespol) lub zapraszani przez admin.
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';

const CURRENT_EDITION = 3;

export function TeamCreatePage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [name, setName]               = useState('');
  const [description, setDescription] = useState('');
  const [editionNumber, setEdition]   = useState(CURRENT_EDITION);
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState<string | null>(null);

  const isParticipant = user?.keycloakRoles.some(r =>
    ['admin', 'hackathon-participant', 'scienceclub-participant'].includes(r)
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || submitting) return;
    if (!name.trim()) {
      setError('Nazwa zespołu jest wymagana');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/hackathon/teams', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name:          name.trim(),
          description:   description.trim() || undefined,
          editionNumber,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Nie udało się utworzyć zespołu');
      // Redirect to my-team page (or team public page if exists)
      navigate('/panel/moj-zespol');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) return null;

  if (!isParticipant) {
    return (
      <div className="max-w-xl mx-auto px-6 py-10">
        <div className="bg-amber-900/20 border border-amber-700/40 rounded-xl px-5 py-4 text-sm text-amber-300">
          Tworzenie zespołów dostępne jest wyłącznie dla uczestników hackathonu.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-10 flex flex-col gap-8">
      <div>
        <Link to="/panel/moj-zespol" className="text-xs text-gray-500 hover:text-gray-300 inline-block mb-2">
          ← Mój zespół
        </Link>
        <h1 className="text-xl font-bold">Utwórz nowy zespół</h1>
        <p className="text-gray-400 text-sm mt-1">
          Staniesz się kapitanem. Pozostali członkowie mogą dołączyć przez stronę „Mój zespół”.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-4"
      >
        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-gray-400">
            Nazwa zespołu <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={255}
            required
            placeholder="Neural Ninjas"
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 w-full"
          />
          <span className="text-xs text-gray-600">Slug wygeneruje się automatycznie ({name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'team' : '…'}).</span>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-gray-400">Opis (opcjonalny)</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            placeholder="Czym zajmuje się zespół, nad czym pracujecie…"
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 resize-none w-full"
          />
        </div>

        {/* Edition */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-gray-400">Edycja hackathonu</label>
          <select
            value={editionNumber}
            onChange={e => setEdition(parseInt(e.target.value))}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 w-full"
          >
            <option value={3}>AI Krak Hack 2026 (3. edycja)</option>
          </select>
        </div>

        {error && (
          <p className="text-xs text-red-400 bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || !name.trim()}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Tworzę…' : 'Utwórz zespół'}
        </button>
      </form>
    </div>
  );
}
