// Types for admin panel data management

export interface Partner {
  id: string;
  name: string;
  logo: string;
  description: string;
  website?: string;
  socialLink?: string;
  socialPlatform?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GuestInstructor {
  id: string;
  name: string;
  image: string;
  specialty: string;
  bio: string;
  socialLink: string;
  socialPlatform: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminUser {
  uid: string;
  email: string;
  displayName?: string;
  avatar?: string;
  role: 'admin' | 'editor' | 'author';
  createdAt: Date;
  lastLogin?: Date;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string; // HTML from rich text editor
  image: string;
  author: string;
  authorDisplayName?: string; // Display name stored for convenience
  authorAvatar?: string;
  tags: string[];
  status: 'draft' | 'review' | 'published';
  views: number;
  ctaText?: string;
  ctaLink?: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
}

export interface WaterTempByMonth {
  jan?: number; feb?: number; mar?: number; apr?: number;
  may?: number; jun?: number; jul?: number; aug?: number;
  sep?: number; oct?: number; nov?: number; dec?: number;
}

export interface Thermocline {
  depth: number;       // approx depth in meters where thermocline starts
  tempDrop: number;    // degrees C drop below the thermocline
  seasons?: string[];  // e.g. ['Summer', 'Autumn']
  notes?: string;
}

export interface DiveSite {
  id: string;
  slug: string;
  name: string;
  location: string;
  country: string;
  coordinates: { lat: number; lng: number };
  waterType: 'lake' | 'sea' | 'quarry' | 'river' | 'pool';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  maxDepth: number;
  description: string;
  highlights: string[];
  facilities: string[];
  waterTemp: WaterTempByMonth;
  visibility: { min: number; max: number };
  bestSeasons: string[];
  photos: string[];
  thermocline?: Thermocline;
  status: 'active' | 'pending' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface DiveSiteDraft {
  slug?: string;
  name: string;
  location: string;
  country: string;
  coordinates: { lat: number; lng: number };
  waterType: 'lake' | 'sea' | 'quarry' | 'river' | 'pool';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  maxDepth: number;
  description: string;
  highlights: string[];
  facilities: string[];
  waterTemp: WaterTempByMonth;
  visibility: { min: number; max: number };
  bestSeasons: string[];
  photos: string[];
  thermocline?: Thermocline;
  status: 'active' | 'pending' | 'archived';
}

export interface BlogDraft {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  image: string;
  author?: string;
  authorDisplayName?: string; // Display name stored for convenience
  authorAvatar?: string;
  tags: string[];
  status: 'draft' | 'review' | 'published';
  ctaText?: string;
  ctaLink?: string;
}
