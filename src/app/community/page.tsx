import type { Metadata } from 'next';
import Community from '@/sections/Community';

export const metadata: Metadata = {
  title: 'Community - Partners & Guest Instructors',
  description: "Discover Blue Mind Freediving's community partners and guest instructors. We collaborate with talented freedivers, instructors, and organizations to build Amsterdam's most supportive freediving ecosystem.",
  keywords: [
    'freediving community amsterdam',
    'freediving partners',
    'guest freediving instructors',
    'freediving collaborations',
    'amsterdam freediving network',
    'AIDA instructors netherlands',
    'freediving clubs amsterdam',
    'freediving organizations',
  ],
  openGraph: {
    title: 'Community | Blue Mind Freediving Amsterdam',
    description: "Meet our community partners and guest instructors. Together, we're building Amsterdam's most inspiring freediving community.",
    url: 'https://bluemindfreediving.nl/community',
    images: [
      {
        url: '/images/BMF-founders.webp',
        width: 1200,
        height: 630,
        alt: 'Blue Mind Freediving Community',
      },
    ],
  },
  alternates: {
    canonical: 'https://bluemindfreediving.nl/community',
  },
};

export default function CommunityPage() {
  return (
    <>
      <Community />
    </>
  );
}
