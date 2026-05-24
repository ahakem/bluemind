/**
 * Generates 4 Instagram-ready 1080×1080 social media posts for BMF Dive Sites.
 * Output: public/social-posts/
 *
 * Run: node scripts/generate-social-posts.mjs
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT  = path.join(ROOT, 'public', 'social-posts');
const LOGO_LIGHT = path.join(ROOT, 'public', 'images', 'bluemind-light.png');  // white logo
const LOGO_DARK  = path.join(ROOT, 'public', 'images', 'bluemind-logo.png');   // blue logo

fs.mkdirSync(OUT, { recursive: true });

const W = 1080;
const H = 1080;

// ── helpers ──────────────────────────────────────────────────────────────────

function encodeUtf8Attr(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Render an SVG string to a PNG buffer via sharp */
async function svgToPng(svg) {
  return sharp(Buffer.from(svg)).png().toBuffer();
}

/** Read a PNG and return as base64 data URI */
function pngToDataUri(filepath) {
  const data = fs.readFileSync(filepath);
  return `data:image/png;base64,${data.toString('base64')}`;
}

// Pre-encode logos once
const logoLight = pngToDataUri(LOGO_LIGHT);
const logoDark  = pngToDataUri(LOGO_DARK);

// ── POST 1: "Your next dive site, found by the community" ────────────────────
// Dark ocean gradient, white text, community tag line
async function post1() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#001a33"/>
      <stop offset="100%" stop-color="#003d80"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="#0099ff"/>
      <stop offset="100%" stop-color="#00ccff"/>
    </linearGradient>
    <!-- decorative circles -->
  </defs>

  <!-- background -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <!-- decorative blurred circles -->
  <circle cx="900" cy="180" r="260" fill="#0077be" opacity="0.18"/>
  <circle cx="120" cy="900" r="200" fill="#00ccff" opacity="0.10"/>
  <circle cx="540" cy="540" r="420" fill="none" stroke="#0099ff" stroke-width="1" opacity="0.12"/>
  <circle cx="540" cy="540" r="480" fill="none" stroke="#0099ff" stroke-width="1" opacity="0.07"/>

  <!-- top horizontal rule -->
  <line x1="80" y1="110" x2="1000" y2="110" stroke="url(#accent)" stroke-width="2" opacity="0.4"/>

  <!-- logo -->
  <image href="${logoLight}" x="60" y="56" width="220" height="60"/>

  <!-- tag pill -->
  <rect x="60" y="200" width="230" height="36" rx="18" fill="#0099ff" opacity="0.85"/>
  <text x="175" y="223" font-family="Arial, sans-serif" font-size="15" font-weight="700" fill="white" text-anchor="middle" letter-spacing="2">COMMUNITY BUILT</text>

  <!-- headline -->
  <text x="60" y="330" font-family="Arial, sans-serif" font-size="72" font-weight="900" fill="white">Your next</text>
  <text x="60" y="420" font-family="Arial, sans-serif" font-size="72" font-weight="900" fill="white">dive site,</text>
  <text x="60" y="510" font-family="Arial, sans-serif" font-size="72" font-weight="900" fill="url(#accent)">found by</text>
  <text x="60" y="600" font-family="Arial, sans-serif" font-size="72" font-weight="900" fill="url(#accent)">the community.</text>

  <!-- body text -->
  <text x="60" y="680" font-family="Arial, sans-serif" font-size="26" fill="#90d5ff" opacity="0.9">Freediving spots worldwide — rated,</text>
  <text x="60" y="715" font-family="Arial, sans-serif" font-size="26" fill="#90d5ff" opacity="0.9">reviewed, and verified by freedivers.</text>

  <!-- stats row -->
  <rect x="60" y="780" width="200" height="90" rx="12" fill="white" opacity="0.06"/>
  <text x="160" y="820" font-family="Arial, sans-serif" font-size="34" font-weight="900" fill="white" text-anchor="middle">1000+</text>
  <text x="160" y="850" font-family="Arial, sans-serif" font-size="14" fill="#90d5ff" text-anchor="middle">DIVE SITES</text>

  <rect x="280" y="780" width="200" height="90" rx="12" fill="white" opacity="0.06"/>
  <text x="380" y="820" font-family="Arial, sans-serif" font-size="34" font-weight="900" fill="white" text-anchor="middle">60+</text>
  <text x="380" y="850" font-family="Arial, sans-serif" font-size="14" fill="#90d5ff" text-anchor="middle">COUNTRIES</text>

  <rect x="500" y="780" width="200" height="90" rx="12" fill="white" opacity="0.06"/>
  <text x="600" y="820" font-family="Arial, sans-serif" font-size="34" font-weight="900" fill="white" text-anchor="middle">FREE</text>
  <text x="600" y="850" font-family="Arial, sans-serif" font-size="14" fill="#90d5ff" text-anchor="middle">ALWAYS</text>

  <!-- bottom URL -->
  <text x="60" y="990" font-family="Arial, sans-serif" font-size="20" fill="#90d5ff" opacity="0.6" letter-spacing="1">bluemindfreediving.nl/dive-sites</text>
  <line x1="80" y1="1000" x2="1000" y2="1000" stroke="url(#accent)" stroke-width="2" opacity="0.4"/>
