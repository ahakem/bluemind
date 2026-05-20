import axios from 'axios';
import { FieldValue } from 'firebase-admin/firestore';
import { initFirestore } from './firestore';
import { logger } from './logger';
import { config } from './config';

const deleteField = () => FieldValue.delete();

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface NominatimResult {
  class?: string;
  type?: string;
  name?: string;
  display_name?: string;
  address?: {
    country?: string;
    country_code?: string;
    state?: string;
    county?: string;
    region?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    sea?: string;
    bay?: string;
    ocean?: string;
    river?: string;
    stream?: string;
    waterway?: string;
    lake?: string;
    water?: string;
    reservoir?: string;
    quarry?: string;
    leisure?: string;
  };
  extratags?: {
    depth?: string;
    sport?: string;
    access?: string;
    wikipedia?: string;
    wikidata?: string;
    description?: string;
    'seamark:type'?: string;
    'seamark:depth'?: string;
  };
}

type WaterType = 'lake' | 'sea' | 'quarry' | 'river' | 'pool';

interface GeoResult {
  country: string | null;
  countryCode: string | null;
  location: string | null;
  waterBodyName: string | null;
  waterType: WaterType | null;
  depth: number | null;
  sport: string | null;
  access: string | null;
  wikipedia: string | null;
}

const SEA_TYPES = new Set([
  'sea', 'bay', 'coastline', 'ocean', 'strait', 'channel', 'sound',
  'gulf', 'fjord', 'lagoon', 'atoll', 'reef', 'coral_reef',
  'shoal', 'bank', 'seamount', 'underwater',
]);

const inferWaterTypeFromNominatim = (result: NominatimResult): WaterType | null => {
  const addr = result.address ?? {};
  const cls = result.class ?? '';
  const type = result.type ?? '';
  const seamark = result.extratags?.['seamark:type'] ?? '';
  const name = (result.name ?? result.display_name ?? '').toLowerCase();

  if (addr.sea || addr.bay || addr.ocean) return 'sea';
  if (SEA_TYPES.has(type)) return 'sea';
  if (cls === 'natural' && SEA_TYPES.has(type)) return 'sea';
  if (cls === 'place' && SEA_TYPES.has(type)) return 'sea';
  // seamark tags: anchorage, mooring, buoy, etc. often over open sea
  if (seamark && (seamark.includes('reef') || seamark.includes('anchorage') || seamark.includes('wreck'))) return 'sea';
  // name heuristics — catches "Red Sea", "Pacific Ocean", "Gulf of..."
  if (/\b(sea|ocean|gulf|strait|channel|atoll|reef|lagoon|fjord|bay|bight)\b/.test(name)) return 'sea';

  if (addr.river || addr.stream || addr.waterway) return 'river';
  if (cls === 'waterway' || type === 'river' || type === 'stream') return 'river';

  if (addr.quarry || type === 'quarry') return 'quarry';
  if (cls === 'landuse' && type === 'quarry') return 'quarry';

  if (addr.leisure === 'swimming_pool' || type === 'swimming_pool') return 'pool';

  if (addr.lake || addr.water || addr.reservoir) return 'lake';
  if (cls === 'natural' && type === 'water') return 'lake';
  if (cls === 'landuse' && type === 'reservoir') return 'lake';

  return null;
};

