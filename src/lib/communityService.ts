import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
  getCountFromServer,
} from 'firebase/firestore';
import { db } from './firebase';
import { SiteSubmission, SiteCorrection, SiteSubmissionDraft, SiteCorrectionDraft } from '@/types/admin';
import { createDiveSite, updateDiveSite, generateSlug } from './diveSiteService';
import { sanitizeText, sanitizeEmail, sanitizeCoordinates, buildFingerprint, validateSubmission } from './sanitize';

const SUB_COL = 'siteSubmissions';
const COR_COL = 'siteCorrections';

const THROTTLE_KEY_SUBMIT = 'bm_lastSiteSubmit';
const THROTTLE_KEY_CORRECT = 'bm_lastSiteCorrect';
const THROTTLE_MS = 60_000; // 1 minute between submissions

function checkThrottle(key: string): void {
  if (typeof window === 'undefined') return;
  const last = localStorage.getItem(key);
  if (last && Date.now() - Number(last) < THROTTLE_MS) {
    throw new Error('Please wait a moment before submitting again.');
  }
}

function setThrottle(key: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, String(Date.now()));
  }
}

function toDate(val: unknown): Date {
  if (val instanceof Timestamp) return val.toDate();
  if (val instanceof Date) return val;
  return new Date();
}

function docToSubmission(id: string, d: Record<string, unknown>): SiteSubmission {
  return {
    id,
    name: (d.name as string) || '',
    location: (d.location as string) || '',
    country: (d.country as string) || '',
    coordinates: (d.coordinates as { lat: number; lng: number }) || { lat: 0, lng: 0 },
    waterType: (d.waterType as SiteSubmission['waterType']) || 'sea',
    difficulty: (d.difficulty as SiteSubmission['difficulty']) || 'intermediate',
    maxDepth: (d.maxDepth as number) || 0,
    description: (d.description as string) || '',
    highlights: (d.highlights as string[]) || [],
    facilities: (d.facilities as string[]) || [],
    visibility: (d.visibility as { min: number; max: number }) || { min: 0, max: 0 },
    bestSeasons: (d.bestSeasons as string[]) || [],
    submitterEmail: (d.submitterEmail as string) || '',
    submitterNote: (d.submitterNote as string) || '',
    status: (d.status as SiteSubmission['status']) || 'pending',
    reviewedBy: (d.reviewedBy as string | null) ?? null,
    reviewedAt: d.reviewedAt ? toDate(d.reviewedAt) : null,
    rejectionReason: (d.rejectionReason as string | null) ?? null,
    createdSiteId: (d.createdSiteId as string | null) ?? null,
    submittedAt: toDate(d.submittedAt),
    _hp: '',
    ipFingerprint: (d.ipFingerprint as string) || '',
  };
}

function docToCorrection(id: string, d: Record<string, unknown>): SiteCorrection {
  return {
    id,
    siteId: (d.siteId as string) || '',
    siteSlug: (d.siteSlug as string) || '',
    siteName: (d.siteName as string) || '',
    fields: (d.fields as Record<string, { current: unknown; suggested: unknown }>) || {},
    submitterEmail: (d.submitterEmail as string) || '',
    correctionNote: (d.correctionNote as string) || '',
    status: (d.status as SiteCorrection['status']) || 'pending',
    reviewedBy: (d.reviewedBy as string | null) ?? null,
    reviewedAt: d.reviewedAt ? toDate(d.reviewedAt) : null,
    rejectionReason: (d.rejectionReason as string | null) ?? null,
    submittedAt: toDate(d.submittedAt),
    _hp: '',
  };
}

// ── Public: submit a new site ─────────────────────────────────────────────────

