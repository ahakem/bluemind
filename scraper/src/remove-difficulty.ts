/**
 * Removes the 'difficulty' field from all diveSites documents.
 * Run: npx ts-node src/remove-difficulty.ts --dry-run
 * Run: npx ts-node src/remove-difficulty.ts
 */

import { FieldValue } from 'firebase-admin/firestore';
import { initFirestore } from './firestore';
import { logger } from './logger';

const DRY_RUN = process.argv.includes('--dry-run');

async function main() {
  const db = await initFirestore();
  const snap = await db.collection('diveSites').get();

  const toFix = snap.docs.filter((doc) => doc.data().difficulty !== undefined);

  logger.info(`Found ${toFix.length}/${snap.size} sites with a difficulty field`);

  if (DRY_RUN) {
    logger.info('Dry run — no changes written.');
    return;
  }

  const CHUNK = 400;
  for (let i = 0; i < toFix.length; i += CHUNK) {
    const chunk = toFix.slice(i, i + CHUNK);
    const batch = db.batch();
    for (const doc of chunk) {
      batch.update(doc.ref, { difficulty: FieldValue.delete() });
    }
    await batch.commit();
    logger.info(`Committed ${Math.min(i + CHUNK, toFix.length)}/${toFix.length}`);
  }

  logger.info('Done.');
}

main().catch((e) => { console.error(e); process.exit(1); });
