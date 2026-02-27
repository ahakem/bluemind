/**
 * Blog Service - Firebase CRUD operations for blog posts
 */

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  QueryConstraint,
  Timestamp,
  Firestore,
} from 'firebase/firestore';
import { db } from './firebase';
import { BlogPost, BlogDraft, AdminUser } from '@/types/admin';

const BLOG_COLLECTION = 'blog_posts';

/**
 * Validate Firebase is initialized
 */
const validateDb = (): Firestore => {
  if (!db) {
    throw new Error('Firebase not initialized');
  }
  return db;
};

/**
 * Get author information by UID, email, or display name
 */
export const getAuthorInfo = async (authorIdentifier: string): Promise<{ displayName: string; avatar?: string } | null> => {
  try {
    const firestore = validateDb();
    
    // Try to get by UID first (direct document access)
    try {
      const docRef = doc(firestore, 'adminUsers', authorIdentifier);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data() as AdminUser;
        return {
          displayName: userData.displayName || userData.email?.split('@')[0] || 'Admin',
          avatar: userData.avatar || undefined,
        };
      }
    } catch (uidError) {
      // Not a valid UID, continue to query by email/displayName
    }
    
    // Try to find by email
    let q = query(
      collection(firestore, 'adminUsers'),
      where('email', '==', authorIdentifier)
    );
    let snapshot = await getDocs(q);
    
    // If not found by email, try by displayName
    if (snapshot.empty) {
      q = query(
        collection(firestore, 'adminUsers'),
        where('displayName', '==', authorIdentifier)
      );
      snapshot = await getDocs(q);
    }
    
    if (snapshot.empty) {
      console.log('No author found for:', authorIdentifier);
      return null;
    }
    
    const userData = snapshot.docs[0].data() as AdminUser;
    return {
      displayName: userData.displayName || userData.email?.split('@')[0] || 'Admin',
      avatar: userData.avatar || undefined,
    };
  } catch (error) {
    console.error('Error fetching author info:', error);
    return null;
  }
};

/**
 * Create URL-friendly slug from title
 */
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .slice(0, 50); // Limit length
};

/**
 * Get all blog posts with optional filters
 */
export const getBlogPosts = async (
  statusFilter?: 'published' | 'review' | 'draft',
  authorUid?: string
): Promise<BlogPost[]> => {
  try {
    const firestore = validateDb();
    const constraints: QueryConstraint[] = [];

    if (authorUid) {
      constraints.push(where('author', '==', authorUid));
    }

    if (statusFilter) {
      constraints.push(where('status', '==', statusFilter));
    }

    // Note: orderBy removed to avoid index requirement
    // We'll sort client-side instead
    const q = query(collection(firestore, BLOG_COLLECTION), ...constraints);
    const snapshot = await getDocs(q);

    const posts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      publishedAt: doc.data().publishedAt?.toDate() || undefined,
      reviewedAt: doc.data().reviewedAt?.toDate() || undefined,
    } as BlogPost));

    // Sort by updatedAt client-side
    return posts.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    throw error;
  }
};

/**
 * Get published blog posts for public view
 */
export const getPublishedPosts = async (): Promise<BlogPost[]> => {
  return getBlogPosts('published');
};

/**
 * Get single blog post by slug
 */
export const getBlogPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  try {
    const firestore = validateDb();
    const q = query(
      collection(firestore, BLOG_COLLECTION),
      where('slug', '==', slug),
      where('status', '==', 'published')
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      publishedAt: doc.data().publishedAt?.toDate() || undefined,
    } as BlogPost;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    throw error;
  }
};

/**
 * Get single blog post by ID
 */
export const getBlogPostById = async (id: string): Promise<BlogPost | null> => {
  try {
    const firestore = validateDb();
    const docRef = doc(firestore, BLOG_COLLECTION, id);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) return null;

    return {
      id: snapshot.id,
      ...snapshot.data(),
      createdAt: snapshot.data().createdAt?.toDate() || new Date(),
      updatedAt: snapshot.data().updatedAt?.toDate() || new Date(),
      publishedAt: snapshot.data().publishedAt?.toDate() || undefined,
    } as BlogPost;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    throw error;
  }
};

/**
 * Create new blog post
 */