</svg>`;

  const buf = await svgToPng(svg);
  await sharp(buf).toFile(path.join(OUT, 'post1-community-found.png'));
  console.log('✓ post1-community-found.png');
}

// ── POST 2: "Dive safe. Filter out what's not for us." ───────────────────────
// Safety / removal request angle — teal accent
async function post2() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg2" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0%"   stop-color="#00111f"/>
      <stop offset="100%" stop-color="#002a1a"/>
    </linearGradient>
    <linearGradient id="teal" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="#00e5cc"/>
      <stop offset="100%" stop-color="#00b4d8"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg2)"/>

  <!-- decorative waves (arcs) -->
  <ellipse cx="540" cy="1180" rx="700" ry="380" fill="#00e5cc" opacity="0.04"/>
  <ellipse cx="540" cy="1260" rx="800" ry="380" fill="#00b4d8" opacity="0.04"/>
  <circle cx="-60" cy="200" r="280" fill="#00e5cc" opacity="0.07"/>

  <!-- logo -->
  <image href="${logoLight}" x="60" y="56" width="220" height="60"/>

  <!-- safety shield icon (SVG path) -->
  <g transform="translate(700, 200) scale(2.8)">
    <path d="M40 6 L8 18 L8 42 C8 56 40 74 40 74 C40 74 72 56 72 42 L72 18 Z"
          fill="none" stroke="#00e5cc" stroke-width="3" opacity="0.5"/>
    <path d="M28 40 L36 48 L52 32" stroke="#00e5cc" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.9"/>
  </g>

  <!-- tag pill -->
  <rect x="60" y="200" width="200" height="36" rx="18" fill="#00e5cc" opacity="0.15"/>
  <rect x="60" y="200" width="200" height="36" rx="18" fill="none" stroke="#00e5cc" stroke-width="1.5" opacity="0.6"/>
  <text x="160" y="223" font-family="Arial, sans-serif" font-size="15" font-weight="700" fill="#00e5cc" text-anchor="middle" letter-spacing="2">DIVE SAFE</text>

  <!-- headline -->
  <text x="60" y="320" font-family="Arial, sans-serif" font-size="66" font-weight="900" fill="white">Not every site</text>
  <text x="60" y="400" font-family="Arial, sans-serif" font-size="66" font-weight="900" fill="white">is built for</text>
  <text x="60" y="480" font-family="Arial, sans-serif" font-size="66" font-weight="900" fill="url(#teal)">freedivers.</text>

  <!-- divider -->
  <line x1="60" y1="520" x2="400" y2="520" stroke="url(#teal)" stroke-width="2" opacity="0.5"/>

  <!-- body -->
  <text x="60" y="570" font-family="Arial, sans-serif" font-size="26" fill="#b0e0ff" opacity="0.85">Our community flags and removes</text>
  <text x="60" y="605" font-family="Arial, sans-serif" font-size="26" fill="#b0e0ff" opacity="0.85">sites that aren't freediving-friendly —</text>
  <text x="60" y="640" font-family="Arial, sans-serif" font-size="26" fill="#b0e0ff" opacity="0.85">so you always know what to expect.</text>

  <!-- feature chips -->
  <rect x="60"  y="700" width="260" height="44" rx="22" fill="#00e5cc" opacity="0.12"/>
  <rect x="60"  y="700" width="260" height="44" rx="22" fill="none" stroke="#00e5cc" stroke-width="1" opacity="0.4"/>
  <text x="190" y="727" font-family="Arial, sans-serif" font-size="16" fill="#00e5cc" text-anchor="middle">✓  Community Verified</text>

  <rect x="340" y="700" width="220" height="44" rx="22" fill="#00e5cc" opacity="0.12"/>
  <rect x="340" y="700" width="220" height="44" rx="22" fill="none" stroke="#00e5cc" stroke-width="1" opacity="0.4"/>
  <text x="450" y="727" font-family="Arial, sans-serif" font-size="16" fill="#00e5cc" text-anchor="middle">✓  Depth Rated</text>

  <rect x="60"  y="762" width="200" height="44" rx="22" fill="#00e5cc" opacity="0.12"/>
  <rect x="60"  y="762" width="200" height="44" rx="22" fill="none" stroke="#00e5cc" stroke-width="1" opacity="0.4"/>
  <text x="160" y="789" font-family="Arial, sans-serif" font-size="16" fill="#00e5cc" text-anchor="middle">✓  Always Free</text>

  <!-- CTA box -->
  <rect x="60" y="860" width="580" height="76" rx="14" fill="#00e5cc" opacity="0.13"/>
  <text x="350" y="895" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="white" text-anchor="middle">Explore the directory →</text>
  <text x="350" y="923" font-family="Arial, sans-serif" font-size="16" fill="#00e5cc" text-anchor="middle">bluemindfreediving.nl/dive-sites</text>

  <!-- bottom line -->
  <line x1="60" y1="1010" x2="1020" y2="1010" stroke="#00e5cc" stroke-width="1" opacity="0.2"/>
  <text x="60" y="1048" font-family="Arial, sans-serif" font-size="18" fill="#00e5cc" opacity="0.45" letter-spacing="1">@BLUEMINDFREEDIVING</text>
</svg>`;

  const buf = await svgToPng(svg);
  await sharp(buf).toFile(path.join(OUT, 'post2-dive-safe.png'));
  console.log('✓ post2-dive-safe.png');
}

