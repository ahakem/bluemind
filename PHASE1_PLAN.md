# Phase 1 — Go Public: Implementation Plan

## What exists already
- `/dive-sites/country/[country]` — proper SEO country pages ✅
- `/dive-sites/city/[city]` — city pages ✅
- `sitemap.ts` — exists but points countries to `?country=` query params instead of the SEO pages ❌
- `bestSeasons` + `waterTemp` fields on DiveSite ✅
- Tide/current fields — NOT in data model yet ❌
- Conditions widget — does not exist ❌

---

## Task order

### 1. Fix sitemap (30 min) 🟢 Quick win
**Why:** Google is currently indexing `/dive-sites?country=Netherlands` instead of `/dive-sites/country/netherlands`.
The real SEO pages exist but Google doesn't know about them.

- Change `countryEntries` in `sitemap.ts` to use `/dive-sites/country/[slug]` URLs
- Add city page entries: `/dive-sites/city/[slug]`
- Keep continents + water type filter URLs as-is (those don't have dedicated pages)

Files: `src/app/sitemap.ts`

---

### 2. Breadcrumb schema on country + city pages (1–2h) 🟢 Quick win
**Why:** Breadcrumbs in Google search results improve CTR. Currently no breadcrumb JSON-LD on listing pages.

Structure:
```
Home > Dive Sites > Netherlands > Amsterdam
```

- Add `BreadcrumbList` JSON-LD to `CountryListingClient` and `CityListingClient`
- Add to site detail page too: `Home > Dive Sites > [Country] > [Site Name]`

Files: `src/app/dive-sites/country/[country]/CountryListingClient.tsx`,
       `src/app/dive-sites/city/[city]/CityListingClient.tsx`,
       `src/app/dive-sites/[slug]/DiveSiteDetailClient.tsx`

---

### 3. Tide & current fields — data model + admin (half day) 🟡
**Why:** Needed before conditions widget. Also enriches site detail pages immediately.

Add to `DiveSite` type and `docToDiveSite`:
```typescript
tidePreference?:   'high' | 'low' | 'slack' | 'any'
tidalSensitivity?: 'low' | 'medium' | 'high'
tidalNotes?:       string   // "Entry only at high tide"
currentDirection?: 'incoming' | 'outgoing' | 'both' | 'none'
currentStrength?:  'none' | 'mild' | 'moderate' | 'strong'
```

- Add to `src/types/admin.ts`
- Add to `docToDiveSite` in `diveSiteService.ts`
- Add editable fields to the admin Edit Site dialog (compact row, sea sites only)

Files: `src/types/admin.ts`, `src/lib/diveSiteService.ts`,
       `src/app/admin/dive-sites/page.tsx`

---

### 4. Update Gemini prompt to extract tide fields (1h) 🟡
**Why:** Auto-populates tide data for all sites during enhancement runs.

Add to the JSON structure in `enhance-site/route.ts` and `enhance-dive-sites.js`:
```json
"tidePreference": "high|low|slack|any",
"tidalSensitivity": "low|medium|high",
"tidalNotes": "specific note or null",
"currentDirection": "incoming|outgoing|both|none",
"currentStrength": "none|mild|moderate|strong"
```

Files: `src/app/api/enhance-site/route.ts`, `scripts/enhance-dive-sites.js`

---

### 5. Run AI pipeline on remaining sites (operational, no code)
**Why:** Need 500+ enhanced sites for Phase 1.

```bash
node scripts/enhance-dive-sites.js --skip-enhanced --limit=200
```

Run in batches. Monitor the review queue in admin. Force-apply quality_failed ones manually.

---

### 6. `/api/conditions` route — live wave + wind + SST (2h) 🟡
**Why:** Powers the conditions widget. Open-Meteo — free, no API key.

Endpoint: `POST /api/conditions` with `{ lat, lng, waterType }`

Fetches in parallel:
- Open-Meteo Marine API → `wave_height`, `wave_period`, `swell_wave_height`, `sea_surface_temperature`
- Open-Meteo Forecast API → `wind_speed_10m`, `wind_direction_10m`, `temperature_2m`

Returns current hour values + next 24h forecast.
No caching needed — Open-Meteo is fast and free.

Files: `src/app/api/conditions/route.ts`

---

### 7. `/api/tide` route — tide predictions with Firestore cache (2–3h) 🔴 Needs API key
**Why:** WorldTides API is free for 50 calls/day. Caching in Firestore keeps it within the limit.

Endpoint: `POST /api/tide` with `{ lat, lng, siteId }`

Logic:
1. Check Firestore `_tideCache/{siteId}_{YYYYMMDD}` — if exists, return cached
2. Otherwise call WorldTides API (`api.worldtides.info/v3`)
3. Store result in Firestore with TTL = end of day
4. Return next 5 high/low times + hourly heights for 48h

Requires: `WORLDTIDES_API_KEY` in `.env.local`

Files: `src/app/api/tide/route.ts`

---

### 8. ConditionsWidget component on site detail page (3–4h) 🟡
**Why:** "Should I dive here today?" answered in one glance — nothing like this on any other dive site.

Visual design:
```
┌─────────────────────────────────────────────┐
│ 🌊 Conditions now          📍 Based on coords│
├──────────────┬──────────────┬───────────────┤
│ Waves  0.8m  │ Wind  12 NW  │ Water  24°C   │
│ Swell  1.2m  │ (offshore ✓) │ Air    28°C   │
├──────────────────────────────────────────────┤
│ 🌙 Tide: Rising · High in 3h 20m (2.4m)     │
│ ████████░░░░░░░░░░░░  ← 48h sparkline       │
│ ⚡ Best at high tide · Sensitivity: medium  │
└─────────────────────────────────────────────┘
```

- Shows for sea + lake sites (skip deep_tank)
- Wind direction relative to site orientation if known (onshore/offshore)
- Tide section only renders if WorldTides key is configured
- Graceful fallback if either API fails
- Client-side fetch on page load, shows skeleton while loading

Files: `src/components/ConditionsWidget.tsx`,
       `src/app/dive-sites/[slug]/DiveSiteDetailClient.tsx`

---

### 9. Seasonal best-time section on site detail (2h) 🟢 Easy
**Why:** Useful content that improves page quality for SEO. Data already exists.

Uses existing `bestSeasons` + `waterTemp` fields to generate a "Best time to visit" block:
- Monthly water temp bar/heatmap (already partially shown)
- Best seasons highlighted
- Visibility range per season if available

Files: `src/app/dive-sites/[slug]/DiveSiteDetailClient.tsx`

---

## Summary

| # | Task | Effort | Depends on | Priority |
|---|------|--------|------------|----------|
| 1 | Fix sitemap | 30 min | — | 🔥 Do first |
| 2 | Breadcrumb schema | 1–2h | — | 🔥 Do first |
| 3 | Tide data model + admin | 0.5 day | — | High |
| 4 | Gemini prompt update | 1h | #3 | High |
| 5 | Run AI pipeline | operational | #4 | Ongoing |
| 6 | `/api/conditions` route | 2h | — | High |
| 7 | `/api/tide` route | 2–3h | WorldTides key | Medium |
| 8 | ConditionsWidget UI | 3–4h | #6, #7 | High |
| 9 | Seasonal section | 2h | — | Medium |

**Recommended start order:** 1 → 2 → 6 → 3 → 4 → 8 → 7 → 9 → 5 (ongoing)

Tasks 1 and 2 are pure SEO and take under 2 hours total.
Tasks 3, 4, 6, 8 are the core of Phase 1 — conditions widget end to end.
Task 7 can be skipped initially (show conditions without tide until WorldTides key is set up).
