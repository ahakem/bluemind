import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Scoring Has Moved - Blue Mind Freediving',
  description:
    'The scoring tool has moved to judgesuite.com. You will be redirected automatically.',
  robots: { index: false, follow: false },
};

export default function PenaltiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
