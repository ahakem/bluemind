import type { Metadata } from 'next';
import Membership from '@/sections/Membership';

export const metadata: Metadata = {
  title: 'Membership | Blue Mind Freediving Amsterdam',
  description: 'Join Blue Mind Freediving Amsterdam! Learn about membership benefits, registration process, and how to start your freediving journey with our community.',
  keywords: ['freediving membership Amsterdam', 'join freediving club', 'Blue Mind registration', 'freediving Netherlands membership', 'freediving course Amsterdam'],
  openGraph: {
    title: 'Membership | Blue Mind Freediving Amsterdam',
    description: 'Join Blue Mind Freediving! Learn about membership benefits and registration.',
    url: 'https://bluemindfreediving.nl/membership',
    type: 'website',
    images: [
      {
        url: '/images/hero1.jpg',
        width: 1200,
        height: 630,
        alt: 'Blue Mind Freediving Membership',
      },
    ],
  },
};

export default function MembershipPage() {
  return <Membership />;
}
