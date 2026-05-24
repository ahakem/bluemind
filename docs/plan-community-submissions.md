# Community Submission & Admin Review — Implementation Plan

## Project Context

Next.js 15, MUI v7, Firebase 12 (Firestore named database `landing`), `@vis.gl/react-google-maps` v1.8, React 19. The existing `CoordinatePickerMap` component already handles draggable markers. Admin auth uses Firebase Auth + `adminUsers` collection with role checks.

---

## 1. Firestore Collection Schemas

### `siteSubmissions` — new site requests

| Field | Type | Notes |
|---|---|---|
| `name` | `string` | max 120 chars, HTML-stripped |
| `location` | `string` | city/region, max 120 chars |
| `country` | `string` | max 80 chars |
| `coordinates` | `{ lat: number; lng: number }` | validated: lat ±90, lng ±180 |
| `waterType` | `'lake' \| 'sea' \| 'quarry' \| 'river' \| 'pool'` | enum |
| `difficulty` | `'beginner' \| 'intermediate' \| 'advanced'` | enum |
| `maxDepth` | `number` | 0–400 |
| `description` | `string` | max 2000 chars, HTML-stripped |
| `highlights` | `string[]` | max 10 items, each max 150 chars |
| `facilities` | `string[]` | max 10 items, each max 100 chars |
| `visibility` | `{ min: number; max: number }` | 0–100 each |
| `bestSeasons` | `string[]` | subset of `['Spring','Summer','Autumn','Winter']` |
| `submitterEmail` | `string` | validated email |
| `submitterNote` | `string` | optional, max 500 chars |
| `status` | `'pending' \| 'approved' \| 'rejected'` | default `'pending'` |
| `reviewedBy` | `string \| null` | admin UID |
| `reviewedAt` | `Timestamp \| null` | set on approve/reject |
| `rejectionReason` | `string \| null` | optional admin note |
| `createdSiteId` | `string \| null` | populated on approval with new `diveSites` doc ID |
| `submittedAt` | `Timestamp` | `serverTimestamp()` |
| `_hp` | `string` | honeypot — must be empty string |
| `ipFingerprint` | `string` | hash of user-agent + time window (for admin visibility) |

### `siteCorrections` — correction requests for existing sites

| Field | Type | Notes |
|---|---|---|
| `siteId` | `string` | Firestore ID of the target `diveSites` doc |
| `siteSlug` | `string` | denormalized for admin display |
| `siteName` | `string` | denormalized for admin display |
| `fields` | `Record<string, { current: unknown; suggested: unknown }>` | keys are `DiveSite` field names |
| `submitterEmail` | `string` | validated email |
| `correctionNote` | `string` | max 1000 chars |
| `status` | `'pending' \| 'approved' \| 'rejected'` | default `'pending'` |
| `reviewedBy` | `string \| null` | admin UID |
| `reviewedAt` | `Timestamp \| null` | |
| `rejectionReason` | `string \| null` | |
| `submittedAt` | `Timestamp` | `serverTimestamp()` |
| `_hp` | `string` | honeypot |

---

## 2. Firestore Security Rules

Add to `firestore.rules` after the `diveSites` match block:

```
// Helper (add at top of rules if not present)
function isAdminOrEditor() {
  return request.auth != null &&
    get(/databases/$(database)/documents/adminUsers/$(request.auth.uid)).data.role
      in ['admin', 'editor'];
}

// siteSubmissions — public create only; admins can read/update/delete
match /siteSubmissions/{docId} {
  allow create: if
    request.resource.data.status == 'pending' &&
    request.resource.data._hp == '' &&
    request.resource.data.name is string &&
    request.resource.data.submitterEmail is string &&
    request.resource.data.coordinates.lat is number &&
    request.resource.data.coordinates.lng is number &&
    request.resource.data.submittedAt == request.time;
  allow read, update, delete: if isAdminOrEditor();
}

// siteCorrections — public create only; admins can read/update/delete
match /siteCorrections/{docId} {
  allow create: if
    request.resource.data.status == 'pending' &&
    request.resource.data._hp == '' &&
    request.resource.data.siteId is string &&
    request.resource.data.submitterEmail is string &&
    request.resource.data.submittedAt == request.time;
  allow read, update, delete: if isAdminOrEditor();
}
```

