/**
 * ParticipantProfile — /uczestnicy/:slug
 * Public profile of a single participant.
 */
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';

interface Project {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  thumbnailUrl: string | null;
  technologies: string[];
}

interface ProfileData {
  profileSlug: string;
  displayName: string;
  avatarUrl:   string | null;
  bio:         string | null;
  university:  string | null;
  graduationYear: number | null;
  skills:      string[];
  githubUrl:   string | null;
  linkedinUrl: string | null;
  role:        string;
  projects:    Project[];
}

const ROLE_LABEL: Record<string, string> = {
  'hackathon-participant':  '🚀 Uczestnik Hackathonu',
  'scienceclub-participant':'🔬 Uczestnik Koła',
  admin:                   '⚙️ Admin',
  moderator:               '🛡 Moderator',
  jury:                    '⚖️ Jury',
};

export function ParticipantProfile() {
  const { slug } = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/public/participants/${slug}`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then(d => d && setProfile(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-gray-500 text-sm">Ładowanie…</p>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-4">
        <p className="text-2xl font-bold">Nie znaleziono profilu</p>
        <Link to="/uczestnicy" className="text-indigo-400 hover:text-indigo-300 text-sm">
          ← Wróć do listy uczestników
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white py-10 px-4">
      <div className="container mx-auto max-w-2xl flex flex-col gap-8">
        {/* Back */}
        <Link to="/uczestnicy" className="text-xs text-gray-500 hover:text-gray-300 transition-colors self-start">
          ← Uczestnicy
        </Link>

        {/* Profile header card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-5">
          {/* Avatar + name */}
          <div className="flex items-start gap-4">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.displayName}
                className="w-16 h-16 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-indigo-900/60 flex items-center justify-center shrink-0 text-2xl font-bold text-indigo-300">
                {profile.displayName.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="flex flex-col gap-1 min-w-0">
              <h1 className="text-xl font-bold text-white">{profile.displayName}</h1>
              {profile.university && (
                <p className="text-sm text-gray-400">
                  {profile.university}
                  {profile.graduationYear && `, rocznik ${profile.graduationYear}`}
                </p>
              )}
              <span className="text-xs text-gray-600 mt-0.5">
                {ROLE_LABEL[profile.role] ?? profile.role}
              </span>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-sm text-gray-300 leading-relaxed">{profile.bio}</p>
          )}

          {/* Skills */}
          {profile.skills.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Umiejętności</p>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map(s => (
                  <span key={s} className="text-xs bg-gray-800 text-gray-300 border border-gray-700 px-2.5 py-1 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          {(profile.githubUrl || profile.linkedinUrl) && (
            <div className="flex gap-3">
              {profile.githubUrl && (
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 px-3 py-1.5 rounded-lg transition-colors text-gray-300"
                >
                  GitHub ↗
                </a>
              )}
              {profile.linkedinUrl && (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 px-3 py-1.5 rounded-lg transition-colors text-gray-300"
                >
                  LinkedIn ↗
                </a>
              )}
            </div>
          )}
        </div>

        {/* Projects */}
        {profile.projects.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Projekty</h2>
            {profile.projects.map(p => (
              <Link
                key={p.id}
                to={`/projekty/${p.slug}`}
                className="bg-gray-900 border border-gray-800 hover:border-indigo-600 rounded-xl p-4 flex gap-4 transition-colors group"
              >
                {p.thumbnailUrl && (
                  <img
                    src={p.thumbnailUrl}
                    alt={p.title}
                    className="w-16 h-16 rounded-lg object-cover shrink-0"
                  />
                )}
                <div className="flex flex-col gap-1 min-w-0">
                  <p className="font-semibold text-sm text-white group-hover:text-indigo-300 transition-colors truncate">
                    {p.title}
                  </p>
                  {p.shortDescription && (
                    <p className="text-xs text-gray-400 line-clamp-2">{p.shortDescription}</p>
                  )}
                  {p.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {p.technologies.slice(0, 4).map(t => (
                        <span key={t} className="text-xs bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
