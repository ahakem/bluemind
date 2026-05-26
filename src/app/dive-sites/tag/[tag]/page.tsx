import { BASE_URL } from '@/lib/siteConfig';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getActiveDiveSites } from '@/lib/diveSiteService';
import TagListingClient from './TagListingClient';

export const revalidate = 86400;


function tagToSlug(tag: string) {
  return tag.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

function capitalize(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

interface Props {
  params: Promise<{ tag: string }>;
}

export async function generateStaticParams() {
  const sites = await getActiveDiveSites();
  const tags = new Set<string>();
  sites.forEach((s) => s.tags.forEach((t) => tags.add(tagToSlug(t))));
  return [...tags].map((tag) => ({ tag }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  const label = capitalize(tag.replace(/-/g, ' '));
  const sites = await getActiveDiveSites();
  const tagged = sites.filter((s) => s.tags.some((t) => tagToSlug(t) === tag));
  if (!tagged.length) return { title: 'Not Found' };

  const countries = [...new Set(tagged.map((s) => s.country))].slice(0, 3).join(', ');

  return {
    title: `${label} Freediving Sites | Blue Mind`,
    description: `Explore ${tagged.length} freediving dive sites tagged "${label}" worldwide. Sites in ${countries} and more.`,
    keywords: [label, 'freediving', 'dive sites', `${label} diving`, 'scuba diving', ...tagged.slice(0, 3).map((s) => s.name)],
    openGraph: {
      title: `${label} Freediving Sites`,
      description: `${tagged.length} sites tagged "${label}" — explore them on Blue Mind`,
      url: `${BASE_URL}/dive-sites/tag/${tag}`,
    },
    alternates: { canonical: `${BASE_URL}/dive-sites/tag/${tag}` },
    robots: { index: true, follow: true },
  };
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const sites = await getActiveDiveSites();
  const tagged = sites.filter((s) => s.tags.some((t) => tagToSlug(t) === tag));
  if (!tagged.length) notFound();

  const tagLabel = capitalize(tag.replace(/-/g, ' '));
  return <TagListingClient tag={tag} tagLabel={tagLabel} sites={tagged} />;
}
