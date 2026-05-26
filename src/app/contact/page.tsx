import { BASE_URL } from '@/lib/siteConfig';
import type { Metadata } from 'next';
import Contact from '@/sections/Contact';

export const metadata: Metadata = {
  title: 'Contact Us | Blue Mind Freediving Amsterdam',
  description: 'Contact Blue Mind Freediving Amsterdam. Get in touch about membership, training sessions, or any questions about freediving in the Netherlands.',
  keywords: ['contact Blue Mind Freediving', 'freediving Amsterdam contact', 'Sloterparkbad address', 'freediving questions Netherlands', 'Blue Mind email'],
  openGraph: {
    title: 'Contact Us | Blue Mind Freediving Amsterdam',
    description: 'Contact Blue Mind Freediving Amsterdam. Get in touch about membership or training.',
    url: `${BASE_URL}/contact`,
    type: 'website',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Contact Blue Mind Freediving',
      },
    ],
  },
};

export default function ContactPage() {
  return <Contact />;
}
