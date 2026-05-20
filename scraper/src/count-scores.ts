import { initFirestore } from './firestore';
import { config } from './config';

const main = async () => {
  const db = initFirestore();
  const snap = await db.collection(config.firestore.collection).where('status', '==', 'pending').get();

  const buckets: Record<string, number> = {
    'no score': 0,
    '0-19 (scuba)': 0,
    '20-44 (review)': 0,
    '45-59 (ok)': 0,
    '60-79 (good)': 0,
    '80+ (great)': 0,
  };
  const needsReview = snap.docs.filter((d) => d.data().needsReview).length;
  const highlightsEnriched = snap.docs.filter((d) => d.data().highlightsEnriched).length;
  const missingCoords = snap.docs.filter((d) => {
    const c = d.data().coordinates as { lat: number; lng: number } | null;
    return !c || (!c.lat && !c.lng);
  }).length;

  snap.docs.forEach((d) => {
    const score = d.data().freediverScore as number | undefined;
    if (score === undefined || score === null) buckets['no score']++;
    else if (score < 20) buckets['0-19 (scuba)']++;
    else if (score < 45) buckets['20-44 (review)']++;
    else if (score < 60) buckets['45-59 (ok)']++;
    else if (score < 80) buckets['60-79 (good)']++;
    else buckets['80+ (great)']++;
  });

  console.log('Total pending:', snap.size);
  console.log('needsReview flag:', needsReview);
  console.log('highlightsEnriched:', highlightsEnriched);
  console.log('Missing coords:', missingCoords);
  console.log('\nScore distribution:');
  Object.entries(buckets).forEach(([b, c]) => console.log(' ', b, ':', c));
  process.exit(0);
};
main().catch((err) => { console.error(err); process.exit(1); });
