/**
 * Removes bad / scraped-navigation highlights from dive sites.
 * A highlight is "bad" if it matches known website nav patterns,
 * is too short, too long, or is obviously not a dive feature.
 *
 * Run with: npx ts-node src/clean-highlights.ts
 * Add --dry-run to preview without writing.
 * Add --stats to see a summary of what would be removed.
 */

import { initFirestore } from './firestore';
import { logger } from './logger';

const DRY_RUN = process.argv.includes('--dry-run');
const STATS = process.argv.includes('--stats');

// Exact matches (case-insensitive)
const BAD_EXACT = new Set([
  'dive site information',
  'dive spot list',
  'diving maps',
  'wreck tours',
  'diving regions',
  'log reports',
  'dive sites',
  'dive site',
  'diving spots',
  'diving site',
  'dive spot',
  'site information',
  'more information',
  'information',
  'contact us',
  'about us',
  'home',
  'back to top',
  'read more',
  'show more',
  'load more',
  'see more',
  'view all',
  'all sites',
  'search',
  'filter',
  'map view',
  'list view',
  'gallery',
  'photos',
  'videos',
  'reviews',
  'comments',
  'print',
  'share',
  'bookmark',
  'favourite',
  'favorite',
  'add to favourites',
  'add to favorites',
  'directions',
  'get directions',
  'weather',
  'forecast',
  'tides',
  'tide table',
  'tide tables',
  'currents',
  'dive log',
  'logbook',
  'registration',
  'login',
  'sign in',
  'sign up',
  'newsletter',
  'subscribe',
  'terms',
  'privacy',
  'sitemap',
  'n/a',
  'na',
  'none',
  'unknown',
  'tba',
  'tbd',
  'coming soon',
]);

// Substrings that indicate a navigation item (case-insensitive)
const BAD_SUBSTRINGS = [
  'dive site information',
  'dive spot list',
  'diving map',
  'wreck tour',
  'diving region',
  'log report',
  'click here',
  'read more',
  'learn more',
  'find out more',
  'more details',
  'see all',
  'view all',
  'show all',
];

function isBadHighlight(h: string): boolean {
  if (!h || typeof h !== 'string') return true;

  const trimmed = h.trim();
  if (trimmed.length === 0) return true;
  if (trimmed.length < 3) return true;        // too short
  if (trimmed.length > 200) return true;      // suspiciously long (paragraph scraped as highlight)

  const lower = trimmed.toLowerCase();

  if (BAD_EXACT.has(lower)) return true;

  for (const sub of BAD_SUBSTRINGS) {
    if (lower.includes(sub)) return true;
  }

  // Looks like a URL
  if (/https?:\/\//.test(trimmed)) return true;

  // Pure numbers / punctuation only
  if (/^[\d\s\W]+$/.test(trimmed)) return true;

  // Repeating text (e.g. "—————", "· · · ·")
  if (/^(.)\1{4,}$/.test(trimmed)) return true;

  return false;
}

async function main() {
  const db = await initFirestore();
  const snap = await db.collection('diveSites').get();

  let checked = 0;
  let sitesAffected = 0;
  let totalRemoved = 0;
  const removedCounts: Record<string, number> = {};
  const batch: { id: string; highlights: string[] }[] = [];

  for (const doc of snap.docs) {
    const data = doc.data();
    const original: string[] = Array.isArray(data.highlights) ? data.highlights : [];
    if (original.length === 0) { checked++; continue; }

    const cleaned = original.filter((h) => !isBadHighlight(h));
    const removed = original.filter((h) => isBadHighlight(h));

    if (removed.length > 0) {
      sitesAffected++;
      totalRemoved += removed.length;

      for (const r of removed) {
        const key = r.trim().toLowerCase();
        removedCounts[key] = (removedCounts[key] ?? 0) + 1;
      }

      if (DRY_RUN || STATS) {
        logger.info(`[${data.name}] removing ${removed.length}: ${removed.map((r) => `"${r}"`).join(', ')}`);
      }

      batch.push({ id: doc.id, highlights: cleaned });
    }
    checked++;
  }

  logger.info(`\nChecked ${checked} sites — ${sitesAffected} affected, ${totalRemoved} highlights to remove.`);

  if (STATS) {
    logger.info('\nTop bad highlights by frequency:');
    const sorted = Object.entries(removedCounts).sort(([, a], [, b]) => b - a).slice(0, 30);
    for (const [text, count] of sorted) {
      logger.info(`  ${count}x  "${text}"`);
    }
  }

  if (DRY_RUN || STATS) {
    logger.info('Dry run — no changes written.');
    return;
  }

  const CHUNK = 400;
  for (let i = 0; i < batch.length; i += CHUNK) {
    const chunk = batch.slice(i, i + CHUNK);
    const fb = db.batch();
    for (const { id, highlights } of chunk) {
      fb.update(db.collection('diveSites').doc(id), { highlights });
    }
    await fb.commit();
    logger.info(`Committed ${Math.min(i + CHUNK, batch.length)}/${batch.length}`);
  }

  logger.info('Done.');
}

main().catch((e) => { console.error(e); process.exit(1); });
