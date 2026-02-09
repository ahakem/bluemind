import type { Metadata } from 'next';
import Hero from '@/sections/Hero';
import About from '@/sections/About';
import Gallery from '@/sections/Gallery';

export const metadata: Metadata = {
  title: 'Freediving Amsterdam | Blue Mind Freediving Club',
  description: 'Freediving Amsterdam - Join Blue Mind Freediving, Amsterdam\'s #1 freediving club. Professional pool training at Sloterparkbad. Learn freediving in Amsterdam from AIDA certified instructors. Beginners welcome!',
  keywords: ['freediving amsterdam', 'freediving amsterdam club', 'freedive amsterdam', 'freediving training amsterdam', 'freediving lessons amsterdam', 'freediving course amsterdam', 'apnea amsterdam', 'freediving pool amsterdam', 'sloterparkbad freediving', 'amsterdam freediving community', 'blue mind freediving', 'learn freediving amsterdam'],
  openGraph: {
    title: 'Freediving Amsterdam | Blue Mind Freediving Club',
    description: 'Freediving Amsterdam - Join Blue Mind, Amsterdam\'s premier freediving club. Professional pool training at Sloterparkbad. AIDA certified instructors.',
    url: 'https://bluemindfreediving.nl',
    type: 'website',
    images: [
      {
        url: '/images/hero1.jpg',
        width: 1200,
        height: 630,
        alt: 'Blue Mind Freediving - Amsterdam Freediving Club',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Freediving Amsterdam | Blue Mind Freediving',
    description: 'Freediving Amsterdam - Professional freediving training at Sloterparkbad',
  },
  alternates: {
    canonical: 'https://bluemindfreediving.nl',
  },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <About showCTA />
      <Gallery enableModal={false} />
    </>
  );
}
