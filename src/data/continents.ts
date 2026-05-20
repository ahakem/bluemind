// ISO 3166-1 alpha-2 codes grouped by continent
// Used for the continent filter on the dive sites page

export type Continent = 'Europe' | 'Africa' | 'Middle East' | 'Asia & Pacific' | 'Americas' | 'Oceania';

export const CONTINENTS: Continent[] = [
  'Europe',
  'Africa',
  'Middle East',
  'Asia & Pacific',
  'Americas',
  'Oceania',
];

const CONTINENT_CODES: Record<Continent, string[]> = {
  Europe: [
    'AD','AL','AT','BA','BE','BG','BY','CH','CY','CZ','DE','DK','EE','ES',
    'FI','FR','GB','GG','GI','GR','HR','HU','IE','IM','IS','IT','JE','LI',
    'LT','LU','LV','MC','MD','ME','MK','MT','NL','NO','PL','PT','RO','RS',
    'RU','SE','SI','SK','SM','UA','VA','XK',
  ],
  Africa: [
    'AO','BF','BI','BJ','BW','CD','CF','CG','CI','CM','CV','DJ','DZ','EG',
    'ER','ET','GA','GH','GM','GN','GQ','GW','KE','KM','LR','LS','LY','MA',
    'MG','ML','MR','MU','MW','MZ','NA','NE','NG','RE','RW','SC','SD','SL',
    'SN','SO','SS','ST','SZ','TD','TG','TN','TZ','UG','ZA','ZM','ZW',
  ],
  'Middle East': [
    'AE','BH','IL','IQ','IR','JO','KW','LB','OM','PS','QA','SA','SY','TR','YE',
  ],
  'Asia & Pacific': [
    'AF','AM','AZ','BD','BN','BT','CN','GE','HK','ID','IN','JP','KG','KH',
    'KP','KR','KZ','LA','LK','MM','MN','MO','MV','MY','NP','PH','PK','SG',
    'TH','TJ','TL','TM','TW','UZ','VN',
  ],
  Americas: [
    'AG','AI','AN','AR','AW','BB','BL','BO','BR','BS','BZ','CA','CL','CO',
    'CR','CU','CW','DM','DO','EC','FK','GD','GF','GP','GT','GY','HN','HT',
    'JM','KN','KY','LC','MF','MQ','MS','MX','NI','PA','PE','PR','PY','SR',
    'SV','TC','TT','US','UY','VC','VE','VG','VI',
  ],
  Oceania: [
    'AS','AU','CK','FJ','FM','GU','KI','MH','MP','NC','NR','NZ','PF','PG',
    'PW','SB','TO','TV','VU','WF','WS',
  ],
};

// Reverse lookup: ISO code → continent
const CODE_TO_CONTINENT: Record<string, Continent> = {};
for (const [continent, codes] of Object.entries(CONTINENT_CODES) as [Continent, string[]][]) {
  for (const code of codes) {
    CODE_TO_CONTINENT[code] = continent;
  }
}

export const getContinent = (isoCode: string): Continent | null =>
  CODE_TO_CONTINENT[isoCode.toUpperCase()] ?? null;
