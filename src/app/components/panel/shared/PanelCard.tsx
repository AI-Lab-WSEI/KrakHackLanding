/**
 * PanelCard — bazowy kontener karty w panelu (admin + user).
 *
 * Styl spójny ze starym `/admin`: bg-white/5, border-white/10, rounded-xl.
 * Używany jako wrapper dla list, formularzy, sekcji dashboard.
 */
import type { ReactNode } from 'react';

interface PanelCardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  as?: 'div' | 'section' | 'article';
}

const PADDING = {
  none: '',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
} as const;

export function PanelCard({
  children,
  className = '',
  padding = 'md',
  as: Tag = 'div',
}: PanelCardProps) {
  return (
    <Tag className={`bg-white/5 border border-white/10 rounded-xl ${PADDING[padding]} ${className}`}>
      {children}
    </Tag>
  );
}
