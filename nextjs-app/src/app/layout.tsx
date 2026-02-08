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
    default: 'Blue Mind Freediving | Freediving Club Amsterdam Netherlands',
    template: '%s | Blue Mind Freediving Amsterdam',
  },
  description: "Join Amsterdam's premier freediving community. Expert Dutch freediving instructors, professional pool training sessions, and certified safety protocols. Learn breath-hold techniques with Dutch national record holders at Sloterparkbad.",
  keywords: [
    'freediving amsterdam',
    'freediving club amsterdam',
    'dutch freediving',
    'freediving netherlands',
    'pool training amsterdam',
    'breath hold training',
    'freediving lessons netherlands',
    'apnea training dutch',
    'nederlandse vrijduik',
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
    siteName: 'Blue Mind Freediving',
    title: 'Blue Mind Freediving | Freediving Club Amsterdam',
    description: "Join Amsterdam's premier freediving community for professional pool training sessions.",
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
