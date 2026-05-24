/**
 * verify-dive-sites.ts
 *
 * Reads every document from the `diveSites` Firestore collection,
 * queries Google Places API (New) for nearby activity, analyses up to 5
 * recent reviews, and writes a `verification` map back to each document.
 *
 * Usage:
 *   npx tsx scripts/verify-dive-sites.ts
 *
 * Required env vars (create a .env.local or export before running):
 *   GOOGLE_PLACES_API_KEY   — Google Cloud API key with Places API (New) enabled
 *   FIREBASE_SERVICE_ACCOUNT — Absolute path to your Firebase service account JSON
 *                              e.g. /home/user/bluemind-sa.json
 *
 * Install once:
 *   npm install --save-dev firebase-admin tsx dotenv
 */

import 'dotenv/config';
import { Firestore } from '@google-cloud/firestore';
import * as fs from 'fs';
import * as path from 'path';

// ─── Config ──────────────────────────────────────────────────────────────────

const PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY ?? '';
const SERVICE_ACCOUNT_PATH = process.env.FIREBASE_SERVICE_ACCOUNT ?? '';
const DATABASE_ID = process.env.FIREBASE_DATABASE_ID ?? '(default)';
const COLLECTION = 'diveSites';
const CONCURRENCY = 2;      // parallel sites processed at once
const SEARCH_RADIUS_M = 2500;
const MAX_REVIEWS = 5;
const REQUEST_DELAY_MS = 250; // ~4 req/s per worker → ~8 req/s total (well under 600/min limit)
const MAX_RETRIES = 3;

// ─── Types ────────────────────────────────────────────────────────────────────

type StatusTag = 'KEEP' | 'REVIEW_NEGATIVE' | 'NO_DATA';

interface Verification {
  statusTag: StatusTag;
  reviewedAt: string;
  positiveMatchCount: number;
  negativeMatchCount: number;
  matchedPlaceId: string | null;
}

interface PlacesResult {
  id?: string;
  displayName?: { text: string };
  userRatingCount?: number;
  reviews?: Array<{ text?: { text: string }; originalText?: { text: string } }>;
}

// ─── Keyword banks ────────────────────────────────────────────────────────────

const POSITIVE_TERMS = [
  'great depth',
  'clear water',
  'good visibility',
  'easy shore entry',
  'nice reef',
  'amazing snorkeling',
  'great snorkeling',
  'beautiful coral',
  'crystal clear',
  'calm water',
  'excellent visibility',
  'great for diving',
  'perfect for freediving',
];

const NEGATIVE_TERMS = [
  'zero visibility',
  'no access',
  'private property',
  'fenced off',
  'scuba only',
  'dangerous current',
  'closed permanently',
  'no entry',
  'restricted area',
  'sewage',
  'polluted',
  'garbage',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ─── Firebase init ────────────────────────────────────────────────────────────

function initFirebase(): Firestore {
  if (!SERVICE_ACCOUNT_PATH) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT env var is not set.\n' +
      'Export the path to your service account JSON before running:\n' +
      '  export FIREBASE_SERVICE_ACCOUNT=/path/to/serviceAccount.json'
    );
  }

  const resolved = path.resolve(SERVICE_ACCOUNT_PATH);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Service account file not found: ${resolved}`);
  }

  const sa = JSON.parse(fs.readFileSync(resolved, 'utf8'));

  console.log(`   Project    : ${sa.project_id}`);
  console.log(`   Database   : ${DATABASE_ID}`);

  return new Firestore({
    projectId: sa.project_id,
    databaseId: DATABASE_ID,
    credentials: {
      client_email: sa.client_email,
      private_key: sa.private_key,
    },
  });
}

// ─── Google Places (New) ──────────────────────────────────────────────────────

async function fetchNearbyPlaces(
  lat: number,
  lng: number,
  siteName: string
): Promise<PlacesResult | null> {
  if (!PLACES_API_KEY) {
    throw new Error('GOOGLE_PLACES_API_KEY env var is not set.');
  }

  const body = {
    includedTypes: ['tourist_attraction', 'park', 'beach', 'marina'],
    maxResultCount: 5,
    locationRestriction: {
      circle: {
        center: { latitude: lat, longitude: lng },
        radius: SEARCH_RADIUS_M,
      },
    },
  };

  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      const backoff = Math.min(1000 * 2 ** attempt, 16000);
      await sleep(backoff);
    }

    const res = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': PLACES_API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.userRatingCount,places.reviews',
      },
      body: JSON.stringify(body),
    });

    if (res.status === 429) {
      lastError = new Error(`Places API 429 — rate limited (attempt ${attempt + 1}/${MAX_RETRIES + 1})`);
      console.warn(`  ⏳ Rate limited for "${siteName}", retrying in ${Math.min(1000 * 2 ** (attempt + 1), 16000) / 1000}s…`);
      continue;
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Places API error ${res.status}: ${text}`);
    }

    await sleep(REQUEST_DELAY_MS);

    const data = (await res.json()) as { places?: PlacesResult[] };
    if (!data.places?.length) return null;

    // Prefer result whose name loosely matches the site name
    const nameLower = siteName.toLowerCase();
    const match =
      data.places.find((p) =>
        p.displayName?.text.toLowerCase().includes(nameLower) ||
        nameLower.includes(p.displayName?.text.toLowerCase() ?? '')
      ) ?? data.places[0];

    return match;
  }

  throw lastError ?? new Error('Max retries exceeded');
}

