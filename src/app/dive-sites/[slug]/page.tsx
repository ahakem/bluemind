import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getDiveSiteBySlug, getAllDiveSites } from '@/lib/diveSiteService';
import DiveSiteDetailClient from './DiveSiteDetailClient';

const BASE_URL = 'https://bluemindfreediving.nl';
const DEFAULT_OG_IMAGE = `${BASE_URL}/images/og-image.jpg`;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const sites = await getAllDiveSites();
  return sites.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const site = await getDiveSiteBySlug(slug);
  if (!site) return { title: 'Site Not Found' };

  const locationParts = [site.location, site.country].filter(Boolean).join(', ');
  const pageTitle = `${site.name} Freediving Site${locationParts ? ` — ${locationParts}` : ''}`;
  const shortTitle = `${site.name} | Blue Mind Dive Sites`;

  // Build description from site data — prefer curated description, fall back to data summary
  let description: string;
  if (site.description && site.description.length > 40) {
    description = site.description.slice(0, 155).trimEnd();
    if (site.description.length > 155) description += '…';
  } else {
    const depthStr = site.maxDepth ? ` Depths to ${site.maxDepth}m.` : '';
    const visStr = site.visibility?.min != null
      ? ` Visibility ${site.visibility.min}–${site.visibility.max}m.`
      : '';
    const seasonStr = site.bestSeasons?.length
      ? ` Best in ${site.bestSeasons.slice(0, 2).join(' & ')}.`
      : '';
    description = `Freediving site${locationParts ? ` in ${locationParts}` : ''}.${depthStr}${visStr}${seasonStr}`.slice(0, 160);
  }

  const tags = site.tags ?? [];
  const keywords = [
    `${site.name.toLowerCase()} freediving`,
    site.country ? `freediving ${site.country.toLowerCase()}` : null,
    site.location ? `dive site ${site.location.toLowerCase()}` : null,
    `${site.waterType} freediving`,
    ...tags.slice(0, 6).map((t) => `${t.toLowerCase()} diving`),
    'freediving site',
    'open water freediving',
    'dive site depth visibility',
  ].filter(Boolean) as string[];

  const url = `${BASE_URL}/dive-sites/${site.slug}`;
  const ogImage = site.photos?.[0] || DEFAULT_OG_IMAGE;

  return {
    title: shortTitle,
    description,
    keywords,
    openGraph: {
      title: pageTitle,
      description,
      url,
      type: 'website',
      siteName: 'Blue Mind Freediving',
      images: [{ url: ogImage, width: 1200, height: 630, alt: site.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: shortTitle,
      description,
      images: [ogImage],
    },
    alternates: { canonical: url },
    robots: { index: true, follow: true },
  };
}

export default async function DiveSiteDetailPage({ params }: Props) {
  const { slug } = await params;
  const site = await getDiveSiteBySlug(slug);
  if (!site) notFound();

  const hasCoords = !!(site.coordinates?.lat && site.coordinates?.lng);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: site.name,
    ...(site.description ? { description: site.description } : {}),
    url: `${BASE_URL}/dive-sites/${site.slug}`,
    ...(hasCoords
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: site.coordinates.lat,
            longitude: site.coordinates.lng,
          },
        }
      : {}),
    address: {
      '@type': 'PostalAddress',
      ...(site.location ? { addressLocality: site.location } : {}),
      addressCountry: site.country,
    },
    ...(site.tags?.length ? { touristType: site.tags } : {}),
    ...(site.bestSeasons?.length
      ? { availableLanguage: undefined, publicAccess: true }
      : {}),
    isAccessibleForFree: true,
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'maxDepth', value: `${site.maxDepth}m`, unitCode: 'MTR' },
      { '@type': 'PropertyValue', name: 'waterType', value: site.waterType },
      ...(site.visibility
        ? [{ '@type': 'PropertyValue', name: 'visibility', value: `${site.visibility.min}–${site.visibility.max}m` }]
        : []),
    ],
  };

  const serializable = {
    ...site,
    createdAt: site.createdAt.toISOString(),
    updatedAt: site.updatedAt.toISOString(),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DiveSiteDetailClient site={serializable as unknown as typeof site} />
    </>
  );
}
