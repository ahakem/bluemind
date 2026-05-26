'use strict';
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });

const { Firestore } = require('@google-cloud/firestore');

const SERVICE_ACCOUNT_PATH = process.env.FIREBASE_SERVICE_ACCOUNT ?? '';
const DATABASE_ID          = process.env.FIREBASE_DATABASE_ID ?? 'landing';
const COLLECTION           = 'diveSites';
const DRY_RUN              = process.argv.includes('--dry-run');

if (!SERVICE_ACCOUNT_PATH) { console.error('FIREBASE_SERVICE_ACCOUNT not set'); process.exit(1); }

const db = new Firestore({
  projectId: require(SERVICE_ACCOUNT_PATH).project_id,
  keyFilename: SERVICE_ACCOUNT_PATH,
  databaseId: DATABASE_ID,
});

// Sites whose `country` field was set to a site name / location instead of the real country.
// Key = wrong value currently in Firestore, Value = correct country to set.
const CORRECTIONS = {
  // Dutch lake sites
  'AUESEE': 'Germany',               // Auesee is in Germany (NRW)
  'BAGGERSEE NIEDERLANGEN': 'Germany',
  'FUHLINGER SEE BB': 'Germany',
  'MESSINGHAUSEN': 'Germany',
  'BERGSE DIEPSLUIS OVERKANT': 'Netherlands',
  'BLIJKPOLDER SPORTHAL': 'Netherlands',
  'BUSSLOO BOOTHELLING': 'Netherlands',
  'DREISCHOR LOSWAL': 'Netherlands',
  'EILAND VAN MAURIK MEERPALEN': 'Netherlands',
  'EILAND VAN MAURIK NOORD': 'Netherlands',
  'GEFFENSE PLAS, WATERMAN': 'Netherlands',
  'GOESE SAS': 'Netherlands',
  'HAARRIJNSE PLAS STRAND': 'Netherlands',
  'HET WIERENBOS': 'Netherlands',
  'KRAAIJENBERGSE PLAS 3': 'Netherlands',
  'KRAAIJENBERGSE PLAS 7': 'Netherlands',
  'ROSMALENSE PLAS VISSTEIGER': 'Netherlands',
  'SCHARENDIJKE KABBELAARSRIF': 'Netherlands',
  'SINT ANNALAND PARKING': 'Netherlands',
  'SLAG BAARDMANNETJE': 'Netherlands',
  'STAVENISSE OOSTNOL': 'Netherlands',
  'SURFPLAS GOIRLE NOORD': 'Netherlands',
  'TOOLENBURGER PLAS NOORD': 'Netherlands',
  'VALKENBURGSE MEER': 'Netherlands',
  'VEENPLATEN ANNA JACOBAPOLDER': 'Netherlands',
  'VEERSE DAM': 'Netherlands',
  'VLIETLAND NOORDOOST': 'Netherlands',
  'VLIETLAND NOORDWEST': 'Netherlands',
  'WEST REPART': 'Netherlands',
  'ZANDMEREN PARKING': 'Netherlands',
  'ZEELANDBRUG PIJLER 2': 'Netherlands',
  'ZEGERPLAS BOOTHILL': 'Netherlands',
  'ZEGERPLAS T-STEIGER': 'Netherlands',
  'ZEGERSLOOT ONDERWATERPARK': 'Netherlands',

  // More Dutch lake / inland sites found in dry run
  'POLDERVELDPLAS NOORD': 'Netherlands',
  'HARDEGARIJP': 'Netherlands',
  'ZUIDERPLAS': 'Netherlands',
  'GRAVENBOL': 'Netherlands',
  'HARINGVLIETWEG 100': 'Netherlands',
  'HAARRIJNSEPLAS STRAND': 'Netherlands',
  'OOLDERPLAS': 'Netherlands',
  'SURFPLAS GOIRLE WEST': 'Netherlands',
  'GROOTE WIELEN BOOTHELLING': 'Netherlands',
  'GROOTE WIELEN': 'Netherlands',
  'GOUDZWAARD': 'Netherlands',
  'BOMMENEDE POLDER': 'Netherlands',
  'GAT VAN CORTENOEVER': 'Netherlands',
  'NIEUWE MEER STRAND': 'Netherlands',
  'NIEUWE MEER BOOTHELLING': 'Netherlands',
  'NIEUWE MEER MERCURE': 'Netherlands',
  'KATTENDIJKE TRAP': 'Netherlands',
  'HET BUITENVELD': 'Netherlands',
  'KATSHOEK': 'Netherlands',
  'RADIOPLAS': 'Netherlands',
  'ALBAPLAS': 'Netherlands',
  'BERENDONCK WATERSKIBAAN': 'Netherlands',
  'ZEUMEREN': 'Netherlands',
  'LENTSE PLAS': 'Netherlands',
  'BINNENSPUIKANAAL': 'Netherlands',
  'RIF010': 'Netherlands',
  'MOEKE MOOREN': 'Netherlands',
  'EILAND 5': 'Netherlands',
  'DE BAARS WALHOEVE': 'Netherlands',
  'RIELERKOLK': 'Netherlands',
  'KRAAIJENBERGSE PLAS 4': 'Netherlands',
  'PUT MIDDELWAARD': 'Netherlands',
  'SS AMELAND': 'Netherlands',         // wreck near Ameland island, NL
  'TIJNINGENPLAS NOORDWEST': 'Netherlands',
  'U 31': 'Netherlands',               // U-boat wreck in Dutch waters

  // More German lakes found in dry run
  'EFFELDER WALDSEE': 'Germany',
  'HITDORFER SEE': 'Germany',

  // Belgian quarry dive sites (carrière = quarry in French/Walloon)
  'CARRIÈRE TROIS FONTAINES': 'Belgium',
  'CARRIERE DE RHISNES': 'Belgium',
  'FLOREFFE': 'Belgium',
  'CARRIERE DE OPPREBAIS': 'Belgium',
};

async function run() {
  console.log(DRY_RUN ? '🔍 DRY RUN — no writes\n' : '✏️  LIVE RUN — writing to Firestore\n');

  const snap = await db.collection(COLLECTION).get();
  let fixed = 0, skipped = 0, unknown = 0;

  for (const doc of snap.docs) {
    const data = doc.data();
    const current = (data.country ?? '').trim();
    const correct = CORRECTIONS[current];

    if (!correct) {
      // Flag anything that looks like a site name in the country field (all-caps, no space = likely wrong)
      if (current === current.toUpperCase() && current.length > 3 && !['UAE', 'USA', 'UK'].includes(current)) {
        console.log(`  ⚠️  Unknown bad country: "${current}" — ${data.name}`);
        unknown++;
      }
      skipped++;
      continue;
    }

    console.log(`  ${DRY_RUN ? '[dry]' : '✅'} "${data.name}" — country: "${current}" → "${correct}"`);
    if (!DRY_RUN) {
      await doc.ref.update({ country: correct, updatedAt: Firestore.Timestamp.now() });
    }
    fixed++;
  }

  console.log(`\nDone. Fixed: ${fixed} · Skipped: ${skipped} · Unknown suspicious: ${unknown}`);
  if (unknown > 0) console.log('  Re-run with --dry-run to review unknowns, then add them to CORRECTIONS above.');
}

run().catch((err) => { console.error(err); process.exit(1); });
