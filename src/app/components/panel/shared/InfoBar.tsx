/**
 * InfoBar — reusable info banner dla sekcji panelu administracyjnego.
 *
 * Cel: wyjaśnić adminowi co dokładnie robi dana sekcja ("backfill", "attendance
 * confirmation", "webhook events" itp.) — bez tooltipa, bez pytania, po prostu
 * widoczne zdanie na górze.
 *
 *   <InfoBar
 *     title="Backfill members"
 *     description="Dolinkuj członków zespołów z potwierdzonych claimów."
 *     tone="info"
 *   />
 *
 * Tony: info (niebieski), warning (żółty), success (zielony), danger (czerwony).
 */
import type { ReactNode } from 'react';
import { Info, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

type Tone = 'info' | 'warning' | 'success' | 'danger';

interface InfoBarProps {
  title?: string;
  description: ReactNode;
  tone?: Tone;
  className?: string;
}

const TONE_MAP: Record<Tone, { bg: string; border: string; text: string; icon: typeof Info }> = {
  info:    { bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    text: 'text-blue-300/90',    icon: Info },
  warning: { bg: 'bg-amber-500/10',   border: 'border-amber-500/30',   text: 'text-amber-200/90',   icon: AlertTriangle },
  success: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-200/90', icon: CheckCircle2 },
  danger:  { bg: 'bg-red-500/10',     border: 'border-red-500/30',     text: 'text-red-200/90',     icon: XCircle },
};

export function InfoBar({ title, description, tone = 'info', className = '' }: InfoBarProps) {
  const t = TONE_MAP[tone];
  const Icon = t.icon;
  return (
    <div className={`${t.bg} border ${t.border} rounded-xl px-4 py-3 flex items-start gap-3 mb-6 ${className}`}>
      <Icon className={`w-4 h-4 ${t.text} shrink-0 mt-0.5`} />
      <div className={`text-xs leading-relaxed ${t.text}`}>
        {title && <p className="font-medium mb-0.5">{title}</p>}
        <p>{description}</p>
      </div>
    </div>
  );
}
