'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import SkipLinks from '@/components/SkipLinks';
import CookieConsent from '@/components/CookieConsent';

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAdminRoute, setIsAdminRoute] = useState(false);

  useEffect(() => {
    // Only check pathname on client side
    setIsAdminRoute(pathname?.startsWith('/admin') ?? false);
  }, [pathname]);

  // For admin routes, render children directly without public site chrome
  if (isAdminRoute) {
    return <>{children}</>;
  }

  // For public routes, render with full site layout
  return (
    <>
      <SkipLinks />
      <Navbar />
      <main id="main-content" role="main" tabIndex={-1}>
        {children}
      </main>
      <footer id="footer" role="contentinfo">
        <Footer />
      </footer>
      <BackToTop />
      <CookieConsent />
    </>
  );
}
