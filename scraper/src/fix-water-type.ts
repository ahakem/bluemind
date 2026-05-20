/**
 * Fixes sites incorrectly classified as 'lake' that are clearly sea/ocean sites.
 * Detection uses: sea keywords in name/location/description, depth > 50m, or country heuristics.
 *
 * Run: npx ts-node src/fix-water-type.ts --dry-run
 * Run: npx ts-node src/fix-water-type.ts
 */

import { initFirestore } from './firestore';
import { logger } from './logger';

const DRY_RUN = process.argv.includes('--dry-run');

// Keywords that indicate a sea/ocean site (checked in name + location + description)
const SEA_KEYWORDS = [
  'reef', 'coral', 'atoll', 'bay', 'sea', 'ocean', 'marine', 'coast', 'coastal',
  'beach', 'cove', 'strait', 'channel', 'lagoon', 'shoal', 'wall', 'drop-off',
  'dropoff', 'shark', 'manta', 'pelagic', 'saltwater', 'salt water',
  'red sea', 'mediterranean', 'caribbean', 'pacific', 'atlantic', 'indian ocean',
  'andaman', 'aegean', 'adriatic', 'tyrrhenian', 'ligurian', 'ionian',
  'wreck', 'shipwreck', 'pinnacle', 'seamount', 'blue hole',
];

// Countries where virtually all dive sites are sea (not landlocked / known lake destinations)
const SEA_COUNTRIES = new Set([
  'Egypt', 'Jordan', 'Saudi Arabia', 'Sudan', 'Eritrea', 'Djibouti', 'Yemen',
  'Maldives', 'Seychelles', 'Mauritius', 'Comoros', 'Madagascar', 'Mozambique',
  'Tanzania', 'Kenya', 'Somalia',
  'Philippines', 'Indonesia', 'Malaysia', 'Thailand', 'Vietnam', 'Myanmar',
  'Palau', 'Micronesia', 'Papua New Guinea', 'Solomon Islands', 'Vanuatu',
  'Fiji', 'Tonga', 'Samoa', 'French Polynesia',
  'Malta', 'Cyprus', 'Greece', 'Croatia', 'Montenegro',
  'Cayman Islands', 'Bahamas', 'Turks and Caicos', 'Bonaire', 'Curaçao',
  'Belize', 'Honduras', 'Cuba', 'Barbados', 'Saint Lucia', 'Grenada',
  'Bermuda', 'Azores', 'Canary Islands',
]);

function hasSEAKeyword(site: Record<string, unknown>): boolean {
  const text = [site.name, site.location, site.description]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return SEA_KEYWORDS.some((kw) => text.includes(kw));
}

async function main() {
  const db = await initFirestore();
  const snap = await db
    .collection('diveSites')
    .where('waterType', '==', 'lake')
    .get();

  logger.info(`Found ${snap.size} sites with waterType=lake`);

  const toFix: { id: string; name: string; country: string; reason: string }[] = [];

  for (const doc of snap.docs) {
    const data = doc.data() as Record<string, unknown>;
    const name = String(data.name ?? '');
    const country = String(data.country ?? '');
    const depth = Number(data.maxDepth ?? 0);

    let reason = '';

    if (SEA_COUNTRIES.has(country)) {
      reason = `sea country (${country})`;
    } else if (hasSEAKeyword(data)) {
      reason = 'sea keyword in name/location/description';
    } else if (depth > 50) {
      reason = `depth ${depth}m (too deep for a lake)`;
    }

    if (reason) {
      toFix.push({ id: doc.id, name, country, reason });
      logger.info(`  → fix: "${name}" [${country}] — ${reason}`);
    }
  }

  logger.info(`\n${toFix.length}/${snap.size} lake sites will be changed to 'sea'`);

  if (DRY_RUN) {
    logger.info('Dry run — no changes written.');
    return;
  }

  const CHUNK = 400;
  for (let i = 0; i < toFix.length; i += CHUNK) {
    const chunk = toFix.slice(i, i + CHUNK);
    const batch = db.batch();
    for (const { id } of chunk) {
      batch.update(db.collection('diveSites').doc(id), { waterType: 'sea' });
    }
    await batch.commit();
    logger.info(`Committed ${Math.min(i + CHUNK, toFix.length)}/${toFix.length}`);
  }

  logger.info('Done.');
}

main().catch((e) => { console.error(e); process.exit(1); });
