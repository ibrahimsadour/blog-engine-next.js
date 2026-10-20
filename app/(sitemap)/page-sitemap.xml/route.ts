import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { buildSiteUrl, getSiteUrl, sitemapUrlEntry } from '@/lib/site-url';
import { logDatabaseError } from '@/lib/logger';
import { isAutomotiveSite, isDynamicContentEnabled } from '@/lib/site-profile';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = getSiteUrl();

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
  } catch (error) {
    logDatabaseError('sitemap.pages', error);
  }

  // Avoid emitting published custom pages with the same URL as automatic directory landings.
  const reserved = new Set<string>();
  if (isDynamicContentEnabled()) {
    reserved.add('cities');
    if (isAutomotiveSite()) reserved.add('cars');
  }
  const uniquePages = pages.filter((page) => !reserved.has(page.slug.replace(/^\\/+|\\/+$/g, '').toLowerCase()));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  ${isDynamicContentEnabled() && isAutomotiveSite() ? `<url><loc>${buildSiteUrl('cars')}</loc></url>` : ''}
  ${isDynamicContentEnabled() ? `<url><loc>${buildSiteUrl('cities')}</loc></url>` : ''}
  ${uniquePages
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
