import type { Metadata } from 'next';
import Gallery from '@/sections/Gallery';

export const metadata: Metadata = {
  title: 'Gallery - Training Photos & Videos',
  description: 'Explore our freediving training gallery. See professional pool training sessions, freediving techniques, and our Amsterdam community in action at Sloterparkbad.',
  keywords: [
    'freediving photos amsterdam',
    'freediving gallery',
    'pool training photos',
    'freediving training images',
    'amsterdam freediving community',
    'sloterparkbad freediving',
    'underwater freediving photos',
  ],
  openGraph: {
    title: 'Gallery | Blue Mind Freediving Amsterdam',
    description: 'Explore our freediving training gallery featuring professional pool sessions in Amsterdam.',
    url: 'https://bluemindfreediving.nl/gallery',
    images: [
      {
        url: '/images/gallery/1.webp',
        width: 1200,
        height: 630,
        alt: 'Blue Mind Freediving Training Gallery',
      },
    ],
  },
  alternates: {
    canonical: 'https://bluemindfreediving.nl/gallery',
  },
};

export default function GalleryPage() {
  return <Gallery showAll={true} />;
}
