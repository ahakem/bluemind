import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface SiteFeatures {
  [key: string]: boolean;
}

const DEFAULT_FEATURES: SiteFeatures = {};

const DOC_PATH = 'siteSettings/features';

export async function getSiteFeatures(): Promise<SiteFeatures> {
  if (!db) return DEFAULT_FEATURES;
  try {
    const snap = await getDoc(doc(db, DOC_PATH));
    if (!snap.exists()) return DEFAULT_FEATURES;
    return { ...DEFAULT_FEATURES, ...snap.data() } as SiteFeatures;
  } catch {
    return DEFAULT_FEATURES;
  }
}

export async function updateSiteFeatures(updates: Partial<SiteFeatures>): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  await setDoc(doc(db, DOC_PATH), updates, { merge: true });
}
