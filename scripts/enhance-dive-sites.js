'use strict';
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Firestore }  = require('@google-cloud/firestore');
const fs             = require('fs');
const readline       = require('readline');

// ─── CLI flags ────────────────────────────────────────────────────────────────
const argv             = process.argv.slice(2);
const FLAG_SKIP_DONE   = argv.includes('--skip-enhanced');   // skip already enhanced
const FLAG_DRY_RUN     = argv.includes('--dry-run');          // no writes
const FLAG_RESUME      = argv.includes('--resume');           // resume from checkpoint
const FLAG_LIMIT       = parseInt((argv.find(a => a.startsWith('--limit=')) || '').split('=')[1]) || 0;

// ─── Config ───────────────────────────────────────────────────────────────────
const GEMINI_API_KEY       = process.env.GEMINI_API_KEY       ?? '';
const SERVICE_ACCOUNT_PATH = process.env.FIREBASE_SERVICE_ACCOUNT ?? '';
const DATABASE_ID          = process.env.FIREBASE_DATABASE_ID ?? 'landing';
const COLLECTION           = 'diveSites';
const REVIEW_COLLECTION    = '_needsReview';
const STATUS_COLLECTION    = '_processingStatus';
const STATUS_DOC           = 'enhance-dive-sites';
const BATCH_SIZE           = 1;
const DELAY_MS             = 4500;           // free tier: 15 RPM → 1 req/4.5s to stay safe
const MIN_QUALITY_SCORE    = 60;
const GEMINI_MODEL         = 'gemini-2.5-flash';

// ─── Generic phrases that trigger auto-rejection ──────────────────────────────
const RED_FLAGS = [
  'crystal clear',
  'stunning coral',
  'stunning formation',
  'perfect for all levels',
  'diverse marine life',
  'world-class diving',
  'world-class',
  'pristine conditions',
  'pristine waters',
  'breathtaking scenery',
  'breathtaking underwater',
  'abundant sea life',
  'excellent visibility',
  'excellent conditions',
  'beautiful coral',
  'teeming with',
  'thriving ecosystem',
];

// ─── Firestore init ───────────────────────────────────────────────────────────
function initFirestore() {
  if (!SERVICE_ACCOUNT_PATH) {
    console.error('❌  FIREBASE_SERVICE_ACCOUNT env var is not set.');
    console.error('   Set it to the absolute path of your service account JSON.');
    process.exit(1);
  }
  const sa = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));
  return new Firestore({
    projectId:   sa.project_id,
    credentials: sa,
    databaseId:  DATABASE_ID,
  });
}

// ─── Gemini init ──────────────────────────────────────────────────────────────
function initGemini() {
  if (!GEMINI_API_KEY) {
    console.error('❌  GEMINI_API_KEY env var is not set.');
    process.exit(1);
  }
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    tools: [{ googleSearch: {} }],
    generationConfig: {
      temperature:     0.1,   // low for factual content
      maxOutputTokens: 8192,
    },
  });
  return model;
}

// ─── Schema discovery ─────────────────────────────────────────────────────────
async function discoverSchema(db) {
  console.log('\n📋 STEP 0: Discovering schema from Firestore…\n');

  const snap = await db.collection(COLLECTION).limit(5).get();
  if (snap.empty) {
    console.error(`❌  Collection '${COLLECTION}' is empty or not found.`);
    process.exit(1);
  }

  const fieldTypes = {};
  const fieldSamples = {};
  snap.docs.forEach(doc => {
    const data = doc.data();
    Object.entries(data).forEach(([k, v]) => {
      const t = v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v;
      fieldTypes[k] = fieldTypes[k] || t;
      if (!fieldSamples[k]) {
        if (typeof v === 'string' && v.length > 80) fieldSamples[k] = v.slice(0, 80) + '…';
        else if (Array.isArray(v)) fieldSamples[k] = `[${v.slice(0, 2).map(x => JSON.stringify(x)).join(', ')}${v.length > 2 ? ', …' : ''}]`;
        else fieldSamples[k] = JSON.stringify(v)?.slice(0, 80);
      }
    });
  });

  console.log(`Found ${snap.size} sample document(s). Schema:\n`);
  console.log('  Field                       Type        Sample value');
  console.log('  ' + '─'.repeat(72));
  Object.entries(fieldTypes).sort().forEach(([k, t]) => {
    const sample = (fieldSamples[k] ?? '').toString().replace(/\n/g, ' ');
    console.log(`  ${k.padEnd(28)} ${t.padEnd(10)} ${sample}`);
  });

  // Enhancement status
  const enhanced = snap.docs.filter(d => d.data().enhancedAt).length;
  console.log(`\n  enhancedAt present in ${enhanced}/${snap.size} sampled docs`);
  console.log(`  Database: ${DATABASE_ID}  |  Collection: ${COLLECTION}  |  Total: (counting…)`);

  const total = (await db.collection(COLLECTION).count().get()).data().count;
  console.log(`  Total documents: ${total}`);

  return { fieldTypes, total };
}

