# Bluemind — Roadmap

> Freediver-first dive site platform with AI-enhanced content.

---

## Phase 0 — Foundation ✅ (Done)

Everything needed to build and manage the content database.

### Data model
- [x] Dive site database (Firestore)
- [x] Freediver-specific fields: freediverScore, freediverFriendly, lineDiving, freediverDepthRange, freediverAccess, freediverConditions
- [x] Marine life model: fish / corals / macro / pelagic / specialSightings with scientific names, season, frequency
- [x] Activity types: line_diving, snorkeling
- [x] Facilities (enhanced structured object)
- [x] Monthly water temperature fields
- [x] Thermocline data model
- [x] Visibility range, water type, best seasons
- [x] Sources + confidence tracking for AI content
- [x] Slug-based URLs

### Admin panel
- [x] Full CRUD for dive sites (create, edit, delete)
- [x] Bulk operations: status, country, activity type, delete
- [x] Coordinate picker (map + manual lat/lng)
- [x] Column visibility preferences
- [x] Mobile card view + desktop table view
- [x] Status management: active / pending / archived
- [x] Filters: country, water type, status, enhancement, verification, relevance flags
- [x] Google verification status (KEEP / REVIEW_NEGATIVE / NO_DATA)

### AI enhancement pipeline
- [x] Gemini 2.5 Flash + Google Search grounding via `/api/enhance-site`
- [x] JSON repair parser (handles comments, Python literals, trailing commas)
- [x] Quality scoring (0–100) with red-flag detection
- [x] Review queue: insufficient_data / parse_failed / quality_failed / enhanced / not_processed tabs
- [x] Global search across all review queue tabs
- [x] Retry dialog with editable name / location / country before calling Gemini
- [x] Re-parse feature — re-runs improved parser on stored raw without a Gemini call
- [x] Auto-persist failed retry results back to the correct queue tab
- [x] Force-save override for quality-failed enhancements
- [x] ✨ Enhance with Gemini button in Add Site dialog (auto-fills form on create)
- [x] 🌡️ Fetch water temps from coordinates (Open-Meteo Marine + Archive APIs)

### Public site
- [x] Site listing page with filters
- [x] Site detail page with marine life, highlights, facilities
- [x] Community "I've dived here" verification votes
- [x] SEO schema markup (structured data)
- [x] Blog / CMS

---

## Phase 1 — Go Public (Content & SEO)

Get enough sites and enough organic traffic to prove the concept.

### Content
- [ ] Reach 500+ enhanced dive sites (run the AI pipeline across existing data)
- [ ] Tide & current metadata per site — add fields to data model:
  - `tidePreference`: high / low / slack / any
  - `tidalSensitivity`: low / medium / high
  - `tidalNotes`: free text (e.g. "entry only possible above 1.2m")
  - `currentStrength`: none / mild / moderate / strong
  - Populated by Gemini enhancement prompt (add to existing prompt)
  - Admin-editable fallback
- [ ] Site photos — at least one cover photo per site (manual sourcing or user-submitted)
- [ ] Seasonal best-time section on site detail page

### SEO
- [ ] Location hub pages: `/dive-sites/[country]` and `/dive-sites/[region]` — high-volume organic
- [ ] Breadcrumb schema on all site pages
- [ ] Dynamic sitemap covering all active sites + hub pages
- [ ] Blog content targeting "best freediving sites in [country]" keywords

### Live conditions widget (site detail page)
Answers "should I dive there today?" in one glance.

```
🌊 Conditions now
Water: 24°C  |  Waves: 0.8m  |  Wind: 12 km/h NW (offshore — good)
🌙 Tide: Rising — High in 3h 20m (2.4m)  ⚡ Best at high tide
```

- [ ] Wave height + swell period (Open-Meteo Marine API — free, no key)
- [ ] Wind speed + direction (Open-Meteo standard forecast API — free, no key)
- [ ] Live sea surface temperature (Open-Meteo Marine — free, no key)
- [ ] Tide prediction chart — 48h sparkline with next high/low time
  - API: WorldTides.info (50 calls/day free, global coverage)
  - Cache result per site per day in Firestore to stay within free tier
  - Colour indicator: green if current tide matches `tidePreference`, amber otherwise
- [ ] Air temperature (Open-Meteo — useful for wetsuit choice)

