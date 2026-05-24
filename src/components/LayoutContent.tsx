'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import DiveSiteNavbar from '@/components/DiveSiteNavbar';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import SkipLinks from '@/components/SkipLinks';
import CookieConsent from '@/components/CookieConsent';
import { SiteSettingsProvider } from '@/contexts/SiteSettingsContext';
import { DiveSiteNavProvider } from '@/contexts/DiveSiteNavContext';

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [isDiveSiteDetail, setIsDiveSiteDetail] = useState(false);

  useEffect(() => {
    setIsAdminRoute(pathname?.startsWith('/admin') ?? false);
    // Minimal nav for all dive site pages (listing, detail, tag)
    const isDiveDetail = !!pathname && (pathname === '/dive-sites' || pathname.startsWith('/dive-sites/'));
    setIsDiveSiteDetail(isDiveDetail);
  }, [pathname]);

  if (isAdminRoute || pathname === '/welcome') {
    return <>{children}</>;
  }

  return (
    <SiteSettingsProvider>
      <DiveSiteNavProvider>
        <SkipLinks />
        {isDiveSiteDetail ? <DiveSiteNavbar /> : <Navbar />}
        <main id="main-content" role="main" tabIndex={-1}>
          {children}
        </main>
        <footer id="footer" role="contentinfo">
          <Footer />
        </footer>
        <BackToTop />
        <CookieConsent />
      </DiveSiteNavProvider>
    </SiteSettingsProvider>
  );
}
