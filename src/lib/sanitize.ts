// SSR-safe input sanitization — no DOM APIs used

export interface ValidationError {
  field: string;
  message: string;
}

export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ').trim();
}

export function truncate(input: string, max: number): string {
  return input.length > max ? input.slice(0, max) : input;
}

export function sanitizeText(input: string, max: number): string {
  return truncate(stripHtml(input), max);
}

export function sanitizeEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export function sanitizeCoordinates(lat: number, lng: number): boolean {
  return (
    isFinite(lat) && isFinite(lng) &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180
  );
}

// Simple FNV-32 hash for generating an IP-free fingerprint
function fnv32(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash.toString(16);
}

export function buildFingerprint(): string {
  if (typeof window === 'undefined') return '';
  const window_min = Math.floor(Date.now() / 60000);
  return fnv32(`${navigator.userAgent}|${window_min}`);
}

const WATER_TYPES = ['lake', 'sea', 'quarry', 'river', 'pool'] as const;
const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter'];

export function validateSubmission(raw: Partial<Record<string, unknown>>): ValidationError[] {
  const errors: ValidationError[] = [];

  const name = typeof raw.name === 'string' ? sanitizeText(raw.name, 120) : '';
  if (!name) errors.push({ field: 'name', message: 'Site name is required' });

  const country = typeof raw.country === 'string' ? sanitizeText(raw.country, 80) : '';
  if (!country) errors.push({ field: 'country', message: 'Country is required' });

  const coords = raw.coordinates as { lat?: number; lng?: number } | undefined;
  if (!coords || !sanitizeCoordinates(coords.lat ?? 0, coords.lng ?? 0) ||
      (coords.lat === 0 && coords.lng === 0)) {
    errors.push({ field: 'coordinates', message: 'Please pick a location on the map' });
  }

  if (!WATER_TYPES.includes(raw.waterType as typeof WATER_TYPES[number])) {
    errors.push({ field: 'waterType', message: 'Invalid water type' });
  }

  const depth = typeof raw.maxDepth === 'number' ? raw.maxDepth : Number(raw.maxDepth);
  if (!isFinite(depth) || depth < 0 || depth > 400) {
    errors.push({ field: 'maxDepth', message: 'Depth must be 0–400 m' });
  }

  const email = typeof raw.submitterEmail === 'string' ? raw.submitterEmail.trim() : '';
  if (!sanitizeEmail(email)) {
    errors.push({ field: 'submitterEmail', message: 'Valid email is required' });
  }

  return errors;
}
