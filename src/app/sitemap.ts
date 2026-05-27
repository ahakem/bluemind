import { BASE_URL } from '@/lib/siteConfig';
import type { MetadataRoute } from 'next';
import { getPublishedPosts } from '@/lib/blogService';

export const revalidate = 86400;

const STATIC_PAGES: MetadataRoute.Sitemap = [
  { url: BASE_URL,                        changeFrequency: 'daily',   priority: 1.0 },
  { url: `${BASE_URL}/blog`,              changeFrequency: 'weekly',  priority: 0.8 },
  { url: `${BASE_URL}/about`,             changeFrequency: 'monthly', priority: 0.7 },
  { url: `${BASE_URL}/privacy-policy`,    changeFrequency: 'yearly',  priority: 0.3 },
  { url: `${BASE_URL}/terms-of-service`,  changeFrequency: 'yearly',  priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticEntries = STATIC_PAGES.map((p) => ({ ...p, lastModified: now }));

  let blogEntries: MetadataRoute.Sitemap = [];

  try {
    const posts = await getPublishedPosts();
    blogEntries = posts.map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: post.updatedAt instanceof Date ? post.updatedAt : new Date(post.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));
  } catch {
    // Firestore unavailable
  }

  return [...staticEntries, ...blogEntries];
}
