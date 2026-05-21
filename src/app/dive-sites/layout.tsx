import type { Metadata, Viewport } from 'next';
import DiveSitesInstallBanner from '@/components/DiveSitesInstallBanner';

export const viewport: Viewport = {
  themeColor: '#0077be',
};

export const metadata: Metadata = {
  manifest: '/dive-pwa/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Dive Sites',
    startupImage: [
      // iPad Pro 12.9"
      { url: '/dive-pwa/splash-2048x2732.png', media: '(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)' },
      // iPad Pro 11"
      { url: '/dive-pwa/splash-1668x2388.png', media: '(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)' },
      // iPad Air / Mini
      { url: '/dive-pwa/splash-1536x2048.png', media: '(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)' },
      // iPhone 15 Pro Max
      { url: '/dive-pwa/splash-1290x2796.png', media: '(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)' },
      // iPhone 15 Pro / 14 Pro
      { url: '/dive-pwa/splash-1179x2556.png', media: '(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)' },
      // iPhone 14 / 13 / 12
      { url: '/dive-pwa/splash-1170x2532.png', media: '(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)' },
      // iPhone X / XS / 11 Pro
      { url: '/dive-pwa/splash-1125x2436.png', media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)' },
      // iPhone XR / 11
      { url: '/dive-pwa/splash-828x1792.png',  media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)' },
      // iPhone 8 / 7 / 6
      { url: '/dive-pwa/splash-750x1334.png',  media: '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)' },
      // iPhone SE
      { url: '/dive-pwa/splash-640x1136.png',  media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)' },
    ],
  },
  icons: {
    apple: '/dive-pwa/apple-touch-icon.png',
    icon: [
      { url: '/dive-pwa/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/dive-pwa/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/dive-pwa/favicon-48.png', sizes: '48x48', type: 'image/png' },
    ],
  },
};

export default function DiveSitesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <DiveSWRegistrar />
      <DiveSitesInstallBanner />
    </>
  );
}

function DiveSWRegistrar() {
  // Inline script — registers the service worker scoped to /dive-sites
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/dive-sw.js', { scope: '/dive-sites/' })
      .catch(function(e) { console.warn('Dive SW registration failed:', e); });
  });
}
`,
      }}
    />
  );
}