Key properties enforced at the rules layer:
- `status` forced to `'pending'` on create — no self-approving
- `_hp` must be empty — bots that fill all fields are rejected
- `submittedAt == request.time` — prevents backdated replay attacks
- Reads of the queue are admin-only — submitters cannot enumerate others

---

## 3. TypeScript Types

**Modify: `src/types/admin.ts`** — add:

```typescript
export interface SiteSubmission {
  id: string;
  name: string;
  location: string;
  country: string;
  coordinates: { lat: number; lng: number };
  waterType: DiveSite['waterType'];
  difficulty: DiveSite['difficulty'];
  maxDepth: number;
  description: string;
  highlights: string[];
  facilities: string[];
  visibility: { min: number; max: number };
  bestSeasons: string[];
  submitterEmail: string;
  submitterNote: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy: string | null;
  reviewedAt: Date | null;
  rejectionReason: string | null;
  createdSiteId: string | null;
  submittedAt: Date;
  _hp: string;
  ipFingerprint: string;
}

export type SiteSubmissionDraft = Omit<SiteSubmission,
  'id' | 'status' | 'reviewedBy' | 'reviewedAt' | 'rejectionReason' | 'createdSiteId' | 'submittedAt'
>;

export interface SiteCorrection {
  id: string;
  siteId: string;
  siteSlug: string;
  siteName: string;
  fields: Record<string, { current: unknown; suggested: unknown }>;
  submitterEmail: string;
  correctionNote: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy: string | null;
  reviewedAt: Date | null;
  rejectionReason: string | null;
  submittedAt: Date;
  _hp: string;
}

export type SiteCorrectionDraft = Omit<SiteCorrection,
  'id' | 'status' | 'reviewedBy' | 'reviewedAt' | 'rejectionReason' | 'submittedAt'
>;
```

---

## 4. New Files to Create

### `src/lib/sanitize.ts`
Pure utility, no side effects, SSR-safe.

- `stripHtml(input: string): string` — strips `<tag>` via regex
- `truncate(input: string, max: number): string` — hard truncate
- `sanitizeText(input: string, max: number): string` — stripHtml + truncate
- `sanitizeEmail(email: string): boolean` — RFC-5322-compatible regex
- `sanitizeCoordinates(lat: number, lng: number): boolean` — lat ±90, lng ±180, finite
- `sanitizeSubmission(raw: unknown): SiteSubmissionDraft | ValidationError[]`
- `sanitizeCorrectionDraft(raw: unknown): SiteCorrectionDraft | ValidationError[]`

### `src/lib/communityService.ts`
All Firestore writes go here. Uses `addDoc` + `serverTimestamp()` — never `setDoc` with custom IDs.

**Public functions (no auth required):**
- `submitSite(draft: SiteSubmissionDraft): Promise<string>` — validates, checks localStorage throttle, writes to `siteSubmissions`
- `submitCorrection(draft: SiteCorrectionDraft): Promise<string>` — same for `siteCorrections`

**Admin functions (auth enforced by Firestore rules):**
- `getPendingSubmissions(): Promise<SiteSubmission[]>`
- `getPendingCorrections(): Promise<SiteCorrection[]>`
- `approveSubmission(id: string, adminUid: string): Promise<string>` — creates `diveSites` doc, marks submission approved, returns new site ID
- `rejectSubmission(id: string, adminUid: string, reason: string): Promise<void>`
- `approveCorrection(id: string, adminUid: string): Promise<void>` — patches only the `fields` listed in the correction doc
- `rejectCorrection(id: string, adminUid: string, reason: string): Promise<void>`
- `getAllSubmissions(filter?: 'pending' | 'approved' | 'rejected'): Promise<SiteSubmission[]>`
- `getAllCorrections(filter?: 'pending' | 'approved' | 'rejected'): Promise<SiteCorrection[]>`

### `src/components/LocationPickerStep.tsx`
Wraps `CoordinatePickerMap` for public-facing multi-step form.

- Google Places Autocomplete text field at top (using `useMapsLibrary('places')` hook)
- On place selected: map pans, zoom set to 14, pin moves to `geometry.location`
- Lat/lng badge showing current pin position
- Helper text: "Drag the pin to the exact entry point"
- Validation: coordinates must not both be `{0, 0}`
- Dynamically imported with `ssr: false`

