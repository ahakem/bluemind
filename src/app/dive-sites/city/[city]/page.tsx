import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getActiveDiveSites } from '@/lib/diveSiteService';
import { lookupCountry } from '@/data/countries';
import { getContinent } from '@/data/continents';
import CityListingClient from './CityListingClient';

export const revalidate = 86400;

const BASE_URL = 'https://bluemindfreediving.nl';
const MIN_SITES = 3;

function cityToSlug(location: string) {
  return location.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

function isValidCityLocation(location: string): boolean {
  if (!location || location.length > 60) return false;
  const l = location.toLowerCase();
  return !l.includes('download') && !l.includes('free app') && !l.includes('our app') && !l.includes('click here') && !location.includes('!');
}

function countryToSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

function flagEmoji(code: string) {
  return code.toUpperCase().replace(/./g, (c) =>
    String.fromCodePoint(c.charCodeAt(0) + 127397)
  );
}

interface Props {
  params: Promise<{ city: string }>;
}

export async function generateStaticParams() {
  const sites = await getActiveDiveSites();
  const counts = new Map<string, number>();
  sites.filter((s) => isValidCityLocation(s.location)).forEach((s) => {
    const slug = cityToSlug(s.location);
    counts.set(slug, (counts.get(slug) ?? 0) + 1);
  });
  return [...counts.entries()]
    .filter(([, count]) => count >= MIN_SITES)
    .map(([city]) => ({ city }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: slug } = await params;
  const sites = await getActiveDiveSites();
  const citySites = sites.filter((s) => cityToSlug(s.location) === slug);
  if (citySites.length < MIN_SITES) return { title: 'Not Found' };

  const cityName = citySites[0].location;
  const countryName = citySites[0].country;
  const c = lookupCountry(countryName);
  const flag = c ? flagEmoji(c.code) : '';
  const withDepth = citySites.filter((s) => s.maxDepth > 0);
  const avgDepth = withDepth.length
    ? Math.round(withDepth.reduce((a, s) => a + s.maxDepth, 0) / withDepth.length)
    : null;

  const title = `${flag} Freediving in ${cityName}, ${countryName} — ${citySites.length} Dive Sites | Blue Mind`;
  const description = `Explore ${citySites.length} freediving dive sites near ${cityName}, ${countryName}.${avgDepth ? ` Average depth ${avgDepth}m.` : ''} Find the best local spots with depth, visibility, and water temperature data.`;

  return {
    title,
    description,
    keywords: [
      `freediving ${cityName}`,
      `dive sites ${cityName}`,
      `${cityName} freediving`,
      `freediving ${countryName}`,
      'freediving',
      'dive sites',
    ],
    openGraph: {
      title: `Freediving in ${cityName}, ${countryName} — ${citySites.length} Sites`,
      description,
      url: `${BASE_URL}/dive-sites/city/${slug}`,
    },
    alternates: { canonical: `${BASE_URL}/dive-sites/city/${slug}` },
    robots: { index: true, follow: true },
  };
}

export default async function CityPage({ params }: Props) {
  const { city: slug } = await params;
  const allSites = await getActiveDiveSites();
  const sites = allSites.filter((s) => cityToSlug(s.location) === slug);
  if (sites.length < MIN_SITES) notFound();

  const cityName = sites[0].location;
  const countryName = sites[0].country;
  const countryData = lookupCountry(countryName);
  const continent = countryData ? (getContinent(countryData.code) ?? 'World') : 'World';
  const countrySlug = countryToSlug(countryName);

  // Other cities in same country with enough sites
  const cityCountsInCountry = new Map<string, number>();
  allSites
    .filter((s) => s.country === countryName && cityToSlug(s.location) !== slug && isValidCityLocation(s.location))
    .forEach((s) => {
      const cs = cityToSlug(s.location);
      cityCountsInCountry.set(cs, (cityCountsInCountry.get(cs) ?? 0) + 1);
    });
  const nearbyCities = [...cityCountsInCountry.entries()]
    .filter(([, count]) => count >= MIN_SITES)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([cs, count]) => {
      const name = allSites.find((s) => s.country === countryName && cityToSlug(s.location) === cs)?.location ?? cs;
      return { name, slug: cs, count };
    });

  return (
    <CityListingClient
      citySlug={slug}
      cityName={cityName}
      countryName={countryName}
      countryCode={countryData?.code ?? ''}
      countrySlug={countrySlug}
      continent={continent}
      sites={sites}
      nearbyCities={nearbyCities}
    />
  );
}
