/**
 * Uses Claude Haiku to classify each site as freediving-relevant or not.
 * Archives sites classified as irrelevant before running expensive enrichment.
 *
 * Cost: ~$0.05 for all 1800 sites (50 tokens/site at Haiku pricing).
 * Run this BEFORE enrich-highlights.ts to avoid wasting API calls.
 */

import Anthropic from '@anthropic-ai/sdk';
import { initFirestore } from './firestore';
import { logger } from './logger';
import { config } from './config';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? '',
});

// ── Classification ────────────────────────────────────────────────────────────

interface SiteData {
  name: string;
  country?: string;
  location?: string;
  waterBodyName?: string;
  waterType?: string;
  maxDepth?: number;
  description?: string;
}

interface ClassifyResult {
  keep: boolean;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
}

const classifySite = async (site: SiteData): Promise<ClassifyResult> => {
  const prompt = `You are curating a freediving database. Freediving = breath-hold diving, no scuba gear.

Site info:
- Name: ${site.name}
- Country: ${site.country ?? 'unknown'}
- Location: ${site.location ?? 'unknown'}
- Water body: ${site.waterBodyName ?? site.waterType ?? 'unknown'}
- Water type: ${site.waterType ?? 'unknown'}
- Max depth: ${site.maxDepth ? `${site.maxDepth}m` : 'unknown'}
- Description: ${site.description ? site.description.slice(0, 250) : 'none'}

Should this site be included in a freediving database?

Keep if: open water (sea, lake, quarry, river, pool), accessible without scuba gear, interesting for breath-hold divers.
Remove if: requires decompression stops, technical scuba gear (trimix, rebreather), or is purely a scuba wreck at depth.
When unsure: keep it.

Reply with ONLY valid JSON, no explanation outside the JSON:
{"keep": true or false, "confidence": "high" or "medium" or "low", "reason": "one short sentence"}`;

  try {
    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 120,
      messages: [{ role: 'user', content: prompt }],
    });

    let text = (msg.content[0] as { type: string; text: string }).text.trim();
    // Strip markdown code fences if Claude wraps the JSON
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    const parsed = JSON.parse(text) as ClassifyResult;
    if (typeof parsed.keep !== 'boolean') throw new Error('Invalid response shape');
    return parsed;
  } catch (err) {
    logger.warn({ err: String(err), site: site.name }, 'Classification failed');
    return { keep: true, confidence: 'low', reason: 'Classification failed — kept by default' };
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
  const limit = limitIdx !== -1 ? parseInt(args[limitIdx + 1] ?? '10', 10) : null;

  const db = initFirestore();
  const snap = await db.collection(config.firestore.collection).get();

  const toClassify = snap.docs.filter((d) => {
    const data = d.data();
    if (data.status === 'archived' && !force) return false; // already archived — skip
    if (data.classified && !force) return false;            // already classified — skip
    return true;
  });

  const limited = limit !== null ? toClassify.slice(0, limit) : toClassify;
  logger.info({ total: snap.size, toClassify: toClassify.length, processing: limited.length, dryRun }, 'Classifying sites');

  const stats = { kept: 0, archived: 0, lowConfidence: 0 };

  for (let i = 0; i < limited.length; i++) {
    const doc = limited[i];
    const data = doc.data() as SiteData & { slug: string; status: string };

    const result = await classifySite(data);

    const logLine = {
      slug: data.slug,
      keep: result.keep,
      confidence: result.confidence,
      reason: result.reason,
      progress: `${i + 1}/${limited.length}`,
    };

    if (!result.keep) {
      logger.info(logLine, 'ARCHIVE');
      if (!dryRun) {
        await doc.ref.update({ status: 'archived', classified: true, classifyReason: result.reason });
      }
      stats.archived++;
    } else {
      logger.debug(logLine, 'KEEP');
      if (!dryRun) {
        await doc.ref.update({
          classified: true,
          classifyReason: result.reason,
          ...(result.confidence === 'low' ? { needsReview: true } : {}),
        });
      }
      stats.kept++;
    }

    if (result.confidence === 'low') stats.lowConfidence++;

    // Haiku is fast — small delay to avoid rate limits
    if (i < limited.length - 1) await sleep(120);
  }

  logger.info({
    ...stats,
    dryRun,
    estimatedCost: `~$${((stats.kept + stats.archived) * 0.00003).toFixed(3)}`,
  }, 'Classification complete');
};

main().catch((err) => {
  logger.fatal({ err }, 'classify-sites failed');
  process.exit(1);
});
