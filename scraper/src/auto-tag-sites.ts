/**
 * Auto-tags dive sites based on keywords found in name, location, highlights, and description.
 * Only tags sites that currently have an empty tags array.
 * Run: npx ts-node src/auto-tag-sites.ts --dry-run
 * Run: npx ts-node src/auto-tag-sites.ts
 * Run: npx ts-node src/auto-tag-sites.ts --all   (re-tag even sites that already have tags)
 */

import { initFirestore } from './firestore';
import { logger } from './logger';

const DRY_RUN = process.argv.includes('--dry-run');
const ALL = process.argv.includes('--all');

// keyword → tag mappings (checked against lowercased text blob)
const TAG_RULES: Array<{ tag: string; keywords: string[] }> = [
  { tag: 'Reef',           keywords: ['reef', 'coral'] },
  { tag: 'Wreck',          keywords: ['wreck', 'shipwreck', 'sunken ship', 'submarine'] },
  { tag: 'Wall',           keywords: ['wall dive', 'wall diving', 'drop-off', 'dropoff', 'cliff face'] },
  { tag: 'Cave',           keywords: ['cave', 'cavern', 'tunnel', 'blue hole', 'arch', 'grotto'] },
  { tag: 'Pinnacle',       keywords: ['pinnacle', 'seamount'] },
  { tag: 'Drop-off',       keywords: ['drop-off', 'dropoff', 'blue hole'] },
  { tag: 'Kelp Forest',    keywords: ['kelp'] },
  { tag: 'Snorkeling',     keywords: ['snorkel'] },
  { tag: 'Night Diving',   keywords: ['night div', 'night dive'] },
  { tag: 'Drift Diving',   keywords: ['drift div', 'drift dive', 'current div'] },
  { tag: 'Cave Diving',    keywords: ['cave div', 'cave dive'] },
  { tag: 'Technical Diving', keywords: ['technical div', 'tec div', 'trimix', 'rebreather'] },
  { tag: 'Sharks',         keywords: ['shark'] },
  { tag: 'Mantas',         keywords: ['manta'] },
  { tag: 'Turtles',        keywords: ['turtle', 'sea turtle'] },
  { tag: 'Dolphins',       keywords: ['dolphin'] },
  { tag: 'Macro Life',     keywords: ['macro', 'nudibranch', 'seahorse', 'frogfish', 'pygmy'] },
  { tag: 'Shore Entry',    keywords: ['shore entry', 'shore dive', 'shore access', 'beach entry', 'enter from shore'] },
  { tag: 'Boat Needed',    keywords: ['boat only', 'boat access', 'boat dive', 'by boat'] },
  { tag: 'Training',       keywords: ['training', 'practice', 'pool training'] },
  { tag: 'Beginner Friendly', keywords: ['beginner friendly', 'suitable for beginners', 'first open water', 'easy dive'] },
  { tag: 'Strong Currents', keywords: ['strong current', 'tidal current', 'current dive', 'surge'] },
  { tag: 'Freediving',     keywords: ['freediv', 'free div', 'apnea', 'apnée', 'apnoea', 'static', 'dynamic'] },
];

// Water type → implied tags
const WATER_TYPE_TAGS: Record<string, string[]> = {
  sea: ['Scuba', 'Freediving'],
  lake: ['Freediving'],
  quarry: ['Freediving'],
  river: ['Freediving'],
};

function inferTags(site: Record<string, unknown>): string[] {
  const text = [site.name, site.location, site.description, ...(Array.isArray(site.highlights) ? site.highlights : [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const tags = new Set<string>();

  // Water type implies activities
  const wt = site.waterType as string;
  for (const t of WATER_TYPE_TAGS[wt] ?? []) tags.add(t);

  // Keyword rules
  for (const { tag, keywords } of TAG_RULES) {
    if (keywords.some((kw) => text.includes(kw))) {
      tags.add(tag);
    }
  }

  // Max depth > 30m suggests technical/advanced potential
  if (Number(site.maxDepth) > 50) tags.add('Freediving');

  return [...tags].sort();
}

async function main() {
  const db = await initFirestore();
  const snap = await db.collection('diveSites').get();

  const toTag: { id: string; name: string; tags: string[] }[] = [];

  for (const doc of snap.docs) {
    const data = doc.data() as Record<string, unknown>;
    const existing: string[] = Array.isArray(data.tags) ? data.tags : [];

    if (!ALL && existing.length > 0) continue;

    const tags = inferTags(data);
    if (tags.length === 0) continue;

    toTag.push({ id: doc.id, name: String(data.name ?? ''), tags });
    logger.info(`  → "${data.name}" [${data.country}] → [${tags.join(', ')}]`);
  }

  logger.info(`\n${toTag.length}/${snap.size} sites will be tagged`);

  if (DRY_RUN) {
    logger.info('Dry run — no changes written.');
    return;
  }

  const CHUNK = 400;
  for (let i = 0; i < toTag.length; i += CHUNK) {
    const chunk = toTag.slice(i, i + CHUNK);
    const batch = db.batch();
    for (const { id, tags } of chunk) {
      batch.update(db.collection('diveSites').doc(id), { tags });
    }
    await batch.commit();
    logger.info(`Committed ${Math.min(i + CHUNK, toTag.length)}/${toTag.length}`);
  }

  logger.info('Done.');
}

main().catch((e) => { console.error(e); process.exit(1); });
