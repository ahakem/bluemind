/**
 * Example Usage and Testing Guide for Blue Mind Freediving Schema
 * 
 * This file demonstrates how to:
 * 1. Use the schema in different contexts
 * 2. Test the implementation
 * 3. Extend with custom schemas
 */

// ============================================================================
// EXAMPLE 1: Server-Side Schema Injection (Already Implemented in layout.tsx)
// ============================================================================

import { generateLocalBusinessSchema } from '@/lib/schemaGenerator';

// This is automatically done in src/app/layout.tsx:
const serverSchema = generateLocalBusinessSchema({
  baseUrl: 'https://bluemindfreediving.nl',
});

// The schema is injected into HEAD as:
// <script type="application/ld+json">
//   {stringified serverSchema}
// </script>

// ============================================================================
// EXAMPLE 2: Client-Side Hook Usage
// ============================================================================

'use client';

import { useSchemaInjection } from '@/hooks/useSchemaInjection';

// Basic usage with defaults
export function ComponentWithSchema() {
  useSchemaInjection();
  return <div>Content here</div>;
}

// Custom configuration
export function ComponentWithCustomSchema() {
  useSchemaInjection({
    scriptId: 'my-custom-schema',
    baseUrl: 'https://bluemindfreediving.nl',
    autoInject: true,
  });
  return <div>Content here</div>;
}

// ============================================================================
// EXAMPLE 3: Component-Based Schema Injection
// ============================================================================

import { SchemaInjector } from '@/hooks/useSchemaInjection';

export default function TrainingPage() {
  // Breadcrumb schema for this specific page
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
        name: 'Training',
        item: 'https://bluemindfreediving.nl/training',
      },
    ],
  };

  return (
    <>
      <SchemaInjector schema={breadcrumbSchema} scriptId="training-breadcrumb" />
      {/* Page content */}
    </>
  );
}

// ============================================================================
// EXAMPLE 4: Type-Safe Custom Schema
// ============================================================================

import type { LocalBusiness, Course, Person } from '@/types/schema';

const customLocalBusiness: LocalBusiness = {
  '@context': 'https://schema.org',
  '@type': ['LocalBusiness', 'SportsClub'],
  '@id': 'https://bluemindfreediving.nl/#custom',
  name: 'Blue Mind Freediving',
  description: 'Custom description',
  url: 'https://bluemindfreediving.nl',
  // ... fully typed properties
};

// ============================================================================
// EXAMPLE 5: Extending with Additional Staff
// ============================================================================

// To add Dewi to the schema, update generateLocalBusinessSchema in schemaGenerator.ts:
const extendedEmployees = [
  {
    '@type': 'Person',
    name: 'Hakim',
    jobTitle: ['Co-Founder', 'President', 'AIDA Certified Judge'],
    // ... existing data
  },
  {
    '@type': 'Person',
    name: 'Dewi',
    jobTitle: ['Co-Founder', 'Vice President', 'AIDA Safety'],
    description:
      'Certified AIDA safety with expertise in Dynamic No Fins (DNF) and Constant Weight No Fins (CNF). Background in emergency response and rescue diving.',
    credential: [
      {
        '@type': 'EducationalOccupationalCredential',
        name: 'AIDA Safety Diver',
        credentialCategory: 'Professional Certification',
      },
      {
        '@type': 'EducationalOccupationalCredential',
        name: 'Emergency Responder',
        credentialCategory: 'Professional Certification',
      },
    ],
  },
];

// ============================================================================
// EXAMPLE 6: FAQ Schema (For FAQ Page)
// ============================================================================

'use client';

import { SchemaInjector } from '@/hooks/useSchemaInjection';

export function FAQSection() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is freediving?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Freediving is the practice of holding your breath while diving underwater. It combines meditation, physical training, and water exploration.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do I need experience to join Blue Mind?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No! We welcome all levels, from complete beginners to advanced athletes. We offer courses starting with Level 1 basics.',
        },
      },
      {
        '@type': 'Question',
        name: 'Where do you train?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We train at Sloterparkbad in Amsterdam. Pool training is safer for learning and skill development.',
        },
      },
    ],
  };

  return (
    <>
      <SchemaInjector schema={faqSchema} scriptId="faq-schema" />
      {/* FAQ content */}
    </>
  );
}

// ============================================================================
// EXAMPLE 7: Course Schema (With Pricing)
// ============================================================================

