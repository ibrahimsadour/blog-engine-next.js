import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { buildSiteUrl, getSiteUrl, sitemapUrlEntry } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = getSiteUrl();
  const now = new Date().toISOString();

  let pages: { slug: string; updatedAt: Date }[] = [];
  try {
    pages = await db.page.findMany({
      where: {
        isPublished: true,
        noIndex: false,
      },
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  } catch {}

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  ${sitemapUrlEntry(buildSiteUrl('cars'), new Date(now), '0.9')}
  ${sitemapUrlEntry(buildSiteUrl('cities'), new Date(now), '0.9')}
  ${pages
    .map((p) => sitemapUrlEntry(buildSiteUrl(p.slug), p.updatedAt, '0.7'))
    .join('')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
