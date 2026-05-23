import type { Metadata } from 'next';
import { getActiveDiveSites } from '@/lib/diveSiteService';
import ContinentsClient from './ContinentsClient';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Freediving Sites by Continent | Blue Mind Freediving',
  description: 'Explore freediving dive sites across all continents. From European lakes to Pacific reefs — discover the world\'s best freediving destinations.',
  openGraph: {
    title: 'Freediving Sites by Continent | Blue Mind Freediving',
    description: 'Discover freediving sites across 6 continents worldwide.',
    type: 'website',
  },
};

export default async function ContinentsPage() {
  const sites = await getActiveDiveSites();
  const serialized = sites.map((s) => ({
    ...s,
    createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : s.createdAt,
    updatedAt: s.updatedAt instanceof Date ? s.updatedAt.toISOString() : s.updatedAt,
  }));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <ContinentsClient sites={serialized as any} />;
}
