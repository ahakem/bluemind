import type { Metadata } from 'next';
import About from '@/sections/About';
import Team from '@/sections/Team';

export const metadata: Metadata = {
  title: 'About Us - Meet the Founders',
  description: "Learn about Blue Mind Freediving's founders Hakim and Dewi. Discover our story, mission, and passion for building Amsterdam's premier freediving community. Founded in 2024 by AIDA-certified instructors and national record holders.",
  keywords: [
    'blue mind freediving founders',
    'freediving amsterdam about',
    'hakim freediver',
    'dewi freediver',
    'amsterdam freediving community',
    'freediving instructors netherlands',
    'AIDA certified freediving',
    'freediving club founders',
  ],
  openGraph: {
    title: 'About Us | Blue Mind Freediving Amsterdam',
    description: "Meet Hakim and Dewi, the founders of Amsterdam's premier freediving community. AIDA-certified instructors with national record achievements.",
    url: 'https://bluemindfreediving.nl/about',
    images: [
      {
        url: '/images/BMF-founders.webp',
        width: 1200,
        height: 630,
        alt: 'Blue Mind Freediving Founders - Hakim and Dewi',
      },
    ],
  },
  alternates: {
    canonical: 'https://bluemindfreediving.nl/about',
  },
};

export default function AboutPage() {
  return (
    <>
      <About showFullContent={true} />
      <Team />
    </>
  );
}
