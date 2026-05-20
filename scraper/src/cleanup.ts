import { initFirestore } from './firestore';
import { logger } from './logger';
import { config } from './config';

const main = async () => {
  const db = initFirestore();
  const snap = await db
    .collection(config.firestore.collection)
    .where('status', '==', 'pending_review')
    .get();

  if (snap.empty) {
    logger.info('No pending_review docs found — nothing to delete');
    return;
  }

  logger.info({ count: snap.size }, 'Deleting pending_review docs');

  const batch = db.batch();
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();

  logger.info({ deleted: snap.size }, 'Done');
};

main().catch((err) => {
  logger.fatal({ err }, 'Cleanup failed');
  process.exit(1);
});
