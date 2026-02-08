import type { Metadata, Viewport } from 'next';
import ThemeRegistry from '@/components/ThemeRegistry';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import SkipLinks from '@/components/SkipLinks';

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

// JSON-LD Structured Data
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://bluemindfreediving.nl/#organization',
      name: 'Blue Mind Freediving',
      alternateName: ['Blue Mind Freediving Amsterdam', 'Dutch Freediving Amsterdam'],
      url: 'https://bluemindfreediving.nl',
      logo: {
        '@type': 'ImageObject',
        url: 'https://bluemindfreediving.nl/images/bluemind-logo.webp',
        width: 200,
        height: 60,
      },
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'info@bluemindfreediving.nl',
        contactType: 'customer service',
        availableLanguage: ['English', 'Dutch'],
      },
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Amsterdam',
        addressRegion: 'North Holland',
        addressCountry: 'Netherlands',
      },
      sameAs: ['https://www.instagram.com/bluemind.freediving/'],
      foundingDate: '2024',
    },
    {
      '@type': 'LocalBusiness',
      '@id': 'https://bluemindfreediving.nl/#localbusiness',
      name: 'Blue Mind Freediving Amsterdam',
      description: 'Professional freediving training facility in Amsterdam, Netherlands.',
      url: 'https://bluemindfreediving.nl',
      email: 'info@bluemindfreediving.nl',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Sloterparkbad',
        addressLocality: 'Amsterdam',
        addressRegion: 'North Holland',
        postalCode: '1064',
        addressCountry: 'Netherlands',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 52.3676,
        longitude: 4.8243,
      },
      openingHours: 'Mo 18:00-21:00',
      priceRange: '€€',
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <ThemeRegistry>
          <SkipLinks />
          <Navbar />
          <main id="main-content" role="main" tabIndex={-1}>
            {children}
          </main>
          <footer id="footer" role="contentinfo">
            <Footer />
          </footer>
          <BackToTop />
        </ThemeRegistry>
      </body>
    </html>
  );
}