// ─── Review analysis ──────────────────────────────────────────────────────────

function analyseReviews(place: PlacesResult | null): {
  statusTag: StatusTag;
  positiveMatchCount: number;
  negativeMatchCount: number;
  matchedPlaceId: string | null;
} {
  if (!place) {
    return { statusTag: 'NO_DATA', positiveMatchCount: 0, negativeMatchCount: 0, matchedPlaceId: null };
  }

  const reviews = (place.reviews ?? []).slice(0, MAX_REVIEWS);
  const allText = reviews
    .map((r) => (r.text?.text ?? r.originalText?.text ?? '').toLowerCase())
    .join(' ');

  const positiveMatchCount = POSITIVE_TERMS.filter((t) => allText.includes(t)).length;
  const negativeMatchCount = NEGATIVE_TERMS.filter((t) => allText.includes(t)).length;

  let statusTag: StatusTag;
  if (negativeMatchCount > 0 && negativeMatchCount >= positiveMatchCount) {
    statusTag = 'REVIEW_NEGATIVE';
  } else if (positiveMatchCount > 0) {
    statusTag = 'KEEP';
  } else {
    statusTag = 'NO_DATA';
  }

  return {
    statusTag,
    positiveMatchCount,
    negativeMatchCount,
    matchedPlaceId: place.id ?? null,
  };
}

// ─── Process one site ─────────────────────────────────────────────────────────

const SKIP_VERIFIED = process.argv.includes('--skip-verified');

async function processSite(
  db: Firestore,
  docSnap: FirebaseFirestore.QueryDocumentSnapshot
): Promise<void> {
  const data = docSnap.data();
  const id = docSnap.id;
  const name: string = data.name ?? 'Unknown';

  if (SKIP_VERIFIED && data.verification?.statusTag) {
    console.log(`⏭  Skipping "${name}" — already verified (${data.verification.statusTag})`);
    return;
  }

  // Support both { lat, lng } and { latitude, longitude }
  const coords = data.coordinates as { lat?: number; lng?: number; latitude?: number; longitude?: number } | undefined;
  const lat = coords?.lat ?? coords?.latitude;
  const lng = coords?.lng ?? coords?.longitude;

  if (!lat || !lng) {
    console.warn(`⚠  Skipping "${name}" (${id}) — missing coordinates`);
    return;
  }

  try {
    const place = await fetchNearbyPlaces(lat, lng, name);
    const { statusTag, positiveMatchCount, negativeMatchCount, matchedPlaceId } = analyseReviews(place);

    const verification: Verification = {
      statusTag,
      reviewedAt: new Date().toISOString(),
      positiveMatchCount,
      negativeMatchCount,
      matchedPlaceId,
    };

    await db.collection(COLLECTION).doc(id).update({ verification });

    const icon = statusTag === 'KEEP' ? '✅' : statusTag === 'REVIEW_NEGATIVE' ? '⚠️ ' : '❔';
    console.log(
      `${icon} ${name.padEnd(40)} → ${statusTag.padEnd(16)} ` +
      `+${positiveMatchCount} / -${negativeMatchCount}` +
      (matchedPlaceId ? ` [${matchedPlaceId}]` : '')
    );
  } catch (err) {
    console.error(`❌ Error processing "${name}" (${id}):`, (err as Error).message);
    // Continue to next site — do not rethrow
  }
}

// ─── Concurrency runner ───────────────────────────────────────────────────────

async function runWithConcurrency<T>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<void>
): Promise<void> {
  let index = 0;

  async function worker(): Promise<void> {
    while (index < items.length) {
      const current = index++;
      await fn(items[current]);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('🌊 Blue Mind — Dive Site Verification Script');
  console.log(`   Collection : ${COLLECTION}`);
  console.log(`   Concurrency: ${CONCURRENCY}`);
  console.log(`   Radius     : ${SEARCH_RADIUS_M}m\n`);

  const db = initFirebase();

  console.log('📖 Fetching dive sites from Firestore…');
  const snapshot = await db.collection(COLLECTION).get();
  const docs = snapshot.docs;
  console.log(`   Found ${docs.length} sites\n`);

  if (!docs.length) {
    console.log('Nothing to process.');
    return;
  }

  const start = Date.now();
  await runWithConcurrency(docs, CONCURRENCY, (doc) => processSite(db, doc));

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n✔  Done — processed ${docs.length} sites in ${elapsed}s`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
