'use client';

import { useSiteFeatures } from '@/contexts/SiteSettingsContext';
import DiveSitesPromo from '@/sections/DiveSitesPromo';

export default function ConditionalDiveSitesPromo() {
  const { diveSitesEnabled } = useSiteFeatures();
  if (!diveSitesEnabled) return null;
  return <DiveSitesPromo />;
}
