export interface Review {
  author_name: string;
  profile_photo_url?: string;
  rating: number;
  text: string;
  time: number; // Unix timestamp
  relative_time_description: string;
}

export interface ReviewsResponse {
  reviews: Review[];
  totalReviewCount: number;
  averageRating: number;
}

export async function fetchReviews(): Promise<ReviewsResponse> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) {
    throw new Error('GOOGLE_PLACES_API_KEY or GOOGLE_PLACE_ID not set in environment');
  }

  const url = `https://places.googleapis.com/v1/places/${placeId}`;
  const res = await fetch(url, {
    headers: {
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'rating,userRatingCount,reviews',
    },
  });

  if (!res.ok) {
    throw new Error(`Places API HTTP error: ${res.status}`);
  }

  const data = await res.json();

  if (data.error) {
    throw new Error(`Places API error: ${data.error.status} — ${data.error.message ?? ''}`);
  }

  const reviews: Review[] = (data.reviews ?? []).map((r: any) => ({
    author_name: r.authorAttribution?.displayName ?? '',
    profile_photo_url: r.authorAttribution?.photoUri ?? '',
    rating: r.rating ?? 0,
    text: r.text?.text ?? '',
    time: r.publishTime ? Math.floor(new Date(r.publishTime).getTime() / 1000) : 0,
    relative_time_description: r.relativePublishTimeDescription ?? '',
  }));

  return {
    reviews,
    totalReviewCount: data.userRatingCount ?? 0,
    averageRating: data.rating ?? 0,
  };
}
