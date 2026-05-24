import * as admin from 'firebase-admin';
import { getFirestore, Firestore, FieldValue } from 'firebase-admin/firestore';
import { config } from './config';
import { logger } from './logger';
import { ScrapedDiveSite } from './types';

let _db: Firestore | null = null;

export const initFirestore = (): Firestore => {
  if (_db) return _db;

  if (!admin.apps.length) {
    if (config.serviceAccountPath) {
      admin.initializeApp({
        credential: admin.credential.cert(config.serviceAccountPath),
        projectId: config.firestore.projectId,
      });
    } else {
      // Fall back to application default credentials (e.g. gcloud auth)
      admin.initializeApp({
        projectId: config.firestore.projectId,
      });
    }
  }

  _db = getFirestore(admin.app(), config.firestore.databaseId);
  logger.info({ databaseId: config.firestore.databaseId }, 'Firestore initialised');
  return _db;
};

export const siteExists = async (db: Firestore, slug: string): Promise<boolean> => {
  const snap = await db
    .collection(config.firestore.collection)
    .where('slug', '==', slug)
    .limit(1)
    .get();
  return !snap.empty;
};

export const saveSite = async (
  db: Firestore,
  site: ScrapedDiveSite,
  dryRun = false
): Promise<string | null> => {
  if (dryRun) {
    logger.info({ slug: site.slug }, '[dry-run] would save site');
    return null;
  }

  const exists = await siteExists(db, site.slug);
  if (exists) {
    logger.warn({ slug: site.slug }, 'Site already exists in Firestore — skipping');
    return null;
  }

  const normalized = {
    ...site,
    waterType: site.waterType === 'unknown' ? 'lake' : site.waterType,
    difficulty: site.difficulty === 'unknown' ? 'intermediate' : site.difficulty,
    maxDepth: site.maxDepth ?? 0,
    visibility: site.visibility ?? { min: 0, max: 0 },
    scrapedAt: FieldValue.serverTimestamp(),
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  const ref = await db.collection(config.firestore.collection).add(normalized);

  logger.info({ slug: site.slug, id: ref.id }, 'Saved to Firestore');
  return ref.id;
};
