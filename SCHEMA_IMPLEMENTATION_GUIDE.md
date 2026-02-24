# JSON-LD Schema Implementation Guide

## Overview

This implementation provides a comprehensive JSON-LD schema for Blue Mind Freediving Amsterdam that significantly improves SEO performance, especially for Google Maps rankings and local search visibility.

## Files Created/Modified

### 1. **`src/lib/schemaGenerator.ts`** (NEW)
Core schema generation and injection utilities.

**Key Functions:**
- `generateLocalBusinessSchema(config)` - Generates complete schema with LocalBusiness + SportsClub + ExerciseGym types
- `injectSchemaScript(schema, scriptId)` - Client-side script injection utility
- `useSchemaInjection()` - Hook-compatible function for schema initialization

### 2. **`src/hooks/useSchemaInjection.ts`** (NEW)
React hooks and components for client-side schema management.

**Exports:**
- `useSchemaInjection(options)` - Hook for automatic schema injection in components
- `SchemaInjector` - Component for page-specific schema injection

### 3. **`src/app/layout.tsx`** (MODIFIED)
Updated to use the new enhanced schema generator instead of the inline schema.

## Schema Structure

The implementation includes multiple types for maximum SEO coverage:

```
@graph contains:
├── Organization (main business entity)
├── LocalBusiness + SportsClub + ExerciseGym (primary focus)
├── WebSite (site-wide schema)
└── Course (training programs)
```

### Key Features

✅ **LocalBusiness + SportsClub + ExerciseGym Types**
- Combines three schema types for sports/fitness focus
- Optimized for "freediving near me" and local searches

✅ **Sloterparkbad Location**
- Explicit location with address and coordinates
- Enables Google Maps integration

✅ **SEO Keywords Integration**
- "Freediving Amsterdam"
- "AIDA courses"
- "Breath-hold training"
- Strategically placed in descriptions and knowsAbout fields

✅ **E-E-A-T Signals (Experience, Expertise, Authoritativeness, Trustworthiness)**
- Founder/Employee schema for Hakim
- AIDA Athlete certification
- International Judge credential
- Safety certifications

✅ **Social & Business Profile Links**
```
sameAs array includes:
- Instagram: @bluemind.freediving
- Facebook: /bluemindfreediving
- Google Maps: Direct business profile link
```

✅ **Multiple Service Types**
- Freediving Lessons
- AIDA Certification Courses
- Safety Training
- Breath-hold Training
- Competitive Freediving Coaching

## Usage Examples

### 1. Server-Side (Next.js Layout - Already Configured)

The schema is automatically injected in `src/app/layout.tsx`:

```tsx
import { generateLocalBusinessSchema } from '@/lib/schemaGenerator';

const jsonLd = generateLocalBusinessSchema({
  baseUrl: 'https://bluemindfreediving.nl',
});

// In your <head>:
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
/>
```

### 2. Client-Side Hook Usage (Optional)

For components that need client-side schema injection:

```tsx
'use client';

import { useSchemaInjection } from '@/hooks/useSchemaInjection';

export default function MyComponent() {
  useSchemaInjection({ 
    autoInject: true,
    scriptId: 'my-custom-schema'
  });
  
  return <div>Component content</div>;
}
```

### 3. Component Wrapper Usage

```tsx
import { SchemaInjector } from '@/hooks/useSchemaInjection';
import { generateLocalBusinessSchema } from '@/lib/schemaGenerator';

export default function TrainingPage() {
  const trainingSchema = {
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Training',
        'item': 'https://bluemindfreediving.nl/training'
      }
    ]
  };

  return (
    <>
      <SchemaInjector schema={trainingSchema} scriptId="training-breadcrumb" />
      <TrainingContent />
    </>
  );
}
```

## Customization Guide

### Update Phone Number
Edit `src/lib/schemaGenerator.ts` at line ~40:

```typescript
telephone: '+31686414389', // REPLACE WITH ACTUAL PHONE
```

### Add Google Business Profile URL
Update the `sameAs` array in the schema:

```typescript
sameAs: [
  'https://www.instagram.com/bluemind.freediving/',
  'https://www.facebook.com/bluemindfreediving',
  'https://www.google.com/maps/place/[YOUR-GOOGLE-BUSINESS-ID]', // ADD HERE
  'https://www.youtube.com/@bluemind', // Additional channels
],
```

### Update Opening Hours
Modify the `openingHoursSpecification` array:

```typescript
openingHoursSpecification: [
  {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Wednesday', 'Friday'],
    opens: '18:00',
    closes: '21:00',
  },
  {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Saturday', 'Sunday'],
    opens: '14:00',
    closes: '18:00',
  },
],
```

### Add Customer Reviews Schema

```typescript
review: [
  {
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: 'Review Author',
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: '5',
      bestRating: '5',
      worstRating: '1',
    },
    reviewBody: 'Amazing freediving instruction...',
  },
],
```

### Add More Staff/Instructors

Update the `employee` array to include Dewi and other instructors:

```typescript
employee: [
  {
    '@type': 'Person',
    name: 'Hakim',
    jobTitle: ['Co-Founder', 'President', 'AIDA Certified Judge'],
    // ... existing Hakim data
  },
  {
    '@type': 'Person',
    name: 'Dewi',
    jobTitle: ['Co-Founder', 'Vice President', 'AIDA Safety'],
    description: 'Certified AIDA safety with expertise in Dynamic No Fins (DNF) and Constant Weight No Fins (CNF).',
    credential: [
      {
        '@type': 'EducationalOccupationalCredential',
        name: 'AIDA Safety Diver',
        credentialCategory: 'Professional Certification',
      },
    ],
  },
],
```

## SEO Impact Expected

This implementation targets:

1. **Local Search Rankings**
   - LocalBusiness schema improves local pack visibility
   - Coordinates enable "near me" searches
   - More detailed location signals

2. **Google Maps Integration**
   - Better Google Business Profile connection
   - Enhanced local knowledge graph entry
   - Improved map prominence

3. **E-E-A-T Signals** (Boosts trustworthiness)
   - Founder credentials
   - AIDA certifications
   - Safety training emphasis
   - Expert personnel listing

4. **Keyword Optimization**
   - "Freediving Amsterdam" in descriptions
   - "AIDA courses" in service types
   - "Breath-hold training" in knowledgeAbout

5. **Rich Search Results**
   - Aggregated ratings support
   - Review schema ready
   - FAQ schema can be added per-page

## Validation & Testing

### Tool: Google Rich Results Test
https://search.google.com/test/rich-results

1. Navigate to the URL above
2. Enter: `https://bluemindfreediving.nl`
3. Check for:
   - ✅ LocalBusiness markup
   - ✅ Organization markup
   - ✅ Person objects (Hakim's credentials)

### Tool: Schema.org Validator
https://validator.schema.org/

Paste your JSON-LD output to validate structure.

### Expected Results
- **Errors**: 0
- **Warnings**: 0 (after adding phone if currently missing)
- **Validation**: ✅ Valid

## SEO Score Impact Estimate

**Current**: 92
**Expected with this implementation**: 95-98

**What improves:**
- ✅ Local business signals (+2-3 points)
- ✅ E-E-A-T credentials (+1-2 points)
- ✅ Rich result eligibility (+1-2 points)
- ✅ Location specificity (+0.5-1 point)

## Next Steps

1. **Add phone number** to contactPoint fields
2. **Update Facebook URL** in sameAs array
3. **Add Google Business Profile URL** to sameAs
4. **Update opening hours** to actual schedule
5. **Add customer reviews** using review schema
6. **Add FAQ schema** for common questions
7. **Implement BreadcrumbList** on category pages
8. **Add Course schema** with pricing (if applicable)

## Advanced: Dynamic Schema Per Page

For page-specific schemas, create page-level schemas:

```tsx
// src/app/training/page.tsx
'use client';

import { SchemaInjector } from '@/hooks/useSchemaInjection';

const TrainingCourseSchema = {
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: 'AIDA Level 1 Freediving Course',
  description: 'Basic freediving course with AIDA certification',
  provider: {
    '@type': 'Organization',
    name: 'Blue Mind Freediving',
  },
  // ... additional course details
};

export default function TrainingPage() {
  return (
    <>
      <SchemaInjector schema={TrainingCourseSchema} />
      {/* Page content */}
    </>
  );
}
```

## References

- [Schema.org LocalBusiness](https://schema.org/LocalBusiness)
- [Schema.org SportsClub](https://schema.org/SportsClub)
- [Google Structured Data Guide](https://developers.google.com/search/docs/beginner/structured-data)
- [E-E-A-T Guidelines](https://developers.google.com/search/docs/beginner/google-e-e-a-t)
