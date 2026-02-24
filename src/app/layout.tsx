import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import ThemeRegistry from '@/components/ThemeRegistry';
import LayoutContent from '@/components/LayoutContent';
import { Analytics } from '@/lib/analytics';
import { generateLocalBusinessSchema } from '@/lib/schemaGenerator';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0056b3',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://bluemindfreediving.nl'),
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
    url: 'https://bluemindfreediving.nl',
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
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  alternates: {
    canonical: 'https://bluemindfreediving.nl',
  },
};

// JSON-LD Structured Data - Enhanced LocalBusiness + SportsClub + ExerciseGym Schema
const jsonLd = generateLocalBusinessSchema({
  baseUrl: 'https://bluemindfreediving.nl',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';
  
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {/* Google Analytics - Load first */}
        {GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX' && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                
                // Check consent
                const consent = localStorage.getItem('cookie-consent');
                if (consent === 'accepted') {
                  gtag('consent', 'update', {
                    analytics_storage: 'granted'
                  });
                  gtag('config', '${GA_MEASUREMENT_ID}', {
                    page_path: window.location.pathname,
                  });
                } else {
                  gtag('consent', 'default', {
                    analytics_storage: 'denied'
                  });
                }
              `}
            </Script>
          </>
        )}
        
        <Analytics />
        <ThemeRegistry>
          <LayoutContent>
            {children}
          </LayoutContent>
        </ThemeRegistry>
      </body>
    </html>
  );
}
