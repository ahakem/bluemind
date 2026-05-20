/**
 * Fixes inaccurate max depth values using two sources:
 *
 *  SEA sites  → GEBCO ocean bathymetry via opentopodata.org (free, batched, no key)
 *               Returns actual seafloor depth at the site coordinates.
 *
 *  LAKE / QUARRY / RIVER / POOL → Claude Haiku AI lookup by name + location
 *               Claude knows depths of famous sites; estimates others from context.
 *
 * Writes: maxDepth (number), depthSource ('gebco' | 'ai'), depthUnknown (bool)
 * Skips sites with depthSource: 'manual' unless --force.
 */

import axios from 'axios';
import Anthropic from '@anthropic-ai/sdk';
import { initFirestore } from './firestore';
import { logger } from './logger';
import { config } from './config';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? '' });

// ── GEBCO batch lookup (sea sites) ────────────────────────────────────────────

interface GebcoResult {
  elevation: number;
  location: { lat: number; lng: number };
}

const GEBCO_BATCH = 100;

const fetchGebcoDepths = async (
  coords: Array<{ lat: number; lng: number; idx: number }>
): Promise<Map<number, number>> => {
  const results = new Map<number, number>();
  if (!coords.length) return results;

  for (let i = 0; i < coords.length; i += GEBCO_BATCH) {
    const chunk = coords.slice(i, i + GEBCO_BATCH);
    const locations = chunk.map((c) => `${c.lat},${c.lng}`).join('|');

    try {
      const res = await axios.get<{ results: GebcoResult[]; status: string }>(
        'https://api.opentopodata.org/v1/gebco2020',
        {
          params: { locations },
          timeout: 20_000,
          headers: { 'User-Agent': 'BlueMindFreediving/1.0 (ahakim.elkholy@gmail.com)' },
        }
      );

      if (res.data.status !== 'OK') {
        logger.warn({ status: res.data.status }, 'GEBCO batch failed');
        continue;
      }

      res.data.results.forEach((r, j) => {
        const depth = r.elevation < 0 ? Math.round(Math.abs(r.elevation)) : 0;
        if (depth > 0) results.set(chunk[j].idx, depth);
      });
    } catch (err) {
      logger.warn({ err: String(err) }, 'GEBCO request failed');
    }

    // Rate limit between batches
    if (i + GEBCO_BATCH < coords.length) await sleep(1100);
  }

  return results;
};

// ── Claude depth lookup (inland sites) ───────────────────────────────────────

const fetchAiDepth = async (site: {
  name: string;
  waterBodyName?: string;
  waterType: string;
  location?: string;
  country?: string;
}): Promise<number | null> => {
  const prompt = `You are a diving expert. What is the maximum recreational dive depth in meters at this site?

Name: ${site.name}
Water body: ${site.waterBodyName ?? site.waterType}
Water type: ${site.waterType}
Location: ${site.location ?? 'unknown'}, ${site.country ?? 'unknown'}

Reply with ONLY an integer number of meters (e.g. 35). If genuinely unknown, reply: unknown`;

  try {
    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 20,
      messages: [{ role: 'user', content: prompt }],
    });
    const text = (msg.content[0] as { type: string; text: string }).text.trim();
    if (text.toLowerCase() === 'unknown') return null;
    const n = parseInt(text.replace(/\D/g, ''), 10);
    return !isNaN(n) && n > 0 && n < 500 ? n : null;
  } catch {
    return null;
  }
};

// ── Main ─────────────────────────────────────────────────────────────────────