export async function submitSite(draft: SiteSubmissionDraft): Promise<string> {
  if (!db) throw new Error('Firebase not initialized');

  // Honeypot
  if (draft._hp !== '') throw new Error('Submission rejected.');

  // Throttle
  checkThrottle(THROTTLE_KEY_SUBMIT);

  // Validate
  const errors = validateSubmission(draft as unknown as Record<string, unknown>);
  if (errors.length > 0) throw new Error(errors[0].message);

  // Sanitize
  const clean: Omit<SiteSubmissionDraft, '_hp'> & { _hp: string } = {
    _hp: '',
    ipFingerprint: buildFingerprint(),
    name: sanitizeText(draft.name, 120),
    location: sanitizeText(draft.location || '', 120),
    country: sanitizeText(draft.country, 80),
    coordinates: draft.coordinates,
    waterType: draft.waterType,
    difficulty: draft.difficulty,
    maxDepth: Math.max(0, Math.min(400, Number(draft.maxDepth) || 0)),
    description: sanitizeText(draft.description || '', 2000),
    highlights: draft.highlights.slice(0, 10).map((h) => sanitizeText(h, 150)),
    facilities: draft.facilities.slice(0, 10).map((f) => sanitizeText(f, 100)),
    visibility: {
      min: Math.max(0, Math.min(100, Number(draft.visibility?.min) || 0)),
      max: Math.max(0, Math.min(100, Number(draft.visibility?.max) || 0)),
    },
    bestSeasons: draft.bestSeasons,
    submitterEmail: draft.submitterEmail.trim().toLowerCase(),
    submitterNote: sanitizeText(draft.submitterNote || '', 500),
  };

  const ref = await addDoc(collection(db, SUB_COL), {
    ...clean,
    status: 'pending',
    reviewedBy: null,
    reviewedAt: null,
    rejectionReason: null,
    createdSiteId: null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    submittedAt: serverTimestamp() as any,
  });

  setThrottle(THROTTLE_KEY_SUBMIT);
  return ref.id;
}

// ── Public: submit a correction ───────────────────────────────────────────────

export async function submitCorrection(draft: SiteCorrectionDraft): Promise<string> {
  if (!db) throw new Error('Firebase not initialized');

  if (draft._hp !== '') throw new Error('Submission rejected.');
  checkThrottle(THROTTLE_KEY_CORRECT);

  if (!draft.siteId) throw new Error('Site ID is required.');
  if (!sanitizeEmail(draft.submitterEmail)) throw new Error('Valid email is required.');
  if (Object.keys(draft.fields).length === 0) throw new Error('Please select at least one field to correct.');

  const ref = await addDoc(collection(db, COR_COL), {
    siteId: draft.siteId,
    siteSlug: draft.siteSlug,
    siteName: sanitizeText(draft.siteName, 120),
    fields: draft.fields,
    submitterEmail: draft.submitterEmail.trim().toLowerCase(),
    correctionNote: sanitizeText(draft.correctionNote || '', 1000),
    _hp: '',
    status: 'pending',
    reviewedBy: null,
    reviewedAt: null,
    rejectionReason: null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    submittedAt: serverTimestamp() as any,
  });

  setThrottle(THROTTLE_KEY_CORRECT);
  return ref.id;
}

// ── Admin: read queues ────────────────────────────────────────────────────────

