import type { Metadata } from 'next';
import Hero from '@/sections/Hero';
import About from '@/sections/About';
import Gallery from '@/sections/Gallery';

export const metadata: Metadata = {
  title: 'Blue Mind Freediving | Amsterdam Freediving Club',
  description: 'Join Amsterdam\'s premier freediving community at Blue Mind Freediving. Expert training at Sloterparkbad pool, from beginners to advanced. Start your underwater journey today!',
  keywords: ['freediving Amsterdam', 'freediving club Netherlands', 'apnea training', 'breath hold diving', 'underwater sports', 'Blue Mind Freediving', 'Sloterparkbad freediving'],
  openGraph: {
    title: 'Blue Mind Freediving | Amsterdam Freediving Club',
    description: 'Join Amsterdam\'s premier freediving community. Expert training from beginners to advanced at Sloterparkbad.',
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
    title: 'Blue Mind Freediving | Amsterdam',
    description: 'Join Amsterdam\'s premier freediving community',
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
      <Gallery />
    </>
  );
}
