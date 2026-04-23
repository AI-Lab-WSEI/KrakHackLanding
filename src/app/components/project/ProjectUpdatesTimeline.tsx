/**
 * ProjectUpdatesTimeline — publiczny widok changelogu projektu.
 *
 * Renderowany na stronie publicznej projektu (ProjectPublicView) pod
 * głównym opisem. Markdown body + opcjonalne zdjęcie + timeline z datą.
 */
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { GitCommit, Sparkles, Play, Users, Package, Circle } from 'lucide-react';

interface Update {
  id:          string;
  title:       string;
  bodyMd:      string | null;
  updateType:  string;
  imageUrl:    string | null;
  videoUrl:    string | null;
  happenedAt:  string;
}

const TYPE_META: Record<string, { label: string; icon: typeof GitCommit; color: string }> = {
  milestone:   { label: 'Milestone',    icon: GitCommit, color: 'text-indigo-300' },
  feature:     { label: 'Nowa funkcja', icon: Sparkles,  color: 'text-emerald-300' },
  demo:        { label: 'Demo',         icon: Play,      color: 'text-amber-300' },
  team_change: { label: 'Zespół',       icon: Users,     color: 'text-cyan-300' },
  release:     { label: 'Release',      icon: Package,   color: 'text-purple-300' },
  other:       { label: 'Aktualizacja', icon: Circle,    color: 'text-gray-400' },
};

interface Props {
  projectSlug: string;
}

export function ProjectUpdatesTimeline({ projectSlug }: Props) {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/public/projects/${projectSlug}/updates`)
      .then(r => r.json())
      .then(d => { if (!cancelled) setUpdates(d.updates ?? []); })
      .catch(() => { /* soft-fail */ })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [projectSlug]);

  if (loading) return <p className="text-xs text-gray-500 py-4">Ładowanie aktualizacji…</p>;
  if (updates.length === 0) return null;  // nie wyświetlamy nic jeśli brak updates

  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold text-white mb-6">Oś czasu projektu</h2>
      <ol className="relative border-l-2 border-white/10 ml-4">
        {updates.map(u => {
          const meta = TYPE_META[u.updateType] ?? TYPE_META.other;
          const Icon = meta.icon;
          const d    = new Date(u.happenedAt);
          return (
            <li key={u.id} className="mb-8 ml-8 relative">
              <span className={`absolute -left-[3.05rem] top-0 w-8 h-8 rounded-full bg-gray-950 border-2 border-white/20 flex items-center justify-center ${meta.color}`}>
                <Icon className="w-3.5 h-3.5" />
              </span>
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                  <h3 className="text-base font-semibold text-white">{u.title}</h3>
                  <time className="text-[11px] text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </time>
                </div>

                <span className={`inline-block text-[10px] uppercase tracking-widest ${meta.color} mb-3`}>
                  {meta.label}
                </span>

                {u.imageUrl && (
                  <img
                    src={u.imageUrl}
                    alt={u.title}
                    className="w-full rounded-lg mb-3 border border-white/10"
                    loading="lazy"
                  />
                )}

                {u.bodyMd && (
                  <div className="prose prose-invert prose-sm max-w-none
                    prose-headings:text-white prose-headings:font-semibold
                    prose-p:text-gray-300
                    prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline
                    prose-code:text-pink-300 prose-code:bg-white/10 prose-code:px-1 prose-code:rounded
                    prose-pre:bg-black/40 prose-pre:border prose-pre:border-white/10
                    prose-strong:text-white
                    prose-li:text-gray-300
                    prose-blockquote:border-l-indigo-500/40 prose-blockquote:text-gray-400
                  ">
                    <ReactMarkdown>{u.bodyMd}</ReactMarkdown>
                  </div>
                )}

                {u.videoUrl && (
                  <a
                    href={u.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-3 text-xs text-indigo-400 hover:text-indigo-300"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Zobacz wideo →
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
