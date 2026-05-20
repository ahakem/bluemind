/**
 * Enriches dive sites with nearby facilities from OpenStreetMap Overpass API.
 * Queries within RADIUS_M meters of the site coordinates.
 *
 * Detected facilities: Parking, Toilets, Showers, Changing Rooms, Dive Shop,
 *                      Restaurant, Cafe, Accommodation
 */

import axios from 'axios';
import { initFirestore } from './firestore';
import { config } from './config';
import { logger } from './logger';

const RADIUS_M = 1500;
const OVERPASS_SERVERS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface FacilityRule {
  label: string;
  tags: string[];
}

const FACILITY_RULES: FacilityRule[] = [
  { label: 'Parking',         tags: ['amenity=parking', 'amenity=parking_space'] },
  { label: 'Toilets',         tags: ['amenity=toilets'] },
  { label: 'Showers',         tags: ['amenity=shower'] },
  { label: 'Changing Rooms',  tags: ['amenity=changing_rooms', 'amenity=dressing_room'] },
  { label: 'Dive Shop',       tags: ['sport=diving', 'shop=diving'] },
  { label: 'Restaurant',      tags: ['amenity=restaurant'] },
  { label: 'Cafe',            tags: ['amenity=cafe'] },
  { label: 'Accommodation',   tags: ['tourism=hotel', 'tourism=hostel', 'tourism=guest_house'] },
  { label: 'Boat Launch',     tags: ['leisure=slipway'] },
  { label: 'Picnic Area',     tags: ['leisure=picnic_table', 'tourism=picnic_site'] },
];

function buildQuery(lat: number, lng: number): string {
  const allTags = FACILITY_RULES.flatMap((r) => r.tags);
  const filters = allTags.map((tag) => {
    const [k, v] = tag.split('=');
    return `node["${k}"="${v}"](around:${RADIUS_M},${lat},${lng});way["${k}"="${v}"](around:${RADIUS_M},${lat},${lng});`;
  }).join('\n');

  return `[out:json][timeout:15];\n(\n${filters}\n);\nout center;`;
}

async function fetchFacilities(lat: number, lng: number): Promise<string[]> {
  const query = buildQuery(lat, lng);
  let res = null;

  for (const server of OVERPASS_SERVERS) {
    try {
      res = await axios.post(server, `data=${encodeURIComponent(query)}`, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 20_000,
      });
      if (res.data?.elements) break;
    } catch {
      continue;
    }
  }

  try {

    const elements = res?.data?.elements as Array<Record<string, unknown>> ?? [];
    if (!elements.length) return [];

    const found = new Set<string>();

    for (const el of elements) {
      const tags = el.tags as Record<string, string> ?? {};
      for (const rule of FACILITY_RULES) {
        for (const tag of rule.tags) {
          const [k, v] = tag.split('=');
          if (tags[k] === v) {
            found.add(rule.label);
          }
        }
      }
    }

    return Array.from(found).sort();
  } catch {
    return [];
  }
}

const main = async () => {
  const db = initFirestore();
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const force = args.includes('--force');
  const limit = args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1]) : null;

  const snap = await db.collection(config.firestore.collection).where('status', '==', 'active').get();

  const toEnrich = snap.docs.filter((d) => {
    const data = d.data();
    const c = data.coordinates as { lat: number; lng: number } | null;
    if (!c?.lat || !c?.lng) return false;
    if (!force && data.facilitiesEnriched) return false;
    return true;
  });

  const limited = limit !== null ? toEnrich.slice(0, limit!) : toEnrich;
  logger.info({ total: snap.size, toEnrich: toEnrich.length, processing: limited.length, dryRun }, 'Starting');

  let enriched = 0;
  let noFacilities = 0;

  for (let i = 0; i < limited.length; i++) {
    const doc = limited[i];
    const data = doc.data();
    const { lat, lng } = data.coordinates as { lat: number; lng: number };
    const name = data.name as string;

    logger.info({ progress: `${i + 1}/${limited.length}`, name }, 'Querying OSM');

    const facilities = await fetchFacilities(lat, lng);

    if (facilities.length === 0) {
      logger.info({ name }, 'No facilities found nearby');
      noFacilities++;
    } else {
      logger.info({ name, facilities }, 'Found');
    }

    if (!dryRun) {
      await doc.ref.update({
        facilities,
        facilitiesEnriched: true,
      });
    }

    enriched++;
    await sleep(1000); // Overpass rate limit: ~1 req/sec
  }

  logger.info({ enriched, noFacilities, dryRun }, 'Done');
  process.exit(0);
};

main().catch((err) => {
  logger.fatal({ err }, 'enrich-facilities failed');
  process.exit(1);
});
