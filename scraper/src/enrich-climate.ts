import axios from 'axios';
import { initFirestore } from './firestore';
import { logger } from './logger';
import { config } from './config';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ── Types ────────────────────────────────────────────────────────────────────

type MonthKey = 'jan' | 'feb' | 'mar' | 'apr' | 'may' | 'jun' | 'jul' | 'aug' | 'sep' | 'oct' | 'nov' | 'dec';
type MonthlyTemp = Partial<Record<MonthKey, number>>;

const MONTH_KEYS: MonthKey[] = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];

const SEASONS: Record<string, MonthKey[]> = {
  Spring: ['mar', 'apr', 'may'],
  Summer: ['jun', 'jul', 'aug'],
  Autumn: ['sep', 'oct', 'nov'],
  Winter: ['dec', 'jan', 'feb'],
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const avgByMonth = (dates: string[], values: (number | null)[]): MonthlyTemp => {
  const buckets: Partial<Record<MonthKey, number[]>> = {};
  for (let i = 0; i < dates.length; i++) {
    const v = values[i];
    if (v === null || v === undefined || isNaN(v)) continue;
    const m = MONTH_KEYS[new Date(dates[i]).getUTCMonth()];
    (buckets[m] ??= []).push(v);
  }
  const result: MonthlyTemp = {};
  for (const [m, vals] of Object.entries(buckets) as [MonthKey, number[]][]) {
    result[m] = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
  }
  return result;
};

const inferBestSeasons = (temps: MonthlyTemp): string[] => {
  const seasonAvgs: { season: string; avg: number }[] = [];

  for (const [season, months] of Object.entries(SEASONS)) {
    const vals = months.map(m => temps[m]).filter((v): v is number => v !== undefined);
    if (!vals.length) continue;
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    seasonAvgs.push({ season, avg });
  }

  if (!seasonAvgs.length) return [];

  const maxAvg = Math.max(...seasonAvgs.map(s => s.avg));

  // All tropical (> 22°C year-round) → all seasons good
  if (seasonAvgs.every(s => s.avg >= 22)) return seasonAvgs.map(s => s.season);

  // Seasons above 18°C or within 4°C of the warmest season
  const good = seasonAvgs.filter(s => s.avg >= 18 || s.avg >= maxAvg - 4);

  // Always return at least the single warmest season
  if (!good.length) return [seasonAvgs.sort((a, b) => b.avg - a.avg)[0].season];

  return good.sort((a, b) => b.avg - a.avg).map(s => s.season);
};

// ── API calls ────────────────────────────────────────────────────────────────

const fetchAirTemp = async (lat: number, lng: number): Promise<MonthlyTemp | null> => {
  try {
    const res = await axios.get('https://archive-api.open-meteo.com/v1/archive', {
      params: {
        latitude: lat,
        longitude: lng,
        start_date: '2021-01-01',
        end_date: '2023-12-31',
        daily: 'temperature_2m_mean',
        timezone: 'UTC',
      },
      timeout: 20_000,
    });
    const d = res.data?.daily;
    if (!d?.time || !d?.temperature_2m_mean) return null;
    return avgByMonth(d.time, d.temperature_2m_mean);
  } catch {
    return null;
  }
};

// Sea surface temp — only meaningful for sea/coastal sites; silently null for inland
const fetchSeaSurfaceTemp = async (lat: number, lng: number): Promise<MonthlyTemp | null> => {
  try {
    const res = await axios.get('https://marine-api.open-meteo.com/v1/marine', {
      params: {
        latitude: lat,
        longitude: lng,
        start_date: '2021-01-01',
        end_date: '2023-12-31',
        hourly: 'sea_surface_temperature',
        timezone: 'UTC',
      },
      timeout: 20_000,
    });
    const d = res.data?.hourly;
    if (!d?.time || !d?.sea_surface_temperature) return null;
    return avgByMonth(d.time, d.sea_surface_temperature);
  } catch {
    return null;
  }
};

// ── Main ─────────────────────────────────────────────────────────────────────

const main = async () => {
  const args = process.argv.slice(2);
  const limitIdx = args.indexOf('--limit');
  const limit = limitIdx !== -1 ? parseInt(args[limitIdx + 1] ?? '10', 10) : null;
  const force = args.includes('--force'); // re-enrich already-processed docs

  const db = initFirestore();
  const snap = await db.collection(config.firestore.collection).get();

  const toEnrich = snap.docs.filter((d) => {
    const data = d.data();
    const coords = data.coordinates as { lat: number; lng: number } | null;
    if (!coords?.lat || !coords?.lng) return false;
    if (!force && data.airTempByMonth) return false; // already enriched
    return true;
  });

  const limited = limit !== null ? toEnrich.slice(0, limit) : toEnrich;
  logger.info({ total: snap.size, toEnrich: toEnrich.length, processing: limited.length }, 'Docs to enrich');

  if (limited.length === 0) {
    logger.info('Nothing to enrich');
    return;
  }

  let enriched = 0;
  let failed = 0;

  for (let i = 0; i < limited.length; i++) {
    const doc = limited[i];
    const data = doc.data() as {
      coordinates: { lat: number; lng: number };
      slug: string;
      waterType?: string;
    };
    const { coordinates, slug } = data;

    logger.info(
      { slug, lat: coordinates.lat, lng: coordinates.lng, progress: `${i + 1}/${limited.length}` },
      'Fetching climate data'
    );

    const airTemp = await fetchAirTemp(coordinates.lat, coordinates.lng);
    await sleep(300); // brief gap between the two API calls
    const sst = await fetchSeaSurfaceTemp(coordinates.lat, coordinates.lng);

    if (!airTemp) {
      logger.warn({ slug }, 'No air temp data — skipping');
      failed++;
      if (i < limited.length - 1) await sleep(1000);
      continue;
    }

    // SST is only usable if the marine API returned actual values (inland sites get {} back)
    const sstUsable = sst !== null && Object.keys(sst).length > 0;
    const waterType = data.waterType as string;
    const isInland = ['lake', 'quarry', 'river', 'pool'].includes(waterType);

    // Sea sites: use real SST. Inland sites: fall back to air temp (approximate but better than nothing)
    const waterTemp: MonthlyTemp = sstUsable ? sst! : airTemp;
    const bestSeasons = inferBestSeasons(waterTemp);

    const updates: Record<string, unknown> = {
      airTempByMonth: airTemp,
      waterTemp,
      bestSeasons,
      waterTempSource: sstUsable ? 'sst' : 'air',
    };

    await doc.ref.update(updates);
    logger.info({
      slug,
      bestSeasons,
      hasSst: sstUsable,
      sampleAirTemp: { jun: airTemp.jun, dec: airTemp.dec },
      sampleWaterTemp: waterTemp ? { jun: waterTemp.jun, dec: waterTemp.dec } : null,
    }, 'Enriched');
    enriched++;

    // ~1 req/sec between sites (two API calls already done above)
    if (i < limited.length - 1) await sleep(1000);
  }

  logger.info({ enriched, failed }, 'enrich-climate complete');
};

main().catch((err) => {
  logger.fatal({ err }, 'enrich-climate failed');
  process.exit(1);
});