// ─── Prompt builder ───────────────────────────────────────────────────────────
function buildPrompt(siteData) {
  const name     = siteData.name     || 'Unknown Site';
  const location = [siteData.location, siteData.country].filter(Boolean).join(', ') || 'Unknown location';
  const existing = {
    description: siteData.description?.slice(0, 300) || '',
    maxDepth:    siteData.maxDepth,
    waterType:   siteData.waterType,
    tags:        siteData.tags,
    highlights:  siteData.highlights,
  };

  return `You are a professional dive site researcher. Use Google Search to find FACTUAL, SPECIFIC information about this dive site.

DIVE SITE: ${name}
LOCATION: ${location}
WATER TYPE: ${siteData.waterType || 'unknown'}
EXISTING DATA: ${JSON.stringify(existing, null, 2)}

=== MANDATORY SEARCH INSTRUCTIONS ===

Execute ALL of these searches before writing anything:
1. "${name} diving ${location}"
2. "${name} dive site"
3. "${name} freediving"
4. "${name} depth ${location}"

Prioritize (most reliable to least):
1. Official dive center websites
2. Established dive travel guides
3. Dive logs with dated reports
4. Official park / marine reserve sites

=== WHAT TO EXTRACT ===

LOCATION & ACCESS:
- Exact position: coordinates, distance from landmarks
- Shore / boat / both access with specific entry points
- How to reach, parking, mooring buoys

DEPTHS & TOPOGRAPHY:
- Specific depth ranges with numbers: "5-40m", "drops to 60m at wall"
- Named features: reef names, wreck names, walls, pinnacles, canyons, gardens
- Measurements of specific features
- Depth infrastructure: "fixed buoys at 15m, 20m, 30m, 40m"

MARINE LIFE (extract DETAILED information):
Fish: common name + scientific name, depth/location, frequency, season
Corals: types (hard/soft/table/gorgonian), location, health condition
Macro: nudibranchs, eels, octopus, shrimp, pipefish with scientific names
Pelagic: dolphins, rays, turtles, sharks — frequency and seasonality
Special: rare sightings, night dive species, resident individuals

CONDITIONS:
- Visibility: specific range from actual reports (e.g., "15-25m in summer")
- Currents: factual description ("gentle slope current", "strong rip on incoming tide")
- Best season with specific months
- Any restrictions or protected status

FREEDIVING SPECIFIC:
- Depth training infrastructure: lines, platforms, buoys with exact depths
- AIDA competitions or records set here
- Shore accessibility, calm water areas
- Vertical drop-offs, caves, or features for depth training

=== QUALITY RULES ===

Your description MUST:
1. Be 2-3 SUBSTANTIAL paragraphs (not summaries — real paragraphs with multiple sentences)
2. Follow this structure: [Para 1] Location, access, topography → [Para 2] Features, depths, infrastructure → [Para 3] Marine life with species → [Para 4 if needed] Conditions, season
3. Include specific measurements in EVERY paragraph
4. Name actual features — not "a reef" but "the Eel Garden reef"
5. Document actual species — not "diverse fish" but "schools of barracuda (Sphyraena barracuda) at 25m"
6. Describe real infrastructure with specs

FORBIDDEN PHRASES — if you use any of these, your response is invalid:
crystal clear | stunning | perfect for all levels | diverse marine life | world-class | pristine | breathtaking | excellent visibility | abundant sea life | teeming with

If you cannot find SPECIFIC factual information, return:
{ "error": "insufficient_data", "searchQueriesUsed": ["q1", "q2"], "partialDataFound": {} }

DO NOT generate plausible-sounding content to fill gaps. Gaps = insufficient_data.

=== OUTPUT FORMAT — return ONLY valid JSON ===

{
  "description": "Paragraph 1: specific location details...\\n\\nParagraph 2: depths, features, infrastructure...\\n\\nParagraph 3: documented marine life with species names...",
  "highlights": [
    "Specific feature with measurements",
    "Named location or infrastructure",
    "Documented marine life with species",
    "Actual depth markers or facilities",
    "Access or condition detail"
  ],
  "maxDepth": "40m",
  "visibilityRange": "15-25m typical summer",
  "freediverFriendly": "yes",
  "freediverFriendlyReason": "Shore accessible, calm bay, fixed buoys at 15/20/30/40m",
  "hasLineDiving": "yes",
  "lineDivingDetails": "Fixed buoys at specific depths" or null,
  "freediverDepthRange": "5-40m with marked stations",
  "freediverAccess": "shore",
  "freediverConditions": "calm",
  "facilities": {
    "diveCenter": true,
    "restaurant": false,
    "parking": true,
    "equipment": true,
    "accommodation": false,
    "depthMarkers": ["15m", "20m", "30m", "40m"]
  },
  "marineLife": {
    "fish": [
      {
        "name": "Barracuda",
        "scientificName": "Sphyraena barracuda",
        "frequency": "common",
        "location": "schools at 20-25m near drop-off",
        "season": "year-round"
      }
    ],
    "corals": [
      {
        "type": "Table corals",
        "location": "coral garden behind saddle at 15-20m",
        "condition": "healthy"
      }
    ],
    "macro": [
      {
        "name": "Garden eels",
        "scientificName": "Heteroconger hassi",
        "frequency": "abundant",
        "location": "sandy slope 5-30m",
        "behavior": "retreat into burrows when approached"
      }
    ],
    "pelagic": [
      {
        "name": "Eagle rays",
        "frequency": "occasional",
        "season": "more common May-October"
      }
    ],
    "specialSightings": ["Resident turtle near mooring buoy", "Spanish dancers during night dives"]
  },
  "sources": ["https://...", "https://..."],
  "confidence": "high"
}`;
}

