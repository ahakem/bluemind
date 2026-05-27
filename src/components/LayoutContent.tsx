'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import DiveSitesTeaser from '@/sections/DiveSitesTeaser';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import SkipLinks from '@/components/SkipLinks';
import CookieConsent from '@/components/CookieConsent';
import { SiteSettingsProvider } from '@/contexts/SiteSettingsContext';

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAdminRoute, setIsAdminRoute] = useState(false);

  useEffect(() => {
    setIsAdminRoute((pathname?.startsWith('/admin') || pathname === '/welcome') ?? false);
  }, [pathname]);

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <SiteSettingsProvider>
      <SkipLinks />
      <Navbar />
      <DiveSitesTeaser />
      <main id="main-content" role="main" tabIndex={-1}>
        {children}
      </main>
      <footer id="footer" role="contentinfo">
        <Footer />
      </footer>
      <BackToTop />
      <CookieConsent />
    </SiteSettingsProvider>
  );
}
