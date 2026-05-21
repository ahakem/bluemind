/**
 * Finds dive sites incorrectly tagged as 'sea' that are actually lakes.
 *
 * Strategy (applied in order, first match wins):
 *  1. Reverse-geocode the site's coordinates via Google Geocoding API.
 *     If any result has type `natural_feature` AND the name/address contains
 *     a lake keyword → lake.
 *  2. Check the site name itself for lake keywords (catches quarries,
 *     gravel pits, reservoirs tagged with their local-language name).
 *  3. If the reverse-geocoded address mentions a known sea/ocean body → keep sea.
 *
 * Run (dry):  npx ts-node src/fix-sea-to-lake.ts --dry-run
 * Run (live): npx ts-node src/fix-sea-to-lake.ts
 * Limit:      npx ts-node src/fix-sea-to-lake.ts --limit 50
 */

import axios from 'axios';
import { initFirestore } from './firestore';
import { logger } from './logger';

const API_KEY = process.env.GOOGLE_MAPS_API_KEY ?? '';
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ── Keyword lists ────────────────────────────────────────────────────────────

const LAKE_KEYWORDS = [
  // English
  'lake', 'reservoir', 'quarry', 'gravel pit', 'gravel lake', 'inland',
  'freshwater', 'fresh water', 'pond', 'loch', 'basin', 'flooded',
  // Dutch / German
  'meer', 'plas', 'poel', 'vijver', 'stausee', 'baggersee', 'kiesgrube',
  'steinbruch', 'talsperre', 'see',
  // French / Spanish / Italian / Portuguese
  'lac', 'lago', 'lagoa', 'laguna', 'barragem', 'embalse',
  // Nordic / Slavic
  'järvi', 'sjö', 'jezero', 'jezioro',
];

const SEA_GEOCODE_KEYWORDS = [
  'sea', 'ocean', 'gulf', 'strait', 'bay', 'fjord', 'sound', 'channel',
  'reef', 'mediterranean', 'caribbean', 'pacific', 'atlantic', 'indian ocean',
  'red sea', 'north sea', 'aegean', 'adriatic', 'baltic',
];

// ── Helpers ──────────────────────────────────────────────────────────────────

// Keywords that need strict word-boundary matching to avoid substring false positives:
//   'lac'  matches inside "black", "place", "glacier" etc.
//   'lago' matches inside "lagoon"
//   'see'  matches inside many words
//   'meer' matches inside "merely" etc.
//   'plas' is short — keep loose (Dutch-specific, unlikely to collide)
const WORD_BOUNDARY_KEYWORDS = new Set(['lac', 'lago', 'see', 'meer', 'loch', 'pond']);

function containsLakeKeyword(text: string): boolean {
  const t = text.toLowerCase();
  return LAKE_KEYWORDS.some((kw) => {
    if (WORD_BOUNDARY_KEYWORDS.has(kw)) {
      return new RegExp(`\\b${kw}\\b`).test(t);
    }
    return t.includes(kw);
  });
}

function containsSeaKeyword(text: string): boolean {
  const t = text.toLowerCase();
  return SEA_GEOCODE_KEYWORDS.some((kw) => t.includes(kw));
}

interface GeoResult {
  types: string[];
  formatted_address: string;
  address_components: { long_name: string; types: string[] }[];
}

async function reverseGeocode(lat: number, lng: number): Promise<GeoResult[]> {
  try {
    const res = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: { latlng: `${lat},${lng}`, key: API_KEY },
      timeout: 10_000,
    });
    if (res.data.status !== 'OK') return [];
    return res.data.results as GeoResult[];
  } catch {
    return [];
  }
}

type Decision = 'lake' | 'sea' | 'skip';

interface Verdict {
  decision: Decision;
  reason: string;
}

// Strong sea indicators in the site name that override any lake keyword match
const SEA_NAME_OVERRIDES = ['reef', 'atoll', 'shoal', 'seamount', 'wreck', 'shipwreck', 'wall', 'pinnacle'];

function hasSEANameOverride(name: string): boolean {
  const t = name.toLowerCase();
  return SEA_NAME_OVERRIDES.some((kw) => new RegExp(`\\b${kw}\\b`).test(t));
}

