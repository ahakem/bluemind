import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AIDA 2025 Penalty System - Pool Disciplines',
  description:
    'Complete penalty and disqualification calculator for AIDA 2025 pool freediving. Covers UNDER AP, Early/Late Start, technical fouls (TURN, START, PULL), and all DQ codes.',
  keywords: [
    'AIDA penalties',
    'freediving penalty calculator',
    'AIDA disqualification',
    'freediving DQ codes',
    'AIDA 2025 penalties',
    'freediving technical foul',
    'under AP penalty',
    'early start penalty',
    'late start freediving',
    'surface protocol DQ',
  ],
  openGraph: {
    title: 'AIDA 2025 Penalty System - Pool Disciplines',
    description:
      'Complete penalty and disqualification calculator for AIDA 2025 pool freediving disciplines.',
    url: 'https://bluemindfreediving.nl/judging/scoring',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AIDA 2025 Penalty System',
    description:
      'Penalty and DQ calculator for AIDA 2025 pool freediving.',
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
