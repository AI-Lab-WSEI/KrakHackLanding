import { createContext, useContext, type ReactNode } from 'react';

export type SiteMode = 'hackathon' | 'lab';

interface SiteConfig {
  mode: SiteMode;
  hackathonUrl: string;
  labUrl: string;
  isLab: boolean;
  isHackathon: boolean;
}

// Read from window.__SITE_CONFIG__ injected by server.js into HTML
// Falls back to hackathon mode if not present
function getConfig(): SiteConfig {
  const w = window as any;
  const raw = w.__SITE_CONFIG__ || {};
  const mode: SiteMode = raw.mode === 'lab' ? 'lab' : 'hackathon';
  return {
    mode,
    hackathonUrl: raw.hackathonUrl || 'https://krakhack.info',
    labUrl: raw.labUrl || 'http://localhost:5175',
    isLab: mode === 'lab',
    isHackathon: mode === 'hackathon',
  };
}

const config = getConfig();
const SiteConfigContext = createContext<SiteConfig>(config);

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  return (
    <SiteConfigContext.Provider value={config}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig(): SiteConfig {
  return useContext(SiteConfigContext);
}
