# Scraper & Enrichment Scripts

All commands run from the `scraper/` directory.  
Prerequisites: `GOOGLE_APPLICATION_CREDENTIALS` and `ANTHROPIC_API_KEY` set in `.env`.

---

## Run order (first time)

| Step | Script | Time | Cost | Status |
|------|--------|------|------|--------|
| 1 | `fix-countries` | ~30 min | free | ✅ done |
| 2 | `enrich-climate` | ~60 min | free | ✅ done |
| 3 | `score-sites` | ~instant | free | ✅ done |
| 4 | `classify-sites` | ~5 min | ~$0.05 | 🔄 running |
| 5 | `fix-depths` | ~10 min | ~$0.01 | ⏳ next |
| 6 | `enrich-highlights` | ~30 min | ~$0.50 | ⏳ waiting |
| 7 | Admin review | — | — | ⏳ waiting |

---

## ⏳ Next: after enrich-climate finishes

```bash
# Step 3 — keyword scoring (instant, no API)
npx ts-node src/score-sites.ts

# Step 4 — AI classification: cuts ~1800 → ~200-300 sites
npx ts-node src/classify-sites.ts --dry-run   # preview first
npx ts-node src/classify-sites.ts             # apply

# Step 5 — enrich survivors with highlights + species
npx ts-node src/enrich-highlights.ts --limit 5   # test first
npx ts-node src/enrich-highlights.ts             # run all

# Step 6 — review in admin panel
# Filter: Relevance → Needs Review → manually keep/delete borderline sites
# Then bulk-activate the good ones
# Then deploy so detail pages get built
```

---

## fix-countries

Reverse-geocodes every site from Nominatim to fix: `country`, `countryCode`,
`location`, `waterBodyName`, `waterType`, `depth`, `sport`, `access`, `wikipedia`.
Also clears scraper junk: `photos → []`, deletes `sourceUrl`.

```bash
# Test on 10 sites
npx ts-node src/fix-countries.ts --limit 10

# Run on all sites
npx ts-node src/fix-countries.ts
```

> Rate limit: 1 req/sec (Nominatim policy). ~1800 sites ≈ 30 min.

---

## enrich-climate

Fetches monthly climate data from Open-Meteo (free, no key needed).  
Writes: `airTempByMonth`, `waterTemp` (SST for sea, air temp for inland), `bestSeasons`.  
Skips sites already enriched unless `--force` is passed.

```bash
# Test on 5 sites
npx ts-node src/enrich-climate.ts --limit 5

# Run on all sites
npx ts-node src/enrich-climate.ts

# Re-run on already-enriched sites
npx ts-node src/enrich-climate.ts --force

# Re-run on first 20 (force)
npx ts-node src/enrich-climate.ts --limit 20 --force
```

> ~2 API calls per site (archive + marine). ~1800 sites ≈ 60 min.

---

## score-sites

Keyword scoring — no API calls, runs instantly.

- Score **< 20** → auto-archived + `scubaOnly: true`
- Score **20–44** → `needsReview: true`
- Score **45+** → clean
- `depthUnknown: true` where `maxDepth` is 0 or missing

```bash
# Dry run — see score distribution without writing
npx ts-node src/score-sites.ts --dry-run

# Test on first 100
npx ts-node src/score-sites.ts --limit 100

# Run on all
npx ts-node src/score-sites.ts
```

---

## fix-depths

Fixes inaccurate max depth values:
- **Sea sites** → GEBCO ocean bathymetry via opentopodata.org (free, batched 100/req, no key)
- **Inland sites** (lake/quarry/river/pool) → Claude Haiku by site name + location

Writes: `maxDepth`, `depthSource` (`'gebco'` | `'ai'` | `'manual'`), `depthUnknown: false`.  
Skips archived sites and sites already fixed unless `--force`.  
Never overwrites `depthSource: 'manual'` unless `--force`.

```bash
# Dry run — see what would change
npx ts-node src/fix-depths.ts --dry-run

# Test on 20 sites
npx ts-node src/fix-depths.ts --limit 20

# Run on all non-archived sites
npx ts-node src/fix-depths.ts

# Re-run everything (including already-fixed)
npx ts-node src/fix-depths.ts --force
```

> Cost: free for sea (GEBCO), ~$0.01 for inland (Claude). Run AFTER classify-sites.

---

## classify-sites

Claude Haiku classifies each site as freediving-relevant or not.
Archives irrelevant sites before running the expensive highlights enrichment.
Skips already-archived and already-classified sites unless `--force`.

- `keep: false` → `status: archived` + `classifyReason`
- `keep: true, confidence: low` → `needsReview: true` (flag for human review)

```bash
# Dry run — preview without writing
npx ts-node src/classify-sites.ts --dry-run

# Test on 20 sites
npx ts-node src/classify-sites.ts --limit 20

# Run on all unclassified sites
npx ts-node src/classify-sites.ts

# Re-classify everything
npx ts-node src/classify-sites.ts --force
```

> Cost: ~$0.05 for all 1800 sites. Run BEFORE enrich-highlights.

---

## enrich-highlights

Fetches real species from iNaturalist + uses Claude Haiku to write
4 freediving-specific highlights per site.  
Writes: `highlights`, `observedSpecies`, `highlightsEnriched: true`.  
Skips already-enriched sites unless `--force`.

```bash
# Test on 5 sites
npx ts-node src/enrich-highlights.ts --limit 5

# Test on 20 sites
npx ts-node src/enrich-highlights.ts --limit 20

# Run on all surviving sites
npx ts-node src/enrich-highlights.ts

# Re-run on already-enriched sites
npx ts-node src/enrich-highlights.ts --force
```

> Cost: ~$0.50 for ~300 surviving sites. Run AFTER classify-sites.

---

## Scraper (re-scrape)

Scrapes divers-guide.com and saves new sites to Firestore with `status: pending`.
Skips slugs that already exist.

```bash
# Dry run — scrape but don't save
npx ts-node src/run.ts --dry-run

# Test on 10 sites
npx ts-node src/run.ts --limit 10

# Scrape a single site by slug
npx ts-node src/run.ts --slug blue-hole-egypt

# Full scrape
npx ts-node src/run.ts
```

---

## Notes

- All scripts respect `--limit N` to process only the first N docs.
- Logs are pretty-printed. Pipe to `pino-pretty` if needed:
  ```bash
  npx ts-node src/fix-countries.ts 2>&1 | npx pino-pretty
  ```
