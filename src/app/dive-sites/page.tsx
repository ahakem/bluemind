import type { Metadata } from 'next';
import DiveSiteListingClient from './DiveSiteListingClient';

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

  if (country && typeLabel) return `${typeLabel}Freediving Sites in ${country}`;
  if (country) return `Freediving Sites in ${country}`;
  if (continent && typeLabel) return `${typeLabel}Freediving Sites in ${continent}`;
  if (continent) return `Freediving Sites in ${continent}`;
  if (typeLabel) return `${typeLabel}Freediving Sites`;
  return 'Freediving Dive Sites Directory';
}

function buildDescription(params: Record<string, string | undefined>): string {
  const country = params.country;
  const waterType = params.waterType;
  const continent = params.continent;

  const typeLabel = waterType && !waterType.includes(',')
    ? waterType + ' '
    : '';

  if (country) {
    return `Explore the best ${typeLabel}freediving sites in ${country}. Depths, visibility, water temperature, and conditions for every site.`;
  }
  if (continent) {
    return `Discover ${typeLabel}freediving sites across ${continent}. Find dive spots with depth, visibility, and water temperature data.`;
  }
  if (typeLabel) {
    return `Browse ${typeLabel}freediving sites worldwide. Explore conditions, depth, visibility and water temperature for every location.`;
  }
  return 'Explore freediving sites worldwide. Find depth, visibility, water temperature, and conditions for hundreds of locations across the globe.';
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const title = buildTitle(params);
  const description = buildDescription(params);
  const country = params.country;
  const continent = params.continent;

  const canonicalParams = new URLSearchParams();
  if (params.country) canonicalParams.set('country', params.country);
  if (params.waterType) canonicalParams.set('waterType', params.waterType);
  if (params.continent) canonicalParams.set('continent', params.continent);
  const qs = canonicalParams.toString();
  const canonical = `https://bluemindfreediving.nl/dive-sites${qs ? `?${qs}` : ''}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: { canonical },
    keywords: [
      'freediving sites',
      country ? `freediving ${country.toLowerCase()}` : 'freediving locations',
      continent ? `freediving ${continent.toLowerCase()}` : 'dive sites worldwide',
      'freediving depth',
      'freediving visibility',
      'open water freediving',
    ],
  };
}

export default async function DiveSitesPage() {
  return <DiveSiteListingClient />;
}