// ─── JSON extraction ──────────────────────────────────────────────────────────
function fixControlChars(s) {
  let inString = false, escaped = false, result = '';
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (escaped) { result += c; escaped = false; continue; }
    if (c === '\\') { result += c; escaped = true; continue; }
    if (c === '"') { inString = !inString; result += c; continue; }
    if (inString) {
      if (c === '\n') { result += '\\n'; continue; }
      if (c === '\r') { result += '\\r'; continue; }
      if (c === '\t') { result += '\\t'; continue; }
    }
    result += c;
  }
  return result;
}

function extractJSON(text) {
  const cleaned = text.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '').trim();
  const candidates = [];
  const codeBlock = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock) candidates.push(codeBlock[1].trim());
  candidates.push(cleaned);
  const objMatch = cleaned.match(/\{[\s\S]*\}/);
  if (objMatch) candidates.push(objMatch[0]);
  for (const candidate of candidates) {
    try { return JSON.parse(candidate); } catch {}
    try { return JSON.parse(fixControlChars(candidate)); } catch {}
  }
  return null;
}

// ─── Quality validator ────────────────────────────────────────────────────────
function validateQuality(enhanced, siteName) {
  let score = 0;
  const issues = [];
  const text = [
    enhanced.description || '',
    ...(enhanced.highlights || []),
    enhanced.freediverFriendlyReason || '',
  ].join(' ');

  // Generic red flags — each costs 10 points and is a hard fail
  let flagCount = 0;
  RED_FLAGS.forEach(flag => {
    if (text.toLowerCase().includes(flag.toLowerCase())) {
      score -= 10;
      flagCount++;
      issues.push(`Generic phrase detected: "${flag}"`);
    }
  });

  // Positive signals
  const hasDepthNumbers  = /\d+\s*m(?:eters?)?(?:\s|,|\.|$)/i.test(text);
  const hasSpecificNames = /[A-Z][a-z]+(?:\s+[A-Za-z]+)?\s+(?:reef|wreck|wall|cave|garden|pinnacle|arch|canyon)/i.test(text);
  const hasSources       = Array.isArray(enhanced.sources) && enhanced.sources.length >= 2;
  const hasConfidence    = ['high', 'medium'].includes(enhanced.confidence);
  const hasMarineLife    = !!(enhanced.marineLife && (
    (enhanced.marineLife.fish?.length   > 0) ||
    (enhanced.marineLife.corals?.length > 0) ||
    (enhanced.marineLife.macro?.length  > 0) ||
    (enhanced.marineLife.pelagic?.length > 0)
  ));
  const hasSciNames      = hasMarineLife &&
    JSON.stringify(enhanced.marineLife).includes('"scientificName"');
  const descLength       = (enhanced.description || '').length;
  const descParas        = (enhanced.description || '').split('\n\n').length;
  const hlCount          = (enhanced.highlights || []).length;

  if (hasDepthNumbers)  { score += 20; } else { issues.push('No specific depth numbers found'); }
  if (hasSpecificNames) { score += 20; } else { issues.push('No named features found (reef, wreck, wall…)'); }
  if (hasSources)       { score += 25; } else { issues.push('Fewer than 2 source URLs'); }
  if (hasConfidence)    { score += 15; } else { issues.push('No confidence rating'); }
  if (hasMarineLife)    { score += 15; } else { issues.push('No structured marine life data'); }
  if (hasSciNames)      score += 5;

  if (descLength < 300) { score -= 20; issues.push(`Description too short (${descLength} chars, need 300+)`); }
  if (descParas  < 2)   { score -= 15; issues.push('Description needs at least 2 paragraphs'); }
  if (hlCount    < 4)   { score -= 10; issues.push(`Too few highlights (${hlCount}, need 4+)`); }

  const finalScore = Math.max(0, Math.min(100, score));

  return {
    isValid:         finalScore >= MIN_QUALITY_SCORE && flagCount === 0,
    score:           finalScore,
    flagCount,
    issues,
    hasDepthNumbers,
    hasSpecificNames,
    hasSources,
    hasMarineLife,
    hasSciNames,
    siteName,
  };
}

