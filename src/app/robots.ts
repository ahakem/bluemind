import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://bluemindfreediving.nl';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/finance'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