### Affiliate links — deferred to Phase 4
Not worth setting up until there's real traffic. Add when monthly visitors are consistent.

---

## Phase 2 — Community (User Accounts & UGC)

Turn visitors into returning users. UGC improves SEO and data quality.

### User accounts
- [ ] Sign in with Google / Apple (Firebase Auth)
- [ ] Profile page: certification level (AIDA/Molchanovs/SSI), home country, personal bests
- [ ] Saved / favourited sites list

### Dive log
- [ ] "Log a dive" on site detail: date, depth, visibility, notes, buddy
- [ ] Personal dive history page
- [ ] Dive count badge on site detail ("47 freedivers logged this site")

### Reviews & ratings — deferred to Phase 3
Only worth building once the site has enough active users to generate meaningful reviews. Empty review sections look worse than no reviews at all.

### Photos
- [ ] User-submitted photos on site detail (Firebase Storage)
- [ ] Basic moderation (approve before showing)
- [ ] Cover photo selection in admin

### Report / corrections
- [ ] "Report incorrect info" button on site detail → feeds admin review queue
- [ ] "Suggest an edit" flow for depth, access, facilities

---

## Phase 3 — Network Effects (Bring People Together)

Features that only get better as more people use them.

### Buddy finder
The feature that drives repeat visits and word-of-mouth.
- [ ] Post a dive trip: location, dates, target depth, certification level required
- [ ] Browse open trips near a site
- [ ] Request to join / accept system
- [ ] Basic messaging between matched divers

### Instructor directory
- [ ] Instructor profiles: AIDA/Molchanovs/SSI level, languages, locations they teach at
- [ ] Linked to specific dive sites
- [ ] Contact button (email or WhatsApp)
- [ ] Free basic profile, paid verified badge

### Dive center listings
- [ ] Shore operators and boat operators linked to each site
- [ ] Equipment rental info, pricing range
- [ ] Free basic listing, paid featured placement

### Mobile PWA
- [ ] Offline-capable site detail pages (service worker cache)
- [ ] "Take me there" — GPS navigation to entry point coordinates
- [ ] Quick dive log entry from phone post-dive
- [ ] Add to home screen prompt

---

## Phase 4 — Monetization

Only build payment infrastructure once Phase 2–3 have proven retention.

### 1. Affiliate revenue (add when traffic is consistent)
- Gear, courses, travel bookings
- Target: €500–2,000/mo at 20k monthly visitors

### 2. Dive center & instructor verified listings (B2B SaaS)
| Tier | Price | What they get |
|------|-------|---------------|
| Free | €0 | Basic listing, one photo, contact info |
| Verified | €29/mo | Verified badge, 10 photos, priority position, contact button |
| Featured | €79/mo | Top placement on site page, booking enquiry form, analytics |

Target: 200 verified operators × €29 = **€5,800 MRR** first milestone.

### 3. Pro membership for divers
| Tier | Price | What they get |
|------|-------|---------------|
| Free | €0 | Full browsing, basic dive log, conditions widget |
| Pro | €6.99/mo or €49/yr | Offline maps, dive log export (PDF/CSV), conditions alerts, trip planning, no ads |

### 4. Sponsored content & brand partnerships
- Wetsuit / fin brands pay for editorial "best gear for [site]" content
- Dive travel operators pay for featured destination guides
- Only realistic at 50k+ monthly visitors

### 5. Data licensing (long term)
- Structured database (marine life, depths, conditions, coordinates) has value to:
  - Dive computer makers (Garmin, Suunto, Shearwater)
  - Dive app developers
  - Academic / conservation research
- License as an API (per-call or annual flat fee)

---

## Metrics to watch

| Stage | Key metric |
|-------|-----------|
| Phase 1 | Sites enhanced · Organic search traffic · Affiliate clicks |
| Phase 2 | MAU · Dive logs submitted · Reviews written |
| Phase 3 | Buddy matches made · Instructor profile views |
| Phase 4 | MRR · Pro conversion rate · Operator churn |

---

## Competitive moat

Generic dive platforms (Diveboard, DiveSite.io) have location + depth. Bluemind has freediver score, line diving details, access method, freediver conditions, marine life with scientific names and seasonal behaviour, monthly water temps, tide preference, tidal conditions, and a pipeline to keep improving it automatically. That's an asset that compounds — every site added and every AI enhancement run makes it harder to replicate.
