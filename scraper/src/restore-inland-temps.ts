/**
 * Restores waterTemp for inland sites by copying airTempByMonth back.
 */

import { initFirestore } from './firestore';
import { config } from './config';
import { logger } from './logger';

const INLAND_TYPES = ['lake', 'quarry', 'river', 'pool'];
const BATCH_SIZE = 400;

const main = async () => {
  const db = initFirestore();

  const snap = await db.collection(config.firestore.collection).get();

  const toRestore = snap.docs.filter((d) => {
    const data = d.data();
    if (!INLAND_TYPES.includes(data.waterType)) return false;
    const airTemp = data.airTempByMonth as Record<string, number> | null;
    const waterTemp = data.waterTemp as Record<string, number> | null;
    return airTemp && Object.keys(airTemp).length > 0 && (!waterTemp || Object.keys(waterTemp).length === 0);
  });

  logger.info({ total: toRestore.length }, 'Restoring waterTemp for inland sites');

  for (let i = 0; i < toRestore.length; i += BATCH_SIZE) {
    const batch = db.batch();
    toRestore.slice(i, i + BATCH_SIZE).forEach((doc) => {
      const airTemp = doc.data().airTempByMonth;
      batch.update(doc.ref, { waterTemp: airTemp, waterTempSource: 'air' });
    });
    await batch.commit();
    logger.info({ done: Math.min(i + BATCH_SIZE, toRestore.length), total: toRestore.length }, 'Progress');
  }

  logger.info({ restored: toRestore.length }, 'Done');
  process.exit(0);
};

main().catch((err) => {
  logger.fatal({ err }, 'restore-inland-temps failed');
  process.exit(1);
});
