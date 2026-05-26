'use client';

import { useEffect } from 'react';
import { useIsFreediveOne } from '@/hooks/useIsFreediveOne';

export default function DynamicFavicon() {
  const isFreediveOne = useIsFreediveOne();

  useEffect(() => {
    if (!isFreediveOne) return;
    document.querySelectorAll("link[rel~='icon']").forEach((el) => el.remove());
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/svg+xml';
    link.href = '/freedive-favicon.svg';
    document.head.appendChild(link);
  }, [isFreediveOne]);

  return null;
}
