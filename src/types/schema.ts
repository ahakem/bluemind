/**
 * TypeScript Types and Interfaces for JSON-LD Schema
 * Provides type-safe schema generation and validation
 */

// Core Schema Types
export interface JSONLDBase {
  '@context': string;
  '@type': string | string[];
  '@id'?: string;
  [key: string]: any;
}

export interface Thing extends JSONLDBase {
  name: string;
  description?: string;
  url?: string;
  image?: string | ImageObject;
  sameAs?: string[];
  mainEntity?: JSONLDBase;
}

export interface ImageObject extends JSONLDBase {
  '@type': 'ImageObject';
  url: string;
  width?: number;
  height?: number;
  caption?: string;
}

export interface PostalAddress extends JSONLDBase {
  '@type': 'PostalAddress';
  streetAddress?: string;
  addressLocality: string;
  addressRegion: string;
  postalCode?: string;
  addressCountry: string;
}

export interface GeoCoordinates extends JSONLDBase {
  '@type': 'GeoCoordinates';
  latitude: number;
  longitude: number;
  elevation?: number;
}

export interface ContactPoint extends JSONLDBase {
  '@type': 'ContactPoint';
  contactType: string;
  email?: string;
  telephone?: string;
  areaServed?: string[];
  availableLanguage?: string[];
}

export interface OpeningHoursSpecification extends JSONLDBase {
  '@type': 'OpeningHoursSpecification';
  dayOfWeek: string | string[];
  opens: string;
  closes: string;
  validFrom?: string;
  validThrough?: string;
}

export interface Credential extends JSONLDBase {
  '@type': 'EducationalOccupationalCredential';
  name: string;
  credentialCategory: string;
  credentialSubject?: string;
  issuedBy?: {
    '@type': 'Organization';
    name: string;
    url?: string;
  };
}

export interface Person extends Thing {
  '@type': 'Person';
  jobTitle?: string | string[];
  knowsAbout?: string[];
  worksFor?: Organization;
  credential?: Credential[];
  affiliation?: Organization[];
}

export interface Organization extends Thing {
  '@type': 'Organization';
  logo?: ImageObject;
  contactPoint?: ContactPoint | ContactPoint[];
  address?: PostalAddress;
  foundingDate?: string;
  foundingLocation?: PostalAddress;
  founder?: Person | Person[];
  employee?: Person | Person[];
  member?: Person | Person[];
}

export interface LocalBusiness extends Thing {
  '@type': string | ('LocalBusiness' | 'SportsClub' | 'ExerciseGym')[];
  address: PostalAddress;
  geo: GeoCoordinates;
  telephone?: string;
  email?: string;
  openingHoursSpecification?: OpeningHoursSpecification[];
  priceRange?: string;
  location?: Place;
  knowsAbout?: string[];
  serviceType?: string[];
  sport?: string[];
  employee?: Person[];
  aggregateRating?: AggregateRating;
  review?: Review[];
}

export interface Place extends JSONLDBase {
  '@type': 'Place';
  name: string;
  address?: PostalAddress;
  geo?: GeoCoordinates;
  description?: string;
}

export interface Course extends Thing {
  '@type': 'Course';
  provider: Organization;
  educationLevel?: string;
  courseCode?: string;
  instructor?: Person[];
  syllabus?: string;
  duration?: string;
  numberOfCredits?: number;
  hasCourseInstance?: CourseInstance[];
}

export interface CourseInstance extends JSONLDBase {
  '@type': 'CourseInstance';
  courseMode?: string;
  inLanguage?: string;
  instructor?: Person;
  startDate?: string;
  endDate?: string;
  offers?: Offer[];
  location?: Place | VirtualLocation;
}

export interface VirtualLocation extends JSONLDBase {
  '@type': 'VirtualLocation';
  url: string;
}

export interface Offer extends JSONLDBase {
  '@type': 'Offer';
  price?: string | number;
  priceCurrency?: string;
  availability?: string;
  availabilityStarts?: string;
  availabilityEnds?: string;
  validFrom?: string;
  validThrough?: string;
  url?: string;
}

export interface AggregateRating extends JSONLDBase {
  '@type': 'AggregateRating';
  ratingValue: number | string;
  reviewCount?: number;
  ratingCount?: number;
  bestRating?: number | string;
  worstRating?: number | string;
  name?: string;
}

export interface Review extends JSONLDBase {
  '@type': 'Review';
  author: Person;
  reviewBody?: string;
  reviewRating: {
    '@type': 'Rating';
    ratingValue: number | string;
    bestRating?: number | string;
    worstRating?: number | string;
  };
  datePublished?: string;
  name?: string;
}

export interface WebSite extends Thing {
  '@type': 'WebSite';
  url: string;
  potentialAction?: SearchAction;
  hasPart?: JSONLDBase[];
}

export interface SearchAction extends JSONLDBase {
  '@type': 'SearchAction';
  target: EntryPoint;
  'query-input': string;
}

export interface EntryPoint extends JSONLDBase {
  '@type': 'EntryPoint';
  urlTemplate: string;
}

export interface BreadcrumbList extends JSONLDBase {
  '@type': 'BreadcrumbList';
  itemListElement: BreadcrumbItem[];
}

export interface BreadcrumbItem extends JSONLDBase {
  '@type': 'ListItem';
  position: number;
  name: string;
  item: string;
}

export interface FAQPage extends JSONLDBase {
  '@type': 'FAQPage';
  mainEntity: Question[];
}

export interface Question extends JSONLDBase {
  '@type': 'Question';
  name: string;
  acceptedAnswer: Answer;
}

export interface Answer extends JSONLDBase {
  '@type': 'Answer';
  text: string;
}

// Schema Configuration Interface
export interface SchemaConfig {
  baseUrl: string;
  googleBusinessId?: string;
  founderName?: string;
  organizationName?: string;
  description?: string;
  email?: string;
  telephone?: string;
}

// Helper function types
export type SchemaGenerator<T extends JSONLDBase = JSONLDBase> = (config: SchemaConfig) => T;

export interface SchemaInjectionOptions {
  scriptId?: string;
  baseUrl?: string;
  autoInject?: boolean;
}

// Factory function for creating typed schema objects
export function createSchema<T extends JSONLDBase>(
  type: string | string[],
  properties: Omit<T, '@type' | '@context'> & { '@id'?: string }
): T {
  return {
    '@type': type,
    ...properties,
  } as T;
}

// Utility type for extracting schema properties
export type SchemaProperties<T extends JSONLDBase> = Omit<T, '@type' | '@context' | '@id'>;
