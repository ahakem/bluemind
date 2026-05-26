import { BASE_URL } from '@/lib/siteConfig';
import type { Metadata } from 'next';
import Calendar from '@/sections/Calendar';
import Membership from '@/sections/Membership';

export const metadata: Metadata = {
  title: 'Training Schedule - Pool Sessions',
  description: 'View our freediving training schedule in Amsterdam. Join our Monday evening sessions at Sloterparkbad. Professional pool training for all skill levels with certified instructors.',
  keywords: [
    'freediving schedule amsterdam',
    'freediving training times',
    'pool training schedule',
    'sloterparkbad freediving',
    'monday freediving sessions',
    'amsterdam pool training',
    'freediving class times',
  ],
  openGraph: {
    title: 'Training Schedule | Blue Mind Freediving Amsterdam',
    description: 'View our weekly freediving training schedule. Join Monday evening sessions at Sloterparkbad Amsterdam.',
    url: `${BASE_URL}/training`,
    images: [
      {
        url: '/images/banner-img.webp',
        width: 1200,
        height: 630,
        alt: 'Blue Mind Freediving Training Schedule',
      },
    ],
  },
  alternates: {
    canonical: `${BASE_URL}/training`,
  },
};

export default function TrainingPage() {
  return (
    <>
      <Calendar />
      <Membership />
    </>
  );
}
