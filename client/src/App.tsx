import { HashRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { Suspense, lazy } from 'react';
import Layout from "./components/Layout";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import SEO from "./components/SEO";
import { useAccessibilityEnhancements } from "./hooks/useAccessibility";

// Lazy load pages for better code splitting
const Home = lazy(() => import("./pages/Home"));
const GalleryPage = lazy(() => import("./pages/GalleryPage"));
const FinancePage = lazy(() => import("./pages/FinancePage"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Loading component for Suspense
const PageLoader = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '200px',
    fontSize: '16px',
    color: '#333' // Better contrast than #666
  }}>
    Loading...
  </div>
);

function App() {
  // Initialize accessibility enhancements
  useAccessibilityEnhancements();
  
  return (
    <HelmetProvider>
      <TooltipProvider>
        <SEO />
        <HashRouter>
          <Layout>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/finance" element={<FinancePage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Layout>
        </HashRouter>
        <Toaster />
      </TooltipProvider>
    </HelmetProvider>
  );
}

export default App;