### `src/components/SubmitSiteDialog.tsx`
Multi-step MUI Dialog.

- **Step 1 – Basic Info:** name, location, country, waterType, difficulty, maxDepth, visibility (min/max), description
- **Step 2 – Location:** `<LocationPickerStep />` with Places search
- **Step 3 – Details & Submit:** highlights (one per line), facilities, bestSeasons (checkboxes), submitterEmail, submitterNote, hidden honeypot `_hp` field

State: single `SiteSubmissionDraft` object for all steps. On submit calls `submitSite()`, shows success/error.

### `src/components/SubmitSiteButton.tsx`
Small client button that opens `SubmitSiteDialog`. Placed in `DiveSiteListingClient.tsx` header.

### `src/components/RequestCorrectionDialog.tsx`
Single-step dialog pre-filled with current site data.

- Checkboxes for each correctable field (name, location, country, coordinates, maxDepth, visibility, waterType, difficulty, description, bestSeasons)
- Selecting a field shows current value vs an editable suggested value side by side
- `correctionNote`, `submitterEmail`, hidden `_hp`
- Builds `fields` map from only checked fields, calls `submitCorrection()`

### `src/components/RequestCorrectionButton.tsx`
Outlined small button with `FlagIcon`. Accepts `site: DiveSite`. Opens `RequestCorrectionDialog`.

### `src/app/admin/submissions/page.tsx`
Server component shell rendering `SubmissionsAdminClient`.

### `src/app/admin/submissions/SubmissionsAdminClient.tsx`
Tabbed client component (MUI `Tabs`):

- **Tab "New Sites"** — pending `siteSubmissions` table
  - Columns: Submitted, Name, Location, Country, Water Type, Depth, Email, Actions
  - Row expansion: full fields + read-only map preview
  - Approve button → `approveSubmission()` + success snackbar
  - Reject button → inline rejection dialog with reason field
  - Toggle to show approved/rejected history

- **Tab "Corrections"** — pending `siteCorrections` table
  - Columns: Submitted, Site Name, Fields Changed, Email, Actions
  - Row expansion: diff table showing current vs suggested per field
  - Approve → `approveCorrection()` (patches only listed fields)
  - Reject → same rejection dialog
  - Toggle to show approved/rejected history

---

## 5. Files to Modify

| File | Change |
|---|---|
| `src/types/admin.ts` | Add `SiteSubmission`, `SiteCorrection`, and draft types |
| `firestore.rules` | Add `siteSubmissions` + `siteCorrections` rules |
| `src/app/dive-sites/DiveSiteListingClient.tsx` | Add `<SubmitSiteButton />` near page header |
| `src/app/dive-sites/[slug]/DiveSiteDetailClient.tsx` | Add `<RequestCorrectionButton site={site} />` in CTA section |
| `src/app/admin/layout.tsx` | Add "Community Queue" nav item with `InboxIcon`, roles `['admin', 'editor']`, href `/admin/submissions` |

---

## 6. Rate Limiting Strategy

**Layer 1 — Firestore rule:** `submittedAt == request.time` enforces `serverTimestamp()`. Prevents backdated replays.

**Layer 2 — Client localStorage throttle** (in `communityService.ts`):
- Check `localStorage.getItem('lastSiteSubmit')` — block re-submission within 60 seconds
- For new sites: track daily count (`siteSubmitCount_YYYY-MM-DD`), cap at 5/day
- This is not security — it's UX protection against accidental double-clicks

**Layer 3 — Honeypot `_hp` field:**
- Hidden via CSS: `position: absolute; left: -9999px; opacity: 0; pointer-events: none`
- Do NOT use `display: none` or `visibility: hidden` — screen readers may still tab to those
- Client silently drops submission if `_hp !== ''`
- Firestore rule also enforces `_hp == ''`

**Layer 4 — `ipFingerprint`:**
- `FNV32(navigator.userAgent + Math.floor(Date.now() / 60000)).toString(16)`
- Stored in Firestore for admin visibility only — not rule-enforced
- Future: Cloud Function `onDocumentCreated` trigger can count submissions per fingerprint and auto-reject if over threshold

---

## 7. Approve/Reject Logic

