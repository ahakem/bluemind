# Dive Sites Enhancer

Batch-enhances dive site descriptions using **Gemini 1.5 Flash + Google Search grounding**.
Zero tolerance for generic content — every description is researched and validated.

---

## Setup

### 1. Add to `.env.local`

```env
GEMINI_API_KEY=AIzaSyXXXXXX          # from aistudio.google.com

# Add these:
FIREBASE_SERVICE_ACCOUNT=/absolute/path/to/serviceAccount.json
FIREBASE_DATABASE_ID=landing         # your named Firestore database
```

Get the service account JSON from:
**Firebase Console → Project Settings → Service accounts → Generate new private key**

### 2. Verify packages

```bash
node -e "require('@google/generative-ai'); console.log('ok')"
node -e "require('@google-cloud/firestore'); console.log('ok')"
```

---

## Usage

### Step 1 — Test one site first

```bash
node scripts/test-single-site.js <site-id>
```

Shows full prompt → raw Gemini response → validation breakdown → asks before saving.

Example:
```bash
node scripts/test-single-site.js "t-dolfijntje"
```

### Step 2 — Test on 10 sites (dry run)

```bash
node scripts/enhance-dive-sites.js --limit=10 --dry-run
```

No writes. Shows what would happen.

### Step 3 — Test on 10 sites (live)

```bash
node scripts/enhance-dive-sites.js --limit=10
```

Writes to Firestore. Check `_needsReview` collection for flagged sites.

### Step 4 — Full run

```bash
node scripts/enhance-dive-sites.js --skip-enhanced
```

Skips sites that already have `enhancedAt` set.

### Resume after interruption

```bash
node scripts/enhance-dive-sites.js --resume --skip-enhanced
```

Picks up from the last successfully processed site (stored in `_processingStatus/enhance-dive-sites`).

---

## CLI Flags

| Flag | Description |
|---|---|
| `--skip-enhanced` | Skip sites where `enhancedAt` is already set |
| `--dry-run` | No Firestore writes; shows what would be saved |
| `--resume` | Resume from last checkpoint |
| `--limit=N` | Process only N sites |

---

## Quality Scoring

Every Gemini response is scored 0–100:

| Signal | Points |
|---|---|
| Specific depth numbers (e.g. "40m") | +20 |
| Named features (e.g. "Eel Garden reef") | +20 |
| ≥ 2 source URLs | +25 |
| Confidence rating (high/medium) | +15 |
| Structured marine life data | +15 |
| Scientific species names | +5 |
| Generic phrase detected | −10 each |
| Description < 300 chars | −20 |
| < 2 paragraphs | −15 |
| < 4 highlights | −10 |

**Minimum to pass: 60/100 AND zero generic phrases**

Failed sites → saved to `_needsReview` collection with full breakdown.

---

## What Gets Written to Each Site

```
description           — 2-3 factual paragraphs
highlights            — 4-5 specific bullets
maxDepth              — updated if found
visibilityRange       — "15-25m typical"
freediverFriendly     — yes / maybe / no / unknown
freediverFriendlyReason
hasLineDiving         — yes / partial / no
lineDivingDetails
freediverDepthRange
freediverAccess       — shore / boat / both / unknown
freediverConditions   — calm / moderate / challenging
facilities            — { diveCenter, restaurant, parking, equipment, accommodation, depthMarkers }
marineLife            — { fish[], corals[], macro[], pelagic[], specialSightings[] }
sources               — array of URLs from Google Search
confidence            — high / medium / low
qualityScore          — 0-100
enhancedAt            — ISO timestamp
enhancedBy            — "gemini-1.5-flash-search"
```

---

## Monitoring

- **Progress**: printed live during run
- **Checkpoint**: stored in `_processingStatus/enhance-dive-sites`
- **Review queue**: `_needsReview` collection
  - `flag: "insufficient_data"` — Gemini couldn't find specific data
  - `flag: "quality_check_failed"` — response had generic phrases or low score
  - `flag: "parse_failed"` — invalid JSON returned

---

## Estimated Cost (Gemini 1.5 Flash)

| Items | Tokens | Cost |
|---|---|---|
| 1 site | ~1,500 | ~$0.001 |
| 100 sites | ~150,000 | ~$0.05 |
| 1,000 sites | ~1,500,000 | ~$0.50 |

Google Search grounding included at no extra charge (AI Studio plan).

---

## Troubleshooting

**`FIREBASE_SERVICE_ACCOUNT not set`** — Add path to `.env.local`

**`API_KEY_INVALID`** — Check `GOOGLE_API_KEY` in `.env.local`

**`PERMISSION_DENIED`** — Enable Gemini API in [Google Cloud Console](https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com)

**`RESOURCE_EXHAUSTED`** — Rate limit hit; script auto-waits 60s and retries

**All sites going to `_needsReview`** — Run `test-single-site.js` first to debug the prompt/response cycle
