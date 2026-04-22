/**
 * ParticipantsPage — /uczestnicy
 * Public directory of participants who have completed onboarding.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router';

interface Participant {
  profileSlug: string;
  displayName: string;
  avatarUrl:   string | null;
  bio:         string | null;
  university:  string | null;
  skills:      string[];
  githubUrl:   string | null;
  linkedinUrl: string | null;
  role:        string;
}

const ROLE_LABEL: Record<string, string> = {
  'hackathon-participant':  '🚀 Uczestnik Hackathonu',
  'scienceclub-participant':'🔬 Uczestnik Koła',
  admin:                   '⚙️ Admin',
  moderator:               '🛡 Moderator',
  jury:                    '⚖️ Jury',
};

function ParticipantCard({ p }: { p: Participant }) {
  return (
    <Link
      to={`/uczestnicy/${p.profileSlug}`}
      className="bg-gray-900 border border-gray-800 hover:border-indigo-600 rounded-xl p-5 flex flex-col gap-3 transition-colors group"
    >
      {/* Avatar + name */}
      <div className="flex items-center gap-3">
        {p.avatarUrl ? (
          <img
            src={p.avatarUrl}
            alt={p.displayName}
            className="w-10 h-10 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-indigo-900/60 flex items-center justify-center shrink-0 text-indigo-300 font-bold text-sm">
            {p.displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="font-semibold text-sm text-white group-hover:text-indigo-300 transition-colors truncate">
            {p.displayName}
          </p>
          {p.university && (
            <p className="text-xs text-gray-500 truncate">{p.university}</p>
          )}
        </div>
      </div>

      {/* Bio snippet */}
      {p.bio && (
        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{p.bio}</p>
      )}

      {/* Skills */}
      {p.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {p.skills.slice(0, 4).map(s => (
            <span key={s} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
              {s}
            </span>
          ))}
          {p.skills.length > 4 && (
            <span className="text-xs text-gray-600">+{p.skills.length - 4}</span>
          )}
        </div>
      )}

      {/* Role badge + links */}
      <div className="flex items-center justify-between mt-auto pt-1">
        <span className="text-xs text-gray-600">
          {ROLE_LABEL[p.role] ?? p.role}
        </span>
        <div className="flex gap-2">
          {p.githubUrl && (
            <span className="text-xs text-gray-600">GitHub</span>
          )}
          {p.linkedinUrl && (
            <span className="text-xs text-gray-600">LinkedIn</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function ParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [search, setSearch]             = useState('');

  useEffect(() => {
    fetch('/api/public/participants')
      .then(r => r.json())
      .then(d => setParticipants(d.participants ?? []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = participants.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.displayName.toLowerCase().includes(q) ||
      (p.university ?? '').toLowerCase().includes(q) ||
      p.skills.some(s => s.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-8 pb-20">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Uczestnicy</h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Poznaj społeczność AI Krak Hack — uczestników, jurorów i członków koła naukowego.
          </p>
        </div>

        {/* Search */}
        <div className="mb-8 max-w-md mx-auto">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Szukaj po imieniu, uczelni lub umiejętnościach…"
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Grid */}
        {loading ? (
          <p className="text-gray-500 text-center py-16">Ładowanie…</p>
        ) : error ? (
          <p className="text-red-400 text-center py-16">{error}</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-500 text-center py-16">
            {search ? 'Brak wyników dla podanej frazy.' : 'Brak uczestników z publicznym profilem.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(p => (
              <ParticipantCard key={p.profileSlug} p={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