// ── POST 3: "Searchable by depth, visibility & season" ───────────────────────
// Feature highlight — clean minimal, white bg with blue accents
async function post3() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg3" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#f0f8ff"/>
      <stop offset="100%" stop-color="#dceeff"/>
    </linearGradient>
    <linearGradient id="blue3" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="#0056b3"/>
      <stop offset="100%" stop-color="#0099ff"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg3)"/>

  <!-- top color bar -->
  <rect x="0" y="0" width="${W}" height="8" fill="url(#blue3)"/>

  <!-- decorative circle -->
  <circle cx="900" cy="900" r="350" fill="#0077be" opacity="0.05"/>
  <circle cx="900" cy="900" r="260" fill="#0077be" opacity="0.05"/>

  <!-- logo (dark version on light bg) -->
  <image href="${logoDark}" x="60" y="46" width="220" height="60"/>

  <!-- tag -->
  <rect x="60" y="180" width="280" height="36" rx="18" fill="url(#blue3)"/>
  <text x="200" y="203" font-family="Arial, sans-serif" font-size="15" font-weight="700" fill="white" text-anchor="middle" letter-spacing="2">FREE DIVING DIRECTORY</text>

  <!-- headline -->
  <text x="60" y="310" font-family="Arial, sans-serif" font-size="60" font-weight="900" fill="#001a33">Search smarter.</text>
  <text x="60" y="388" font-family="Arial, sans-serif" font-size="60" font-weight="900" fill="#001a33">Dive deeper.</text>

  <!-- filter cards -->
  <!-- Depth -->
  <rect x="60" y="440" width="298" height="130" rx="16" fill="white"/>
  <rect x="60" y="440" width="298" height="130" rx="16" fill="none" stroke="#0077be" stroke-width="2" opacity="0.3"/>
  <text x="100" y="490" font-family="Arial, sans-serif" font-size="32" fill="#0077be">▼</text>
  <text x="100" y="525" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#001a33">Depth</text>
  <text x="100" y="552" font-family="Arial, sans-serif" font-size="15" fill="#5580a0">Filter by max depth</text>

  <!-- Visibility -->
  <rect x="378" y="440" width="298" height="130" rx="16" fill="white"/>
  <rect x="378" y="440" width="298" height="130" rx="16" fill="none" stroke="#0077be" stroke-width="2" opacity="0.3"/>
  <text x="418" y="490" font-family="Arial, sans-serif" font-size="32" fill="#0077be">◎</text>
  <text x="418" y="525" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#001a33">Visibility</text>
  <text x="418" y="552" font-family="Arial, sans-serif" font-size="15" fill="#5580a0">See through the water</text>

  <!-- Season -->
  <rect x="60" y="590" width="298" height="130" rx="16" fill="white"/>
  <rect x="60" y="590" width="298" height="130" rx="16" fill="none" stroke="#0077be" stroke-width="2" opacity="0.3"/>
  <text x="100" y="640" font-family="Arial, sans-serif" font-size="32" fill="#0077be">◑</text>
  <text x="100" y="675" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#001a33">Season</text>
  <text x="100" y="702" font-family="Arial, sans-serif" font-size="15" fill="#5580a0">Best months to visit</text>

  <!-- Water type -->
  <rect x="378" y="590" width="298" height="130" rx="16" fill="white"/>
  <rect x="378" y="590" width="298" height="130" rx="16" fill="none" stroke="#0077be" stroke-width="2" opacity="0.3"/>
  <text x="418" y="640" font-family="Arial, sans-serif" font-size="32" fill="#0077be">〜</text>
  <text x="418" y="675" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#001a33">Water Type</text>
  <text x="418" y="702" font-family="Arial, sans-serif" font-size="15" fill="#5580a0">Sea · Lake · River</text>

  <!-- country / continent -->
  <rect x="60" y="740" width="616" height="130" rx="16" fill="url(#blue3)"/>
  <text x="368" y="796" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="white" text-anchor="middle">🌍  60+ Countries · 6 Continents</text>
  <text x="368" y="830" font-family="Arial, sans-serif" font-size="16" fill="rgba(255,255,255,0.8)" text-anchor="middle">Filter by region and find sites near you</text>

  <!-- community note -->
  <text x="60" y="940" font-family="Arial, sans-serif" font-size="22" fill="#001a33" font-weight="700">Built by freedivers, for freedivers.</text>
  <text x="60" y="970" font-family="Arial, sans-serif" font-size="18" fill="#5580a0">100% free · No login required</text>

  <!-- URL -->
  <text x="60" y="1030" font-family="Arial, sans-serif" font-size="18" fill="#0077be" font-weight="600">bluemindfreediving.nl/dive-sites</text>

  <!-- bottom bar -->
  <rect x="0" y="1072" width="${W}" height="8" fill="url(#blue3)"/>
