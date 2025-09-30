import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  structuredData?: any;
}

const SEO = ({
  title = "Blue Mind Freediving | Dutch Freediving Amsterdam Pool Training Netherlands",
  description = "Join Netherlands' premier freediving community in Amsterdam. Expert Dutch freediving instructors, professional pool training sessions, and certified safety protocols. Learn breath-hold techniques with Dutch national record holders at Sloterparkbad.",
  keywords = "dutch freediving, freediving amsterdam, dutch freedivers, freediving netherlands, pool training amsterdam, breath hold training, freediving club amsterdam, freediving lessons netherlands, apnea training dutch, nederlandse vrijduik, vrijduiken amsterdam, ademhouden training, dutch diving school",
  image = "/assets/hero.png",
  url = "https://bluemindfreediving.nl",
  type = "website",
  structuredData
}: SEOProps) => {
  
  // Default structured data for the organization
  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${url}/#organization`,
        "name": "Blue Mind Freediving",
        "alternateName": ["Blue Mind Freediving Amsterdam", "Dutch Freediving Amsterdam", "Nederlandse Vrijduik Amsterdam"],
        "url": url,
        "logo": {
          "@type": "ImageObject",
          "url": `${url}/assets/bluemind-logo.png`,
          "width": 200,
          "height": 60
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+31-6-12345678",
          "contactType": "customer service",
          "email": "info@bluemindfreediving.nl",
          "availableLanguage": ["English", "Dutch", "Nederlands"]
        },
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Amsterdam",
          "addressRegion": "North Holland",
          "addressCountry": "Netherlands",
          "postalCode": "1054"
        },
        "sameAs": [
          "https://www.instagram.com/bluemind.freediving/"
        ],
        "foundingDate": "2024",
        "foundingLocation": "Amsterdam, Netherlands",
        "memberOf": {
          "@type": "Organization",
          "name": "Dutch Freediving Community"
        }
      },
      {
        "@type": "LocalBusiness",
        "@id": `${url}/#localbusiness`,
        "name": "Blue Mind Freediving Amsterdam",
        "alternateName": ["Dutch Freediving Amsterdam", "Nederlandse Vrijduik Training"],
        "description": "Professional freediving training facility in Amsterdam, Netherlands. Learn from Dutch national record holders and certified instructors.",
        "url": url,
        "telephone": "+31-6-12345678",
        "email": "info@bluemindfreediving.nl",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Sloterparkbad",
          "addressLocality": "Amsterdam",
          "addressRegion": "North Holland",
          "postalCode": "1054",
          "addressCountry": "Netherlands"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 52.3676,
          "longitude": 4.9041
        },
        "openingHours": ["Mo 18:00-21:00"],
        "priceRange": "€20-€40",
        "paymentAccepted": ["Cash", "Credit Card", "Bank Transfer", "iDEAL"],
        "currenciesAccepted": "EUR",
        "servedCuisine": "Freediving Training",
        "hasMap": "https://maps.google.com/?q=Sloterparkbad+Amsterdam",
        "slogan": "Netherlands' Premier Freediving Community"
      },
      {
        "@type": "SportsActivityLocation",
        "@id": `${url}/#sportslocation`,
        "name": "Blue Mind Freediving Training Facility",
        "description": "Professional freediving pool training facility in Amsterdam",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Amsterdam",
          "addressCountry": "Netherlands"
        },
        "amenityFeature": [
          {
            "@type": "LocationFeatureSpecification",
            "name": "Heated Indoor Pool",
            "value": true
          },
          {
            "@type": "LocationFeatureSpecification", 
            "name": "Professional Instruction",
            "value": true
          },
          {
            "@type": "LocationFeatureSpecification",
            "name": "Safety Equipment",
            "value": true
          }
        ]
      },
      {
        "@type": "Course",
        "@id": `${url}/#course`,
        "name": "Dutch Freediving Pool Training Course Amsterdam",
        "alternateName": ["Nederlandse Vrijduik Training", "Amsterdam Breath Hold Course"],
        "description": "Learn freediving techniques from Dutch national record holders in Amsterdam's premier pool training facility",
        "provider": {
          "@id": `${url}/#organization`
        },
        "courseMode": "In-person",
        "educationalLevel": "Beginner to Advanced",
        "inLanguage": ["en", "nl"],
        "coursePrerequisites": "Basic swimming ability",
        "teaches": [
          "Dynamic apnea training",
          "Static apnea techniques", 
          "Freediving safety protocols",
          "Mental preparation for breath holding",
          "Equalization techniques",
          "Dutch freediving competition standards"
        ],
        "locationCreated": {
          "@type": "Place",
          "name": "Amsterdam, Netherlands",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Amsterdam",
            "addressCountry": "Netherlands"
          }
        },
        "offers": {
          "@type": "Offer",
          "price": "25",
          "priceCurrency": "EUR",
          "availability": "https://schema.org/InStock"
        }
      },
      {
        "@type": "SportsTeam",
        "@id": `${url}/#sportsteam`,
        "name": "Blue Mind Freediving Team Amsterdam",
        "sport": "Freediving",
        "memberOf": {
          "@type": "SportsOrganization",
          "name": "Dutch Freediving Association"
        },
        "location": {
          "@type": "Place",
          "name": "Amsterdam, Netherlands"
        },
        "athlete": [
          {
            "@type": "Person",
            "name": "Hakim",
            "description": "4x Egyptian National Record Holder, AIDA Judge & Safety"
          },
          {
            "@type": "Person", 
            "name": "Dewi",
            "description": "AIDA Safety Certified, Emergency Responder"
          }
        ]
      }
    ]
  };

  const schemaData = structuredData || defaultStructuredData;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="author" content="Blue Mind Freediving Amsterdam" />
      
      {/* Dutch Language Tags */}
      <meta name="geo.region" content="NL-NH" />
      <meta name="geo.placename" content="Amsterdam" />
      <meta name="geo.position" content="52.3676;4.9041" />
      <meta name="ICBM" content="52.3676, 4.9041" />
      
      {/* Alternate Language Links */}
      <link rel="alternate" hrefLang="en" href={url} />
      <link rel="alternate" hrefLang="nl" href={url} />
      <link rel="alternate" hrefLang="x-default" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Blue Mind Freediving Amsterdam" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:locale:alternate" content="nl_NL" />
      <meta property="og:country-name" content="Netherlands" />
      <meta property="og:region" content="North Holland" />
      <meta property="og:locality" content="Amsterdam" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* Additional SEO Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="format-detection" content="telephone=no" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>

      {/* Canonical URL */}
      <link rel="canonical" href={url} />

      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    </Helmet>
  );
};

export default SEO;