/**
 * Clears waterTemp for inland sites (lake/quarry/river/pool) that have
 * air temperature stored instead of real water temperature.
 */

import { initFirestore } from './firestore';
import { config } from './config';
import { logger } from './logger';

const INLAND_TYPES = ['lake', 'quarry', 'river', 'pool'];
const BATCH_SIZE = 400;

const main = async () => {
  const db = initFirestore();

  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  const snap = await db.collection(config.firestore.collection).get();

  const toClear = snap.docs.filter((d) => {
    const data = d.data();
    if (!INLAND_TYPES.includes(data.waterType)) return false;
    const wt = data.waterTemp as Record<string, number> | null;
    // Only clear if waterTemp has values (air temp was stored)
    return wt && Object.keys(wt).length > 0;
  });

  logger.info({ total: toClear.length, dryRun }, 'Inland sites with air temp to clear');

  if (dryRun) {
    toClear.slice(0, 5).forEach((d) => {
      const data = d.data();
      logger.info({ name: data.name, waterType: data.waterType }, 'Would clear');
    });
    process.exit(0);
  }

  for (let i = 0; i < toClear.length; i += BATCH_SIZE) {
    const batch = db.batch();
    toClear.slice(i, i + BATCH_SIZE).forEach((doc) => {
      batch.update(doc.ref, { waterTemp: {}, waterTempSource: 'none' });
    });
    await batch.commit();
    logger.info({ done: Math.min(i + BATCH_SIZE, toClear.length), total: toClear.length }, 'Progress');
  }

  logger.info({ cleared: toClear.length }, 'Done');
  process.exit(0);
};

main().catch((err) => {
  logger.fatal({ err }, 'clear-inland-temps failed');
  process.exit(1);
});