export async function getPendingSubmissions(): Promise<SiteSubmission[]> {
  if (!db) return [];
  const q = query(collection(db, SUB_COL), where('status', '==', 'pending'), orderBy('submittedAt', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToSubmission(d.id, d.data() as Record<string, unknown>));
}

export async function getPendingCorrections(): Promise<SiteCorrection[]> {
  if (!db) return [];
  const q = query(collection(db, COR_COL), where('status', '==', 'pending'), orderBy('submittedAt', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToCorrection(d.id, d.data() as Record<string, unknown>));
}

export async function getAllSubmissions(filter?: SiteSubmission['status']): Promise<SiteSubmission[]> {
  if (!db) return [];
  const q = filter
    ? query(collection(db, SUB_COL), where('status', '==', filter), orderBy('submittedAt', 'desc'))
    : query(collection(db, SUB_COL), orderBy('submittedAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToSubmission(d.id, d.data() as Record<string, unknown>));
}

export async function getAllCorrections(filter?: SiteCorrection['status']): Promise<SiteCorrection[]> {
  if (!db) return [];
  const q = filter
    ? query(collection(db, COR_COL), where('status', '==', filter), orderBy('submittedAt', 'desc'))
    : query(collection(db, COR_COL), orderBy('submittedAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToCorrection(d.id, d.data() as Record<string, unknown>));
}

export async function getPendingCounts(): Promise<{ submissions: number; corrections: number }> {
  if (!db) return { submissions: 0, corrections: 0 };
  const [s, c] = await Promise.all([
    getCountFromServer(query(collection(db, SUB_COL), where('status', '==', 'pending'))),
    getCountFromServer(query(collection(db, COR_COL), where('status', '==', 'pending'))),
  ]);
  return { submissions: s.data().count, corrections: c.data().count };
}

// ── Admin: approve / reject submissions ───────────────────────────────────────

export async function approveSubmission(id: string, adminUid: string): Promise<string> {
  if (!db) throw new Error('Firebase not initialized');
  const snap = await getDoc(doc(db, SUB_COL, id));
  if (!snap.exists()) throw new Error('Submission not found');
  const data = snap.data() as Record<string, unknown>;

  // Generate a slug with a short random suffix to avoid collisions
  const base = generateSlug((data.name as string) || 'site');
  const suffix = Math.random().toString(36).slice(2, 6);
  const slug = `${base}-${suffix}`;

  const newSiteId = await createDiveSite({
    slug,
    name: (data.name as string) || '',
    location: (data.location as string) || '',
    country: (data.country as string) || '',
    coordinates: (data.coordinates as { lat: number; lng: number }) || { lat: 0, lng: 0 },
    waterType: (data.waterType as SiteSubmission['waterType']) || 'sea',
    difficulty: (data.difficulty as SiteSubmission['difficulty']) || 'intermediate',
    maxDepth: (data.maxDepth as number) || 0,
    description: (data.description as string) || '',
    highlights: (data.highlights as string[]) || [],
    facilities: (data.facilities as string[]) || [],
    waterTemp: {},
    visibility: (data.visibility as { min: number; max: number }) || { min: 0, max: 0 },
    bestSeasons: (data.bestSeasons as string[]) || [],
    photos: [],
    status: 'active',
  });

  await updateDoc(doc(db, SUB_COL, id), {
    status: 'approved',
    reviewedBy: adminUid,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reviewedAt: serverTimestamp() as any,
    createdSiteId: newSiteId,
  });

  return newSiteId;
}

export async function rejectSubmission(id: string, adminUid: string, reason: string): Promise<void> {
  if (!db) throw new Error('Firebase not initialized');
  await updateDoc(doc(db, SUB_COL, id), {
    status: 'rejected',
    reviewedBy: adminUid,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reviewedAt: serverTimestamp() as any,
    rejectionReason: reason || '',
  });
}

// ── Admin: approve / reject corrections ──────────────────────────────────────

export async function approveCorrection(id: string, adminUid: string): Promise<void> {
  if (!db) throw new Error('Firebase not initialized');
  const snap = await getDoc(doc(db, COR_COL, id));
  if (!snap.exists()) throw new Error('Correction not found');
  const data = snap.data() as Record<string, unknown>;
  const fields = data.fields as Record<string, { current: unknown; suggested: unknown }>;

  // Build a patch from only the suggested values
  const patch = Object.fromEntries(
    Object.entries(fields).map(([k, v]) => [k, v.suggested])
  ) as Parameters<typeof updateDiveSite>[1];

  await updateDiveSite(data.siteId as string, patch);

  await updateDoc(doc(db, COR_COL, id), {
    status: 'approved',
    reviewedBy: adminUid,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reviewedAt: serverTimestamp() as any,
  });
}

export async function rejectCorrection(id: string, adminUid: string, reason: string): Promise<void> {
  if (!db) throw new Error('Firebase not initialized');
  await updateDoc(doc(db, COR_COL, id), {
    status: 'rejected',
    reviewedBy: adminUid,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reviewedAt: serverTimestamp() as any,
    rejectionReason: reason || '',
  });
}
