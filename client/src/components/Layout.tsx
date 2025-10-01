import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BackToTop from "./BackToTop";
import SkipLinks from "./SkipLinks";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
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
    </>
  );
};

export default Layout;
