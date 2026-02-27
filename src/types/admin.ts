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
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
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
}
