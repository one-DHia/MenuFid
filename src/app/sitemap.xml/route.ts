import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function GET() {
  const baseUrl = 'https://www.menufid.site';
  const now = new Date().toISOString();

  const staticPages = [
    { url: `${baseUrl}`, lastmod: now, changefreq: 'daily', priority: '1.0' },
    { url: `${baseUrl}/pricing`, lastmod: now, changefreq: 'weekly', priority: '0.9' },
    { url: `${baseUrl}/distribution`, lastmod: now, changefreq: 'weekly', priority: '0.9' },
    { url: `${baseUrl}/contact`, lastmod: now, changefreq: 'monthly', priority: '0.7' },
    { url: `${baseUrl}/wallet`, lastmod: now, changefreq: 'daily', priority: '0.8' },
    { url: `${baseUrl}/terms`, lastmod: now, changefreq: 'yearly', priority: '0.3' },
    { url: `${baseUrl}/privacy`, lastmod: now, changefreq: 'yearly', priority: '0.3' },
  ];

  let dynamicPages: { url: string; lastmod: string; changefreq: string; priority: string }[] = [];

  try {
    const { data: merchants } = await supabaseAdmin
      .from('merchants')
      .select('slug, created_at, is_suspended')
      .eq('is_suspended', false);

    if (merchants && merchants.length > 0) {
      for (const m of merchants) {
        if (!m.slug) continue;
        dynamicPages.push({
          url: `${baseUrl}/menu/${encodeURIComponent(m.slug)}`,
          lastmod: m.created_at || now,
          changefreq: 'weekly',
          priority: '0.9',
        });
        dynamicPages.push({
          url: `${baseUrl}/wallet/${encodeURIComponent(m.slug)}`,
          lastmod: m.created_at || now,
          changefreq: 'weekly',
          priority: '0.8',
        });
      }
    }
  } catch (err) {
    console.warn('[Sitemap Generation Warning]:', err);
  }

  const allPages = [...staticPages, ...dynamicPages];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (page) => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
