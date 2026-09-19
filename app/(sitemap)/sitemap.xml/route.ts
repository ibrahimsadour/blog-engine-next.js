import { NextResponse } from 'next/server';
import { escapeXml, getSiteUrl } from '@/lib/site-url';
import { isAutomotiveSite, isDynamicContentEnabled } from '@/lib/site-profile';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = getSiteUrl();
  const now = new Date().toISOString();
  const sitemap = (path: string) => `  <sitemap>
    <loc>${escapeXml(`${baseUrl}/${path}`)}</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`;

  const dynamicContent = isDynamicContentEnabled();
  const entries = [
    sitemap('page-sitemap.xml'),
    sitemap('post-sitemap.xml'),
    sitemap('category-sitemap.xml'),
    ...(dynamicContent
      ? [
          sitemap('directory-sitemap.xml'),
          sitemap('city-service-sitemap.xml'),
          ...(isAutomotiveSite() ? [sitemap('car-service-sitemap.xml')] : []),
        ]
      : []),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</sitemapindex>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
