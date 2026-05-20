/**
 * Bulk-activates all pending sites with freediverScore >= MIN_SCORE.
 * Sites with needsReview: true are skipped — activate those manually.
 */

import { initFirestore } from './firestore';
import { config } from './config';
import { logger } from './logger';

const MIN_SCORE = 45;
const BATCH_SIZE = 400;

const main = async () => {
  const db = initFirestore();

  const snap = await db
    .collection(config.firestore.collection)
    .where('status', '==', 'pending')
    .get();

  const toActivate = snap.docs.filter((d) => {
    const data = d.data();
    if (data.needsReview) return false;
    const score = data.freediverScore as number ?? 0;
    return score >= MIN_SCORE;
  });

  logger.info({ total: snap.size, toActivate: toActivate.length }, 'Starting bulk activate');

  let done = 0;
  for (let i = 0; i < toActivate.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const chunk = toActivate.slice(i, i + BATCH_SIZE);
    chunk.forEach((doc) => batch.update(doc.ref, { status: 'active' }));
    await batch.commit();
    done += chunk.length;
    logger.info({ done, total: toActivate.length }, 'Progress');
  }

  logger.info({ activated: done }, 'Done');
  process.exit(0);
};

main().catch((err) => {
  logger.fatal({ err }, 'bulk-activate failed');
  process.exit(1);
});
