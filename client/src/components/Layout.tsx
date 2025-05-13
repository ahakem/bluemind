import { useState, useEffect, ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Preloader from "./Preloader";
import BackToTop from "./BackToTop";

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
      {loading && <Preloader />}
      <Navbar />
      <main>{children}</main>
      <Footer />
      <BackToTop />
    </>
  );
};

export default Layout;
