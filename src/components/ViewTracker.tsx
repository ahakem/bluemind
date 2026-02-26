'use client';

import { useEffect } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ViewTrackerProps {
  postId: string;
}

export default function ViewTracker({ postId }: ViewTrackerProps) {
  useEffect(() => {
    // Only run in browser, not during SSR/SSG
    if (typeof window === 'undefined') return;
    
    // Increment view count when component mounts
    const incrementView = async () => {
      try {
        if (!db) return;
        
        const docRef = doc(db, 'blog_posts', postId);
        const current = await getDoc(docRef);
        
        if (current.exists()) {
          await updateDoc(docRef, {
            views: (current.data().views || 0) + 1,
          });
        }
      } catch (error) {
        // View tracking is not critical, fail silently
        console.debug('View tracking failed:', error);
      }
    };

    // Delay to ensure page is fully loaded
    const timer = setTimeout(incrementView, 1000);
    return () => clearTimeout(timer);
  }, [postId]);

  return null; // This component doesn't render anything
}

