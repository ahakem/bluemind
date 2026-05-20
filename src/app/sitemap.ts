import type { MetadataRoute } from 'next';
import { getActiveDiveSites } from '@/lib/diveSiteService';

// Revalidate daily — picks up newly published dive sites without a redeploy
export const revalidate = 86400;

const BASE_URL = 'https://bluemindfreediving.nl';

const STATIC_PAGES: MetadataRoute.Sitemap = [
  { url: BASE_URL,                                   changeFrequency: 'weekly',  priority: 1.0 },
  { url: `${BASE_URL}/training`,                     changeFrequency: 'monthly', priority: 0.9 },
  { url: `${BASE_URL}/membership`,                   changeFrequency: 'monthly', priority: 0.9 },
  { url: `${BASE_URL}/dive-sites`,                   changeFrequency: 'daily',   priority: 0.9 },
  { url: `${BASE_URL}/about`,                        changeFrequency: 'monthly', priority: 0.8 },
  { url: `${BASE_URL}/schedule`,                     changeFrequency: 'weekly',  priority: 0.8 },
  { url: `${BASE_URL}/community`,                    changeFrequency: 'monthly', priority: 0.7 },
  { url: `${BASE_URL}/gallery`,                      changeFrequency: 'weekly',  priority: 0.7 },
  { url: `${BASE_URL}/contact`,                      changeFrequency: 'monthly', priority: 0.7 },
  { url: `${BASE_URL}/judging`,                      changeFrequency: 'monthly', priority: 0.7 },
  { url: `${BASE_URL}/judging/scoring`,              changeFrequency: 'monthly', priority: 0.6 },
  { url: `${BASE_URL}/judging/pool-distance`,        changeFrequency: 'monthly', priority: 0.6 },
  { url: `${BASE_URL}/documents/privacy-policy`,     changeFrequency: 'yearly',  priority: 0.3 },
  { url: `${BASE_URL}/documents/terms-of-service`,   changeFrequency: 'yearly',  priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Stamp static pages with today's date
  const staticEntries = STATIC_PAGES.map((p) => ({ ...p, lastModified: now }));

  // Fetch all published dive sites from Firestore
  let siteEntries: MetadataRoute.Sitemap = [];
  try {
    const sites = await getActiveDiveSites();
    siteEntries = sites.map((site) => ({
      url: `${BASE_URL}/dive-sites/${site.slug}`,
      lastModified: site.updatedAt instanceof Date ? site.updatedAt : new Date(site.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));
  } catch {
    // Firestore unavailable — sitemap will omit dive sites rather than fail
  }

  return [...staticEntries, ...siteEntries];
}
