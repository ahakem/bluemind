import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pool Distance Tracker Has Moved - Blue Mind Freediving',
  description:
    'The pool distance tracker has moved to judgesuite.com. You will be redirected automatically.',
  robots: { index: false, follow: false },
};

export default function ScoringLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
