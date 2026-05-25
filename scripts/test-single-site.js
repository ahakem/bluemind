'use strict';
/**
 * Test enhancement on one site before running the full batch.
 *
 * Usage:
 *   node scripts/test-single-site.js <site-id>
 *   node scripts/test-single-site.js "lighthouse-dahab"
 *
 * Shows: full prompt, raw Gemini response, validation breakdown, asks before saving.
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Firestore }  = require('@google-cloud/firestore');
const fs             = require('fs');
const readline       = require('readline');

// ─── Config (shared with enhance-dive-sites.js) ───────────────────────────────
const GEMINI_API_KEY       = process.env.GEMINI_API_KEY       ?? '';
const SERVICE_ACCOUNT_PATH = process.env.FIREBASE_SERVICE_ACCOUNT ?? '';
const DATABASE_ID          = process.env.FIREBASE_DATABASE_ID ?? 'landing';
const COLLECTION           = 'diveSites';
const GEMINI_MODEL         = 'gemini-2.5-flash';
const MIN_QUALITY_SCORE    = 60;

const RED_FLAGS = [
  'crystal clear', 'stunning coral', 'stunning formation',
  'perfect for all levels', 'diverse marine life', 'world-class',
  'pristine conditions', 'pristine waters', 'breathtaking',
  'excellent visibility', 'excellent conditions', 'abundant sea life',
  'teeming with', 'thriving ecosystem',
];

// ─── Init ─────────────────────────────────────────────────────────────────────
function initFirestore() {
  if (!SERVICE_ACCOUNT_PATH) {
    console.error('❌  FIREBASE_SERVICE_ACCOUNT not set in .env.local');
    process.exit(1);
  }
  const sa = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));
  return new Firestore({ projectId: sa.project_id, credentials: sa, databaseId: DATABASE_ID });
}

function initGemini() {
  if (!GEMINI_API_KEY) {
    console.error('❌  GEMINI_API_KEY not set in .env.local');
    process.exit(1);
  }
  return new GoogleGenerativeAI(GEMINI_API_KEY).getGenerativeModel({
    model: GEMINI_MODEL,
    tools: [{ googleSearch: {} }],
    generationConfig: { temperature: 0.1, maxOutputTokens: 8192 },
  });
}

// ─── Helpers (duplicated from main script to keep test standalone) ────────────
function buildPrompt(siteData) {
  const name     = siteData.name     || 'Unknown Site';
  const location = [siteData.location, siteData.country].filter(Boolean).join(', ') || 'Unknown';
  const existing = {
    description: siteData.description?.slice(0, 300) || '',
    maxDepth: siteData.maxDepth,
    waterType: siteData.waterType,
    tags: siteData.tags,
    highlights: siteData.highlights,
  };

  return `You are a professional dive site researcher. Use Google Search to find FACTUAL, SPECIFIC information about this dive site.

DIVE SITE: ${name}
LOCATION: ${location}
WATER TYPE: ${siteData.waterType || 'unknown'}
EXISTING DATA: ${JSON.stringify(existing, null, 2)}

Execute ALL of these searches:
1. "${name} diving ${location}"
2. "${name} dive site"
3. "${name} freediving"
4. "${name} depth ${location}"

Extract: exact depths with numbers, named features, documented species with scientific names, infrastructure details, visibility ranges, access method, conditions.

FORBIDDEN: crystal clear | stunning | perfect for all levels | diverse marine life | world-class | pristine | breathtaking | excellent visibility

If insufficient specific data: return { "error": "insufficient_data", "searchQueriesUsed": [], "partialDataFound": {} }

Return ONLY valid JSON with this structure:
{
  "description": "Para 1: location/access/topography\\n\\nPara 2: depths/features/infrastructure\\n\\nPara 3: marine life with species names",
  "highlights": ["specific detail 1", "specific detail 2", "specific detail 3", "specific detail 4"],
  "maxDepth": "40m",
  "visibilityRange": "15-25m typical",
  "freediverFriendly": "yes|maybe|no|unknown",
  "freediverFriendlyReason": "reason with specifics",
  "hasLineDiving": "yes|partial|no",
  "lineDivingDetails": "description or null",
  "freediverDepthRange": "5-40m",
  "freediverAccess": "shore|boat|both|unknown",
  "freediverConditions": "calm|moderate|challenging",
  "facilities": {
    "diveCenter": true,
    "restaurant": false,
    "parking": true,
    "equipment": true,
    "accommodation": false,
    "depthMarkers": ["15m", "20m", "30m", "40m"]
  },
  "marineLife": {
    "fish": [{ "name": "", "scientificName": "", "frequency": "", "location": "", "season": "" }],
    "corals": [{ "type": "", "location": "", "condition": "" }],
    "macro": [{ "name": "", "scientificName": "", "frequency": "", "location": "", "behavior": "" }],
    "pelagic": [{ "name": "", "frequency": "", "season": "" }],
    "specialSightings": []
  },
  "sources": ["url1", "url2"],
  "waterType": "sea|lake|deep_tank",
  "confidence": "high|medium|low"
}`;
}

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
  const obj = cleaned.match(/\{[\s\S]*\}/);
  if (obj) candidates.push(obj[0]);

  for (const candidate of candidates) {
    try { return JSON.parse(candidate); } catch {}
    try { return JSON.parse(fixControlChars(candidate)); } catch {}
  }

  return null;
}

function validateQuality(enhanced, siteName) {
  let score = 0;
  const issues = [];
  const text = [enhanced.description || '', ...(enhanced.highlights || [])].join(' ');

  let flagCount = 0;
  RED_FLAGS.forEach(flag => {
    if (text.toLowerCase().includes(flag.toLowerCase())) {
      score -= 10; flagCount++;
      issues.push(`Generic phrase: "${flag}"`);
    }
  });

  const hasDepthNumbers  = /\d+\s*m(?:eters?)?/i.test(text);
  const hasSpecificNames = /[A-Z][a-z]+(?:\s+[A-Za-z]+)?\s+(?:reef|wreck|wall|cave|garden|pinnacle|arch|canyon)/i.test(text);
  const hasSources       = Array.isArray(enhanced.sources) && enhanced.sources.length >= 2;
  const hasConfidence    = ['high', 'medium'].includes(enhanced.confidence);
  const hasMarineLife    = !!(enhanced.marineLife && (
    enhanced.marineLife.fish?.length > 0 || enhanced.marineLife.corals?.length > 0 ||
    enhanced.marineLife.macro?.length > 0 || enhanced.marineLife.pelagic?.length > 0
  ));
  const hasSciNames = hasMarineLife && JSON.stringify(enhanced.marineLife).includes('"scientificName"');

  if (hasDepthNumbers)  score += 20; else issues.push('No depth numbers');
  if (hasSpecificNames) score += 20; else issues.push('No named features');
  if (hasSources)       score += 25; else issues.push('< 2 sources');
  if (hasConfidence)    score += 15; else issues.push('No confidence rating');
  if (hasMarineLife)    score += 15; else issues.push('No marine life data');
  if (hasSciNames)      score += 5;

  const descLen   = (enhanced.description || '').length;
  const descParas = (enhanced.description || '').split('\n\n').length;
  const hlCount   = (enhanced.highlights || []).length;

  if (descLen < 300)  { score -= 20; issues.push(`Description too short (${descLen} chars)`); }
  if (descParas < 2)  { score -= 15; issues.push('Need ≥ 2 paragraphs'); }
  if (hlCount < 4)    { score -= 10; issues.push(`Too few highlights (${hlCount})`); }

  return {
    isValid: Math.max(0, Math.min(100, score)) >= MIN_QUALITY_SCORE && flagCount === 0,
    score: Math.max(0, Math.min(100, score)),
    flagCount, issues, hasDepthNumbers, hasSpecificNames, hasSources, hasMarineLife, hasSciNames,
  };
}

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(r => rl.question(question, a => { rl.close(); r(a.trim()); }));
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const siteId = process.argv[2];
  if (!siteId) {
    console.error('Usage: node scripts/test-single-site.js <site-id>');
    process.exit(1);
  }

  const db    = initFirestore();
  const model = initGemini();

  // Fetch site
  console.log(`\n🔍 Fetching site: ${siteId}`);
  let docSnap = await db.collection(COLLECTION).doc(siteId).get();
  if (!docSnap.exists) {
    console.log('   Not found by ID. Searching by slug…');
    const q = await db.collection(COLLECTION).where('slug', '==', siteId).limit(1).get();
    if (q.empty) {
      console.error(`❌  Site "${siteId}" not found in collection '${COLLECTION}'`);
      process.exit(1);
    }
    docSnap = q.docs[0];
  }

  const docId = docSnap.id;
  const siteData = docSnap.data();
  if (!siteData) { console.error('❌  Site data empty'); process.exit(1); }

  console.log('\n📄 SITE DATA:');
  console.log('─'.repeat(60));
  const preview = {
    id: siteId, name: siteData.name, location: siteData.location,
    country: siteData.country, waterType: siteData.waterType,
    maxDepth: siteData.maxDepth, description: siteData.description?.slice(0, 200) + '…',
    tags: siteData.tags, highlights: siteData.highlights,
    enhancedAt: siteData.enhancedAt || '(not enhanced yet)',
  };
  console.log(JSON.stringify(preview, null, 2));

  const prompt = buildPrompt(siteData);
  console.log('\n📝 PROMPT (first 500 chars):');
  console.log('─'.repeat(60));
  console.log(prompt.slice(0, 500) + '\n…');

  const go = await ask('\nSend to Gemini? (y/n): ');
  if (go.toLowerCase() !== 'y') { console.log('Aborted.'); process.exit(0); }

  console.log('\n🔄 Calling Gemini with Google Search…');
  let raw = '';
  let sources = [];

  try {
    const result   = await model.generateContent(prompt);
    const response = result.response;
    raw = response.text();
    const meta = response.candidates?.[0]?.groundingMetadata;
    sources = (meta?.groundingChunks ?? []).map(c => c.web?.uri).filter(Boolean);
    const queries = meta?.webSearchQueries ?? [];
    if (queries.length) console.log(`   Search queries used: ${queries.join(' | ')}`);
  } catch (err) {
    console.error('❌  API error:', err.message);
    process.exit(1);
  }

  console.log('\n📥 RAW RESPONSE:');
  console.log('─'.repeat(60));
  console.log(raw);
  console.log('─'.repeat(60));
  console.log(`Grounding sources (${sources.length}):`, sources);

  const parsed = extractJSON(raw);
  if (!parsed) {
    console.log('\n❌  Could not parse JSON from response.');
    process.exit(1);
  }

  if (parsed.error === 'insufficient_data') {
    console.log('\n⭐ Gemini returned insufficient_data:');
    console.log(JSON.stringify(parsed, null, 2));
    process.exit(0);
  }

  parsed.sources = [...new Set([...sources, ...(parsed.sources ?? [])])];

  const validation = validateQuality(parsed, siteData.name);

  console.log('\n✅ VALIDATION RESULTS:');
  console.log('─'.repeat(60));
  console.log(`Score:         ${validation.score}/100  ${validation.score >= MIN_QUALITY_SCORE ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Generic flags: ${validation.flagCount}  ${validation.flagCount === 0 ? '✅' : '❌'}`);
  console.log(`Depth numbers: ${validation.hasDepthNumbers ? '✅' : '❌'}`);
  console.log(`Named features:${validation.hasSpecificNames ? '✅' : '❌'}`);
  console.log(`Sources ≥ 2:   ${validation.hasSources ? '✅' : '❌'} (${(parsed.sources || []).length} found)`);
  console.log(`Marine life:   ${validation.hasMarineLife ? '✅' : '❌'}`);
  console.log(`Sci. names:    ${validation.hasSciNames ? '✅' : '—'}`);
  if (validation.issues.length) {
    console.log('\nIssues:');
    validation.issues.forEach(i => console.log(`  • ${i}`));
  }

  console.log('\n📋 PARSED RESULT:');
  console.log('─'.repeat(60));
  console.log(JSON.stringify(parsed, null, 2));

  if (!validation.isValid) {
    console.log('\n⚠️  This result would be sent to _needsReview (did not pass validation).');
    const saveReview = await ask('Save to _needsReview anyway? (y/n): ');
    if (saveReview.toLowerCase() === 'y') {
      await db.collection('_needsReview').doc(docId).set({
        originalData: siteData,
        attemptedEnhancement: parsed,
        validationScore: validation.score,
        flagCount: validation.flagCount,
        issues: validation.issues,
        flag: 'quality_check_failed',
        model: GEMINI_MODEL,
        timestamp: new Date().toISOString(),
      });
      console.log('✅  Saved to _needsReview.');
    }
    process.exit(0);
  }

  const save = await ask('\n💾 Save this enhancement to diveSites? (y/n): ');
  if (save.toLowerCase() === 'y') {
    const update = {
      description: parsed.description,
      highlights:  parsed.highlights,
      maxDepth:    parsed.maxDepth ?? siteData.maxDepth,
      visibilityRange:       parsed.visibilityRange,
      freediverFriendly:     parsed.freediverFriendly,
      freediverFriendlyReason: parsed.freediverFriendlyReason,
      hasLineDiving:         parsed.hasLineDiving,
      lineDivingDetails:     parsed.lineDivingDetails ?? null,
      freediverDepthRange:   parsed.freediverDepthRange,
      freediverAccess:       parsed.freediverAccess,
      freediverConditions:   parsed.freediverConditions,
      facilitiesEnhanced:    parsed.facilities ?? {},
      marineLife:            parsed.marineLife ?? {},
      sources:               parsed.sources,
      confidence:            parsed.confidence,
      qualityScore:          validation.score,
      enhancedAt:            new Date().toISOString(),
      enhancedBy:            `${GEMINI_MODEL}-search`,
    };
    await db.collection(COLLECTION).doc(docId).update(update);
    console.log('✅  Saved to Firestore!');
  } else {
    console.log('Not saved.');
  }
}

main().catch(err => {
  console.error('\n💥 Error:', err.message);
  process.exit(1);
});