</svg>`;

  const buf = await svgToPng(svg);
  await sharp(buf).toFile(path.join(OUT, 'post3-search-features.png'));
  console.log('✓ post3-search-features.png');
}

// ── POST 4: "Join the community — add your spot" ─────────────────────────────
// CTA / invite to contribute — warmer, action focused
async function post4() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg4" x1="0.2" y1="0" x2="0.8" y2="1">
      <stop offset="0%"   stop-color="#001233"/>
      <stop offset="50%"  stop-color="#003070"/>
      <stop offset="100%" stop-color="#001233"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="#ffd700"/>
      <stop offset="100%" stop-color="#ffaa00"/>
    </linearGradient>
    <linearGradient id="cta" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="#0099ff"/>
      <stop offset="100%" stop-color="#0056b3"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg4)"/>

  <!-- background glow -->
  <circle cx="540" cy="400" r="500" fill="#0055cc" opacity="0.12"/>
  <circle cx="200" cy="900" r="300" fill="#0099ff" opacity="0.07"/>
  <circle cx="900" cy="200" r="200" fill="#ffd700" opacity="0.04"/>

  <!-- logo -->
  <image href="${logoLight}" x="60" y="52" width="220" height="60"/>

  <!-- large plus / add icon -->
  <circle cx="880" cy="540" r="130" fill="#0099ff" opacity="0.1"/>
  <circle cx="880" cy="540" r="130" fill="none" stroke="#0099ff" stroke-width="2" opacity="0.3"/>
  <line x1="880" y1="460" x2="880" y2="620" stroke="white" stroke-width="12" stroke-linecap="round" opacity="0.7"/>
  <line x1="800" y1="540" x2="960" y2="540" stroke="white" stroke-width="12" stroke-linecap="round" opacity="0.7"/>

  <!-- tag pill -->
  <rect x="60" y="190" width="260" height="38" rx="19" fill="url(#gold)" opacity="0.9"/>
  <text x="190" y="214" font-family="Arial, sans-serif" font-size="15" font-weight="800" fill="#001233" text-anchor="middle" letter-spacing="2">YOU KNOW A SPOT?</text>

  <!-- headline -->
  <text x="60" y="320" font-family="Arial, sans-serif" font-size="74" font-weight="900" fill="white">Add it.</text>
  <text x="60" y="410" font-family="Arial, sans-serif" font-size="74" font-weight="900" fill="white">Share it.</text>
  <text x="60" y="500" font-family="Arial, sans-serif" font-size="74" font-weight="900" fill="url(#gold)">Grow it.</text>

  <!-- divider -->
  <rect x="60" y="540" width="80" height="4" rx="2" fill="url(#gold)" opacity="0.8"/>

  <!-- body -->
  <text x="60" y="590" font-family="Arial, sans-serif" font-size="24" fill="#90c8ff">The BMF Dive Sites directory is built</text>
  <text x="60" y="622" font-family="Arial, sans-serif" font-size="24" fill="#90c8ff">entirely by the freediving community.</text>
  <text x="60" y="670" font-family="Arial, sans-serif" font-size="24" fill="#90c8ff">Every site you add helps another diver</text>
  <text x="60" y="702" font-family="Arial, sans-serif" font-size="24" fill="#90c8ff">find their next perfect dive.</text>

  <!-- steps row -->
  <rect x="60"  y="770" width="90" height="90" rx="12" fill="#0099ff" opacity="0.15"/>
  <rect x="60"  y="770" width="90" height="90" rx="12" fill="none" stroke="#0099ff" stroke-width="1.5" opacity="0.5"/>
  <text x="105"  y="818" font-family="Arial, sans-serif" font-size="32" font-weight="900" fill="white" text-anchor="middle">1</text>
  <text x="105"  y="838" font-family="Arial, sans-serif" font-size="11" fill="#90c8ff" text-anchor="middle">FIND SITE</text>

  <line x1="162" y1="815" x2="192" y2="815" stroke="#0099ff" stroke-width="2" opacity="0.4" stroke-dasharray="4,3"/>

  <rect x="200" y="770" width="90" height="90" rx="12" fill="#0099ff" opacity="0.15"/>
  <rect x="200" y="770" width="90" height="90" rx="12" fill="none" stroke="#0099ff" stroke-width="1.5" opacity="0.5"/>
  <text x="245" y="818" font-family="Arial, sans-serif" font-size="32" font-weight="900" fill="white" text-anchor="middle">2</text>
  <text x="245" y="838" font-family="Arial, sans-serif" font-size="11" fill="#90c8ff" text-anchor="middle">SUBMIT</text>

  <line x1="302" y1="815" x2="332" y2="815" stroke="#0099ff" stroke-width="2" opacity="0.4" stroke-dasharray="4,3"/>

  <rect x="340" y="770" width="90" height="90" rx="12" fill="#ffd700" opacity="0.12"/>
  <rect x="340" y="770" width="90" height="90" rx="12" fill="none" stroke="#ffd700" stroke-width="1.5" opacity="0.5"/>
  <text x="385" y="818" font-family="Arial, sans-serif" font-size="32" font-weight="900" fill="white" text-anchor="middle">3</text>
  <text x="385" y="838" font-family="Arial, sans-serif" font-size="11" fill="#ffd700" text-anchor="middle">GO LIVE</text>

  <!-- CTA button -->
  <rect x="60" y="910" width="620" height="80" rx="16" fill="url(#cta)"/>
  <text x="370" y="957" font-family="Arial, sans-serif" font-size="26" font-weight="800" fill="white" text-anchor="middle">Submit Your Dive Site →</text>

  <!-- URL & handle -->
  <text x="60" y="1025" font-family="Arial, sans-serif" font-size="18" fill="#90c8ff" opacity="0.7">bluemindfreediving.nl/dive-sites</text>
  <text x="1020" y="1025" font-family="Arial, sans-serif" font-size="18" fill="#90c8ff" opacity="0.7" text-anchor="end">@bluemindfreediving</text>

  <!-- bottom rule -->
  <line x1="60" y1="1048" x2="1020" y2="1048" stroke="url(#cta)" stroke-width="1.5" opacity="0.35"/>
</svg>`;

  const buf = await svgToPng(svg);
  await sharp(buf).toFile(path.join(OUT, 'post4-add-your-spot.png'));
  console.log('✓ post4-add-your-spot.png');
}

// ── run all ──────────────────────────────────────────────────────────────────
(async () => {
  try {
    await Promise.all([post1(), post2(), post3(), post4()]);
    console.log(`\nAll posts saved to: public/social-posts/`);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
