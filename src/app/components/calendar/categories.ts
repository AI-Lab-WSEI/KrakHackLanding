/**
 * Kategorie kalendarza — kolorystyka + ikony + labele.
 * Spójne z migracj\u0105 0018_calendar_entries.sql.
 */
import {
  Users, Mic, Timer, Trophy, Wrench, GitCommit, Shield, Dot,
  type LucideIcon,
} from 'lucide-react';

export type CalendarCategory =
  | 'meeting'
  | 'conference'
  | 'deadline'
  | 'hackathon'
  | 'workshop'
  | 'project_milestone'
  | 'internal'
  | 'other';

interface CategoryMeta {
  label:   string;
  icon:    LucideIcon;
  dot:     string;  // Tailwind bg-* classes dla kropki
  text:    string;  // Tailwind text-* classes
  border:  string;  // Tailwind border-* classes
  hex:     string;  // raw hex (dla inline styles / iCal)
}

export const CATEGORY_META: Record<CalendarCategory, CategoryMeta> = {
  meeting:           { label: 'Spotkanie koła',   icon: Users,     dot: 'bg-cyan-400',    text: 'text-cyan-300',    border: 'border-cyan-500/40',    hex: '#22d3ee' },
  conference:        { label: 'Konferencja',       icon: Mic,       dot: 'bg-purple-400',  text: 'text-purple-300',  border: 'border-purple-500/40',  hex: '#c084fc' },
  deadline:          { label: 'Deadline',          icon: Timer,     dot: 'bg-red-400',     text: 'text-red-300',     border: 'border-red-500/40',     hex: '#f87171' },
  hackathon:         { label: 'Hackathon',         icon: Trophy,    dot: 'bg-amber-400',   text: 'text-amber-300',   border: 'border-amber-500/40',   hex: '#fbbf24' },
  workshop:          { label: 'Warsztat',          icon: Wrench,    dot: 'bg-emerald-400', text: 'text-emerald-300', border: 'border-emerald-500/40', hex: '#34d399' },
  project_milestone: { label: 'Etap projektu',     icon: GitCommit, dot: 'bg-indigo-400',  text: 'text-indigo-300',  border: 'border-indigo-500/40',  hex: '#818cf8' },
  internal:          { label: 'Plan wewnętrzny',   icon: Shield,    dot: 'bg-slate-400',   text: 'text-slate-300',   border: 'border-slate-500/40',   hex: '#94a3b8' },
  other:             { label: 'Inne',              icon: Dot,       dot: 'bg-gray-400',    text: 'text-gray-300',    border: 'border-gray-500/40',    hex: '#9ca3af' },
};

export const ALL_CATEGORIES: CalendarCategory[] = Object.keys(CATEGORY_META) as CalendarCategory[];

/**
 * Znajdź meta dla kategorii (fallback = 'other').
 */
export function getCategoryMeta(category: string): CategoryMeta {
  return CATEGORY_META[(category as CalendarCategory)] ?? CATEGORY_META.other;
}
