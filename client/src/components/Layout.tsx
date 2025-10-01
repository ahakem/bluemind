import { useState, useEffect, ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Preloader from "./Preloader";
import BackToTop from "./BackToTop";
import SkipLinks from "./SkipLinks";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <SkipLinks />
      {loading && <Preloader />}
      <Navbar />
      <main id="main-content" role="main" tabIndex={-1}>
        {children}
      </main>
      <footer id="footer" role="contentinfo">
        <Footer />
      </footer>
      <BackToTop />
    </>
  );
};

export default Layout;
