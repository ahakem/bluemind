import { initFirestore } from './firestore';
import { config } from './config';

const main = async () => {
  const db = initFirestore();
  const snap = await db.collection(config.firestore.collection).get();
  const counts: Record<string, number> = {};
  snap.docs.forEach((d) => {
    const s = (d.data().status as string) ?? 'unknown';
    counts[s] = (counts[s] ?? 0) + 1;
  });
  console.log('Total docs:', snap.size);
  Object.entries(counts).sort((a, b) => b[1] - a[1]).forEach(([s, c]) => console.log(' ', s, ':', c));
  process.exit(0);
};
main().catch((err) => { console.error(err); process.exit(1); });
