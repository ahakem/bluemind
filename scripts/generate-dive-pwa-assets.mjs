/**
 * Generates all PWA icons and Apple splash screens for the Dive Sites PWA.
 * Run: node scripts/generate-dive-pwa-assets.mjs
 */

import sharp from 'sharp';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT = join(ROOT, 'public', 'dive-pwa');

mkdirSync(OUT, { recursive: true });

// Ocean-blue gradient background: #001f3f → #0077be
const BG_TOP    = { r: 0,   g: 31,  b: 63,  alpha: 1 };
const BG_BOTTOM = { r: 0,   g: 119, b: 190, alpha: 1 };
const LOGO       = join(ROOT, 'public', 'images', 'bluemind-logo.png');
const LOGO_LIGHT = join(ROOT, 'public', 'images', 'bluemind-light.png');

// ── Build a square icon with white bg + centred logo ──────────────────────
async function makeIcon(size) {
  const rx = Math.round(size * 0.18);
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="#ffffff" rx="${rx}"/>
  </svg>`;

  const logoSize = Math.round(size * 0.68);
  const logopad  = Math.round((size - logoSize) / 2);

  const logo = await sharp(LOGO)
    .resize(logoSize, logoSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toBuffer();

  return sharp(Buffer.from(svg))
    .composite([{ input: logo, top: logopad, left: logopad }])
    .png()
    .toBuffer();
}

// ── Maskable icon: white bg, logo in safe zone (no rounded corners) ────────
async function makeMaskable(size) {
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="#ffffff"/>
  </svg>`;

  const safeSize = Math.round(size * 0.8);
  const logoSize = Math.round(safeSize * 0.75);
  const logopad  = Math.round((size - logoSize) / 2);

  const logo = await sharp(LOGO)
    .resize(logoSize, logoSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toBuffer();

  return sharp(Buffer.from(svg))
    .composite([{ input: logo, top: logopad, left: logopad }])
    .png()
    .toBuffer();
}

// ── Apple splash screen ────────────────────────────────────────────────────
async function makeSplash(w, h) {
  const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stop-color="#00111f"/>
        <stop offset="60%"  stop-color="#002040"/>
        <stop offset="100%" stop-color="#003f80"/>
      </linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#g)"/>
    <text x="${w/2}" y="${h * 0.82}" text-anchor="middle"
      font-family="system-ui, -apple-system, sans-serif"
      font-size="${Math.round(h * 0.022)}" font-weight="500"
      fill="rgba(144,213,255,0.65)" letter-spacing="4">
      DIVE SITES
    </text>
  </svg>`;

  // White logo centred slightly above middle
  const logoSize = Math.round(Math.min(w, h) * 0.32);
  const logoLeft = Math.round((w - logoSize) / 2);
  const logoTop  = Math.round(h * 0.34);

  const logo = await sharp(LOGO_LIGHT)
    .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  return sharp(Buffer.from(svg))
    .composite([{ input: logo, top: logoTop, left: logoLeft }])
    .png()
    .toBuffer();
}

// ── Generate everything ────────────────────────────────────────────────────

const icons = [
  { size: 16,  name: 'favicon-16.png' },
  { size: 32,  name: 'favicon-32.png' },
  { size: 48,  name: 'favicon-48.png' },
  { size: 72,  name: 'icon-72.png' },
  { size: 96,  name: 'icon-96.png' },
  { size: 128, name: 'icon-128.png' },
  { size: 144, name: 'icon-144.png' },
  { size: 152, name: 'icon-152.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'icon-192.png' },
  { size: 384, name: 'icon-384.png' },
  { size: 512, name: 'icon-512.png' },
];

// Apple splash screens: [width, height, name]
const splashes = [
  [2048, 2732, 'splash-2048x2732.png'],  // 12.9" iPad Pro
  [1668, 2388, 'splash-1668x2388.png'],  // 11" iPad Pro
  [1536, 2048, 'splash-1536x2048.png'],  // iPad Air / Mini
  [1290, 2796, 'splash-1290x2796.png'],  // iPhone 15 Pro Max
  [1179, 2556, 'splash-1179x2556.png'],  // iPhone 15 Pro
  [1170, 2532, 'splash-1170x2532.png'],  // iPhone 14
  [1125, 2436, 'splash-1125x2436.png'],  // iPhone X / XS
  [1080, 1920, 'splash-1080x1920.png'],  // older Android
  [ 828, 1792, 'splash-828x1792.png'],   // iPhone XR
  [ 750, 1334, 'splash-750x1334.png'],   // iPhone 8
  [ 640, 1136, 'splash-640x1136.png'],   // iPhone SE
];

console.log('Generating icons…');
for (const { size, name } of icons) {
  const buf = await makeIcon(size);
  await sharp(buf).toFile(join(OUT, name));
  console.log(`  ✓ ${name}`);
}

console.log('Generating maskable icons…');
for (const size of [192, 512]) {
  const buf = await makeMaskable(size);
  await sharp(buf).toFile(join(OUT, `maskable-${size}.png`));
  console.log(`  ✓ maskable-${size}.png`);
}

console.log('Generating splash screens…');
for (const [w, h, name] of splashes) {
  const buf = await makeSplash(w, h);
  await sharp(buf).toFile(join(OUT, name));
  console.log(`  ✓ ${name}`);
}

console.log('\nDone — assets written to public/dive-pwa/');
