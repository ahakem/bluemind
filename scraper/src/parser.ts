import * as cheerio from 'cheerio';
import { ScrapedDiveSite, WaterTempByMonth } from './types';
import { logger } from './logger';

// Regex helpers
const depthRe = /(?:max(?:imum)?\s*(?:depth)?|diepte)[^\d]*(\d+)\s*m/i;
const visibilityRe = /(?:visibility|zicht(?:baarheid)?)[^\d]*(\d+)(?:\s*[-–]\s*(\d+))?\s*m/i;
const tempRe = /(\d+)\s*[°]?\s*C/gi;

const MONTH_MAP: Record<string, keyof WaterTempByMonth> = {
  january: 'jan', jan: 'jan',
  february: 'feb', feb: 'feb',
  march: 'mar', mar: 'mar',
  april: 'apr', apr: 'apr',
  may: 'may',
  june: 'jun', jun: 'jun',
  july: 'jul', jul: 'jul',
  august: 'aug', aug: 'aug',
  september: 'sep', sep: 'sep',
  october: 'oct', oct: 'oct',
  november: 'nov', nov: 'nov',
  december: 'dec', dec: 'dec',
};

const WATER_TYPE_KEYWORDS: Record<string, ScrapedDiveSite['waterType']> = {
  lake: 'lake', meer: 'lake', plas: 'lake', vijver: 'lake',
  sea: 'sea', ocean: 'sea', zee: 'sea',
  quarry: 'quarry', groeve: 'quarry',
  river: 'river', rivier: 'river',
  pool: 'pool', zwembad: 'pool',
};

const DIFFICULTY_KEYWORDS: Record<string, ScrapedDiveSite['difficulty']> = {
  beginner: 'beginner', makkelijk: 'beginner', easy: 'beginner',
  intermediate: 'intermediate', gemiddeld: 'intermediate', medium: 'intermediate',
  advanced: 'advanced', gevorderd: 'advanced', expert: 'advanced', moeilijk: 'advanced',
};

const extractNumber = (text: string, re: RegExp): number | null => {
  const m = re.exec(text);
  return m ? parseInt(m[1], 10) : null;
};

const extractVisibility = (text: string): { min: number; max: number } | null => {
  const m = visibilityRe.exec(text);
  if (!m) return null;
  const min = parseInt(m[1], 10);
  const max = m[2] ? parseInt(m[2], 10) : min;
  return { min, max };
};

const extractWaterTemps = (text: string): WaterTempByMonth => {
  const temps: WaterTempByMonth = {};
  // Pattern: "January: 8°C" or "jan 8°C" or month–range table patterns
  const monthTempRe = /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\b[:\s]*(\d{1,2})\s*°?\s*c\b/gi;
  let m: RegExpExecArray | null;
  while ((m = monthTempRe.exec(text)) !== null) {
    const key = MONTH_MAP[m[1].toLowerCase()];
    if (key) temps[key] = parseInt(m[2], 10);
  }
  return temps;
};

const inferWaterType = (text: string): ScrapedDiveSite['waterType'] => {
  const lower = text.toLowerCase();
  for (const [kw, type] of Object.entries(WATER_TYPE_KEYWORDS)) {
    if (lower.includes(kw)) return type;
  }
  return 'unknown';
};

const inferDifficulty = (text: string): ScrapedDiveSite['difficulty'] => {
  const lower = text.toLowerCase();
  for (const [kw, level] of Object.entries(DIFFICULTY_KEYWORDS)) {
    if (lower.includes(kw)) return level;
  }
  return 'unknown';
};

const extractPhotos = ($: cheerio.CheerioAPI): string[] => {
  const photos: string[] = [];
  $('img.spot-image, .spot-photos img, .gallery img, .photos img').each((_, el) => {
    const src = $(el).attr('src') ?? $(el).attr('data-src') ?? '';
    if (src && src.includes('cdn.duikersgids.nl')) {
      photos.push(src.startsWith('http') ? src : `https:${src}`);
    }
  });
  // Also pick up any image from the CDN domain regardless of class
  if (photos.length === 0) {
    $('img').each((_, el) => {
      const src = $(el).attr('src') ?? $(el).attr('data-src') ?? '';
      if (src && src.includes('cdn.duikersgids.nl')) {
        photos.push(src.startsWith('http') ? src : `https:${src}`);
      }
    });
  }
  return [...new Set(photos)]; // deduplicate
};

