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
  role: 'admin' | 'editor';
  createdAt: Date;
  lastLogin?: Date;
}
