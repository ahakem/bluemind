import axios, { AxiosInstance } from 'axios';
import { config } from './config';
import { logger } from './logger';
import { parseSitePage, extractSiteLinks } from './parser';
import { initFirestore, saveSite, siteExists } from './firestore';
import { ScrapedDiveSite, ScrapeResult } from './types';

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

const buildClient = (): AxiosInstance =>
  axios.create({
    baseURL: config.baseUrl,
    timeout: 15_000,
    headers: {
      'User-Agent':
        'BlueMindScraper/1.0 (+https://bluemindfreediving.com; for community dive site directory)',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });

const fetchWithRetry = async (
  client: AxiosInstance,
  url: string,
  retries = config.rateLimit.maxRetries
): Promise<string | null> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await client.get<string>(url);
      return res.data;
    } catch (err: unknown) {
      const status = axios.isAxiosError(err) ? err.response?.status : null;
      logger.warn({ url, attempt, status }, 'Fetch failed');
      if (attempt < retries) {
        await sleep(config.rateLimit.retryDelayMs * attempt);
      }
    }
  }
  return null;
};

const checkRobotsTxt = async (client: AxiosInstance): Promise<boolean> => {
  try {
    const html = await fetchWithRetry(client, '/robots.txt');
    if (!html) return true; // assume allowed if we can't fetch
    const lower = html.toLowerCase();
    // If there's a Disallow: / for our user-agent or *, block
    const lines = lower.split('\n');
    let inOurAgent = false;
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('user-agent:')) {
        inOurAgent = trimmed.includes('*') || trimmed.includes('blueминд');
      }
      if (inOurAgent && trimmed.startsWith('disallow: /') && trimmed !== 'disallow: /en') {
        // Only block if disallow covers root; /en paths are explicitly checked
        if (trimmed === 'disallow: /') return false;
      }
    }
    return true;
  } catch {
    return true;
  }
};

export interface ScrapeOptions {
  dryRun: boolean;
  limit: number | null;
  slugs: string[]; // if set, only scrape these specific slugs
}

export const runScraper = async (options: ScrapeOptions): Promise<ScrapeResult[]> => {
  const { dryRun, limit, slugs } = options;
  const client = buildClient();
  const results: ScrapeResult[] = [];

  logger.info({ dryRun, limit, specificSlugs: slugs.length }, 'Scraper starting');

  // Robots.txt check
  const allowed = await checkRobotsTxt(client);
  if (!allowed) {
    logger.error('robots.txt disallows scraping — aborting');
    return results;
  }
  logger.info('robots.txt check passed');

  // Initialise Firestore (unless dry run)
  const db = dryRun ? null : initFirestore();

  // Build list of URLs to scrape
  let urls: string[] = [];

  if (slugs.length > 0) {
    urls = slugs.map((s) => `${config.baseUrl}${config.sitePathPrefix}${s}`);
    logger.info({ count: urls.length }, 'Scraping specific slugs');
  } else {
    logger.info('Discovering site links from listing pages…');
    urls = await discoverSiteUrls(client, limit);
    logger.info({ count: urls.length }, 'Discovered site URLs');
  }

  if (limit !== null) {
    urls = urls.slice(0, limit);
    logger.info({ limit }, 'Limiting to N sites');
  }

  // Scrape each URL
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const slug = url.replace(`${config.baseUrl}${config.sitePathPrefix}`, '');

    logger.info({ url, progress: `${i + 1}/${urls.length}` }, 'Scraping site');

    // Skip if already in Firestore
    if (db && (await siteExists(db, slug))) {
      logger.info({ slug }, 'Already in Firestore — skipping');
      results.push({ site: { slug } as ScrapedDiveSite });
      await sleep(config.rateLimit.delayMs);
      continue;
    }

    const html = await fetchWithRetry(client, url);
    if (!html) {
      logger.error({ url }, 'Failed to fetch page after retries');
      results.push({ site: { slug } as ScrapedDiveSite, error: 'fetch failed' });
      await sleep(config.rateLimit.delayMs);
      continue;
    }

    const site = parseSitePage(html, slug, url);
    if (!site) {
      logger.warn({ slug }, 'Parser returned null — skipping');
      results.push({ site: { slug } as ScrapedDiveSite, error: 'parse failed' });
      await sleep(config.rateLimit.delayMs);
      continue;
    }

    let firestoreId: string | null = null;
    if (db) {
      try {
        firestoreId = await saveSite(db, site, dryRun);
      } catch (err) {
        logger.error({ slug, err }, 'Firestore save failed');
        results.push({ site, error: String(err) });
        await sleep(config.rateLimit.delayMs);
        continue;
      }
    }

    results.push({ site, firestoreId: firestoreId ?? undefined });

    // Rate limiting
    if (i < urls.length - 1) {
      await sleep(config.rateLimit.delayMs);
    }
  }

  const saved = results.filter((r) => r.firestoreId).length;
  const failed = results.filter((r) => r.error).length;
  logger.info({ total: results.length, saved, failed }, 'Scrape complete');

  return results;
};

const discoverSiteUrls = async (
  client: AxiosInstance,
  limit: number | null
): Promise<string[]> => {
  const allUrls = new Set<string>();
  const pagesToVisit = [`${config.baseUrl}${config.listingPath}`];
  const visitedPages = new Set<string>();

  while (pagesToVisit.length > 0) {
    const page = pagesToVisit.shift()!;
    if (visitedPages.has(page)) continue;
    visitedPages.add(page);

    logger.debug({ page }, 'Discovering links from listing page');
    const html = await fetchWithRetry(client, page);
    if (!html) continue;

    const links = extractSiteLinks(html, config.baseUrl);
    let newSiteLinks = 0;

    for (const link of links) {
      if (!allUrls.has(link)) {
        allUrls.add(link);
        newSiteLinks++;
      }
    }

    logger.debug({ page, newLinks: newSiteLinks, total: allUrls.size }, 'Found links');

    // Early exit if we have enough
    if (limit !== null && allUrls.size >= limit) break;

    await sleep(config.rateLimit.delayMs);
  }

  return Array.from(allUrls);
};
