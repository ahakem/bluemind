import type { Metadata } from 'next';
import Script from 'next/script';
import JudgingSuiteHub from './JudgingSuiteHub';

export const metadata: Metadata = {
  title: 'AIDA Freediving Judge Suite - Official 2025 Tools',
  description:
    'Professional tools for freediving judges, updated for AIDA v17.7 rules. Scoring calculator, penalty system, and timing logistics for pool disciplines.',
  keywords: [
    'AIDA judge tools',
    'freediving judge calculator',
    'AIDA 2025 rules',
    'freediving scoring',
    'freediving penalties',
    'AIDA v17.7',
    'STA scoring',
    'DYN scoring',
    'DNF scoring',
    'freediving judge suite',
  ],
  openGraph: {
    title: 'AIDA Freediving Judge Suite - Official 2025 Tools',
    description:
      'Professional tools for freediving judges, updated for AIDA v17.7 rules.',
    url: 'https://bluemindfreediving.nl/judging',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AIDA Freediving Judge Suite - Official 2025 Tools',
    description:
      'Professional tools for freediving judges, updated for AIDA v17.7 rules.',
  },
  alternates: {
    canonical: 'https://bluemindfreediving.nl/judging',
  },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://bluemindfreediving.nl',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Judge Suite',
      item: 'https://bluemindfreediving.nl/judging',
    },
  ],
};

const softwareAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'AIDA Freediving Judge Suite',
  description:
    'Professional scoring and penalty tools for freediving judges, built for AIDA Rules & Regulations Version 17.7 (January 2025).',
  url: 'https://bluemindfreediving.nl/judging',
  applicationCategory: 'SportsApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
  },
  creator: {
    '@type': 'Organization',
    name: 'Blue Mind Freediving',
    url: 'https://bluemindfreediving.nl',
  },
};

export default function JudgingPage() {
  return (
    <>
      <Script
        id="judging-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="judging-software-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
      <JudgingSuiteHub />
    </>
  );
}
