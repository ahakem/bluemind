'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface DiveSiteNavContextValue {
  siteCount: number | null;
  setSiteCount: (n: number) => void;
}

const DiveSiteNavContext = createContext<DiveSiteNavContextValue>({
  siteCount: null,
  setSiteCount: () => {},
});

export function DiveSiteNavProvider({ children }: { children: ReactNode }) {
  const [siteCount, setSiteCount] = useState<number | null>(null);
  return (
    <DiveSiteNavContext.Provider value={{ siteCount, setSiteCount }}>
      {children}
    </DiveSiteNavContext.Provider>
  );
}

export const useDiveSiteNav = () => useContext(DiveSiteNavContext);