const main = async () => {
  if (!process.env.ANTHROPIC_API_KEY) {
    logger.fatal('ANTHROPIC_API_KEY env var is required');
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const force = args.includes('--force');
  const limitIdx = args.indexOf('--limit');
  const limit = limitIdx !== -1 ? parseInt(args[limitIdx + 1] ?? '20', 10) : null;

  const db = initFirestore();
  const snap = await db.collection(config.firestore.collection).get();

  const toFix = snap.docs.filter((d) => {
    const data = d.data();
    if (data.status === 'archived') return false;
    if (!data.coordinates?.lat || !data.coordinates?.lng) return false;
    if (!force && data.depthSource === 'manual') return false; // respect manual edits
    if (!force && data.depthSource === 'gebco') return false;  // already fixed
    if (!force && data.depthSource === 'ai') return false;
    return true;
  });

  const limited = limit !== null ? toFix.slice(0, limit) : toFix;
  logger.info({ total: snap.size, toFix: toFix.length, processing: limited.length, dryRun }, 'Fixing depths');

  // ── Split into sea/unknown vs definitively-inland ──
  // 'lake' is included in GEBCO pass — Nominatim often mislabels open-sea sites as lake.
  // GEBCO will return 0 for real inland lakes and >0 for ocean; misses fall through to Claude.
  const INLAND_ONLY = new Set(['quarry', 'river', 'pool']);
  const seaDocs: Array<{ doc: FirebaseFirestore.QueryDocumentSnapshot; idx: number }> = [];
  const inlandDocs: Array<{ doc: FirebaseFirestore.QueryDocumentSnapshot }> = [];

  limited.forEach((doc, idx) => {
    const wt = (doc.data().waterType as string) ?? '';
    if (INLAND_ONLY.has(wt)) inlandDocs.push({ doc });
    else seaDocs.push({ doc, idx }); // 'sea', 'lake', unknown → GEBCO first
  });

  logger.info({ sea: seaDocs.length, inland: inlandDocs.length }, 'Split by water type');

  // ── GEBCO batch for sea sites ──
  logger.info('Fetching GEBCO depths for sea sites…');
  const gebcoCoords = seaDocs.map(({ doc, idx }) => ({
    lat: doc.data().coordinates.lat as number,
    lng: doc.data().coordinates.lng as number,
    idx,
  }));

  const gebcoDepths = await fetchGebcoDepths(gebcoCoords);
  logger.info({ found: gebcoDepths.size, total: seaDocs.length }, 'GEBCO results');

  // Write sea/lake site depths; real inland lakes fall through to Claude
  const gebcoMissed: Array<{ doc: FirebaseFirestore.QueryDocumentSnapshot }> = [];

  for (const { doc, idx } of seaDocs) {
    const depth = gebcoDepths.get(idx);
    const slug = doc.data().slug as string;
    const currentWaterType = (doc.data().waterType as string) ?? '';

    if (!depth) {
      if (currentWaterType === 'lake') {
        // Real inland lake — send to Claude for depth
        gebcoMissed.push({ doc });
      } else {
        // Sea site but GEBCO says land → coordinates are on shore, flag for manual correction
        logger.warn({ slug }, 'Coordinates on shore — flagging coordinatesOnShore');
        if (!dryRun) {
          await doc.ref.update({ coordinatesOnShore: true });
        }
      }
      continue;
    }

    const updates: Record<string, unknown> = { maxDepth: depth, depthSource: 'gebco', depthUnknown: false, coordinatesOnShore: false };

    // GEBCO confirms site is >5m underwater but waterType is still 'lake' (scraper default) →
    // correct to 'sea'. Catches Red Sea / ocean sites misclassified by Nominatim at zoom=14.
    if (depth > 5 && currentWaterType === 'lake') {
      updates.waterType = 'sea';
      logger.info({ slug, depth }, 'waterType corrected lake→sea via GEBCO');
    }

    logger.info({ slug, depth, source: 'gebco' }, 'Depth fixed');
    if (!dryRun) {
      await doc.ref.update(updates);
    }
  }

  // ── Claude for inland sites (quarry/river/pool + lake sites GEBCO returned 0 for) ──
  logger.info('Fetching AI depths for inland sites…');
  const allInlandDocs = [...inlandDocs, ...gebcoMissed];
  let aiFixed = 0;
  let aiSkipped = 0;

  for (let i = 0; i < allInlandDocs.length; i++) {
    const { doc } = allInlandDocs[i];
    const data = doc.data() as {
      slug: string;
      name: string;
      waterBodyName?: string;
      waterType: string;
      location?: string;
      country?: string;
    };

    const depth = await fetchAiDepth(data);

    if (!depth) {
      logger.debug({ slug: data.slug }, 'AI returned unknown depth');
      aiSkipped++;
    } else {
      logger.info({ slug: data.slug, depth, source: 'ai' }, 'Depth fixed');
      if (!dryRun) {
        await doc.ref.update({ maxDepth: depth, depthSource: 'ai', depthUnknown: false });
      }
      aiFixed++;
    }

    if (i < allInlandDocs.length - 1) await sleep(150);
  }

  logger.info({
    gebcoFixed: gebcoDepths.size,
    gebcoSkipped: seaDocs.length - gebcoDepths.size,
    lakeReclassified: gebcoMissed.length,
    aiFixed,
    aiSkipped,
    dryRun,
  }, 'fix-depths complete');
};

main().catch((err) => {
  logger.fatal({ err }, 'fix-depths failed');
  process.exit(1);
});