const extractHighlights = ($: cheerio.CheerioAPI, description: string): string[] => {
  const highlights: string[] = [];

  // Try bullet lists near the description area
  $('ul li, .highlights li, .features li').each((_, el) => {
    const text = $(el).text().trim();
    if (text.length > 10 && text.length < 200) highlights.push(text);
  });

  if (highlights.length > 0) return highlights.slice(0, 6);

  // Fallback: split description into sentences, take top 3
  const sentences = description
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20 && s.length < 180);
  return sentences.slice(0, 3);
};

export interface ParseResult {
  site: Omit<ScrapedDiveSite, 'slug' | 'sourceUrl' | 'scrapedAt' | 'status'>;
  rawText: string;
}

export const parseSitePage = (
  html: string,
  slug: string,
  url: string
): ScrapedDiveSite | null => {
  const $ = cheerio.load(html);

  // Name — prefer h1, fallback to title
  const name =
    $('h1').first().text().trim() ||
    $('title').text().replace(/\s*[-|].*$/, '').trim();

  if (!name) {
    logger.warn({ slug }, 'Could not extract name — skipping');
    return null;
  }

  // Location / country from breadcrumb or h3
  const breadcrumbItems = $('nav[aria-label="breadcrumb"] li, .breadcrumb li, ol.breadcrumb li')
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(Boolean);

  // Breadcrumb typically: Home > Country > Region > Site
  const country = breadcrumbItems[1] ?? $('h3').first().text().trim() ?? '';
  const location = breadcrumbItems[2] ?? breadcrumbItems[1] ?? country;

  // Main text content — log entries and description block
  const descriptionEl = $(
    '.spot-description, .description, [class*="description"], .log-entry, article'
  ).first();
  const description = descriptionEl.text().replace(/\s+/g, ' ').trim().slice(0, 1500);

  // Coordinates from #divemap rel="spot;{lat};{lng};{id}"
  let coordinates: { lat: number; lng: number } | null = null;
  const mapRel = $('#divemap').attr('rel') ?? '';
  const mapParts = mapRel.split(';');
  if (mapParts.length >= 3) {
    const lat = parseFloat(mapParts[1]);
    const lng = parseFloat(mapParts[2]);
    if (!isNaN(lat) && !isNaN(lng)) coordinates = { lat, lng };
  }

  // Collect all visible text for regex mining
  const allText = $('body').text().replace(/\s+/g, ' ');

  const maxDepth = extractNumber(allText, depthRe);
  const visibility = extractVisibility(allText);
  const waterTemp = extractWaterTemps(allText);
  const waterType = inferWaterType(allText);
  const difficulty = inferDifficulty(allText);
  const photos = extractPhotos($);
  const highlights = extractHighlights($, description);

  // Best seasons — look for month clusters mentioned near "best" or "season"
  const seasonRe = /(?:best\s+(?:time|season|period)|aanbevolen)[^.]*?(spring|summer|autumn|fall|winter)/gi;
  const seasons: string[] = [];
  let sm: RegExpExecArray | null;
  while ((sm = seasonRe.exec(allText)) !== null) {
    const s = sm[1].toLowerCase();
    const mapped = s === 'fall' ? 'Autumn' : s.charAt(0).toUpperCase() + s.slice(1);
    if (!seasons.includes(mapped)) seasons.push(mapped);
  }

  logger.debug(
    { slug, name, maxDepth, waterType, difficulty, photos: photos.length, coordinates },
    'Parsed page'
  );

  return {
    slug,
    sourceUrl: url,
    name,
    location,
    country,
    coordinates,
    waterType,
    difficulty,
    maxDepth,
    description: description || name,
    highlights,
    facilities: [],
    waterTemp,
    visibility,
    bestSeasons: seasons,
    photos,
    status: 'pending',
    scrapedAt: new Date(),
  };
};

export const extractSiteLinks = (html: string, baseUrl: string): string[] => {
  const $ = cheerio.load(html);
  const seen = new Set<string>();

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') ?? '';
    let full: string | null = null;

    // Absolute URL: https://www.divers-guide.com/en/dive-spots/{slug}
    if (/^https?:\/\/www\.divers-guide\.com\/en\/dive-spots\/[^/\s?#]{2,}$/.test(href)) {
      full = href;
    }
    // Relative with leading slash: /en/dive-spots/{slug}
    else if (/^\/en\/dive-spots\/[^/\s?#]{2,}$/.test(href)) {
      full = `${baseUrl}${href}`;
    }
    // Relative without leading slash: en/dive-spots/{slug}
    else if (/^en\/dive-spots\/[^/\s?#]{2,}$/.test(href)) {
      full = `${baseUrl}/${href}`;
    }

    if (full && !seen.has(full)) {
      seen.add(full);
    }
  });

  return Array.from(seen);
};