export const courseSchema = {
  '@context': 'https://schema.org',
  '@type': 'Course',
  '@id': 'https://bluemindfreediving.nl/training#course-level1',
  name: 'AIDA Level 1 Freediving Course',
  description: 'Introduction to freediving and breath-hold techniques with AIDA certification.',
  provider: {
    '@type': 'Organization',
    name: 'Blue Mind Freediving',
    url: 'https://bluemindfreediving.nl',
  },
  instructor: [
    {
      '@type': 'Person',
      name: 'Hakim',
      jobTitle: 'AIDA Certified Instructor',
    },
  ],
  educationLevel: 'Beginner',
  courseCode: 'AIDA-L1',
  duration: 'P2D', // ISO 8601 format: 2 days
  numberOfCredits: 1,
  hasCourseInstance: [
    {
      '@type': 'CourseInstance',
      name: 'AIDA Level 1 - Next Session',
      courseMode: 'OnSite',
      instructor: {
        '@type': 'Person',
        name: 'Hakim',
      },
      startDate: '2024-03-15',
      endDate: '2024-03-16',
      location: {
        '@type': 'Place',
        name: 'Sloterparkbad',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Sloterpark 100',
          addressLocality: 'Amsterdam',
          addressRegion: 'North Holland',
          postalCode: '1064',
          addressCountry: 'NL',
        },
      },
      offers: [
        {
          '@type': 'Offer',
          price: '299',
          priceCurrency: 'EUR',
          availability: 'InStock',
        },
      ],
    },
  ],
};

// ============================================================================
// EXAMPLE 8: Review Schema (For Testimonials)
// ============================================================================

export const reviewSchema = {
  '@context': 'https://schema.org',
  '@type': 'Review',
  author: {
    '@type': 'Person',
    name: 'Sarah Johnson',
  },
  reviewBody:
    'Best freediving experience! Hakim and Dewi are professional, caring instructors. Highly recommend Blue Mind!',
  reviewRating: {
    '@type': 'Rating',
    ratingValue: '5',
    bestRating: '5',
  },
  datePublished: '2024-02-20',
};

// ============================================================================
// TESTING URLS AND TOOLS
// ============================================================================

export const testingResources = {
  googleRichResultsTest: 'https://search.google.com/test/rich-results',
  schemaOrgValidator: 'https://validator.schema.org/',
  googleStructuredDataTest: 'https://search.google.com/structured-data/testing-tool',
  linkedAtPageLevel: 'https://bluemindfreediving.nl',
};

// ============================================================================
// QUICK TEST CHECKLIST
// ============================================================================

/**
 * Run through this checklist to verify the implementation:
 * 
 * 1. ✅ Server-side schema injection:
 *    - Check page source (Cmd+U / Ctrl+U)
 *    - Look for <script type="application/ld+json"> in HEAD
 *    - Verify @graph contains LocalBusiness, Organization, WebSite
 * 
 * 2. ✅ LocalBusiness + SportsClub types:
 *    - Verify @type array includes all three
 *    - Check Sloterparkbad location is present
 *    - Confirm geo coordinates are set
 * 
 * 3. ✅ E-E-A-T Signals:
 *    - Look for "employee" object with Hakim
 *    - Verify AIDA credentials are listed
 *    - Check "International Judge" is mentioned
 * 
 * 4. ✅ Keywords:
 *    - Search page source for "Freediving Amsterdam"
 *    - Search for "AIDA courses"
 *    - Search for "breath-hold training"
 * 
 * 5. ✅ Social Links:
 *    - Verify sameAs array contains Instagram link
 *    - Verify sameAs contains Facebook link (if added)
 *    - Verify Google Maps profile link (if added)
 * 
 * 6. ✅ Google Validation:
 *    - Go to Google Rich Results Test
 *    - Paste your domain
 *    - Check for validation errors (should be 0)
 *    - Preview LocalBusiness card
 */

// ============================================================================
// CUSTOMIZATION CHECKLIST
// ============================================================================

export const customizationToDo = `
TODO LIST FOR FULL IMPLEMENTATION:

1. CONTACT INFORMATION
   [ ] Add actual phone number to src/lib/schemaGenerator.ts
       Replace: '+31686414389'
       Line: ~40 and ~135

2. SOCIAL MEDIA & BUSINESS PROFILES
   [ ] Add Google Business Profile URL to sameAs array
   [ ] Add Facebook page link
   [ ] Add YouTube channel (if applicable)
   [ ] Add LinkedIn profile

3. OPENING HOURS
   [ ] Update openingHoursSpecification with actual hours
   [ ] Add multiple day specifications if needed
   [ ] Include day-specific closures if applicable

4. TEAM
   [ ] Add Dewi and other team members to employee array
   [ ] Verify all credentials are accurate
   [ ] Update instructor information

5. REVIEWS
   [ ] Start collecting customer reviews
   [ ] Create review schema elements
   [ ] Add to aggregateRating

6. COURSES
   [ ] Create specific course schemas for each offering
   [ ] Add pricing information
   [ ] Link to course instances

7. FAQ
   [ ] Create FAQ page with schema
   [ ] Cover common freediving questions
   [ ] Answer questions about AIDA certification

8. TESTING
   [ ] Test in Google Rich Results Test
   [ ] Test in Schema.org Validator
   [ ] Verify on Google Search Console
   [ ] Monitor for errors over time
`;
