import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
  Firestore,
  deleteField,
} from 'firebase/firestore';
import { db } from './firebase';
import { DiveSite, DiveSiteDraft } from '@/types/admin';
import { SEED_DIVE_SITES } from '@/data/diveSites';

const COLLECTION = 'diveSites';

const validateDb = (): Firestore => {
  if (!db) throw new Error('Firebase not initialized');
  return db;
};

const toDate = (val: unknown): Date => {
  if (val instanceof Timestamp) return val.toDate();
  if (val instanceof Date) return val;
  return new Date();
};

const docToDiveSite = (id: string, data: Record<string, unknown>): DiveSite => ({
  id,
  slug: data.slug as string,
  name: (data.name as string) || '',
  location: (data.location as string) || '',
  country: (data.country as string) || '',
  coordinates: (data.coordinates as { lat: number; lng: number }) || { lat: 0, lng: 0 },
  waterType: (data.waterType as DiveSite['waterType']) || 'sea',
  maxDepth: (data.maxDepth as number) || 0,
  description: (data.description as string) || '',
  highlights: (data.highlights as string[]) || [],
  facilities: (data.facilities as string[]) || [],
  tags: (data.tags as string[]) || [],
  waterTemp: (data.waterTemp as DiveSite['waterTemp']) || {},
  visibility: (data.visibility as { min: number; max: number }) || { min: 0, max: 0 },
  bestSeasons: (data.bestSeasons as string[]) || [],
  photos: (data.photos as string[]) || [],
  thermocline: data.thermocline as DiveSite['thermocline'] ?? undefined,
  status: data.status as DiveSite['status'],
  createdAt: toDate(data.createdAt),
  updatedAt: toDate(data.updatedAt),
  freediverScore: data.freediverScore as number | undefined,
  needsReview: data.needsReview as boolean | undefined,
  scubaOnly: data.scubaOnly as boolean | undefined,
  depthUnknown: data.depthUnknown as boolean | undefined,
  scubaFlags: data.scubaFlags as string[] | undefined,
  coordinatesOnShore: data.coordinatesOnShore as boolean | undefined,
  googleRating: data.googleRating as number | undefined,
  googleRatingsTotal: data.googleRatingsTotal as number | undefined,
  googlePlaceId: data.googlePlaceId as string | undefined,
});

export const generateSlug = (name: string): string =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);

export const getAllDiveSites = async (): Promise<DiveSite[]> => {
  try {
    const firestore = validateDb();
    const q = query(collection(firestore, COLLECTION), orderBy('name', 'asc'));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => docToDiveSite(d.id, d.data() as Record<string, unknown>));
    }
  } catch {
    // fall through to seed data
  }
  return SEED_DIVE_SITES;
};

export const getActiveDiveSites = async (): Promise<DiveSite[]> => {
  try {
    const firestore = validateDb();
    const q = query(
      collection(firestore, COLLECTION),
      where('status', '==', 'active'),
      orderBy('name', 'asc')
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => docToDiveSite(d.id, d.data() as Record<string, unknown>));
    }
    // Firestore connected but no active sites yet
    return [];
  } catch (err) {
    console.warn('[diveSiteService] Firestore query failed, falling back to seed data:', err);
  }
  return SEED_DIVE_SITES.filter((s) => s.status === 'active');
};

export const getDiveSiteBySlug = async (slug: string): Promise<DiveSite | null> => {
  try {
    const firestore = validateDb();
    const q = query(collection(firestore, COLLECTION), where('slug', '==', slug));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const d = snap.docs[0];
      return docToDiveSite(d.id, d.data() as Record<string, unknown>);
    }
  } catch {
    // fall through to seed data
  }
  return SEED_DIVE_SITES.find((s) => s.slug === slug) ?? null;
};

const cleanForFirestore = (obj: Record<string, unknown>): Record<string, unknown> => {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => {
      if (v === undefined) return [k, deleteField()];
      if (v !== null && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Timestamp)) {
        // Recursively clean nested objects (e.g. waterTemp, thermocline)
        const cleaned = cleanForFirestore(v as Record<string, unknown>);
        // Strip undefined-only keys from sub-objects (waterTemp months)
        const stripped = Object.fromEntries(Object.entries(cleaned).filter(([, val]) => val !== undefined));
        return [k, stripped];
      }
      return [k, v];
    })
  );
};

export const createDiveSite = async (draft: DiveSiteDraft): Promise<string> => {
  const firestore = validateDb();
  const slug = draft.slug || generateSlug(draft.name);
  const now = Timestamp.now();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref = await addDoc(collection(firestore, COLLECTION), cleanForFirestore({
    ...draft,
    slug,
    createdAt: now,
    updatedAt: now,
  }) as any);
  return ref.id;
};

export const updateDiveSite = async (id: string, updates: Partial<DiveSiteDraft>): Promise<void> => {
  const firestore = validateDb();
  // If coordinates are being updated, clear the on-shore flag so fix-depths won't re-flag it
  const extra = updates.coordinates ? { coordinatesOnShore: false } : {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await updateDoc(doc(firestore, COLLECTION, id), cleanForFirestore({
    ...updates,
    ...extra,
    updatedAt: Timestamp.now(),
  }) as any);
};

export const deleteDiveSite = async (id: string): Promise<void> => {
  const firestore = validateDb();
  await deleteDoc(doc(firestore, COLLECTION, id));
};
