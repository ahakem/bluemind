import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  orderBy,
  Timestamp,
  Firestore,
  deleteField,
} from 'firebase/firestore';
import { db } from './firebase';
import { DiveSite, DiveSiteDraft, ReviewQueueItem } from '@/types/admin';
import { SEED_DIVE_SITES } from '@/data/diveSites';

const COLLECTION = 'diveSites';
const VERIFICATIONS_COLLECTION = 'siteVerifications';
const DIVE_LOGS_COLLECTION = 'diveLogs';
const RATINGS_COLLECTION = 'siteRatings';

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
  maxDepth: typeof data.maxDepth === 'number' ? data.maxDepth : (parseFloat(data.maxDepth as string) || 0),
  description: (data.description as string) || '',
  highlights: (data.highlights as string[]) || [],
  facilities: Array.isArray(data.facilities) ? (data.facilities as string[]) : [],
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
  verified: data.verified as boolean | undefined,
  activities: (data.activities as ('line_diving' | 'snorkeling')[]) || [],
  verification: data.verification as DiveSite['verification'] ?? undefined,
  enhancedAt: data.enhancedAt as string | undefined,
  facilitiesEnhanced: (
    typeof data.facilitiesEnhanced === 'object' && !Array.isArray(data.facilitiesEnhanced)
      ? data.facilitiesEnhanced
      : typeof data.facilities === 'object' && !Array.isArray(data.facilities)
        ? data.facilities
        : undefined
  ) as DiveSite['facilitiesEnhanced'] ?? undefined,
  marineLife: data.marineLife as DiveSite['marineLife'] ?? undefined,
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

