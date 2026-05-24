/**
 * Scores each dive site for freediving relevance and:
 *  - Writes freediverScore (0–100) + scubaFlags to every doc
 *  - Auto-archives sites with score < ARCHIVE_THRESHOLD (very likely scuba-only)
 *  - Sets needsReview: true for uncertain sites (ARCHIVE_THRESHOLD ≤ score < REVIEW_THRESHOLD)
 *  - Sets depthUnknown: true where maxDepth is 0 or missing
 *
 * Thresholds (adjust to taste):
 *   < 20  → archived (scubaOnly: true)
 *   20–44 → pending + needsReview: true
 *   45+   → freediving-relevant, no flag
 */

import { initFirestore } from './firestore';
import { logger } from './logger';
import { config } from './config';

const ARCHIVE_THRESHOLD = 20;
const REVIEW_THRESHOLD = 45;

// ── Keyword tables ────────────────────────────────────────────────────────────

const RED_FLAGS: Array<{ pattern: RegExp; weight: number; label: string }> = [
  { pattern: /\bdecompression\b|\bdeco\s*stop\b/i,          weight: -25, label: 'decompression' },
  { pattern: /\bnitrox\b/i,                                  weight: -20, label: 'nitrox' },
  { pattern: /\btrimix\b|\bheliox\b/i,                       weight: -25, label: 'trimix/heliox' },
  { pattern: /\brebreather\b/i,                              weight: -25, label: 'rebreather' },
  { pattern: /\btechnical\s*div/i,                           weight: -20, label: 'technical diving' },
  { pattern: /\btec\s*div/i,                                 weight: -20, label: 'tec diving' },
  { pattern: /\bcave\s*div/i,                                weight: -15, label: 'cave diving' },
  { pattern: /\bscuba\s*tank\b|\bcylinder\b|\bair\s*tank\b/i,weight: -15, label: 'scuba equipment' },
  { pattern: /\bBCD\b|\bbuoyancy\s*compensator\b/i,          weight: -15, label: 'BCD' },
  { pattern: /\bdive\s*computer\b/i,                         weight: -10, label: 'dive computer' },
  { pattern: /\bregulator\b/i,                               weight: -10, label: 'regulator' },
  { pattern: /\bnight\s*div/i,                               weight:  -5, label: 'night dive' },
];

const GREEN_FLAGS: Array<{ pattern: RegExp; weight: number; label: string }> = [
  // Explicitly freediving — strong positive signal
  { pattern: /\bfreediv/i,                                   weight: +25, label: 'freediving' },
  { pattern: /\bfree\s*div/i,                                weight: +25, label: 'free diving' },
  { pattern: /\bapnea\b|\bapnoea\b/i,                        weight: +25, label: 'apnea' },
  { pattern: /\bbreath[\s-]?hold\b/i,                        weight: +20, label: 'breath hold' },
  // Accessible without scuba gear — weak positive
  { pattern: /\bsnorkel/i,                                   weight: +10, label: 'snorkeling' },
  { pattern: /\bmarine\s*reserve\b|\bmarine\s*park\b/i,      weight:  +8, label: 'marine reserve' },
  { pattern: /\bcrystal[\s-]?clear\b|\bexcellent\s*visib/i,  weight:  +5, label: 'visibility' },
  { pattern: /\bcoral\s*garden\b|\bcoral\s*reef\b/i,         weight:  +5, label: 'coral reef' },
  { pattern: /\breef\s*flat\b|\breef\s*garden\b/i,           weight:  +5, label: 'reef flat/garden' },
  // NOTE: "shallow" intentionally excluded — freedivers dive 5m to 100m+,
  // depth alone is not a positive or negative signal for freediving relevance.
];

// ── Scorer ────────────────────────────────────────────────────────────────────

interface ScoreResult {
  score: number;
  scubaFlags: string[];
  greenFlags: string[];
}

const scoreText = (text: string): { delta: number; flags: string[] } => {
  let delta = 0;
  const flags: string[] = [];
  for (const { pattern, weight, label } of [...RED_FLAGS, ...GREEN_FLAGS]) {
    if (pattern.test(text)) {
      delta += weight;
      flags.push(label);
    }
  }
  return { delta, flags };
};

