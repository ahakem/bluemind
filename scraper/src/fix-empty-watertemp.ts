/**
 * Fixes sites that got waterTemp: {} but have airTempByMonth — copies air temp back.
 */
import { initFirestore } from './firestore';
import { config } from './config';
import { logger } from './logger';

const main = async () => {
  const db = initFirestore();
  const snap = await db.collection(config.firestore.collection).get();

  const toFix = snap.docs.filter((d) => {
    const data = d.data();
    const air = data.airTempByMonth as Record<string, number> | null;
    const water = data.waterTemp as Record<string, number> | null;
    return air && Object.keys(air).length > 0 && (!water || Object.keys(water).length === 0);
  });

  logger.info({ total: toFix.length }, 'Sites to fix');

  const batch = db.batch();
  toFix.forEach((doc) => {
    batch.update(doc.ref, { waterTemp: doc.data().airTempByMonth, waterTempSource: 'air' });
  });
  await batch.commit();

  logger.info({ fixed: toFix.length }, 'Done');
  process.exit(0);
};

main().catch((err) => { console.error(err); process.exit(1); });
