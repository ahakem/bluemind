import type { Metadata } from 'next';
import Calendar from '@/sections/Calendar';

export const metadata: Metadata = {
  title: 'Training Schedule | Blue Mind Freediving Amsterdam',
  description: 'View Blue Mind Freediving training schedule at Sloterparkbad Amsterdam. Check upcoming freediving sessions, events, and book your spot for pool training.',
  keywords: ['freediving schedule Amsterdam', 'Blue Mind training times', 'Sloterparkbad freediving schedule', 'freediving sessions Netherlands', 'pool training Amsterdam'],
  openGraph: {
    title: 'Training Schedule | Blue Mind Freediving Amsterdam',
    description: 'View Blue Mind Freediving training schedule at Sloterparkbad Amsterdam.',
    url: 'https://bluemindfreediving.nl/schedule',
    type: 'website',
    images: [
      {
        url: '/images/hero1.jpg',
        width: 1200,
        height: 630,
        alt: 'Blue Mind Freediving Training Schedule',
      },
    ],
  },
};

export default function SchedulePage() {
  return <Calendar />;
}
