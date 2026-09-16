import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.menufid.site';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/distributor/',
          '/pro/dashboard',
          '/pro/profile',
          '/pro/scanner',
          '/pro/menu',
          '/pro/qr',
          '/pro/loyalty',
          '/pro/suspended',
          '/pro/trial-expired',
          '/pro/deleted',
        ],
      },
      {
        userAgent: ['Googlebot', 'Bingbot', 'Applebot', 'DuckDuckBot', 'Baiduspider', 'YandexBot'],
        allow: '/',
        disallow: ['/api/', '/admin/', '/distributor/', '/pro/'],
      },
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'Amazonbot'],
        allow: '/',
        disallow: ['/api/', '/admin/', '/distributor/', '/pro/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
