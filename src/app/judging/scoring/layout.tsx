import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AIDA Scoring & Penalty Calculator - Free Freediving Judge Tool | Blue Mind Freediving',
  description:
    'Free scoring and penalty calculator for AIDA freediving competitions. Covers STA, DYN, DNF, CWT, FIM, CNF with all DQ codes, Under AP, early/late start, and technical fouls. Built for AIDA v17.7 (2025).',
  keywords: [
    'AIDA penalties',
    'freediving penalty calculator',
    'AIDA scoring',
    'freediving DQ codes',
    'AIDA 2025 penalties',
    'surface protocol DQ',
    'freediving scoring tool',
  ],
  openGraph: {
    title: 'AIDA Scoring & Penalty Calculator - Free Judge Tool',
    description:
      'Instant scoring and penalty calculations for all AIDA pool and depth freediving disciplines.',
    url: 'https://bluemindfreediving.nl/judging/scoring',
    type: 'article',
  },
  alternates: {
    canonical: 'https://bluemindfreediving.nl/judging/scoring',
  },
};

export default function PenaltiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
