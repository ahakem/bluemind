import { BASE_URL } from '@/lib/siteConfig';
import type { Metadata } from 'next';
import { getActiveDiveSites } from '@/lib/diveSiteService';
import DiveSiteListingClient from './DiveSiteListingClient';

export const revalidate = 3600; // re-fetch from Firestore at most once per hour

const SITE_NAME = 'Blue Mind Freediving';

interface Props {
  searchParams: Promise<Record<string, string | undefined>>;
}

function buildTitle(params: Record<string, string | undefined>): string {
  const country = params.country;
  const waterType = params.waterType;
  const continent = params.continent;

  const typeLabel = waterType && !waterType.includes(',')
    ? waterType.charAt(0).toUpperCase() + waterType.slice(1) + ' '
    : '';

  let core: string;
  if (country && typeLabel) core = `${typeLabel}Freediving Sites in ${country}`;
  else if (country)          core = `Freediving Dive Sites in ${country}`;
  else if (continent && typeLabel) core = `${typeLabel}Freediving Sites in ${continent}`;
  else if (continent)        core = `Freediving Dive Sites in ${continent}`;
  else if (typeLabel)        core = `${typeLabel}Freediving Sites Worldwide`;
  else                       core = 'Freediving Dive Sites Directory';

  return `${core} | ${SITE_NAME}`;
}

function buildDescription(params: Record<string, string | undefined>): string {
  const country = params.country;
  const waterType = params.waterType;
  const continent = params.continent;

  const typeLabel = waterType && !waterType.includes(',') ? waterType + ' ' : '';

  if (country) {
    return `Explore the best ${typeLabel}freediving sites in ${country}. Browse by depth, visibility, water temperature, and season — all in one place.`;
  }
  if (continent) {
    return `Discover ${typeLabel}freediving sites across ${continent}. Compare depth, visibility, water temperature, and best seasons for every location.`;
  }
  if (typeLabel) {
    return `Browse ${typeLabel}freediving sites worldwide. Explore conditions, depth, visibility, and water temperature for every location.`;
  }
  return 'Explore the world\'s best freediving sites. Search by country, depth, visibility, water temperature, and season — a curated directory for freedivers.';
}

function buildKeywords(params: Record<string, string | undefined>): string[] {
  const country = params.country;
  const continent = params.continent;
  const waterType = params.waterType;

  return [
    'freediving sites',
    'freediving directory',
    country  ? `freediving sites ${country.toLowerCase()}`   : 'best freediving spots',
    country  ? `dive sites ${country.toLowerCase()}`         : 'dive sites worldwide',
    continent ? `freediving ${continent.toLowerCase()}`      : 'open water freediving',
    waterType === 'sea'  ? 'ocean freediving sites'          : null,
    waterType === 'lake' ? 'lake freediving sites'           : null,
    'freediving depth visibility',
    'freediving conditions',
  ].filter(Boolean) as string[];
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const title = buildTitle(params);
  const description = buildDescription(params);
  const keywords = buildKeywords(params);

  const canonicalParams = new URLSearchParams();
  if (params.country)   canonicalParams.set('country', params.country);
  if (params.waterType) canonicalParams.set('waterType', params.waterType);
  if (params.continent) canonicalParams.set('continent', params.continent);
  const qs = canonicalParams.toString();
  const canonical = `${BASE_URL}/dive-sites${qs ? `?${qs}` : ''}`;

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      siteName: SITE_NAME,
      images: [{ url: `${BASE_URL}/images/og-image.jpg`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: { canonical },
    robots: { index: true, follow: true },
  };
}

export default async function DiveSitesPage() {
  const sites = await getActiveDiveSites();
  const initialSites = sites.map((s) => ({
    ...s,
    createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : s.createdAt,
    updatedAt: s.updatedAt instanceof Date ? s.updatedAt.toISOString() : s.updatedAt,
  }));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <DiveSiteListingClient initialSites={initialSites as any} />;
}
