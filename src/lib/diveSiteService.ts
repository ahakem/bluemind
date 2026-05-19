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
} from 'firebase/firestore';
import { db } from './firebase';
import { DiveSite, DiveSiteDraft } from '@/types/admin';
import { SEED_DIVE_SITES } from '@/data/diveSites';

const COLLECTION = 'dive_sites';

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
  name: data.name as string,
  location: data.location as string,
  country: data.country as string,
  coordinates: data.coordinates as { lat: number; lng: number },
  waterType: data.waterType as DiveSite['waterType'],
  difficulty: data.difficulty as DiveSite['difficulty'],
  maxDepth: data.maxDepth as number,
  description: data.description as string,
  highlights: (data.highlights as string[]) || [],
  facilities: (data.facilities as string[]) || [],
  waterTemp: (data.waterTemp as DiveSite['waterTemp']) || {},
  visibility: data.visibility as { min: number; max: number },
  bestSeasons: (data.bestSeasons as string[]) || [],
  photos: (data.photos as string[]) || [],
  thermocline: data.thermocline as DiveSite['thermocline'] ?? undefined,
  status: data.status as DiveSite['status'],
  createdAt: toDate(data.createdAt),
  updatedAt: toDate(data.updatedAt),
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
  } catch {
    // fall through to seed data
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

export const createDiveSite = async (draft: DiveSiteDraft): Promise<string> => {
  const firestore = validateDb();
  const slug = draft.slug || generateSlug(draft.name);
  const now = Timestamp.now();
  const ref = await addDoc(collection(firestore, COLLECTION), {
    ...draft,
    slug,
    createdAt: now,
    updatedAt: now,
  });
  return ref.id;
};

export const updateDiveSite = async (id: string, updates: Partial<DiveSiteDraft>): Promise<void> => {
  const firestore = validateDb();
  await updateDoc(doc(firestore, COLLECTION, id), {
    ...updates,
    updatedAt: Timestamp.now(),
  });
};

export const deleteDiveSite = async (id: string): Promise<void> => {
  const firestore = validateDb();
  await deleteDoc(doc(firestore, COLLECTION, id));
};
