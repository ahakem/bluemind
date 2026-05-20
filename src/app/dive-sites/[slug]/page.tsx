import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getDiveSiteBySlug, getAllDiveSites } from '@/lib/diveSiteService';
import DiveSiteDetailClient from './DiveSiteDetailClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  // Build pages for all sites regardless of status so pending sites
  // can be previewed directly by URL (they won't appear in the public listing)
  const sites = await getAllDiveSites();
  return sites.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const site = await getDiveSiteBySlug(slug);
  if (!site) return { title: 'Site Not Found' };
  const desc = (site.description || '').slice(0, 160);
  return {
    title: `${site.name} — Dive Site`,
    description: desc,
    openGraph: {
      title: `${site.name} | Blue Mind Freediving`,
      description: desc,
      url: `https://bluemindfreediving.nl/dive-sites/${site.slug}`,
    },
    alternates: { canonical: `https://bluemindfreediving.nl/dive-sites/${site.slug}` },
  };
}

export default async function DiveSiteDetailPage({ params }: Props) {
  const { slug } = await params;
  const site = await getDiveSiteBySlug(slug);
  if (!site) notFound();

  // Serialize dates to strings — Date objects can't cross the server→client boundary in dev mode
  const serializable = {
    ...site,
    createdAt: site.createdAt.toISOString(),
    updatedAt: site.updatedAt.toISOString(),
  };

  return <DiveSiteDetailClient site={serializable as unknown as typeof site} />;
}
