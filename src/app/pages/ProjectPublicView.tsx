/**
 * ProjectPublicView — /projekty/:slug
 * Publiczna strona projektu widoczna bez logowania.
 */
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { ProjectUpdatesTimeline } from '@/app/components/project/ProjectUpdatesTimeline';

interface PublicProject {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  projectType: string;
  techStack: string[];
  tags: string[];
  githubUrl: string | null;
  demoUrl: string | null;
  thumbnailUrl: string | null;
  images: string[];
  placementLabel: string | null;
  specialMention: string | null;
  owner: {
    displayName: string | null;
    avatarUrl: string | null;
    githubUrl: string | null;
  } | null;
  team: {
    name: string;
    slug: string;
  } | null;
}

export function ProjectPublicView() {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<PublicProject | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const res = await fetch(`/api/public/projects/${slug}`);
        if (res.status === 404) { setNotFound(true); return; }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setProject(await res.json());
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-sm">Ładowanie…</p>
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <span className="text-5xl">🔍</span>
        <h1 className="text-2xl font-bold">Projekt nie istnieje</h1>
        <p className="text-gray-400 text-sm">Nie znaleziono projektu o podanym adresie.</p>
        <Link to="/" className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors">
          ← Strona główna
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-3">
        {project.placementLabel && (
          <span className="text-sm font-medium text-yellow-400">
            🏆 {project.placementLabel}
          </span>
        )}
        {project.specialMention && (
          <span className="text-sm font-medium text-indigo-400">
            ⭐ {project.specialMention}
          </span>
        )}
        <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>

        {/* Owner / team */}
        <div className="flex items-center gap-3">
          {project.owner?.avatarUrl && (
            <img
              src={project.owner.avatarUrl}
              alt={project.owner.displayName ?? ''}
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="text-sm text-gray-400">
            {project.owner?.displayName ?? 'Anonim'}
            {project.team && (
              <> · <Link
                to={`/edycja/1/zespoly/${project.team.slug}`}
                className="text-indigo-400 hover:text-indigo-300"
              >
                {project.team.name}
              </Link></>
            )}
          </span>
        </div>
      </div>

      {/* Thumbnail */}
      {project.thumbnailUrl && (
        <img
          src={project.thumbnailUrl}
          alt={project.title}
          className="w-full rounded-2xl object-cover max-h-80"
        />
      )}

      {/* Description */}
      {project.description && (
        <div className="text-gray-300 leading-relaxed whitespace-pre-line">
          {project.description}
        </div>
      )}

      {/* Tech stack */}
      {project.techStack.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-xs text-gray-500 font-medium uppercase tracking-wide">Tech stack</h3>
          <div className="flex flex-wrap gap-2">
            {project.techStack.map(t => (
              <span key={t} className="text-xs bg-gray-800 text-gray-300 border border-gray-700 px-2.5 py-1 rounded-full">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {project.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {project.tags.map(t => (
            <span key={t} className="text-xs text-indigo-400 border border-indigo-800/50 px-2.5 py-0.5 rounded-full">
              #{t}
            </span>
          ))}
        </div>
      )}

      {/* Links */}
      <div className="flex gap-4">
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-sm bg-gray-800 hover:bg-gray-700 border border-gray-700 px-4 py-2.5 rounded-xl transition-colors"
          >
            <span>🐙</span> GitHub
          </a>
        )}
        {project.demoUrl && (
          <a
            href={project.demoUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-sm bg-indigo-900/50 hover:bg-indigo-900 border border-indigo-700/50 px-4 py-2.5 rounded-xl transition-colors"
          >
            <span>🚀</span> Demo
          </a>
        )}
      </div>

      {/* Gallery */}
      {project.images.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-xs text-gray-500 font-medium uppercase tracking-wide">Galeria</h3>
          <div className="grid grid-cols-2 gap-3">
            {project.images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`${project.title} — zdjęcie ${i + 1}`}
                className="rounded-xl object-cover w-full aspect-video"
              />
            ))}
          </div>
        </div>
      )}

      {/* Oś czasu projektu — changelog aktualizacji (Faza 11.3) */}
      <ProjectUpdatesTimeline projectSlug={project.slug} />
    </div>
  );
}
