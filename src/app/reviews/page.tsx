import { BASE_URL } from '@/lib/siteConfig';
import type { Metadata } from 'next';
import Script from 'next/script';
import { fetchReviews, type Review } from '@/lib/googleReviews';
import ReviewsSection from '@/sections/Reviews';

export const dynamic = 'force-dynamic';


export const metadata: Metadata = {
  title: 'Reviews | Blue Mind Freediving Amsterdam',
  description: 'See what our members say about Blue Mind Freediving Amsterdam. Rated 5 stars by our freediving community. Read real Google reviews and share your experience.',
  keywords: [
    'blue mind freediving reviews',
    'freediving amsterdam reviews',
    'freediving club amsterdam testimonials',
    'blue mind freediving testimonials',
    'amsterdam freediving google reviews',
  ],
  openGraph: {
    title: 'Reviews | Blue Mind Freediving Amsterdam',
    description: 'Rated 5 stars by our freediving community. Read real Google reviews from Blue Mind Freediving Amsterdam members.',
    url: `${BASE_URL}/reviews`,
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/images/hero.webp`,
        width: 1200,
        height: 630,
        alt: 'Blue Mind Freediving Amsterdam - Community Reviews',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Reviews | Blue Mind Freediving Amsterdam',
    description: 'Rated 5 stars by our freediving community. Read real Google reviews.',
    images: [`${BASE_URL}/images/hero.webp`],
  },
  alternates: {
    canonical: `${BASE_URL}/reviews`,
  },
};

function buildJsonLd(reviews: Review[], averageRating: number, totalReviewCount: number) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${BASE_URL}/#localbusiness`,
    name: 'Blue Mind Freediving Amsterdam',
    url: BASE_URL,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: averageRating.toFixed(1),
      reviewCount: totalReviewCount,
      bestRating: '5',
      worstRating: '1',
    },
    review: reviews.filter(r => r.text?.trim()).map(r => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: r.author_name,
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: r.rating,
        bestRating: '5',
        worstRating: '1',
      },
      reviewBody: r.text,
      datePublished: new Date(r.time * 1000).toISOString().split('T')[0],
    })),
  };
}

export default async function ReviewsPage() {
  let reviews: Review[] = [];
  let totalReviewCount = 0;
  let averageRating = 0;
  let error: string | null = null;

  try {
    ({ reviews, totalReviewCount, averageRating } = await fetchReviews());
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load reviews';
  }

  const jsonLd = buildJsonLd(reviews, averageRating, totalReviewCount);

  return (
    <>
      <Script
        id="reviews-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ReviewsSection
        reviews={reviews}
        totalReviewCount={totalReviewCount}
        averageRating={averageRating}
        error={error}
      />
    </>
  );
}
