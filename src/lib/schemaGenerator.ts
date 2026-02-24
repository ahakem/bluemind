/**
 * JSON-LD Schema Generator for Blue Mind Freediving
 * Generates comprehensive structured data for SEO optimization
 */

interface SchemaConfig {
  baseUrl: string;
  googleBusinessId?: string;
  founderName?: string;
}

export const generateLocalBusinessSchema = (config: SchemaConfig = { baseUrl: 'https://bluemindfreediving.nl' }) => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      // Organization Schema
      {
        '@type': 'Organization',
        '@id': `${config.baseUrl}/#organization`,
        name: 'Blue Mind Freediving',
        alternateName: ['Blue Mind Freediving Amsterdam', 'Blue Mind Apnea Club'],
        description:
          'Amsterdam\'s premier freediving club specializing in AIDA courses, breath-hold training, and freediving education at Sloterparkbad. Professional instructors offering freediving Amsterdam lessons for all levels.',
        url: config.baseUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${config.baseUrl}/images/bluemind-logo.webp`,
          width: 200,
          height: 60,
        },
        image: `${config.baseUrl}/images/og-image.jpg`,
        contactPoint: [
          {
            '@type': 'ContactPoint',
            email: 'info@bluemindfreediving.nl',
            contactType: 'customer service',
            availableLanguage: ['English', 'Dutch'],
            areaServed: ['Amsterdam', 'Netherlands', 'Worldwide'],
            telephone: '+31686414389',
          },
        ],
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Sloterparkbad, Sloterpark 100',
          addressLocality: 'Amsterdam',
          addressRegion: 'North Holland',
          postalCode: '1064',
          addressCountry: 'NL',
        },
        sameAs: [
          'https://www.instagram.com/bluemind.freediving/',
          'https://share.google/kcyzsYtQEltJCfxJg',
        ],
        foundingDate: '2024',
        founder: [
          {
            '@type': 'Person',
            name: 'Hakim',
            url: `${config.baseUrl}/#founder-hakim`,
          },
          {
            '@type': 'Person',
            name: 'Dewi',
            url: `${config.baseUrl}/#founder-dewi`,
          },
        ],
      },

      // LocalBusiness + SportsClub + ExerciseGym Schema
      {
        '@type': ['LocalBusiness', 'SportsClub', 'ExerciseGym'],
        '@id': `${config.baseUrl}/#localbusiness`,
        name: 'Blue Mind Freediving Amsterdam',
        alternateName: 'Blue Mind Apnea Club Amsterdam',
        description:
          'Professional freediving training club in Amsterdam offering AIDA courses, breath-hold training, and freediving lessons at Sloterparkbad. Expert instruction in freediving Amsterdam from certified AIDA instructors and international judges.',
        url: config.baseUrl,
        email: 'info@bluemindfreediving.nl',
        telephone: '+31686414389',
        image: `${config.baseUrl}/images/gallery/4.webp`,

        // Location Information
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
          geo: {
            '@type': 'GeoCoordinates',
            latitude: 52.370227,
            longitude: 4.817489,
          },
        },

        // Primary Address
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Sloterparkbad, Sloterpark 100',
          addressLocality: 'Amsterdam',
          addressRegion: 'North Holland',
          postalCode: '1064',
          addressCountry: 'NL',
        },

        // Geo Coordinates
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 52.370227,
          longitude: 4.817489,
        },

        // Opening Hours
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: 'Monday',
            opens: '18:00',
            closes: '21:00',
          },
        ],
        priceRange: '€€',

        // Sports Activities & Focus Areas
        knowsAbout: [
          'Freediving Amsterdam',
          'AIDA courses',
          'Breath-hold training',
          'Static apnea',
          'Dynamic apnea',
          'Constant weight diving',
          'Freediving competitions',
          'Water safety',
        ],

        // Services Offered
        serviceType: [
          'Freediving Lessons',
          'AIDA Certification Courses',
          'Safety Training',
          'Breath-hold Training',
          'Competitive Freediving Coaching',
        ],

        // Sports Equipment
        sport: [
          'Freediving',
          'Apnea',
          'Breath-hold Sports',
        ],

        // Multiple social media & business profiles
        sameAs: [
          'https://www.instagram.com/bluemind.freediving/',
          'https://share.google/kcyzsYtQEltJCfxJg',
        ],

        // Staff / Key People
        employee: [
          {
            '@type': 'Person',
            name: 'Hakim',
            image: `${config.baseUrl}/images/gallery/16.webp`,
            jobTitle: ['Co-Founder', 'President', 'AIDA Certified Judge'],
            description:
              '4x Egyptian national record holder, AIDA-certified athlete and international judge. Expert freediving coach with safety specialization.',
            knowsAbout: [
              'Freediving',
              'AIDA Certifications',
              'Safety Management',
              'Competitive Diving',
            ],
            url: `${config.baseUrl}/#founder-hakim`,
            sameAs: [
              'https://www.instagram.com/bluemind.freediving/',
            ],
            credential: [
              {
                '@type': 'EducationalOccupationalCredential',
                name: 'AIDA Athlete',
                credentialCategory: 'Professional Certification',
              },
              {
                '@type': 'EducationalOccupationalCredential',
                name: 'AIDA International Judge',
                credentialCategory: 'Professional Certification',
              },
              {
                '@type': 'EducationalOccupationalCredential',
                name: 'AIDA Safety Diver',
                credentialCategory: 'Professional Certification',
              },
            ],
          },
          {
            '@type': 'Person',
            name: 'Dewi',
            image: `${config.baseUrl}/images/gallery/16.webp`,
            jobTitle: ['Co-Founder', 'Vice President', 'AIDA Safety & Athlete'],
            description:
              'Certified AIDA athlete and safety diver with expertise in Dynamic No Fins (DNF) and Constant Weight No Fins (CNF). Emergency responder background with focus on rescue and water safety.',
            knowsAbout: [
              'Freediving',
              'Water Safety',
              'Dynamic No Fins',
              'Constant Weight No Fins',
              'Emergency Response',
              'Rescue Diving',
            ],
            url: `${config.baseUrl}/#founder-dewi`,
            sameAs: [
              'https://www.instagram.com/bluemind.freediving/',
            ],
            credential: [
              {
                '@type': 'EducationalOccupationalCredential',
                name: 'AIDA Athlete',
                credentialCategory: 'Professional Certification',
              },
              {
                '@type': 'EducationalOccupationalCredential',
                name: 'AIDA Safety Diver',
                credentialCategory: 'Professional Certification',
              },
              {
                '@type': 'EducationalOccupationalCredential',
                name: 'Emergency Responder & Rescue Diver',
                credentialCategory: 'Professional Certification',
              },
            ],
          },
        ],

        // Ratings & Reviews (optional - add once you have reviews)
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '5',
          ratingCount: '1',
          bestRating: '5',
          worstRating: '1',
        },
      },

      // WebSite Schema for better search presence
      {
        '@type': 'WebSite',
        '@id': `${config.baseUrl}/#website`,
        url: config.baseUrl,
        name: 'Blue Mind Freediving',
        description:
          'Freediving Amsterdam - Professional AIDA courses and breath-hold training at Sloterparkbad',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${config.baseUrl}?search={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },

      // Training Program / Course Schema
      {
        '@type': 'Course',
        '@id': `${config.baseUrl}/training#course`,
        name: 'AIDA Freediving Courses Amsterdam',
        description:
          'Professional AIDA-certified freediving courses in Amsterdam. Learn breath-hold training and freediving techniques at Sloterparkbad with international instructors.',
        provider: {
          '@type': 'Organization',
          name: 'Blue Mind Freediving',
          url: config.baseUrl,
        },
        educationLevel: 'Intermediate',
      },
    ],
  };

  return jsonLd;
};

/**
 * Utility function to safely inject schema into document head
 * Prevents duplicate scripts and ensures proper JSON-LD formatting
 */
export const injectSchemaScript = (schema: Record<string, any>, scriptId: string = 'bluemind-schema') => {
  if (typeof window === 'undefined') return; // SSR safety

  // Check if script already exists
  const existingScript = document.querySelector(`script#${scriptId}`);
  if (existingScript) {
    console.log('Schema script already exists, skipping injection');
    return;
  }

  try {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = scriptId;
    script.innerHTML = JSON.stringify(schema);
    
    // Inject into head
    const head = document.head || document.getElementsByTagName('head')[0];
    if (head) {
      head.insertBefore(script, head.firstChild);
      console.log('Schema script injected successfully');
    }
  } catch (error) {
    console.error('Error injecting schema script:', error);
  }
};

/**
 * Hook-compatible function to initialize schema on client side
 * Use this if you need client-side schema injection
 */
export const useSchemaInjection = (schema?: Record<string, any>) => {
  const defaultSchema = schema || generateLocalBusinessSchema();

  if (typeof window !== 'undefined') {
    // Only run on client side
    injectSchemaScript(defaultSchema);
  }

  return defaultSchema;
};
