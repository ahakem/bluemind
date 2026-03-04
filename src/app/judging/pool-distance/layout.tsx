import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pool Distance Tracker - Freediving Lap Counter',
  description:
    'Track pool distance during freediving competitions. Lap counter with configurable pool length, remaining meters, and instant total distance calculation for DYN, DYNB, and DNF.',
  keywords: [
    'freediving distance tracker',
    'freediving lap counter',
    'pool distance calculator',
    'DYN distance tracker',
    'DNF lap counter',
    'freediving pool laps',
    'AIDA competition tools',
  ],
  openGraph: {
    title: 'Pool Distance Tracker - Freediving Lap Counter',
    description:
      'Track pool distance during freediving competitions with lap counting and total distance calculation.',
    url: 'https://bluemindfreediving.nl/judging/pool-distance',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Pool Distance Tracker - Freediving',
    description:
      'Lap counter and distance tracker for freediving pool disciplines.',
  },
  alternates: {
    canonical: 'https://bluemindfreediving.nl/judging/pool-distance',
  },
};

export default function ScoringLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