### Approve new site submission
1. Read `siteSubmissions/{id}`
2. Map fields to `DiveSiteDraft`, set `status: 'active'`, generate `slug` via `generateSlug(name)` + short random suffix (e.g., `-a1b2`) to avoid collision with admin-created slugs
3. Call `createDiveSite(draft)` — returns new Firestore ID
4. `updateDoc(siteSubmissions/{id}, { status: 'approved', reviewedBy, reviewedAt: serverTimestamp(), createdSiteId })`

### Approve correction
1. Read `siteCorrections/{id}`
2. Build patch: `Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, v.suggested]))`
3. Call `updateDiveSite(siteId, patch)` — uses existing service
4. `updateDoc(siteCorrections/{id}, { status: 'approved', reviewedBy, reviewedAt: serverTimestamp() })`

### Reject either
- `updateDoc({ status: 'rejected', rejectionReason, reviewedBy, reviewedAt: serverTimestamp() })`

---

## 8. Implementation Phases

### Phase 1 — Data model and security (no UI)
1. Add types to `src/types/admin.ts`
2. Write `src/lib/sanitize.ts`
3. Write `src/lib/communityService.ts` (public + admin functions)
4. Update `firestore.rules`, deploy, test with emulator

### Phase 2 — Submit New Site
1. `LocationPickerStep.tsx`
2. `SubmitSiteDialog.tsx`
3. `SubmitSiteButton.tsx`
4. Add button to `DiveSiteListingClient.tsx`
5. Test end-to-end: submit → verify Firestore doc

### Phase 3 — Request Data Correction
1. `RequestCorrectionDialog.tsx`
2. `RequestCorrectionButton.tsx`
3. Add button to `DiveSiteDetailClient.tsx`
4. Test end-to-end: submit correction → verify fields map in Firestore

### Phase 4 — Admin Approval Panel
1. `SubmissionsAdminClient.tsx`
2. `src/app/admin/submissions/page.tsx`
3. Add nav item to `src/app/admin/layout.tsx`
4. Test approve new site → verify `diveSites` doc created
5. Test approve correction → verify targeted field patch
6. Test reject with reason

### Phase 5 — Polish
1. localStorage rate limiting in `communityService.ts`
2. Pending count badge on admin nav item (lightweight `getCountFromServer` query)
3. Honeypot CSS audit (not `display:none`)
4. Slug collision protection (random suffix for community-submitted slugs)

---

## 9. Security Checklist

| Check | Mechanism | Layer |
|---|---|---|
| No public writes to `diveSites` | Firestore rule: write requires admin/editor role | Firestore |
| Queue is admin-read-only | Firestore rule: read on submissions requires `isAdminOrEditor()` | Firestore |
| No self-approval | Rule: `allow create` only with `status == 'pending'`; update/delete blocked for unauth | Firestore |
| HTML injection | `stripHtml()` in `sanitize.ts` on all string fields before write | Client |
| Max field lengths | `truncate()` in `sanitize.ts` | Client |
| Coordinate range | `sanitizeCoordinates()` + Firestore number type check | Client + Firestore |
| Email format | `sanitizeEmail()` regex | Client |
| Bot prevention | Honeypot `_hp` field enforced both client and Firestore | Client + Firestore |
| Replay attacks | `submittedAt == request.time` Firestore rule | Firestore |
| Double-submit / flooding | localStorage cooldown | Client |
| Admin identity per action | Each admin write hits a collection requiring `isAdminOrEditor()` | Firestore + Auth |
| Slug collisions | Random suffix on community-submitted slugs | Application |

---

## 10. File Tree

```
src/
  types/
    admin.ts                             ← MODIFY
  lib/
    sanitize.ts                          ← NEW
    communityService.ts                  ← NEW
  components/
    LocationPickerStep.tsx               ← NEW
    SubmitSiteButton.tsx                 ← NEW
    SubmitSiteDialog.tsx                 ← NEW
    RequestCorrectionButton.tsx          ← NEW
    RequestCorrectionDialog.tsx          ← NEW
  app/
    dive-sites/
      DiveSiteListingClient.tsx          ← MODIFY (add SubmitSiteButton)
      [slug]/
        DiveSiteDetailClient.tsx         ← MODIFY (add RequestCorrectionButton)
    admin/
      layout.tsx                         ← MODIFY (add Community Queue nav item)
      submissions/
        page.tsx                         ← NEW
        SubmissionsAdminClient.tsx       ← NEW

firestore.rules                          ← MODIFY
```
