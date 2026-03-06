import type { Metadata } from 'next';
import JudgeSuiteRedirect from './JudgeSuiteRedirect';

export const metadata: Metadata = {
  title: 'Judge Suite Has Moved - Blue Mind Freediving',
  description:
    'The Judge Suite tool has moved to judgesuite.com. You will be redirected automatically.',
  robots: { index: false, follow: false },
};

export default function JudgingPage() {
  return <JudgeSuiteRedirect />;
}
