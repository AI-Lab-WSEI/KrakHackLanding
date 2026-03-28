import { useSiteConfig } from '@/app/hooks/useSiteConfig';
import { Edition2026 } from './Edition2026';
import { AboutPage } from './AboutPage';

export function HomePage() {
  const { isLab } = useSiteConfig();
  return isLab ? <AboutPage /> : <Edition2026 />;
}
