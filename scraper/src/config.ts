import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const config = {
  baseUrl: 'https://www.divers-guide.com',
  listingPath: '/en/dive-site-information/dive-spots',
  sitePathPrefix: '/en/dive-spots/',
  rateLimit: {
    delayMs: parseInt(process.env.SCRAPE_DELAY_MS ?? '1500', 10),
    maxRetries: 3,
    retryDelayMs: 3000,
  },
  firestore: {
    projectId: process.env.FIREBASE_PROJECT_ID ?? 'bluemind-landing',
    databaseId: 'landing',
    collection: 'diveSites',
  },
  serviceAccountPath: process.env.GOOGLE_APPLICATION_CREDENTIALS ?? '',
} as const;
