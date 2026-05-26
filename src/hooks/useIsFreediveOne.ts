'use client';

import { useEffect, useState } from 'react';

export function useIsFreediveOne() {
  const [isFreediveOne, setIsFreediveOne] = useState(
    process.env.NEXT_PUBLIC_FREEDIVE_ONE === 'true'
  );
  useEffect(() => {
    if (window.location.hostname.includes('freedive.one')) {
      setIsFreediveOne(true);
    }
  }, []);
  return isFreediveOne;
}
