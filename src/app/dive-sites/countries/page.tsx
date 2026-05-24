import type { Metadata } from 'next';
import { getActiveDiveSites } from '@/lib/diveSiteService';
import CountriesClient from './CountriesClient';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Freediving Sites by Country | Blue Mind Freediving',
  description: 'Browse freediving dive sites grouped by country. Explore 60+ countries with depth, visibility, and conditions data — curated by the freediving community.',
  openGraph: {
    title: 'Freediving Sites by Country | Blue Mind Freediving',
    description: 'Explore freediving sites in 60+ countries worldwide.',
    type: 'website',
  },
};

export default async function CountriesPage() {
  const sites = await getActiveDiveSites();
  const serialized = sites.map((s) => ({
    ...s,
    createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : s.createdAt,
    updatedAt: s.updatedAt instanceof Date ? s.updatedAt.toISOString() : s.updatedAt,
  }));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <CountriesClient sites={serialized as any} />;
}
