import axios from 'axios';
import * as cheerio from 'cheerio';
import { initFirestore } from './firestore';
import { logger } from './logger';
import { config } from './config';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const extractCoordinates = (html: string): { lat: number; lng: number } | null => {
  const $ = cheerio.load(html);
  const rel = $('#divemap').attr('rel') ?? '';
  const parts = rel.split(';');
  if (parts.length >= 3) {
    const lat = parseFloat(parts[1]);
    const lng = parseFloat(parts[2]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }
  return null;
};

const main = async () => {
  const db = initFirestore();
  const client = axios.create({
    timeout: 15_000,
    headers: {
      'User-Agent': 'BlueMindScraper/1.0 (+https://bluemindfreediving.com)',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });

  // Get all docs missing coordinates
  const snap = await db
    .collection(config.firestore.collection)
    .where('status', '==', 'pending_review')
    .get();

  const missing = snap.docs.filter((d) => !d.data().coordinates);
  logger.info({ total: snap.size, missingCoords: missing.length }, 'Docs to fix');

  let fixed = 0;
  let failed = 0;

  for (let i = 0; i < missing.length; i++) {
    const doc = missing[i];
    const sourceUrl = doc.data().sourceUrl as string;

    if (!sourceUrl) {
      logger.warn({ id: doc.id }, 'No sourceUrl — skipping');
      failed++;
      continue;
    }

    logger.info({ url: sourceUrl, progress: `${i + 1}/${missing.length}` }, 'Fetching');

    try {
      const res = await client.get<string>(sourceUrl);
      const coords = extractCoordinates(res.data);

      if (coords) {
        await doc.ref.update({ coordinates: coords });
        logger.info({ id: doc.id, coords }, 'Updated');
        fixed++;
      } else {
        logger.warn({ id: doc.id, url: sourceUrl }, 'No coordinates found on page');
        failed++;
      }
    } catch (err) {
      logger.error({ id: doc.id, url: sourceUrl, err }, 'Fetch failed');
      failed++;
    }

    if (i < missing.length - 1) await sleep(config.rateLimit.delayMs);
  }

  logger.info({ fixed, failed }, 'Fix complete');
};

main().catch((err) => {
  logger.fatal({ err }, 'fix-coordinates failed');
  process.exit(1);
});
