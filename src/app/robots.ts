import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://bluemindfreediving.nl';

  return {
    rules: [
      // Google and Bing — full crawl access for SEO
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
      // AI training crawlers — block the dive sites database
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'CCBot',
          'anthropic-ai',
          'Claude-Web',
          'ClaudeBot',
          'Omgilibot',
          'FacebookBot',
          'PerplexityBot',
          'YouBot',
          'Bytespider',
          'PetalBot',
        ],
        disallow: ['/dive-sites/', '/api/', '/admin/'],
      },
      // All other crawlers — throttled with crawl delay
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/'],
        crawlDelay: 10,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
