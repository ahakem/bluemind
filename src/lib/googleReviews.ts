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

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating,user_ratings_total&key=${apiKey}`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Places API HTTP error: ${res.status}`);
  }

  const data = await res.json();

  if (data.status !== 'OK') {
    throw new Error(`Places API error: ${data.status} — ${data.error_message ?? ''}`);
  }

  return {
    reviews: data.result.reviews ?? [],
    totalReviewCount: data.result.user_ratings_total ?? 0,
    averageRating: data.result.rating ?? 0,
  };
}
