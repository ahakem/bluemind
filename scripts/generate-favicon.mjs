import sharp from 'sharp';
import { writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '../public/dive-pwa');

// SVG: dark navy background + 3 water wave lines (matches MUI WaterIcon / navbar style)
function makeSvg(size) {
  const pad = size * 0.12;
  const w = size - pad * 2;
  const h = size - pad * 2;
  const cx = pad;
  const cy = pad;

  // Wave row heights (3 waves evenly spaced in lower 55% of icon)
  const waveTop = cy + h * 0.3;
  const gap = h * 0.22;

  function wave(y, amplitude) {
    const sw = Math.max(1.5, size * 0.055);
    const q1x = cx + w * 0.25;
    const q1y = y - amplitude;
    const q2x = cx + w * 0.75;
    const q2y = y + amplitude;
    return `<path d="M${cx},${y} Q${q1x},${q1y} ${cx + w * 0.5},${y} Q${q2x},${q2y} ${cx + w},${y}"
      fill="none" stroke="#4fc3f7" stroke-width="${sw}" stroke-linecap="round"/>`;
  }

  const amp = h * 0.07;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.18}" fill="#001f3f"/>
  ${wave(waveTop, amp)}
  ${wave(waveTop + gap, amp)}
  ${wave(waveTop + gap * 2, amp)}
</svg>`;
}

const sizes = [16, 32, 48, 72, 96, 128, 144, 152, 192, 384, 512];

for (const size of sizes) {
  const svg = Buffer.from(makeSvg(size));
  const filename =
    size <= 48 ? `favicon-${size}.png`
    : size === 192 || size === 512 ? `icon-${size}.png`
    : `icon-${size}.png`;

  await sharp(svg).png().toFile(path.join(OUT, filename));
  console.log(`✅  ${filename}`);
}

// Also write the apple-touch-icon (180px inside 192 canvas)
await sharp(Buffer.from(makeSvg(192))).png().toFile(path.join(OUT, 'apple-touch-icon.png'));
console.log('✅  apple-touch-icon.png');

// maskable versions (same but with more padding — safe zone is center 80%)
function makeMaskableSvg(size) {
  const pad = size * 0.12;
  const w = size - pad * 2;
  const h = size - pad * 2;
  const cx = pad;
  const cy = pad;
  const waveTop = cy + h * 0.3;
  const gap = h * 0.22;
  const amp = h * 0.07;

  function wave(y, amplitude) {
    const sw = Math.max(1.5, size * 0.055);
    const q1x = cx + w * 0.25;
    const q1y = y - amplitude;
    const q2x = cx + w * 0.75;
    const q2y = y + amplitude;
    return `<path d="M${cx},${y} Q${q1x},${q1y} ${cx + w * 0.5},${y} Q${q2x},${q2y} ${cx + w},${y}"
      fill="none" stroke="#4fc3f7" stroke-width="${sw}" stroke-linecap="round"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#001f3f"/>
  ${wave(waveTop, amp)}
  ${wave(waveTop + gap, amp)}
  ${wave(waveTop + gap * 2, amp)}
</svg>`;
}

await sharp(Buffer.from(makeMaskableSvg(192))).png().toFile(path.join(OUT, 'maskable-192.png'));
await sharp(Buffer.from(makeMaskableSvg(512))).png().toFile(path.join(OUT, 'maskable-512.png'));
console.log('✅  maskable-192.png');
console.log('✅  maskable-512.png');

console.log('\n🎉  All icons generated in public/dive-pwa/');
