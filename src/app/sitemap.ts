import type { MetadataRoute } from 'next';
import { getActiveDiveSites } from '@/lib/diveSiteService';
import { getPublishedPosts } from '@/lib/blogService';
import { CONTINENTS } from '@/data/continents';

// Revalidate daily — picks up newly published dive sites and new countries
export const revalidate = 86400;

const BASE_URL = 'https://bluemindfreediving.nl';

const STATIC_PAGES: MetadataRoute.Sitemap = [
  { url: BASE_URL,                                   changeFrequency: 'weekly',  priority: 1.0 },
  { url: `${BASE_URL}/training`,                     changeFrequency: 'monthly', priority: 0.9 },
  { url: `${BASE_URL}/membership`,                   changeFrequency: 'monthly', priority: 0.9 },
  { url: `${BASE_URL}/dive-sites`,                   changeFrequency: 'daily',   priority: 0.9 },
  { url: `${BASE_URL}/about`,                        changeFrequency: 'monthly', priority: 0.8 },
  { url: `${BASE_URL}/schedule`,                     changeFrequency: 'weekly',  priority: 0.8 },
  { url: `${BASE_URL}/blog`,                         changeFrequency: 'weekly',  priority: 0.8 },
  { url: `${BASE_URL}/community`,                    changeFrequency: 'monthly', priority: 0.7 },
  { url: `${BASE_URL}/gallery`,                      changeFrequency: 'weekly',  priority: 0.7 },
  { url: `${BASE_URL}/contact`,                      changeFrequency: 'monthly', priority: 0.7 },
  { url: `${BASE_URL}/judging`,                      changeFrequency: 'monthly', priority: 0.7 },
  { url: `${BASE_URL}/judging/scoring`,              changeFrequency: 'monthly', priority: 0.6 },
  { url: `${BASE_URL}/judging/pool-distance`,        changeFrequency: 'monthly', priority: 0.6 },
  { url: `${BASE_URL}/documents/privacy-policy`,     changeFrequency: 'yearly',  priority: 0.3 },
  { url: `${BASE_URL}/documents/terms-of-service`,   changeFrequency: 'yearly',  priority: 0.3 },
];

function listingUrl(params: Record<string, string>): string {
  const qs = new URLSearchParams(params).toString();
  return `${BASE_URL}/dive-sites?${qs}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticEntries = STATIC_PAGES.map((p) => ({ ...p, lastModified: now }));

  // Continent filter pages — one per continent
  const continentEntries: MetadataRoute.Sitemap = CONTINENTS.map((c) => ({
    url: listingUrl({ continent: c }),
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Water type pages
  const waterTypeEntries: MetadataRoute.Sitemap = ['sea', 'lake'].map((wt) => ({
    url: listingUrl({ waterType: wt }),
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  let countryEntries: MetadataRoute.Sitemap = [];
  let siteEntries: MetadataRoute.Sitemap = [];
  let blogEntries: MetadataRoute.Sitemap = [];

  try {
    const [sites, posts] = await Promise.all([getActiveDiveSites(), getPublishedPosts()]);

    // Unique countries with at least one site
    const countries = [...new Set(sites.map((s) => s.country).filter(Boolean))].sort();
    countryEntries = countries.map((country) => ({
      url: listingUrl({ country }),
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    // Individual dive site pages
    siteEntries = sites.map((site) => ({
      url: `${BASE_URL}/dive-sites/${site.slug}`,
      lastModified: site.updatedAt instanceof Date ? site.updatedAt : new Date(site.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

    // Published blog posts
    blogEntries = posts.map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: post.updatedAt instanceof Date ? post.updatedAt : new Date(post.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));
  } catch {
    // Firestore unavailable — sitemap returns static + filter pages only
  }

  return [
    ...staticEntries,
    ...continentEntries,
    ...waterTypeEntries,
    ...countryEntries,
    ...siteEntries,
    ...blogEntries,
  ];
}
