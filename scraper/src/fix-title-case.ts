/**
 * Converts ALL-CAPS location and name fields to Title Case.
 * Only updates fields that are detectably uppercase (>60% uppercase alpha chars).
 * Run with: npx ts-node src/fix-title-case.ts
 * Add --dry-run to preview without writing.
 */

import { initFirestore } from './firestore';
import { logger } from './logger';

const DRY_RUN = process.argv.includes('--dry-run');

// Words that should stay lowercase (unless first word)
const LOWER_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'nor', 'but', 'for', 'so', 'yet',
  'at', 'by', 'in', 'of', 'on', 'to', 'up', 'via', 'de', 'van', 'von',
  'del', 'den', 'der', 'des', 'die', 'la', 'le', 'les', 'el', 'los', 'las',
]);

// Known abbreviations / acronyms to preserve as-is (matched case-insensitively)
const PRESERVE_UPPER = new Set([
  'UK', 'USA', 'UAE', 'EU', 'BC', 'NW', 'SW', 'NE', 'SE',
  // Ship prefixes
  'HMS', 'SS', 'MV', 'RMS', 'SV', 'MY',
]);

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(/\s+/)
    .map((word, i) => {
      if (!word) return word;
      // Strip trailing punctuation for lookup, then re-attach
      const clean = word.replace(/[^a-zA-Z]/g, '');
      if (PRESERVE_UPPER.has(clean.toUpperCase())) return word.toUpperCase();
      if (i > 0 && LOWER_WORDS.has(clean)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ')
    .trim();
}

function isMostlyUpperCase(str: string): boolean {
  if (!str) return false;
  const alpha = str.replace(/[^a-zA-Z]/g, '');
  if (alpha.length < 3) return false;
  const upper = alpha.replace(/[^A-Z]/g, '').length;
  return upper / alpha.length > 0.6;
}

async function main() {
  const db = await initFirestore();
  const snap = await db.collection('diveSites').get();

  let checked = 0;
  let updated = 0;
  const batch: { id: string; patch: Record<string, string> }[] = [];

  for (const doc of snap.docs) {
    const data = doc.data();
    const patch: Record<string, string> = {};

    if (typeof data.location === 'string' && isMostlyUpperCase(data.location)) {
      const fixed = toTitleCase(data.location);
      if (fixed !== data.location) {
        patch.location = fixed;
        logger.info(`  location: "${data.location}" → "${fixed}"`);
      }
    }

    if (typeof data.name === 'string' && isMostlyUpperCase(data.name)) {
      const fixed = toTitleCase(data.name);
      if (fixed !== data.name) {
        patch.name = fixed;
        logger.info(`  name:     "${data.name}" → "${fixed}"`);
      }
    }

    if (Object.keys(patch).length > 0) {
      batch.push({ id: doc.id, patch });
      updated++;
    }
    checked++;
  }

  logger.info(`\nChecked ${checked} sites — ${updated} need title-case fix.`);

  if (DRY_RUN) {
    logger.info('Dry run — no changes written.');
    return;
  }

  // Write in batches of 400
  const CHUNK = 400;
  for (let i = 0; i < batch.length; i += CHUNK) {
    const chunk = batch.slice(i, i + CHUNK);
    const fb = db.batch();
    for (const { id, patch } of chunk) {
      fb.update(db.collection('diveSites').doc(id), patch);
    }
    await fb.commit();
    logger.info(`Committed ${Math.min(i + CHUNK, batch.length)}/${batch.length}`);
  }

  logger.info('Done.');
}

main().catch((e) => { console.error(e); process.exit(1); });
