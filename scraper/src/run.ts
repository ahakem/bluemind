import { runScraper } from './scraper';
import { logger } from './logger';

const parseArgs = () => {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const limitIdx = args.indexOf('--limit');
  const limit = limitIdx !== -1 ? parseInt(args[limitIdx + 1] ?? '10', 10) : null;

  // --slug grevelingenmeer --slug oosterschelde
  const slugs: string[] = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--slug' && args[i + 1]) {
      slugs.push(args[++i]);
    }
  }

  return { dryRun, limit, slugs };
};

const main = async () => {
  const opts = parseArgs();

  logger.info(
    {
      dryRun: opts.dryRun,
      limit: opts.limit ?? 'none',
      slugs: opts.slugs.length > 0 ? opts.slugs : 'all',
    },
    'Starting Blue Mind dive site scraper'
  );

  if (opts.dryRun) {
    logger.info('DRY RUN — no data will be written to Firestore');
  }

  try {
    const results = await runScraper(opts);

    const saved = results.filter((r) => r.firestoreId).length;
    const skipped = results.filter((r) => !r.error && !r.firestoreId).length;
    const failed = results.filter((r) => r.error).length;

    logger.info(
      { total: results.length, saved, skipped, failed },
      'Scraper finished'
    );

    if (failed > 0) {
      logger.warn('Some sites failed — check logs above for details');
      process.exitCode = 1;
    }
  } catch (err) {
    logger.fatal({ err }, 'Unhandled error in scraper');
    process.exit(1);
  }
};

main();
