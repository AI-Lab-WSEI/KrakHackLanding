import { useSiteConfig } from '@/app/hooks/useSiteConfig';
import { Edition2026 } from './Edition2026';
import { AboutPage } from './AboutPage';

export function HomePage() {
  const { isLab, loading } = useSiteConfig();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return isLab ? <AboutPage /> : <Edition2026 />;
}
