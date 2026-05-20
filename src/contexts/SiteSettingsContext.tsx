'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getSiteFeatures, SiteFeatures } from '@/lib/siteSettings';

const defaultFeatures: SiteFeatures = { diveSitesEnabled: false };

const SiteSettingsContext = createContext<SiteFeatures>(defaultFeatures);

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [features, setFeatures] = useState<SiteFeatures>(defaultFeatures);

  useEffect(() => {
    getSiteFeatures().then(setFeatures);
  }, []);

  return (
    <SiteSettingsContext.Provider value={features}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteFeatures() {
  return useContext(SiteSettingsContext);
}
