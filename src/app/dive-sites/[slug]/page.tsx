import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getDiveSiteBySlug, getActiveDiveSites } from '@/lib/diveSiteService';
import DiveSiteDetailClient from './DiveSiteDetailClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const sites = await getActiveDiveSites();
  return sites.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const site = await getDiveSiteBySlug(slug);
  if (!site) return { title: 'Site Not Found' };
  return {
    title: `${site.name} — Dive Site`,
    description: site.description.slice(0, 160),
    openGraph: {
      title: `${site.name} | Blue Mind Freediving`,
      description: site.description.slice(0, 160),
      url: `https://bluemindfreediving.nl/dive-sites/${site.slug}`,
    },
    alternates: { canonical: `https://bluemindfreediving.nl/dive-sites/${site.slug}` },
  };
}

export default async function DiveSiteDetailPage({ params }: Props) {
  const { slug } = await params;
  const site = await getDiveSiteBySlug(slug);
  if (!site) notFound();
  return <DiveSiteDetailClient site={site} />;
}