function analyse(
  siteName: string,
  geoResults: GeoResult[],
): Verdict {
  // 1. Check site name first — strongest signal
  if (containsLakeKeyword(siteName)) {
    if (hasSEANameOverride(siteName)) {
      return { decision: 'sea', reason: `lake keyword overridden by sea indicator in name: "${siteName}"` };
    }
    return { decision: 'lake', reason: `lake keyword in site name: "${siteName}"` };
  }

  // 2. Walk through geocoding results
  for (const result of geoResults) {
    const addressText = result.formatted_address;
    const allNames = [
      addressText,
      ...result.address_components.map((c) => c.long_name),
    ].join(' ');

    const isNaturalFeature = result.types.includes('natural_feature');

    // Natural feature with lake keyword → lake
    if (isNaturalFeature && containsLakeKeyword(allNames)) {
      return { decision: 'lake', reason: `geocode natural_feature + lake keyword: "${addressText}"` };
    }

    // Address explicitly mentions lake (even without natural_feature type)
    if (containsLakeKeyword(allNames) && !containsSeaKeyword(allNames)) {
      return { decision: 'lake', reason: `lake keyword in geocode address: "${addressText}"` };
    }

    // Address explicitly mentions sea/ocean → confirm it's a sea site
    if (containsSeaKeyword(allNames)) {
      return { decision: 'sea', reason: `sea keyword in geocode address: "${addressText}"` };
    }
  }

  // 3. No strong signal either way
  return { decision: 'skip', reason: 'no conclusive signal from name or geocoding' };
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!API_KEY) {
    logger.error('GOOGLE_MAPS_API_KEY not set in environment');
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const limitArg = args.indexOf('--limit');
  const limit = limitArg !== -1 ? parseInt(args[limitArg + 1]) : Infinity;

  const db = await initFirestore();

  const snap = await db
    .collection('diveSites')
    .where('waterType', '==', 'sea')
    .get();

  const active = snap.docs.filter((d) => d.data().status !== 'archived');
  logger.info(`Found ${active.length} active sea-tagged sites (${snap.size} total)`);

  const candidates = active.slice(0, limit === Infinity ? active.length : limit);

  const results = { fixed: 0, kept: 0, skipped: 0, errors: 0 };
  const toLake: { id: string; name: string; country: string; reason: string }[] = [];

  for (let i = 0; i < candidates.length; i++) {
    const d = candidates[i];
    const data = d.data();
    const name = String(data.name ?? '');
    const country = String(data.country ?? '');
    const coords = data.coordinates as { lat: number; lng: number } | null;

    logger.info(`[${i + 1}/${candidates.length}] ${name} (${country})`);

    if (!coords?.lat || !coords?.lng) {
      logger.warn('  ↳ skip — no coordinates');
      results.skipped++;
      continue;
    }

    let geoResults: GeoResult[] = [];
    try {
      geoResults = await reverseGeocode(coords.lat, coords.lng);
    } catch {
      logger.error('  ↳ geocoding request failed');
      results.errors++;
      await sleep(1000);
      continue;
    }

    const { decision, reason } = analyse(name, geoResults);

    if (decision === 'lake') {
      logger.info(`  ↳ LAKE — ${reason}`);
      toLake.push({ id: d.id, name, country, reason });
      results.fixed++;
    } else if (decision === 'sea') {
      logger.info(`  ↳ keep sea — ${reason}`);
      results.kept++;
    } else {
      logger.info(`  ↳ skip — ${reason}`);
      results.skipped++;
    }

    await sleep(120); // ~8 req/s, well within geocoding quota
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  logger.info('');
  logger.info(`=== Summary (dry-run: ${dryRun}) ===`);
  logger.info(`  Will fix to lake : ${toLake.length}`);
  logger.info(`  Kept as sea      : ${results.kept}`);
  logger.info(`  Skipped          : ${results.skipped}`);
  logger.info(`  Errors           : ${results.errors}`);

  if (toLake.length) {
    logger.info('');
    logger.info('Sites to update:');
    for (const s of toLake) {
      logger.info(`  • ${s.name} (${s.country}) — ${s.reason}`);
    }
  }

  if (dryRun) {
    logger.info('\nDry run — no changes written.');
    return;
  }

  // ── Write in Firestore batches of 400 ──────────────────────────────────────
  const CHUNK = 400;
  for (let i = 0; i < toLake.length; i += CHUNK) {
    const chunk = toLake.slice(i, i + CHUNK);
    const batch = db.batch();
    for (const { id } of chunk) {
      batch.update(db.collection('diveSites').doc(id), { waterType: 'lake' });
    }
    await batch.commit();
    logger.info(`Committed batch ${Math.ceil((i + 1) / CHUNK)}`);
  }

  logger.info('Done.');
  process.exit(0);
}

main().catch((e) => {
  logger.fatal({ err: e }, 'fix-sea-to-lake failed');
  process.exit(1);
});
