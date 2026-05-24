import { initFirestore } from './firestore';
import { config } from './config';

const main = async () => {
  const db = initFirestore();
  const snap = await db.collection(config.firestore.collection).where('status', '==', 'active').get();
  const missing = snap.docs.filter((d) => {
    const c = d.data().coordinates as { lat: number; lng: number } | null;
    return !c || (!c.lat && !c.lng);
  });
  console.log('Total active:', snap.size);
  console.log('Missing coords:', missing.length);
  if (missing.length > 0) {
    console.log('\nSample (first 5):');
    missing.slice(0, 5).forEach((d) => {
      const data = d.data();
      console.log(' -', data.name, '|', data.location, '|', data.country);
    });
  }
  process.exit(0);
};

main().catch((err) => { console.error(err); process.exit(1); });
