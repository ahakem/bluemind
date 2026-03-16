import type { Metadata } from 'next';
import PrivacyPolicy from '../PrivacyPolicy';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Blue Mind Freediving privacy policy — how we collect, use, and protect your personal data (GDPR compliant).',
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicy />;
}
