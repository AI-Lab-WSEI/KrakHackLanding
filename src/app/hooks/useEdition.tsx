import { createContext, useContext } from 'react';
import type { EditionMeta } from '@/data/edition-registry';
import type { Edition } from '@/types/edition';
import type { TeamProject } from '@/data/teams';

export interface EditionContextValue {
  meta: EditionMeta;
  edition: Edition;
  teams: TeamProject[];
  results: any | null;
  basePath: string;
  teamPath: (slug: string) => string;
  taskPath: (slug: string) => string;
}

const EditionContext = createContext<EditionContextValue | null>(null);

export function EditionProvider({ value, children }: { value: EditionContextValue; children: React.ReactNode }) {
  return <EditionContext.Provider value={value}>{children}</EditionContext.Provider>;
}

export function useEdition(): EditionContextValue {
  const ctx = useContext(EditionContext);
  if (!ctx) throw new Error('useEdition must be used within EditionProvider');
  return ctx;
}

/** Returns null when outside EditionProvider (legacy routes). */
export function useEditionOptional(): EditionContextValue | null {
  return useContext(EditionContext);
}
