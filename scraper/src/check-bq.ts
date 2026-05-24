import { initFirestore } from './firestore';

async function main() {
  const db = await initFirestore();
  const snap = await db.collection('diveSites').where('country', '==', 'Netherlands').get();

  const bq: { id: string; name: string; lat: number; lng: number }[] = [];
  let nlCount = 0;

  snap.docs.forEach((d) => {
    const data = d.data();
    const coords = data.coordinates as { lat: number; lng: number } | undefined;
    if (coords && coords.lat < 25 && coords.lng < -50) {
      bq.push({ id: d.id, name: data.name as string, lat: coords.lat, lng: coords.lng });
    } else {
      nlCount++;
    }
  });

  console.log(`BQ sites (${bq.length}):`);
  bq.forEach((s) => console.log(`  ${s.name} — ${s.lat}, ${s.lng}`));
  console.log(`NL sites: ${nlCount}`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
