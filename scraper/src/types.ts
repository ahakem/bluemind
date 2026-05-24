export interface WaterTempByMonth {
  jan?: number; feb?: number; mar?: number; apr?: number;
  may?: number; jun?: number; jul?: number; aug?: number;
  sep?: number; oct?: number; nov?: number; dec?: number;
}

export interface Thermocline {
  depth: number;
  tempDrop: number;
  seasons?: string[];
  notes?: string;
}

export interface ScrapedDiveSite {
  slug: string;
  sourceUrl: string;
  name: string;
  location: string;
  country: string;
  coordinates: { lat: number; lng: number } | null;
  waterType: 'lake' | 'sea' | 'quarry' | 'river' | 'pool' | 'unknown';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'unknown';
  maxDepth: number | null;
  description: string;
  highlights: string[];
  facilities: string[];
  waterTemp: WaterTempByMonth;
  visibility: { min: number; max: number } | null;
  bestSeasons: string[];
  photos: string[];
  thermocline?: Thermocline;
  status: 'pending';
  scrapedAt: Date;
}

export interface ScrapeResult {
  site: ScrapedDiveSite;
  firestoreId?: string;
  error?: string;
}
