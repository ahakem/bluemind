/**
 * Enriches dive sites with Google Places data:
 * - googleRating (e.g. 4.6)
 * - googleRatingsTotal (e.g. 1240)
 * - googlePlaceId (for future use)
 *
 * Uses Places Text Search API to find the place by name + location.
 */

import axios from 'axios';
import { initFirestore } from './firestore';
import { config } from './config';
import { logger } from './logger';

const API_KEY = process.env.GOOGLE_MAPS_API_KEY ?? '';
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface PlacesResult {
  placeId: string;
  rating?: number;
  ratingsTotal?: number;
  name: string;
}

async function searchPlace(query: string, lat: number, lng: number): Promise<PlacesResult | null> {
  try {
    const res = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
      params: {
        query,
        location: `${lat},${lng}`,
        radius: 5000,
        key: API_KEY,
      },
      timeout: 10_000,
    });
    const results = res.data.results as Array<{
      place_id: string;
      name: string;
      rating?: number;
      user_ratings_total?: number;
    }>;
    if (!results?.length) return null;
    const r = results[0];
    return {
      placeId: r.place_id,
      name: r.name,
      rating: r.rating,
      ratingsTotal: r.user_ratings_total,
    };
  } catch {
    return null;
  }
}

const main = async () => {
  if (!API_KEY) {
    logger.error('GOOGLE_MAPS_API_KEY not set');
    process.exit(1);
  }

  const db = initFirestore();
  const snap = await db.collection(config.firestore.collection).where('status', '==', 'active').get();

  // Only process sites with valid coordinates and not yet enriched
  const toEnrich = snap.docs.filter((d) => {
    const data = d.data();
    const c = data.coordinates as { lat: number; lng: number } | null;
    if (!c?.lat || !c?.lng) return false;
    if (data.googlePlaceId) return false; // already done
    return true;
  });

  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const limit = args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1]) : toEnrich.length;
  const limited = toEnrich.slice(0, limit);

  logger.info({ total: toEnrich.length, processing: limited.length, dryRun }, 'Starting');

  let enriched = 0;
  let noResult = 0;

  for (let i = 0; i < limited.length; i++) {
    const doc = limited[i];
    const data = doc.data();
    const name = data.name as string;
    const { lat, lng } = data.coordinates as { lat: number; lng: number };

    logger.info({ progress: `${i + 1}/${limited.length}`, name }, 'Searching');

    const result = await searchPlace(name, lat, lng);

    if (!result) {
      logger.warn({ name }, 'No result found');
      noResult++;
    } else {
      // Simple similarity check: at least one word from site name appears in found name
      const siteWords = name.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
      const foundLower = result.name.toLowerCase();
      const isRelevant = siteWords.some((w) => foundLower.includes(w));

      if (!isRelevant) {
        logger.warn({ name, found: result.name }, 'Match looks wrong — skipping');
        noResult++;
      } else {
        logger.info({ name, rating: result.rating, total: result.ratingsTotal, found: result.name }, 'Found');
        if (!dryRun) {
          await doc.ref.update({
            googleRating: result.rating ?? null,
            googleRatingsTotal: result.ratingsTotal ?? 0,
            googlePlaceId: result.placeId,
          });
        }
        enriched++;
      }
    }

    await sleep(250);
  }

  logger.info({ enriched, noResult, dryRun }, 'Done');
  process.exit(0);
};

main().catch((err) => {
  logger.fatal({ err }, 'enrich-google-places failed');
  process.exit(1);
});
