import { initFirestore } from './firestore';
import { config } from './config';

const INLAND_TYPES = ['lake', 'quarry', 'river', 'pool'];

const main = async () => {
  const db = initFirestore();
  const snap = await db.collection(config.firestore.collection).get();

  const inland = snap.docs.filter((d) => INLAND_TYPES.includes(d.data().waterType));

  let hasAirTemp = 0;
  let hasWaterTemp = 0;
  let hasNeither = 0;

  inland.forEach((d) => {
    const data = d.data();
    const air = data.airTempByMonth as Record<string, number> | null;
    const water = data.waterTemp as Record<string, number> | null;
    const hasAir = air && Object.keys(air).length > 0;
    const hasWater = water && Object.keys(water).length > 0;
    if (hasAir) hasAirTemp++;
    if (hasWater) hasWaterTemp++;
    if (!hasAir && !hasWater) hasNeither++;
  });

  console.log('Total inland sites:', inland.length);
  console.log('Has airTempByMonth:', hasAirTemp);
  console.log('Has waterTemp:', hasWaterTemp);
  console.log('Has neither:', hasNeither);

  // Show one example
  const sample = inland.find((d) => {
    const air = d.data().airTempByMonth as Record<string, number> | null;
    return air && Object.keys(air).length > 0;
  });
  if (sample) {
    const data = sample.data();
    console.log('\nSample site:', data.name);
    console.log('airTempByMonth keys:', Object.keys(data.airTempByMonth || {}).length);
    console.log('waterTemp keys:', Object.keys(data.waterTemp || {}).length);
  }

  process.exit(0);
};

main().catch((err) => { console.error(err); process.exit(1); });
