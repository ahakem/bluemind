/**
 * Generates 4 Instagram Stories (1080×1920) for BMF Dive Sites.
 * Output: public/social-posts/stories/
 *
 * Run: node scripts/generate-social-stories.mjs
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT  = path.join(ROOT, 'public', 'social-posts', 'stories');
const LOGO_LIGHT = path.join(ROOT, 'public', 'images', 'bluemind-light.png');
const LOGO_DARK  = path.join(ROOT, 'public', 'images', 'bluemind-logo.png');

fs.mkdirSync(OUT, { recursive: true });

const W = 1080;
const H = 1920;

function pngToDataUri(filepath) {
  const data = fs.readFileSync(filepath);
  return `data:image/png;base64,${data.toString('base64')}`;
}

async function svgToPng(svg) {
  return sharp(Buffer.from(svg)).png().toBuffer();
}

const logoLight = pngToDataUri(LOGO_LIGHT);
const logoDark  = pngToDataUri(LOGO_DARK);

// ── STORY 1: "Your next dive site, found by the community" ──────────────────
async function story1() {
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
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <!-- decorative circles -->
  <circle cx="900" cy="300"  r="360" fill="#0077be" opacity="0.15"/>
  <circle cx="120" cy="1600" r="300" fill="#00ccff" opacity="0.09"/>
  <circle cx="540" cy="960"  r="600" fill="none" stroke="#0099ff" stroke-width="1.5" opacity="0.1"/>
  <circle cx="540" cy="960"  r="700" fill="none" stroke="#0099ff" stroke-width="1"   opacity="0.06"/>

  <!-- safe zone top padding (Instagram UI) -->
  <!-- logo -->
  <image href="${logoLight}" x="80" y="120" width="280" height="76"/>

  <!-- top rule -->
  <line x1="80" y1="220" x2="1000" y2="220" stroke="url(#accent)" stroke-width="2" opacity="0.35"/>

  <!-- tag pill -->
  <rect x="80" y="300" width="280" height="46" rx="23" fill="#0099ff" opacity="0.85"/>
  <text x="220" y="329" font-family="Arial, sans-serif" font-size="17" font-weight="700" fill="white" text-anchor="middle" letter-spacing="2">COMMUNITY BUILT</text>

  <!-- big headline center section -->
  <text x="80" y="460" font-family="Arial, sans-serif" font-size="96" font-weight="900" fill="white">Your</text>
  <text x="80" y="570" font-family="Arial, sans-serif" font-size="96" font-weight="900" fill="white">next dive</text>
  <text x="80" y="680" font-family="Arial, sans-serif" font-size="96" font-weight="900" fill="white">site,</text>

  <text x="80" y="800" font-family="Arial, sans-serif" font-size="96" font-weight="900" fill="url(#accent)">found by</text>
  <text x="80" y="910" font-family="Arial, sans-serif" font-size="96" font-weight="900" fill="url(#accent)">the</text>
  <text x="80" y="1020" font-family="Arial, sans-serif" font-size="96" font-weight="900" fill="url(#accent)">community.</text>

  <!-- divider -->
  <rect x="80" y="1070" width="100" height="5" rx="2.5" fill="url(#accent)" opacity="0.7"/>

  <!-- body text -->
  <text x="80" y="1130" font-family="Arial, sans-serif" font-size="32" fill="#90d5ff" opacity="0.9">Freediving spots worldwide —</text>
  <text x="80" y="1172" font-family="Arial, sans-serif" font-size="32" fill="#90d5ff" opacity="0.9">rated, reviewed and verified</text>
  <text x="80" y="1214" font-family="Arial, sans-serif" font-size="32" fill="#90d5ff" opacity="0.9">by freedivers like you.</text>

  <!-- stats cards -->
  <rect x="80"  y="1300" width="270" height="130" rx="18" fill="white" opacity="0.07"/>
  <text x="215" y="1353" font-family="Arial, sans-serif" font-size="48" font-weight="900" fill="white" text-anchor="middle">1000+</text>
  <text x="215" y="1390" font-family="Arial, sans-serif" font-size="17" fill="#90d5ff" text-anchor="middle">DIVE SITES</text>

  <rect x="380" y="1300" width="270" height="130" rx="18" fill="white" opacity="0.07"/>
  <text x="515" y="1353" font-family="Arial, sans-serif" font-size="48" font-weight="900" fill="white" text-anchor="middle">60+</text>
  <text x="515" y="1390" font-family="Arial, sans-serif" font-size="17" fill="#90d5ff" text-anchor="middle">COUNTRIES</text>

  <rect x="680" y="1300" width="270" height="130" rx="18" fill="white" opacity="0.07"/>
  <text x="815" y="1353" font-family="Arial, sans-serif" font-size="48" font-weight="900" fill="white" text-anchor="middle">FREE</text>
  <text x="815" y="1390" font-family="Arial, sans-serif" font-size="17" fill="#90d5ff" text-anchor="middle">ALWAYS</text>

  <!-- CTA -->
  <rect x="80" y="1490" width="920" height="96" rx="18" fill="url(#accent)" opacity="0.9"/>
  <text x="540" y="1547" font-family="Arial, sans-serif" font-size="30" font-weight="800" fill="#001a33" text-anchor="middle">Explore the Directory →</text>

  <!-- URL -->
  <text x="540" y="1660" font-family="Arial, sans-serif" font-size="24" fill="#90d5ff" opacity="0.65" text-anchor="middle">bluemindfreediving.nl/dive-sites</text>

  <!-- bottom rule -->
  <line x1="80" y1="1820" x2="1000" y2="1820" stroke="url(#accent)" stroke-width="2" opacity="0.3"/>
  <text x="540" y="1860" font-family="Arial, sans-serif" font-size="22" fill="#90d5ff" opacity="0.4" text-anchor="middle" letter-spacing="2">@BLUEMINDFREEDIVING</text>
</svg>`;

  const buf = await svgToPng(svg);
  await sharp(buf).toFile(path.join(OUT, 'story1-community-found.png'));
  console.log('✓ story1-community-found.png');
}

// ── STORY 2: "Dive Safe" ─────────────────────────────────────────────────────
async function story2() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#00111f"/>
      <stop offset="100%" stop-color="#002a1a"/>
    </linearGradient>
    <linearGradient id="teal" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="#00e5cc"/>
      <stop offset="100%" stop-color="#00b4d8"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg2)"/>

  <!-- glow blobs -->
  <circle cx="-80"  cy="400"  r="350" fill="#00e5cc" opacity="0.06"/>
  <circle cx="1160" cy="1500" r="400" fill="#00b4d8" opacity="0.06"/>
  <ellipse cx="540" cy="1920" rx="800" ry="420" fill="#00e5cc" opacity="0.04"/>

  <!-- logo -->
  <image href="${logoLight}" x="80" y="120" width="280" height="76"/>

  <!-- top rule -->
  <line x1="80" y1="220" x2="1000" y2="220" stroke="url(#teal)" stroke-width="2" opacity="0.3"/>

  <!-- shield -->
  <g transform="translate(620, 260) scale(3.6)">
    <path d="M40 6 L8 18 L8 44 C8 58 40 76 40 76 C40 76 72 58 72 44 L72 18 Z"
          fill="none" stroke="#00e5cc" stroke-width="2.5" opacity="0.45"/>
    <path d="M27 42 L36 51 L53 30" stroke="#00e5cc" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.85"/>
  </g>

  <!-- tag pill -->
  <rect x="80" y="330" width="220" height="46" rx="23" fill="#00e5cc" opacity="0.14"/>
  <rect x="80" y="330" width="220" height="46" rx="23" fill="none" stroke="#00e5cc" stroke-width="1.5" opacity="0.55"/>
  <text x="190" y="359" font-family="Arial, sans-serif" font-size="17" font-weight="700" fill="#00e5cc" text-anchor="middle" letter-spacing="2">DIVE SAFE</text>

  <!-- headline -->
  <text x="80" y="490" font-family="Arial, sans-serif" font-size="88" font-weight="900" fill="white">Not every</text>
  <text x="80" y="592" font-family="Arial, sans-serif" font-size="88" font-weight="900" fill="white">site is built</text>
  <text x="80" y="694" font-family="Arial, sans-serif" font-size="88" font-weight="900" fill="white">for</text>
  <text x="80" y="796" font-family="Arial, sans-serif" font-size="88" font-weight="900" fill="url(#teal)">freedivers.</text>

  <!-- divider -->
  <rect x="80" y="840" width="100" height="5" rx="2.5" fill="url(#teal)" opacity="0.7"/>

  <!-- body -->
  <text x="80" y="910" font-family="Arial, sans-serif" font-size="30" fill="#b0e0ff" opacity="0.85">Our community flags and removes</text>
  <text x="80" y="950" font-family="Arial, sans-serif" font-size="30" fill="#b0e0ff" opacity="0.85">sites that aren't freediving-friendly</text>
  <text x="80" y="990" font-family="Arial, sans-serif" font-size="30" fill="#b0e0ff" opacity="0.85">— so you always know what to</text>
  <text x="80" y="1030" font-family="Arial, sans-serif" font-size="30" fill="#b0e0ff" opacity="0.85">expect before you dive.</text>

  <!-- feature pills -->
  <rect x="80"  y="1120" width="390" height="60" rx="30" fill="#00e5cc" opacity="0.12"/>
  <rect x="80"  y="1120" width="390" height="60" rx="30" fill="none" stroke="#00e5cc" stroke-width="1.5" opacity="0.45"/>
  <text x="275" y="1157" font-family="Arial, sans-serif" font-size="22" fill="#00e5cc" text-anchor="middle">✓  Community Verified</text>

  <rect x="80"  y="1202" width="310" height="60" rx="30" fill="#00e5cc" opacity="0.12"/>
  <rect x="80"  y="1202" width="310" height="60" rx="30" fill="none" stroke="#00e5cc" stroke-width="1.5" opacity="0.45"/>
  <text x="235" y="1239" font-family="Arial, sans-serif" font-size="22" fill="#00e5cc" text-anchor="middle">✓  Depth Rated</text>

  <rect x="80"  y="1284" width="280" height="60" rx="30" fill="#00e5cc" opacity="0.12"/>
  <rect x="80"  y="1284" width="280" height="60" rx="30" fill="none" stroke="#00e5cc" stroke-width="1.5" opacity="0.45"/>
  <text x="220" y="1321" font-family="Arial, sans-serif" font-size="22" fill="#00e5cc" text-anchor="middle">✓  Always Free</text>

  <!-- site removal note -->
  <rect x="80" y="1400" width="920" height="110" rx="16" fill="#00e5cc" opacity="0.07"/>
  <rect x="80" y="1400" width="920" height="110" rx="16" fill="none" stroke="#00e5cc" stroke-width="1" opacity="0.25"/>
  <text x="540" y="1448" font-family="Arial, sans-serif" font-size="24" fill="#00e5cc" text-anchor="middle" font-weight="700">See a site that doesn't belong?</text>
  <text x="540" y="1482" font-family="Arial, sans-serif" font-size="21" fill="#90d5ff" text-anchor="middle">Flag it. We review every request.</text>

  <!-- CTA -->
  <rect x="80" y="1560" width="920" height="96" rx="18" fill="url(#teal)" opacity="0.85"/>
  <text x="540" y="1617" font-family="Arial, sans-serif" font-size="30" font-weight="800" fill="#001a33" text-anchor="middle">Explore the Directory →</text>

  <!-- URL -->
  <text x="540" y="1710" font-family="Arial, sans-serif" font-size="24" fill="#90d5ff" opacity="0.55" text-anchor="middle">bluemindfreediving.nl/dive-sites</text>

  <!-- bottom -->
  <line x1="80" y1="1820" x2="1000" y2="1820" stroke="url(#teal)" stroke-width="1.5" opacity="0.25"/>
  <text x="540" y="1860" font-family="Arial, sans-serif" font-size="22" fill="#00e5cc" opacity="0.4" text-anchor="middle" letter-spacing="2">@BLUEMINDFREEDIVING</text>
</svg>`;

  const buf = await svgToPng(svg);
  await sharp(buf).toFile(path.join(OUT, 'story2-dive-safe.png'));
  console.log('✓ story2-dive-safe.png');
}

// ── STORY 3: "Search smarter. Dive deeper." ──────────────────────────────────
async function story3() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg3" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#f0f8ff"/>
      <stop offset="100%" stop-color="#d4eaff"/>
    </linearGradient>
    <linearGradient id="blue3" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="#0056b3"/>
      <stop offset="100%" stop-color="#0099ff"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg3)"/>

  <!-- top color bar -->
  <rect x="0" y="0" width="${W}" height="10" fill="url(#blue3)"/>

  <!-- decorative circle -->
  <circle cx="960" cy="1700" r="450" fill="#0077be" opacity="0.05"/>
  <circle cx="960" cy="1700" r="330" fill="#0077be" opacity="0.05"/>
  <circle cx="-80" cy="400"  r="300" fill="#0077be" opacity="0.04"/>

  <!-- logo -->
  <image href="${logoDark}" x="80" y="80" width="280" height="76"/>

  <!-- tag -->
  <rect x="80" y="230" width="340" height="46" rx="23" fill="url(#blue3)"/>
  <text x="250" y="259" font-family="Arial, sans-serif" font-size="17" font-weight="700" fill="white" text-anchor="middle" letter-spacing="2">FREEDIVING DIRECTORY</text>

  <!-- headline -->
  <text x="80" y="380" font-family="Arial, sans-serif" font-size="90" font-weight="900" fill="#001a33">Search</text>
  <text x="80" y="480" font-family="Arial, sans-serif" font-size="90" font-weight="900" fill="#001a33">smarter.</text>
  <text x="80" y="600" font-family="Arial, sans-serif" font-size="90" font-weight="900" fill="#0056b3">Dive</text>
  <text x="80" y="700" font-family="Arial, sans-serif" font-size="90" font-weight="900" fill="#0056b3">deeper.</text>

  <!-- sub -->
  <text x="80" y="770" font-family="Arial, sans-serif" font-size="28" fill="#4a6e8a">Filter by what matters to freedivers.</text>

  <!-- filter cards — 2 col -->
  <!-- Depth -->
  <rect x="80"  y="830" width="430" height="160" rx="20" fill="white"/>
  <rect x="80"  y="830" width="430" height="160" rx="20" fill="none" stroke="#0077be" stroke-width="2" opacity="0.25"/>
  <text x="130" y="900" font-family="Arial, sans-serif" font-size="42" fill="#0077be">▼</text>
  <text x="130" y="945" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="#001a33">Depth</text>
  <text x="130" y="975" font-family="Arial, sans-serif" font-size="18" fill="#5580a0">Max depth filter</text>

  <!-- Visibility -->
  <rect x="570" y="830" width="430" height="160" rx="20" fill="white"/>
  <rect x="570" y="830" width="430" height="160" rx="20" fill="none" stroke="#0077be" stroke-width="2" opacity="0.25"/>
  <text x="620" y="900" font-family="Arial, sans-serif" font-size="42" fill="#0077be">◎</text>
  <text x="620" y="945" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="#001a33">Visibility</text>
  <text x="620" y="975" font-family="Arial, sans-serif" font-size="18" fill="#5580a0">Water clarity</text>

  <!-- Season -->
  <rect x="80"  y="1010" width="430" height="160" rx="20" fill="white"/>
  <rect x="80"  y="1010" width="430" height="160" rx="20" fill="none" stroke="#0077be" stroke-width="2" opacity="0.25"/>
  <text x="130" y="1080" font-family="Arial, sans-serif" font-size="42" fill="#0077be">◑</text>
  <text x="130" y="1125" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="#001a33">Season</text>
  <text x="130" y="1155" font-family="Arial, sans-serif" font-size="18" fill="#5580a0">Best months to visit</text>

  <!-- Water type -->
  <rect x="570" y="1010" width="430" height="160" rx="20" fill="white"/>
  <rect x="570" y="1010" width="430" height="160" rx="20" fill="none" stroke="#0077be" stroke-width="2" opacity="0.25"/>
  <text x="620" y="1080" font-family="Arial, sans-serif" font-size="42" fill="#0077be">〜</text>
  <text x="620" y="1125" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="#001a33">Water Type</text>
  <text x="620" y="1155" font-family="Arial, sans-serif" font-size="18" fill="#5580a0">Sea · Lake · River</text>

  <!-- Country full width -->
  <rect x="80" y="1190" width="920" height="160" rx="20" fill="url(#blue3)"/>
  <text x="540" y="1265" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="white" text-anchor="middle">🌍  60+ Countries · 6 Continents</text>
  <text x="540" y="1310" font-family="Arial, sans-serif" font-size="21" fill="rgba(255,255,255,0.8)" text-anchor="middle">Filter by region and find sites near you</text>

  <!-- community note -->
  <text x="80" y="1430" font-family="Arial, sans-serif" font-size="30" fill="#001a33" font-weight="800">Built by freedivers, for freedivers.</text>
  <text x="80" y="1476" font-family="Arial, sans-serif" font-size="24" fill="#5580a0">100% free · No login required</text>
  <text x="80" y="1522" font-family="Arial, sans-serif" font-size="24" fill="#5580a0">Searchable · Filterable · Community-run</text>

  <!-- CTA -->
  <rect x="80" y="1600" width="920" height="96" rx="18" fill="url(#blue3)"/>
  <text x="540" y="1657" font-family="Arial, sans-serif" font-size="30" font-weight="800" fill="white" text-anchor="middle">Find Your Next Dive →</text>

  <!-- URL -->
  <text x="540" y="1760" font-family="Arial, sans-serif" font-size="24" fill="#0056b3" text-anchor="middle" font-weight="600">bluemindfreediving.nl/dive-sites</text>

  <!-- bottom bar -->
  <rect x="0" y="1910" width="${W}" height="10" fill="url(#blue3)"/>
</svg>`;

  const buf = await svgToPng(svg);
  await sharp(buf).toFile(path.join(OUT, 'story3-search-features.png'));
  console.log('✓ story3-search-features.png');
}

// ── STORY 4: "Add it. Share it. Grow it." ────────────────────────────────────
async function story4() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg4" x1="0.2" y1="0" x2="0.8" y2="1">
      <stop offset="0%"   stop-color="#001233"/>
      <stop offset="55%"  stop-color="#003070"/>
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

  <!-- glow -->
  <circle cx="540" cy="700"  r="620" fill="#0055cc" opacity="0.11"/>
  <circle cx="160" cy="1700" r="380" fill="#0099ff" opacity="0.06"/>
  <circle cx="920" cy="280"  r="260" fill="#ffd700" opacity="0.04"/>

  <!-- logo -->
  <image href="${logoLight}" x="80" y="120" width="280" height="76"/>

  <!-- top rule -->
  <line x1="80" y1="220" x2="1000" y2="220" stroke="url(#cta)" stroke-width="2" opacity="0.3"/>

  <!-- plus icon large -->
  <circle cx="540" cy="470" r="160" fill="#0099ff" opacity="0.10"/>
  <circle cx="540" cy="470" r="160" fill="none" stroke="#0099ff" stroke-width="2.5" opacity="0.3"/>
  <line x1="540" y1="360" x2="540" y2="580" stroke="white" stroke-width="14" stroke-linecap="round" opacity="0.75"/>
  <line x1="430" y1="470" x2="650" y2="470" stroke="white" stroke-width="14" stroke-linecap="round" opacity="0.75"/>

  <!-- tag pill -->
  <rect x="310" y="680" width="460" height="52" rx="26" fill="url(#gold)" opacity="0.9"/>
  <text x="540" y="713" font-family="Arial, sans-serif" font-size="19" font-weight="800" fill="#001233" text-anchor="middle" letter-spacing="2">YOU KNOW A SPOT?</text>

  <!-- headline -->
  <text x="540" y="840"  font-family="Arial, sans-serif" font-size="110" font-weight="900" fill="white" text-anchor="middle">Add it.</text>
  <text x="540" y="960"  font-family="Arial, sans-serif" font-size="110" font-weight="900" fill="white" text-anchor="middle">Share it.</text>
  <text x="540" y="1085" font-family="Arial, sans-serif" font-size="110" font-weight="900" fill="url(#gold)" text-anchor="middle">Grow it.</text>

  <!-- divider -->
  <rect x="470" y="1120" width="100" height="5" rx="2.5" fill="url(#gold)" opacity="0.8"/>

  <!-- body -->
  <text x="540" y="1190" font-family="Arial, sans-serif" font-size="28" fill="#90c8ff" text-anchor="middle">The BMF Dive Sites directory is</text>
  <text x="540" y="1228" font-family="Arial, sans-serif" font-size="28" fill="#90c8ff" text-anchor="middle">built entirely by the freediving</text>
  <text x="540" y="1266" font-family="Arial, sans-serif" font-size="28" fill="#90c8ff" text-anchor="middle">community — just like you.</text>

  <!-- 3 steps -->
  <rect x="80"  y="1340" width="270" height="120" rx="16" fill="#0099ff" opacity="0.13"/>
  <rect x="80"  y="1340" width="270" height="120" rx="16" fill="none" stroke="#0099ff" stroke-width="1.5" opacity="0.45"/>
  <text x="215" y="1396" font-family="Arial, sans-serif" font-size="44" font-weight="900" fill="white" text-anchor="middle">1</text>
  <text x="215" y="1436" font-family="Arial, sans-serif" font-size="16" fill="#90c8ff" text-anchor="middle">FIND SITE</text>

  <line x1="362" y1="1400" x2="408" y2="1400" stroke="#0099ff" stroke-width="2" opacity="0.4" stroke-dasharray="5,4"/>

  <rect x="405" y="1340" width="270" height="120" rx="16" fill="#0099ff" opacity="0.13"/>
  <rect x="405" y="1340" width="270" height="120" rx="16" fill="none" stroke="#0099ff" stroke-width="1.5" opacity="0.45"/>
  <text x="540" y="1396" font-family="Arial, sans-serif" font-size="44" font-weight="900" fill="white" text-anchor="middle">2</text>
  <text x="540" y="1436" font-family="Arial, sans-serif" font-size="16" fill="#90c8ff" text-anchor="middle">SUBMIT</text>

  <line x1="687" y1="1400" x2="733" y2="1400" stroke="#0099ff" stroke-width="2" opacity="0.4" stroke-dasharray="5,4"/>

  <rect x="730" y="1340" width="270" height="120" rx="16" fill="url(#gold)" opacity="0.13"/>
  <rect x="730" y="1340" width="270" height="120" rx="16" fill="none" stroke="#ffd700" stroke-width="1.5" opacity="0.45"/>
  <text x="865" y="1396" font-family="Arial, sans-serif" font-size="44" font-weight="900" fill="white" text-anchor="middle">3</text>
  <text x="865" y="1436" font-family="Arial, sans-serif" font-size="16" fill="#ffd700" text-anchor="middle">GO LIVE</text>

  <!-- CTA button -->
  <rect x="80" y="1540" width="920" height="96" rx="18" fill="url(#cta)"/>
  <text x="540" y="1598" font-family="Arial, sans-serif" font-size="30" font-weight="800" fill="white" text-anchor="middle">Submit Your Dive Site →</text>

  <!-- swipe up / link -->
  <text x="540" y="1700" font-family="Arial, sans-serif" font-size="24" fill="#90c8ff" opacity="0.65" text-anchor="middle">bluemindfreediving.nl/dive-sites</text>

  <!-- animated arrow hint -->
  <text x="540" y="1780" font-family="Arial, sans-serif" font-size="28" fill="white" opacity="0.3" text-anchor="middle">↑  swipe up</text>

  <!-- bottom rule -->
  <line x1="80" y1="1820" x2="1000" y2="1820" stroke="url(#cta)" stroke-width="1.5" opacity="0.3"/>
  <text x="540" y="1865" font-family="Arial, sans-serif" font-size="22" fill="#90c8ff" opacity="0.4" text-anchor="middle" letter-spacing="2">@BLUEMINDFREEDIVING</text>
</svg>`;

  const buf = await svgToPng(svg);
  await sharp(buf).toFile(path.join(OUT, 'story4-add-your-spot.png'));
  console.log('✓ story4-add-your-spot.png');
}

// ── run all ──────────────────────────────────────────────────────────────────
(async () => {
  try {
    await Promise.all([story1(), story2(), story3(), story4()]);
    console.log(`\nAll stories saved to: public/social-posts/stories/`);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
