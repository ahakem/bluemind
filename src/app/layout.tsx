import { BASE_URL } from '@/lib/siteConfig';
import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Montserrat, Poppins } from 'next/font/google';
import ThemeRegistry from '@/components/ThemeRegistry';
import LayoutContent from '@/components/LayoutContent';
import { Analytics } from '@/lib/analytics';
import { generateLocalBusinessSchema } from '@/lib/schemaGenerator';
import DynamicFavicon from '@/components/DynamicFavicon';
import './globals.css';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0056b3',
};

export const metadata: Metadata = {
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Freediving Amsterdam | Blue Mind Freediving Club - #1 Pool Training',
    template: '%s | Freediving Amsterdam - Blue Mind',
  },
  description: "Freediving Amsterdam at Blue Mind - Amsterdam's #1 freediving club. Professional pool training at Sloterparkbad with AIDA certified instructors. Learn freediving in Amsterdam from national record holders. Weekly sessions, all levels welcome.",
  keywords: [
    'freediving amsterdam',
    'freediving amsterdam club',
    'freedive amsterdam',
    'freediving training amsterdam',
    'freediving lessons amsterdam',
    'freediving course amsterdam',
    'apnea training amsterdam',
    'freediving pool amsterdam',
    'sloterparkbad freediving',
    'learn freediving amsterdam',
    'amsterdam freediving',
    'blue mind freediving',
    'freediving netherlands',
    'dutch freediving',
    'vrijduiken amsterdam',
  ],
  authors: [{ name: 'Blue Mind Freediving' }],
  creator: 'Blue Mind Freediving',
  publisher: 'Blue Mind Freediving',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_NL',
    url: BASE_URL,
    siteName: 'Blue Mind Freediving Amsterdam',
    title: 'Freediving Amsterdam | Blue Mind Freediving Club',
    description: "Freediving Amsterdam - Blue Mind, Amsterdam's #1 freediving club. Professional pool training at Sloterparkbad with AIDA certified instructors.",
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Blue Mind Freediving Amsterdam',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blue Mind Freediving | Freediving Club Amsterdam',
    description: "Join Amsterdam's premier freediving community for professional pool training sessions.",
    images: ['/images/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
};

// JSON-LD Structured Data - Enhanced LocalBusiness + SportsClub + ExerciseGym Schema
const jsonLd = generateLocalBusinessSchema({
  baseUrl: BASE_URL,
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${montserrat.variable} ${poppins.variable}`}>
      <head>
        {/* icons and manifest are declared via Next.js metadata so child layouts (e.g. dive-sites) can override them */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {/* Google Tag Manager — manages GA4, Ads conversions, and any future tags */}
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-PDZ7L4PW');`}
        </Script>
        {/* GTM noscript fallback */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PDZ7L4PW"
            height="0" width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        
        <Analytics />
        <DynamicFavicon />
        <ThemeRegistry>
          <LayoutContent>
            {children}
          </LayoutContent>
        </ThemeRegistry>
      </body>
    </html>
  );
}
