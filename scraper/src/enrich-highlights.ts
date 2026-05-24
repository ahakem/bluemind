import axios from 'axios';
import Anthropic from '@anthropic-ai/sdk';
import { initFirestore } from './firestore';
import { logger } from './logger';
import { config } from './config';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? '',
});

// ── iNaturalist ───────────────────────────────────────────────────────────────

interface INatSpecies {
  count: number;
  taxon: {
    name: string;
    preferred_common_name?: string;
    iconic_taxon_name?: string;
  };
}

const MARINE_TAXA = [
  'Actinopterygii',   // ray-finned fish
  'Chondrichthyes',   // sharks & rays
  'Mollusca',         // octopus, squid, nudibranch
  'Echinodermata',    // starfish, sea urchin
  'Cnidaria',         // corals, jellyfish, anemones
  'Reptilia',         // sea turtles
  'Mammalia',         // dolphins, seals
  'Porifera',         // sponges
  'Crustacea',        // crabs, lobsters, shrimps
];

const fetchSpecies = async (lat: number, lng: number, waterType: string): Promise<string[]> => {
  const radius = waterType === 'sea' ? 10 : 3; // km
  try {
    const res = await axios.get<{ results: INatSpecies[] }>(
      'https://api.inaturalist.org/v1/observations/species_counts',
      {
        params: {
          lat,
          lng,
          radius,
          quality_grade: 'research',
          iconic_taxon_name: MARINE_TAXA.join(','),
          per_page: 30,
          order: 'desc',
          order_by: 'count',
        },
        headers: { 'User-Agent': 'BlueMindFreediving/1.0 (ahakim.elkholy@gmail.com)' },
        timeout: 15_000,
      }
    );

    return (res.data?.results ?? []).map((r) => {
      const common = r.taxon.preferred_common_name;
      const scientific = r.taxon.name;
      return common ? `${common} (${scientific})` : scientific;
    });
  } catch {
    return [];
  }
};

// ── Claude highlights generation ─────────────────────────────────────────────

interface SiteContext {
  name: string;
  country: string;
  location?: string;
  waterBodyName?: string;
  waterType: string;
  maxDepth: number;
  visibility?: { min: number; max: number };
  waterTemp?: Record<string, number>;
  bestSeasons?: string[];
  difficulty: string;
  description?: string;
  species: string[];
}

interface EnrichResult {
  highlights: string[];
  description: string;
  scubaFocused: boolean;
  scubaReason?: string;
}

const generateContent = async (site: SiteContext): Promise<EnrichResult | null> => {
  const tempRange = site.waterTemp
    ? (() => {
        const vals = Object.values(site.waterTemp).filter(Boolean);
        if (!vals.length) return null;
        const min = Math.min(...vals);
        const max = Math.max(...vals);
        return min === max ? `${min}°C year-round` : `${min}–${max}°C`;
      })()
    : null;

  const speciesText = site.species.length
    ? `Observed marine life nearby: ${site.species.slice(0, 15).join(', ')}.`
    : '';

  const existingDesc = site.description
    ? `Existing description (may be scuba-focused or low quality — use as context only):\n"${site.description.slice(0, 400)}"`
    : '';

  const prompt = `You are a freediving expert writing content for a freediving site directory. Freedivers = breath-hold divers, NOT scuba.

Dive site data:
- Name: ${site.name}
- Country: ${site.country}
- Region: ${site.location ?? 'unknown'}
- Water body: ${site.waterBodyName ?? site.waterType}
- Water type: ${site.waterType}
- Max depth: ${site.maxDepth}m
- Visibility: ${site.visibility ? `${site.visibility.min}–${site.visibility.max}m` : 'unknown'}
- Water temperature: ${tempRange ?? 'unknown'}
- Best seasons: ${site.bestSeasons?.join(', ') ?? 'unknown'}
- Difficulty: ${site.difficulty}
${speciesText}
${existingDesc}

Write three things:

1. "scubaFocused": true if this site is primarily a scuba site not suitable for freedivers (requires decompression, technical gas, deep wreck only accessible with tanks). false if it can be enjoyed breath-hold. When unsure, use false.

2. If scubaFocused is true, add "scubaReason": one short sentence explaining why.

3. If scubaFocused is false, write:
   - "description": 2–3 sentences (max 60 words) for freedivers. What makes it special, the underwater environment, who it suits. No scuba gear mentions.
   - "highlights": exactly 4 single-sentence highlights (max 15 words each). Cover: marine life, terrain/depth profile, visibility/conditions, one practical tip.

Reply ONLY with valid JSON, no markdown:
{"scubaFocused": false, "description": "...", "highlights": ["...", "...", "...", "..."]}
or if scuba only:
{"scubaFocused": true, "scubaReason": "..."}`;

  try {
    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    });

    let text = (msg.content[0] as { type: string; text: string }).text.trim();
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    const parsed = JSON.parse(text) as EnrichResult;
    if (typeof parsed.scubaFocused === 'boolean') return parsed;
  } catch (err) {
    logger.warn({ err: String(err) }, 'Claude content generation failed');
  }
  return null;
};