const buildLocation = (addr: NominatimResult['address']): string | null => {
  if (!addr) return null;
  const parts = [
    addr.city ?? addr.town ?? addr.village ?? addr.municipality ?? addr.county,
    addr.state ?? addr.region,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : null;
};

const nominatimGet = async (lat: number, lng: number, zoom: number): Promise<NominatimResult | null> => {
  try {
    const res = await axios.get<NominatimResult>(
      'https://nominatim.openstreetmap.org/reverse',
      {
        params: { lat, lon: lng, format: 'json', zoom, extratags: 1 },
        headers: {
          'User-Agent': 'BlueMindFreediving/1.0 (ahakim.elkholy@gmail.com)',
          'Accept-Language': 'en',
        },
        timeout: 10_000,
      }
    );
    return res.data;
  } catch {
    return null;
  }
};

const reverseGeocode = async (lat: number, lng: number): Promise<GeoResult> => {
  const empty: GeoResult = {
    country: null, countryCode: null, location: null, waterBodyName: null,
    waterType: null, depth: null, sport: null, access: null, wikipedia: null,
  };

  const d = await nominatimGet(lat, lng, 14);
  if (!d) return empty;

  const addr = d.address ?? {};
  const ext = d.extratags ?? {};

  const rawDepth = ext.depth ?? ext['seamark:depth'];
  const depth = rawDepth ? parseFloat(rawDepth) : null;

  let waterType = inferWaterTypeFromNominatim(d);

  // Zoom=14 over open sea often returns a reef or seafloor feature with no water type.
  // Fall back to zoom=6 which returns the broader named sea/ocean.
  if (!waterType) {
    await sleep(1100); // respect rate limit between extra calls
    const d6 = await nominatimGet(lat, lng, 6);
    if (d6) waterType = inferWaterTypeFromNominatim(d6);
  }

  return {
    country: addr.country ?? null,
    countryCode: addr.country_code?.toUpperCase() ?? null,
    location: buildLocation(addr),
    waterBodyName: d.name ?? null,
    waterType,
    depth: depth && !isNaN(depth) ? depth : null,
    sport: ext.sport ?? null,
    access: ext.access ?? null,
    wikipedia: ext.wikipedia ?? null,
  };
};

const main = async () => {
  const args = process.argv.slice(2);
  const limitIdx = args.indexOf('--limit');
  const limit = limitIdx !== -1 ? parseInt(args[limitIdx + 1] ?? '10', 10) : null;

  const db = initFirestore();

  const snap = await db.collection(config.firestore.collection).get();

  const toFix = snap.docs.filter((d) => {
    const coords = d.data().coordinates as { lat: number; lng: number } | null;
    return !!(coords?.lat && coords?.lng);
  });

  const limited = limit !== null ? toFix.slice(0, limit) : toFix;
  logger.info({ total: snap.size, toFix: toFix.length, processing: limited.length }, 'Docs to fix');

  if (limited.length === 0) {
    logger.info('Nothing to fix');
    return;
  }

  let fixed = 0;
  let failed = 0;

  for (let i = 0; i < limited.length; i++) {
    const doc = limited[i];
    const data = doc.data() as {
      coordinates: { lat: number; lng: number };
      slug: string;
      photos: string[];
      sourceUrl?: string;
    };
    const { coordinates, slug } = data;

    const updates: Record<string, unknown> = {};

    // Clean scraper-only fields
    if (Array.isArray(data.photos) && data.photos.length > 0) updates.photos = [];
    if (data.sourceUrl) updates.sourceUrl = deleteField();

    logger.info(
      { slug, lat: coordinates.lat, lng: coordinates.lng, progress: `${i + 1}/${limited.length}` },
      'Reverse geocoding'
    );

    const geo = await reverseGeocode(coordinates.lat, coordinates.lng);

    if (geo.country) {
      updates.country = geo.country;
    } else {
      logger.warn({ slug }, 'Nominatim returned no country');
    }

    if (geo.countryCode) updates.countryCode = geo.countryCode;
    if (geo.location) updates.location = geo.location;
    if (geo.waterBodyName) updates.waterBodyName = geo.waterBodyName;
    if (geo.waterType) updates.waterType = geo.waterType;
    if (geo.depth !== null) updates.depth = geo.depth;
    if (geo.sport) updates.sport = geo.sport;
    if (geo.access) updates.access = geo.access;
    if (geo.wikipedia) updates.wikipedia = geo.wikipedia;

    // Respect Nominatim rate limit
    if (i < limited.length - 1) await sleep(1100);

    if (Object.keys(updates).length > 0) {
      await doc.ref.update(updates);
      logger.info({
        slug,
        country: geo.country,
        countryCode: geo.countryCode,
        location: geo.location,
        waterType: geo.waterType,
        depth: geo.depth,
        sport: geo.sport,
        photos: updates.photos !== undefined ? '[] (cleared)' : undefined,
        sourceUrl: updates.sourceUrl !== undefined ? '(deleted)' : undefined,
      }, 'Updated');
      fixed++;
    } else {
      failed++;
    }
  }

  logger.info({ fixed, failed }, 'fix-countries complete');
};

main().catch((err) => {
  logger.fatal({ err }, 'fix-countries failed');
  process.exit(1);
});