export const createBlogPost = async (data: BlogDraft, userId: string): Promise<string> => {
  try {
    const firestore = validateDb();
    const slug = data.slug || generateSlug(data.title);
    const now = Timestamp.now();

    const postData: any = {
      title: data.title,
      slug,
      excerpt: data.excerpt,
      content: data.content,
      image: data.image,
      author: data.author || userId,
      tags: data.tags || [],
      status: data.status || 'draft',
      views: 0,
      createdAt: now,
      updatedAt: now,
      publishedAt: data.status === 'published' ? now : null,
      reviewedAt: null,
      reviewedBy: null,
    };

    // Only include authorAvatar if it exists
    if (data.authorAvatar) {
      postData.authorAvatar = data.authorAvatar;
    }

    // Only include authorDisplayName if it exists
    if (data.authorDisplayName) {
      postData.authorDisplayName = data.authorDisplayName;
    }

    const docRef = await addDoc(collection(firestore, BLOG_COLLECTION), postData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating blog post:', error);
    throw error;
  }
};

/**
 * Update blog post
 */
export const updateBlogPost = async (id: string, data: Partial<BlogPost>): Promise<void> => {
  try {
    const firestore = validateDb();
    const docRef = doc(firestore, BLOG_COLLECTION, id);
    
    const updateData: any = {
      ...data,
      updatedAt: Timestamp.now(),
    };

    // Remove undefined authorAvatar if present
    if (updateData.authorAvatar === undefined) {
      delete updateData.authorAvatar;
    }

    // Remove undefined authorDisplayName if present
    if (updateData.authorDisplayName === undefined) {
      delete updateData.authorDisplayName;
    }

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating blog post:', error);
    throw error;
  }
};

/**
 * Publish blog post
 */
export const publishBlogPost = async (id: string): Promise<void> => {
  try {
    const firestore = validateDb();
    const docRef = doc(firestore, BLOG_COLLECTION, id);
    await updateDoc(docRef, {
      status: 'published',
      publishedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error publishing blog post:', error);
    throw error;
  }
};

/**
 * Submit post for review
 */
export const submitForReview = async (id: string): Promise<void> => {
  try {
    const firestore = validateDb();
    const docRef = doc(firestore, BLOG_COLLECTION, id);
    await updateDoc(docRef, {
      status: 'review',
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error submitting for review:', error);
    throw error;
  }
};

/**
 * Approve (review) and publish blog post
 */
export const approveBlogPost = async (id: string, userId: string): Promise<void> => {
  try {
    const firestore = validateDb();
    const docRef = doc(firestore, BLOG_COLLECTION, id);
    await updateDoc(docRef, {
      status: 'published',
      publishedAt: Timestamp.now(),
      reviewedAt: Timestamp.now(),
      reviewedBy: userId,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error approving blog post:', error);
    throw error;
  }
};

/**
 * Reject review and return to draft
 */
export const rejectBlogPost = async (id: string): Promise<void> => {
  try {
    const firestore = validateDb();
    const docRef = doc(firestore, BLOG_COLLECTION, id);
    await updateDoc(docRef, {
      status: 'draft',
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error rejecting blog post:', error);
    throw error;
  }
};

/**
 * Delete blog post
 */
export const deleteBlogPost = async (id: string): Promise<void> => {
  try {
    const firestore = validateDb();
    const docRef = doc(firestore, BLOG_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting blog post:', error);
    throw error;
  }
};

/**
 * Increment view count
 */
export const incrementBlogPostViews = async (id: string): Promise<void> => {
  try {
    const firestore = validateDb();
    const docRef = doc(firestore, BLOG_COLLECTION, id);
    const current = await getDoc(docRef);
    if (current.exists()) {
      await updateDoc(docRef, {
        views: (current.data().views || 0) + 1,
      });
    }
  } catch (error) {
    console.error('Error incrementing views:', error);
    // Don't throw - view tracking is not critical
  }
};

/**
 * Search blog posts by tags
 */
export const searchPostsByTag = async (tag: string): Promise<BlogPost[]> => {
  try {
    const firestore = validateDb();
    const q = query(
      collection(firestore, BLOG_COLLECTION),
      where('tags', 'array-contains', tag),
      where('status', '==', 'published'),
      orderBy('publishedAt', 'desc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      publishedAt: doc.data().publishedAt?.toDate() || undefined,
    } as BlogPost));
  } catch (error) {
    console.error('Error searching posts by tag:', error);
    throw error;
  }
};
