import type { Metadata } from 'next';
import TermsOfService from './TermsOfService';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Blue Mind Freediving terms of service — membership rules, liability, cancellation policy, and code of conduct.',
};

export default function TermsOfServicePage() {
  return <TermsOfService />;
}
