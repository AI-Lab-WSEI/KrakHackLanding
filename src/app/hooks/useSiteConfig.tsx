import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type SiteMode = 'hackathon' | 'lab';

interface SiteConfig {
  mode: SiteMode;
  hackathonUrl: string;
  labUrl: string;
  isLab: boolean;
  isHackathon: boolean;
  loading: boolean;
}

const defaultConfig: SiteConfig = {
  mode: 'hackathon',
  hackathonUrl: 'https://krakhack.info',
  labUrl: 'http://localhost:5175',
  isLab: false,
  isHackathon: true,
  loading: true,
};

const SiteConfigContext = createContext<SiteConfig>(defaultConfig);

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SiteConfig>(defaultConfig);

  useEffect(() => {
    const apiBase = import.meta.env.DEV ? 'http://localhost:3000' : '';
    fetch(`${apiBase}/api/config/site`)
      .then((res) => res.json())
      .then((data) => {
        const mode: SiteMode = data.mode === 'lab' ? 'lab' : 'hackathon';
        setConfig({
          mode,
          hackathonUrl: data.hackathonUrl || defaultConfig.hackathonUrl,
          labUrl: data.labUrl || defaultConfig.labUrl,
          isLab: mode === 'lab',
          isHackathon: mode === 'hackathon',
          loading: false,
        });
      })
      .catch(() => {
        setConfig({ ...defaultConfig, loading: false });
      });
  }, []);

  return (
    <SiteConfigContext.Provider value={config}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig(): SiteConfig {
  return useContext(SiteConfigContext);
}
