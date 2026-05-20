/**
 * Fixes sites with missing or zero coordinates using Google Geocoding API.
 * Searches by "site name, location, country" and falls back to "location, country".
 */

import axios from 'axios';
import { initFirestore } from './firestore';
import { config } from './config';
import { logger } from './logger';

const API_KEY = process.env.GOOGLE_MAPS_API_KEY ?? '';
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface GeoResult {
  lat: number;
  lng: number;
  formattedAddress: string;
}

async function geocode(query: string): Promise<GeoResult | null> {
  try {
    const res = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: { address: query, key: API_KEY },
      timeout: 10_000,
    });
    const results = res.data.results as Array<{
      geometry: { location: { lat: number; lng: number } };
      formatted_address: string;
    }>;
    if (!results?.length) return null;
    const { lat, lng } = results[0].geometry.location;
    return { lat, lng, formattedAddress: results[0].formatted_address };
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
  const snap = await db.collection(config.firestore.collection).get();

  const missing = snap.docs.filter((d) => {
    const data = d.data();
    if (data.status === 'archived') return false;
    const c = data.coordinates as { lat: number; lng: number } | null;
    return !c || (!c.lat && !c.lng);
  });

  logger.info({ total: missing.length }, 'Sites missing coordinates');

  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const limit = args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1]) : missing.length;
  const limited = missing.slice(0, limit);

  let fixed = 0;
  let failed = 0;

  for (let i = 0; i < limited.length; i++) {
    const doc = limited[i];
    const data = doc.data();
    const name = data.name as string;
    const location = data.location as string;
    const country = data.country as string;

    logger.info({ progress: `${i + 1}/${limited.length}`, name, country }, 'Geocoding');

    // Convert ALL CAPS to Title Case
    const toTitle = (s: string) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
    const titleName = toTitle(name);

    // Detect garbage data where location/country == name (bad scrape)
    const cleanLocation = location && location !== name ? toTitle(location) : null;
    const cleanCountry = country && country !== name && country !== location && !country.includes('App') ? toTitle(country) : null;

    // Infer country hint from Dutch/German keywords in name
    const dutchHint = /plas|waard|meer|vijver|polder|plas|kanaal/i.test(name) ? 'Netherlands' : null;
    const germanHint = /\bsee\b|baggersee|kiesgrube/i.test(name) ? 'Germany' : null;
    const countryHint = cleanCountry ?? dutchHint ?? germanHint;

    const queries: string[] = [];
    if (cleanLocation && countryHint) queries.push(`${titleName}, ${cleanLocation}, ${countryHint}`);
    if (countryHint) queries.push(`${titleName}, ${countryHint}`);
    if (cleanLocation) queries.push(`${titleName}, ${cleanLocation}`);
    queries.push(titleName);
    queries.push(name); // last resort: original casing

    let result: GeoResult | null = null;
    for (const q of queries) {
      result = await geocode(q);
      if (result) break;
      await sleep(50);
    }

    if (!result) {
      logger.warn({ name, country }, 'No result — archiving');
      if (!dryRun) {
        await doc.ref.update({ status: 'archived', archiveReason: 'geocoding_failed' });
      }
      failed++;
    } else {
      logger.info({ name, lat: result.lat, lng: result.lng, address: result.formattedAddress }, 'Found');
      if (!dryRun) {
        await doc.ref.update({ coordinates: { lat: result.lat, lng: result.lng } });
      }
      fixed++;
    }

    await sleep(50);
  }

  logger.info({ fixed, failed, dryRun }, 'Done');
  process.exit(0);
};

main().catch((err) => {
  logger.fatal({ err }, 'fix-missing-coords failed');
  process.exit(1);
});
