import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pool Distance Calculator — Any Pool Size | Blue Mind Freediving',
  description:
    'Free pool distance calculator for freediving competitions. Instantly compute realised distances for any pool length — 25 m, 33 m, 50 m, or custom — with automatic Under AP penalties for DYN, DYNB, and DNF.',
  keywords: [
    'freediving distance calculator',
    'pool distance calculator',
    'non-standard pool freediving',
    '33m pool distance',
    'DYN distance calculator',
    'DNF distance calculator',
    'AIDA competition tools',
    'freediving lap calculator',
  ],
  openGraph: {
    title: 'Pool Distance Calculator — Any Pool Size',
    description:
      'Calculate realised distances for any pool length during freediving competitions — including non-standard sizes like 33 m.',
    url: 'https://bluemindfreediving.nl/judging/pool-distance',
    type: 'article',
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
