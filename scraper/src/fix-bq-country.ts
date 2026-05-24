/**
 * Re-tags dive sites incorrectly labelled "Netherlands" that are in Bonaire
 * (coordinates lat < 25, lng < -50) to country "Bonaire".
 *
 * Run (dry):  npx ts-node src/fix-bq-country.ts --dry-run
 * Run (live): npx ts-node src/fix-bq-country.ts
 */

import { initFirestore } from './firestore';
import { logger } from './logger';

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  const db = await initFirestore();
  const snap = await db.collection('diveSites').where('country', '==', 'Netherlands').get();

  const toFix: { id: string; name: string }[] = [];

  snap.docs.forEach((d) => {
    const data = d.data();
    const coords = data.coordinates as { lat: number; lng: number } | undefined;
    if (coords && coords.lat < 25 && coords.lng < -50) {
      toFix.push({ id: d.id, name: data.name as string });
    }
  });

  logger.info(`Found ${toFix.length} Bonaire sites tagged as Netherlands`);
  toFix.forEach((s) => logger.info(`  • ${s.name}`));

  if (dryRun) {
    logger.info('\nDry run — no changes written.');
    return;
  }

  const CHUNK = 400;
  for (let i = 0; i < toFix.length; i += CHUNK) {
    const batch = db.batch();
    toFix.slice(i, i + CHUNK).forEach(({ id }) => {
      batch.update(db.collection('diveSites').doc(id), { country: 'Bonaire' });
    });
    await batch.commit();
    logger.info(`Committed batch ${Math.ceil((i + 1) / CHUNK)}`);
  }

  logger.info(`Done — ${toFix.length} sites updated to country: Bonaire`);
  process.exit(0);
}

main().catch((e) => { logger.fatal({ err: e }, 'fix-bq failed'); process.exit(1); });