// ─── Cost tracker ─────────────────────────────────────────────────────────────
class CostTracker {
  constructor() { this.inputTokens = 0; this.outputTokens = 0; }
  add(promptLen, responseLen) {
    this.inputTokens  += Math.ceil(promptLen  / 4);
    this.outputTokens += Math.ceil(responseLen / 4);
  }
  summary() {
    const inputCost  = (this.inputTokens  / 1_000_000) * 0.075;
    const outputCost = (this.outputTokens / 1_000_000) * 0.30;
    return {
      inputTokens:  this.inputTokens,
      outputTokens: this.outputTokens,
      estimatedCost: `$${(inputCost + outputCost).toFixed(4)}`,
    };
  }
}

// ─── Resume / progress ────────────────────────────────────────────────────────
async function getCheckpoint(db) {
  const snap = await db.collection(STATUS_COLLECTION).doc(STATUS_DOC).get();
  return snap.exists ? snap.data() : null;
}

async function saveCheckpoint(db, lastId, stats) {
  await db.collection(STATUS_COLLECTION).doc(STATUS_DOC).set({
    lastProcessedId: lastId,
    ...stats,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
}

// ─── Site enhancer ────────────────────────────────────────────────────────────
async function enhanceSite(model, db, siteId, siteData, costTracker) {
  const prompt = buildPrompt(siteData);
  let raw = '';
  let sources = [];

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    raw = response.text();

    // Extract grounding sources
    const meta = response.candidates?.[0]?.groundingMetadata;
    sources = (meta?.groundingChunks ?? [])
      .map(c => c.web?.uri)
      .filter(Boolean);

    costTracker.add(prompt.length, raw.length);
  } catch (err) {
    if (err.message?.includes('API_KEY_INVALID')) {
      console.error('\n❌  Invalid API key — check GEMINI_API_KEY in .env');
      process.exit(1);
    }
    if (err.message?.includes('PERMISSION_DENIED')) {
      console.error('\n❌  Permission denied — enable Gemini API in Google Cloud Console');
      process.exit(1);
    }
    if (err.message?.includes('RESOURCE_EXHAUSTED')) {
      console.log('⚠️  Rate limit hit — waiting 60s…');
      await sleep(60_000);
      return enhanceSite(model, db, siteId, siteData, costTracker); // retry once
    }
    console.error(`   API error: ${err.message}`);
    return null;
  }

  const parsed = extractJSON(raw);

  if (!parsed) {
    console.log('   ⚠️  Could not parse JSON from response');
    await db.collection(REVIEW_COLLECTION).doc(siteId).set({
      originalData:        siteData,
      rawResponse:         raw.slice(0, 2000),
      flag:                'parse_failed',
      model:               GEMINI_MODEL,
      timestamp:           new Date().toISOString(),
    });
    return { skipped: true, reason: 'JSON parse failed' };
  }

  if (parsed.error === 'insufficient_data') {
    await db.collection(REVIEW_COLLECTION).doc(siteId).set({
      originalData:        siteData,
      attemptedEnhancement: parsed,
      partialDataFound:    parsed.partialDataFound ?? {},
      flag:                'insufficient_data',
      searchQueriesUsed:   parsed.searchQueriesUsed ?? [],
      model:               GEMINI_MODEL,
      timestamp:           new Date().toISOString(),
    });
    return { skipped: true, reason: 'insufficient_data' };
  }

  // Merge grounding sources with any declared in the JSON
  const allSources = [...new Set([...sources, ...(parsed.sources ?? [])])].slice(0, 10);
  parsed.sources = allSources;

  const validation = validateQuality(parsed, siteData.name || siteId);

  if (!validation.isValid) {
    await db.collection(REVIEW_COLLECTION).doc(siteId).set({
      originalData:         siteData,
      attemptedEnhancement: parsed,
      validationScore:      validation.score,
      flagCount:            validation.flagCount,
      issues:               validation.issues,
      failedRequirements: {
        hasDepthNumbers:  validation.hasDepthNumbers,
        hasSpecificNames: validation.hasSpecificNames,
        hasSources:       validation.hasSources,
        hasMarineLife:    validation.hasMarineLife,
        hasSciNames:      validation.hasSciNames,
      },
      flag:      'quality_check_failed',
      model:     GEMINI_MODEL,
      timestamp: new Date().toISOString(),
    });
    return { skipped: true, reason: `quality_fail score=${validation.score}/100 flags=${validation.flagCount}` };
  }

  return {
    description:           parsed.description,
    highlights:            parsed.highlights,
    maxDepth:              parsed.maxDepth             ?? siteData.maxDepth,
    visibilityRange:       parsed.visibilityRange,
    freediverFriendly:     parsed.freediverFriendly,
    freediverFriendlyReason: parsed.freediverFriendlyReason,
    hasLineDiving:         parsed.hasLineDiving,
    lineDivingDetails:     parsed.lineDivingDetails    ?? null,
    freediverDepthRange:   parsed.freediverDepthRange,
    freediverAccess:       parsed.freediverAccess,
    freediverConditions:   parsed.freediverConditions,
    facilitiesEnhanced:    parsed.facilities           ?? {},
    marineLife:            parsed.marineLife           ?? {},
    sources:               allSources,
    confidence:            parsed.confidence,
    qualityScore:          validation.score,
    enhancedAt:            new Date().toISOString(),
    enhancedBy:            `${GEMINI_MODEL}-search`,
  };
}

// ─── Prompt helper ────────────────────────────────────────────────────────────
function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans.trim()); }));
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🌊 Dive Sites Enhancer  |  Gemini 1.5 Flash + Google Search\n');

  const db    = initFirestore();
  const model = initGemini();

  // ── STEP 0: Schema discovery ─────────────────────────────────────────────
  const { total } = await discoverSchema(db);

  const answer = await prompt('\nProceed with enhancement? (y/n): ');
  if (answer.toLowerCase() !== 'y') { console.log('Aborted.'); process.exit(0); }

  // ── Fetch sites ──────────────────────────────────────────────────────────
  console.log('\n📖 Fetching dive sites…');
  const snap = await db.collection(COLLECTION).orderBy('name').get();
  let sites   = snap.docs;

  // Resume support
  if (FLAG_RESUME) {
    const cp = await getCheckpoint(db);
    if (cp?.lastProcessedId) {
      const idx = sites.findIndex(d => d.id === cp.lastProcessedId);
      if (idx >= 0) {
        sites = sites.slice(idx + 1);
        console.log(`▶  Resuming after "${cp.lastProcessedId}" (${sites.length} remaining)`);
      }
    }
  }

  // Skip already enhanced
  if (FLAG_SKIP_DONE) {
    const before = sites.length;
    sites = sites.filter(d => !d.data().enhancedAt);
    console.log(`⏭  Skipped ${before - sites.length} already-enhanced sites`);
  }

  if (FLAG_LIMIT > 0) {
    sites = sites.slice(0, FLAG_LIMIT);
    console.log(`🔢  Limiting to ${FLAG_LIMIT} sites`);
  }

  const totalToProcess = sites.length;
  console.log(`\n🚀 Processing ${totalToProcess} sites  |  dry-run=${FLAG_DRY_RUN}\n`);
  console.log('─'.repeat(60));

  const costTracker = new CostTracker();
  let processed = 0, successful = 0, failed = 0, skipped = 0;
  const qualityScores = [];

  for (let i = 0; i < sites.length; i += BATCH_SIZE) {
    const batch = sites.slice(i, i + BATCH_SIZE);

    for (const doc of batch) {
      const siteId   = doc.id;
      const siteData = doc.data();
      const name     = siteData.name || siteId;
      processed++;

      console.log(`\n🔍 Processing: ${name} (${processed}/${totalToProcess})`);

      const result = await enhanceSite(model, db, siteId, siteData, costTracker);

      if (result === null) {
        failed++;
        console.log(`   ❌ Failed: API/network error`);
      } else if (result.skipped) {
        skipped++;
        console.log(`   ⭐ Skipped: ${result.reason}`);
      } else {
        if (!FLAG_DRY_RUN) {
          await db.collection(COLLECTION).doc(siteId).update(result);
          await saveCheckpoint(db, siteId, { processed, successful, failed, skipped });
        } else {
          console.log('   [DRY RUN] Would save:', Object.keys(result).join(', '));
        }
        successful++;
        qualityScores.push(result.qualityScore);
        console.log(`   ✅ Enhanced — Quality: ${result.qualityScore}/100  Sources: ${(result.sources || []).length}  [${result.enhancedBy}]`);
      }

      // Rate limiting between requests
      if (processed < totalToProcess) {
        await sleep(DELAY_MS);
      }
    }

    // Progress checkpoint after each batch
    if (!FLAG_DRY_RUN && processed < totalToProcess) {
      console.log(`\n📊 Batch done — ${processed}/${totalToProcess}  ✅ ${successful}  ❌ ${failed}  ⭐ ${skipped}`);
    }
  }

  // ── Final summary ────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(60));
  console.log('🏁 ENHANCEMENT COMPLETE');
  console.log('═'.repeat(60));
  console.log(`Total sites:              ${totalToProcess}`);
  console.log(`✅ Successfully enhanced: ${successful}`);
  console.log(`❌ Failed (API errors):   ${failed}`);
  console.log(`⭐ Skipped / flagged:     ${skipped}`);

  if (qualityScores.length > 0) {
    const avg = qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length;
    console.log(`\n📈 Quality scores:`);
    console.log(`   Average:  ${avg.toFixed(1)}/100`);
    console.log(`   Highest:  ${Math.max(...qualityScores)}/100`);
    console.log(`   Lowest:   ${Math.min(...qualityScores)}/100`);
    const dist = { '90+': 0, '75-89': 0, '60-74': 0, '<60': 0 };
    qualityScores.forEach(s => {
      if (s >= 90) dist['90+']++;
      else if (s >= 75) dist['75-89']++;
      else if (s >= 60) dist['60-74']++;
      else dist['<60']++;
    });
    console.log(`   Distribution: 90+: ${dist['90+']}  75-89: ${dist['75-89']}  60-74: ${dist['60-74']}  <60: ${dist['<60']}`);
  }

  const cost = costTracker.summary();
  console.log(`\n💰 Cost estimate:`);
  console.log(`   Input tokens:  ~${cost.inputTokens.toLocaleString()}`);
  console.log(`   Output tokens: ~${cost.outputTokens.toLocaleString()}`);
  console.log(`   Estimated:     ${cost.estimatedCost}`);
  console.log(`\n⚠️  Review flagged sites in Firestore '${REVIEW_COLLECTION}' collection`);
}

main().catch(err => {
  console.error('\n💥 Fatal error:', err.message);
  process.exit(1);
});