// ── Main ─────────────────────────────────────────────────────────────────────

const main = async () => {
  if (!process.env.ANTHROPIC_API_KEY) {
    logger.fatal('ANTHROPIC_API_KEY env var is required');
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const limitIdx = args.indexOf('--limit');
  const limit = limitIdx !== -1 ? parseInt(args[limitIdx + 1] ?? '10', 10) : null;
  const force = args.includes('--force');

  const db = initFirestore();
  const snap = await db.collection(config.firestore.collection).get();

  const toEnrich = snap.docs.filter((d) => {
    const data = d.data();
    const coords = data.coordinates as { lat: number; lng: number } | null;
    if (!coords?.lat || !coords?.lng) return false;
    if (!force && data.highlightsEnriched) return false;
    return true;
  });

  const limited = limit !== null ? toEnrich.slice(0, limit) : toEnrich;
  logger.info({ total: snap.size, toEnrich: toEnrich.length, processing: limited.length }, 'Docs to enrich');

  if (limited.length === 0) {
    logger.info('Nothing to enrich');
    return;
  }

  let enriched = 0;
  let failed = 0;
  const stats = { archived: 0 };

  for (let i = 0; i < limited.length; i++) {
    const doc = limited[i];
    const data = doc.data() as {
      slug: string;
      name: string;
      country: string;
      location?: string;
      waterBodyName?: string;
      waterType: string;
      maxDepth: number;
      visibility?: { min: number; max: number };
      waterTemp?: Record<string, number>;
      bestSeasons?: string[];
      difficulty: string;
      description?: string;
      coordinates: { lat: number; lng: number };
    };
    const { slug, coordinates } = data;

    logger.info(
      { slug, progress: `${i + 1}/${limited.length}` },
      'Enriching highlights'
    );

    // 1. Fetch real species observations from iNaturalist
    const species = await fetchSpecies(coordinates.lat, coordinates.lng, data.waterType);
    logger.debug({ slug, speciesCount: species.length }, 'iNaturalist species');
    await sleep(500);

    // 2. Generate highlights + description with Claude
    const result = await generateContent({
      name: data.name,
      country: data.country,
      location: data.location,
      waterBodyName: data.waterBodyName,
      waterType: data.waterType,
      maxDepth: data.maxDepth,
      visibility: data.visibility,
      waterTemp: data.waterTemp,
      bestSeasons: data.bestSeasons,
      difficulty: data.difficulty,
      description: data.description,
      species,
    });

    if (!result) {
      logger.warn({ slug }, 'No content generated — skipping');
      failed++;
      if (i < limited.length - 1) await sleep(1000);
      continue;
    }

    if (result.scubaFocused) {
      logger.info({ slug, reason: result.scubaReason }, 'Scuba-focused — archiving');
      await doc.ref.update({
        status: 'archived',
        classifyReason: result.scubaReason ?? 'Scuba-focused site detected during enrichment',
        highlightsEnriched: true, // mark done so it won't be reprocessed
      });
      stats.archived++;
      if (i < limited.length - 1) await sleep(1200);
      continue;
    }

    await doc.ref.update({
      highlights: result.highlights,
      description: result.description,
      observedSpecies: species.slice(0, 20),
      highlightsEnriched: true,
    });

    logger.info({ slug, description: result.description, highlights: result.highlights }, 'Content saved');
    enriched++;

    if (i < limited.length - 1) await sleep(1200);
  }

  logger.info({ enriched, archived: stats.archived, failed }, 'enrich-highlights complete');
};

main().catch((err) => {
  logger.fatal({ err }, 'enrich-highlights failed');
  process.exit(1);
});
