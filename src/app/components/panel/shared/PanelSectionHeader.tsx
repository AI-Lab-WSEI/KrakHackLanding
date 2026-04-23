/**
 * PanelSectionHeader — tytuł sekcji + opcjonalny eyebrow + akcja po prawej.
 *
 *   <PanelSectionHeader title="Aplikacje do koła" eyebrow="Membership" />
 *   <PanelSectionHeader title="Certyfikaty" cta={<button>Dodaj</button>} />
 */
import type { ReactNode } from 'react';

interface PanelSectionHeaderProps {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  cta?: ReactNode;
  className?: string;
}

export function PanelSectionHeader({
  title,
  eyebrow,
  subtitle,
  cta,
  className = '',
}: PanelSectionHeaderProps) {
  return (
    <div className={`flex items-start justify-between gap-4 mb-6 ${className}`}>
      <div className="min-w-0 flex-1">
        {eyebrow && (
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
            {eyebrow}
          </p>
        )}
        <h1 className="text-xl sm:text-2xl font-semibold text-white truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
        )}
      </div>
      {cta && <div className="shrink-0">{cta}</div>}
    </div>
  );
}