const scoreSite = (data: {
  name?: string;
  description?: string;
  highlights?: string[];
  waterType?: string;
  maxDepth?: number;
}): ScoreResult => {
  // Start at 40 — sites with no signal at all land in "needs review" (20–44), not "clean"
  // A site needs at least one positive signal to be considered confidently freediving-relevant
  let score = 40;
  const scubaFlags: string[] = [];
  const greenFlags: string[] = [];

  const textBlob = [
    data.name ?? '',
    data.description ?? '',
    ...(data.highlights ?? []),
  ].join(' ');

  const { delta, flags } = scoreText(textBlob);
  score += delta;

  // Split flags into red vs green for logging
  for (const f of flags) {
    const isRed = RED_FLAGS.some(r => r.label === f);
    if (isRed) scubaFlags.push(f);
    else greenFlags.push(f);
  }

  // Depth data from scraper is unreliable — not used for scoring.
  // depthUnknown flag is set separately to help admins spot missing values.

  // Water type bonus
  if (data.waterType === 'pool') score += 20;
  else if (data.waterType === 'quarry') score += 15;
  else if (data.waterType === 'lake') score += 5;

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    scubaFlags,
    greenFlags,
  };
};

// ── Main ─────────────────────────────────────────────────────────────────────

const main = async () => {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const limitIdx = args.indexOf('--limit');
  const limit = limitIdx !== -1 ? parseInt(args[limitIdx + 1] ?? '100', 10) : null;

  const db = initFirestore();
  const snap = await db.collection(config.firestore.collection).get();

  const docs = limit !== null ? snap.docs.slice(0, limit) : snap.docs;
  logger.info({ total: snap.size, processing: docs.length, dryRun }, 'Scoring sites');

  const stats = { archived: 0, needsReview: 0, clean: 0, depthUnknown: 0 };
  const scoreDistribution: Record<string, number> = {
    '0–19': 0, '20–44': 0, '45–69': 0, '70–100': 0,
  };

  const batch_size = 400;
  let batch = db.batch();
  let batchCount = 0;

  for (let i = 0; i < docs.length; i++) {
    const doc = docs[i];
    const data = doc.data() as {
      name?: string;
      description?: string;
      highlights?: string[];
      waterType?: string;
      maxDepth?: number;
      status?: string;
    };

    const { score, scubaFlags, greenFlags } = scoreSite(data);
    const depthUnknown = !data.maxDepth || data.maxDepth === 0;

    // Bucket for stats
    if (score < 20) scoreDistribution['0–19']++;
    else if (score < 45) scoreDistribution['20–44']++;
    else if (score < 70) scoreDistribution['45–69']++;
    else scoreDistribution['70–100']++;

    const updates: Record<string, unknown> = {
      freediverScore: score,
      ...(scubaFlags.length ? { scubaFlags } : {}),
      ...(greenFlags.length ? { greenFlags } : {}),
      ...(depthUnknown ? { depthUnknown: true } : { depthUnknown: false }),
    };

    if (score < ARCHIVE_THRESHOLD) {
      updates.status = 'archived';
      updates.scubaOnly = true;
      updates.needsReview = false;
      stats.archived++;
    } else if (score < REVIEW_THRESHOLD) {
      updates.needsReview = true;
      updates.scubaOnly = false;
      stats.needsReview++;
    } else {
      updates.needsReview = false;
      updates.scubaOnly = false;
      stats.clean++;
    }

    if (depthUnknown) stats.depthUnknown++;

    logger.debug({
      slug: (data as Record<string, unknown>).slug,
      score,
      scubaFlags,
      greenFlags,
      depthUnknown,
      willArchive: score < ARCHIVE_THRESHOLD,
    }, 'Scored');

    if (!dryRun) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      batch.update(doc.ref, updates as any);
      batchCount++;

      // Firestore batches max 500 ops — commit and reset
      if (batchCount >= batch_size) {
        await batch.commit();
        batch = db.batch();
        batchCount = 0;
        logger.info({ committed: i + 1 }, 'Batch committed');
      }
    }
  }

  if (!dryRun && batchCount > 0) {
    await batch.commit();
  }

  logger.info({
    ...stats,
    scoreDistribution,
    dryRun,
    thresholds: { archive: `<${ARCHIVE_THRESHOLD}`, review: `<${REVIEW_THRESHOLD}` },
  }, 'Scoring complete');
};

main().catch((err) => {
  logger.fatal({ err }, 'score-sites failed');
  process.exit(1);
});