export const getDiveSiteVerified = async (id: string): Promise<boolean> => {
  try {
    const firestore = validateDb();
    const snap = await getDoc(doc(firestore, COLLECTION, id));
    if (snap.exists()) return !!(snap.data() as Record<string, unknown>).verified;
  } catch {}
  return false;
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

export const submitVerification = async (
  siteId: string,
  siteSlug: string,
  siteName: string,
): Promise<void> => {
  const firestore = validateDb();
  await addDoc(collection(firestore, VERIFICATIONS_COLLECTION), {
    siteId,
    siteSlug,
    siteName,
    submittedAt: Timestamp.now(),
  });
};

export const getSiteVerificationCounts = async (): Promise<Map<string, number>> => {
  const firestore = validateDb();
  const snap = await getDocs(collection(firestore, VERIFICATIONS_COLLECTION));
  const counts = new Map<string, number>();
  snap.docs.forEach((d) => {
    const id = d.data().siteId as string;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  });
  return counts;
};

export const markSiteVerified = async (id: string, verified: boolean): Promise<void> => {
  const firestore = validateDb();
  await updateDoc(doc(firestore, COLLECTION, id), {
    verified,
    updatedAt: Timestamp.now(),
  });
};

// ── Dive logs ─────────────────────────────────────────────────────────────────

export const submitDiveLog = async (siteId: string, siteSlug: string, siteName: string): Promise<void> => {
  const firestore = validateDb();
  await addDoc(collection(firestore, DIVE_LOGS_COLLECTION), {
    siteId, siteSlug, siteName,
    submittedAt: Timestamp.now(),
  });
  _logCountsCache = null; // invalidate on write
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

let _logCountsCache: { data: Map<string, number>; ts: number } | null = null;

export const getDiveLogCounts = async (): Promise<Map<string, number>> => {
  if (_logCountsCache && Date.now() - _logCountsCache.ts < CACHE_TTL) {
    return _logCountsCache.data;
  }
  const firestore = validateDb();
  const snap = await getDocs(collection(firestore, DIVE_LOGS_COLLECTION));
  const counts = new Map<string, number>();
  snap.docs.forEach((d) => {
    const id = d.data().siteId as string;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  });
  _logCountsCache = { data: counts, ts: Date.now() };
  return counts;
};

export const getSiteDiveCount = async (siteId: string): Promise<number> => {
  const firestore = validateDb();
  const q = query(collection(firestore, DIVE_LOGS_COLLECTION), where('siteId', '==', siteId));
  const snap = await getDocs(q);
  return snap.size;
};

// ── Community ratings ─────────────────────────────────────────────────────────

export const submitRating = async (
  siteId: string, siteSlug: string, siteName: string, rating: number
): Promise<void> => {
  const firestore = validateDb();
  await addDoc(collection(firestore, RATINGS_COLLECTION), {
    siteId, siteSlug, siteName, rating,
    submittedAt: Timestamp.now(),
  });
  _ratingsCache = null; // invalidate on write
};

let _ratingsCache: { data: Map<string, { avg: number; count: number }>; ts: number } | null = null;

export const getAverageRatings = async (): Promise<Map<string, { avg: number; count: number }>> => {
  if (_ratingsCache && Date.now() - _ratingsCache.ts < CACHE_TTL) {
    return _ratingsCache.data;
  }
  const firestore = validateDb();
  const snap = await getDocs(collection(firestore, RATINGS_COLLECTION));
  const acc = new Map<string, { sum: number; count: number }>();
  snap.docs.forEach((d) => {
    const { siteId, rating } = d.data() as { siteId: string; rating: number };
    const prev = acc.get(siteId) ?? { sum: 0, count: 0 };
    acc.set(siteId, { sum: prev.sum + rating, count: prev.count + 1 });
  });
  const result = new Map<string, { avg: number; count: number }>();
  acc.forEach(({ sum, count }, id) =>
    result.set(id, { avg: Math.round((sum / count) * 10) / 10, count })
  );
  _ratingsCache = { data: result, ts: Date.now() };
  return result;
};

export const getSiteRatingsSummary = async (siteId: string): Promise<{ avg: number; count: number } | null> => {
  const firestore = validateDb();
  const q = query(collection(firestore, RATINGS_COLLECTION), where('siteId', '==', siteId));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const sum = snap.docs.reduce((a, d) => a + (d.data().rating as number), 0);
  return { avg: Math.round((sum / snap.docs.length) * 10) / 10, count: snap.docs.length };
};

// ── Review queue (_needsReview collection) ────────────────────────────────────

const REVIEW_QUEUE_COLLECTION = '_needsReview';

export const getReviewQueue = async (
  flag?: 'insufficient_data' | 'parse_failed' | 'quality_check_failed'
): Promise<ReviewQueueItem[]> => {
  const firestore = validateDb();
  const constraints = flag ? [where('flag', '==', flag)] : [];
  const q = query(collection(firestore, REVIEW_QUEUE_COLLECTION), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as Record<string, unknown>;
    return {
      id: d.id,
      flag: data.flag as ReviewQueueItem['flag'],
      originalData: (data.originalData as ReviewQueueItem['originalData']) ?? {},
      rawResponse: data.rawResponse as string | undefined,
      attemptedEnhancement: data.attemptedEnhancement as Record<string, unknown> | undefined,
      validationScore: data.validationScore as number | undefined,
      issues: data.issues as string[] | undefined,
      searchQueriesUsed: data.searchQueriesUsed as string[] | undefined,
      timestamp: (data.timestamp as string) ?? '',
    };
  });
};

export const getReviewQueueCount = async (): Promise<number> => {
  const firestore = validateDb();
  const snap = await getDocs(collection(firestore, REVIEW_QUEUE_COLLECTION));
  return snap.size;
};

export const deleteReviewItem = async (siteId: string): Promise<void> => {
  const firestore = validateDb();
  await deleteDoc(doc(firestore, REVIEW_QUEUE_COLLECTION, siteId));
};

export const saveReviewItem = async (item: ReviewQueueItem): Promise<void> => {
  const firestore = validateDb();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await setDoc(doc(firestore, REVIEW_QUEUE_COLLECTION, item.id), cleanForFirestore({
    flag: item.flag,
    originalData: item.originalData,
    rawResponse: item.rawResponse,
    attemptedEnhancement: item.attemptedEnhancement,
    validationScore: item.validationScore,
    issues: item.issues,
    searchQueriesUsed: item.searchQueriesUsed,
    timestamp: item.timestamp || new Date().toISOString(),
  }) as any);
};

export const forceApplySiteEnhancement = async (siteId: string, item: ReviewQueueItem): Promise<void> => {
  const firestore = validateDb();
  const enh = item.attemptedEnhancement ?? {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await updateDoc(doc(firestore, COLLECTION, siteId), cleanForFirestore({
    description: enh.description,
    highlights: enh.highlights,
    maxDepth: enh.maxDepth ?? item.originalData,
    visibilityRange: enh.visibilityRange,
    freediverFriendly: enh.freediverFriendly,
    freediverFriendlyReason: enh.freediverFriendlyReason,
    hasLineDiving: enh.hasLineDiving,
    lineDivingDetails: enh.lineDivingDetails ?? null,
    freediverDepthRange: enh.freediverDepthRange,
    freediverAccess: enh.freediverAccess,
    freediverConditions: enh.freediverConditions,
    facilitiesEnhanced: enh.facilities ?? {},
    marineLife: enh.marineLife ?? {},
    sources: enh.sources,
    confidence: enh.confidence,
    qualityScore: item.validationScore,
    enhancedAt: new Date().toISOString(),
    enhancedBy: 'force-applied',
    updatedAt: Timestamp.now(),
  }) as any);
  await deleteDoc(doc(firestore, REVIEW_QUEUE_COLLECTION, siteId));
};
