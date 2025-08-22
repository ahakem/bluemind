import { HashRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import GalleryPage from "./pages/GalleryPage";
import FinancePage from "./pages/FinancePage";
import NotFound from "@/pages/not-found";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Helmet } from 'react-helmet-async';

function App() {
  return (
    <TooltipProvider>
      <Helmet defaultTitle="Blue Mind Freediving Amsterdam">
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#051a33" /> {/* Matches your footer color */}
        <meta name="language" content="English" />
        <meta property="og:site_name" content="Blue Mind Freediving" />
        <meta name="twitter:site" content="@bluemindfreediving" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* Structured data for better Google search results */}
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "SportsClub",
              "name": "Blue Mind Freediving",
              "url": "https://bluemindfreediving.nl",
              "logo": "https://bluemindfreediving.nl/logo.png",
              "description": "Professional freediving training in Amsterdam with certified instructors",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Amsterdam",
                "addressCountry": "NL"
              },
              "sameAs": [
                "https://www.instagram.com/bluemind.freediving/"
              ]
            }
          `}
        </script>
      </Helmet>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/finance" element={<FinancePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </HashRouter>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;