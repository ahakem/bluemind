import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getActiveDiveSites } from '@/lib/diveSiteService';
import { lookupCountry } from '@/data/countries';
import { getContinent } from '@/data/continents';
import CountryListingClient from './CountryListingClient';

export const revalidate = 86400;

const BASE_URL = 'https://bluemindfreediving.nl';

function countryToSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

function flagEmoji(code: string) {
  return code.toUpperCase().replace(/./g, (c) =>
    String.fromCodePoint(c.charCodeAt(0) + 127397)
  );
}

interface Props {
  params: Promise<{ country: string }>;
}

export async function generateStaticParams() {
  const sites = await getActiveDiveSites();
  const countries = new Set(sites.map((s) => countryToSlug(s.country)));
  return [...countries].map((country) => ({ country }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country: slug } = await params;
  const sites = await getActiveDiveSites();
  const countrySites = sites.filter((s) => countryToSlug(s.country) === slug);
  if (!countrySites.length) return { title: 'Not Found' };

  const countryName = countrySites[0].country;
  const c = lookupCountry(countryName);
  const flag = c ? flagEmoji(c.code) : '';
  const withDepth = countrySites.filter((s) => s.maxDepth > 0);
  const avgDepth = withDepth.length
    ? Math.round(withDepth.reduce((a, s) => a + s.maxDepth, 0) / withDepth.length)
    : null;

  const title = `${flag} Freediving in ${countryName} — ${countrySites.length} Dive Sites | Blue Mind`;
  const description = `Explore ${countrySites.length} freediving dive sites in ${countryName}.${avgDepth ? ` Average depth ${avgDepth}m.` : ''} Discover the best spots with depth, visibility, and water temperature data.`;

  return {
    title,
    description,
    keywords: [`freediving ${countryName}`, `dive sites ${countryName}`, `${countryName} freediving spots`, 'freediving', 'dive sites'],
    openGraph: {
      title: `Freediving in ${countryName} — ${countrySites.length} Sites`,
      description,
      url: `${BASE_URL}/dive-sites/country/${slug}`,
    },
    alternates: { canonical: `${BASE_URL}/dive-sites/country/${slug}` },
    robots: { index: true, follow: true },
  };
}

const MIN_CITY_SITES = 3;

function cityToSlug(location: string) {
  return location.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

function isValidCityLocation(location: string): boolean {
  if (!location || location.length > 60) return false;
  const l = location.toLowerCase();
  return !l.includes('download') && !l.includes('free app') && !l.includes('our app') && !l.includes('click here') && !location.includes('!');
}

export default async function CountryPage({ params }: Props) {
  const { country: slug } = await params;
  const allSites = await getActiveDiveSites();
  const sites = allSites.filter((s) => countryToSlug(s.country) === slug);
  if (!sites.length) notFound();

  const countryName = sites[0].country;
  const countryData = lookupCountry(countryName);
  const continent = countryData ? (getContinent(countryData.code) ?? 'World') : 'World';

  // Nearby countries — same continent, sorted by site count
  const continentCountries = new Map<string, number>();
  allSites.forEach((s) => {
    const c = lookupCountry(s.country);
    if (!c) return;
    if (getContinent(c.code) === continent && s.country !== countryName) {
      continentCountries.set(s.country, (continentCountries.get(s.country) ?? 0) + 1);
    }
  });
  const nearbySlugs = [...continentCountries.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, slug: countryToSlug(name), count }));

  // Cities within this country that have enough sites
  const cityCounts = new Map<string, number>();
  sites.filter((s) => isValidCityLocation(s.location)).forEach((s) => {
    const cs = cityToSlug(s.location);
    cityCounts.set(cs, (cityCounts.get(cs) ?? 0) + 1);
  });
  const citySlugs = [...cityCounts.entries()]
    .filter(([, count]) => count >= MIN_CITY_SITES)
    .sort((a, b) => b[1] - a[1])
    .map(([cs, count]) => {
      const name = sites.find((s) => cityToSlug(s.location) === cs)?.location ?? cs;
      return { name, slug: cs, count };
    });

  return (
    <CountryListingClient
      countrySlug={slug}
      countryName={countryName}
      countryCode={countryData?.code ?? ''}
      continent={continent}
      sites={sites}
      nearbySlugs={nearbySlugs}
      citySlugs={citySlugs}
    />
  );
}
