'use client';

import { useEffect } from 'react';

interface ViewTrackerProps {
  postId: string;
}

export default function ViewTracker({ postId }: ViewTrackerProps) {
  useEffect(() => {
    // Increment view count when component mounts
    const incrementView = async () => {
      try {
        await fetch('/api/blog/increment-view', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId }),
        });
      } catch (error) {
        // View tracking is not critical, fail silently
        console.debug('View tracking failed:', error);
      }
    };

    incrementView();
  }, [postId]);

  return null; // This component doesn't render anything
}
