import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { buildSiteUrl, sitemapUrlEntry } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

export async function GET() {
  let categories: { slug: string; updatedAt: Date }[] = [];
  try {
    categories = await db.category.findMany({
      where: {
        articles: {
          some: {
            isPublished: true,
            noIndex: false,
          },
        },
      },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    });
  } catch {}

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${categories
    .map((item) => sitemapUrlEntry(buildSiteUrl('category', item.slug), item.updatedAt, '0.7'))
    .join('')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
