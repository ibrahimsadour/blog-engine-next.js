import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { buildSiteUrl, escapeXml, getSiteUrl } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = getSiteUrl();
  let articles: Array<{ title: string; slug: string; featuredImage: string | null; updatedAt: Date }> = [];

  try {
    articles = await db.article.findMany({
      where: { isPublished: true, noIndex: false },
      select: { title: true, slug: true, featuredImage: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    });
  } catch {}

  const entries = articles.map((item) => {
    let imageXml = '';
    if (item.featuredImage) {
      let imageUrl: string | null = null;
      try {
        const candidate = new URL(item.featuredImage, baseUrl);
        if (candidate.protocol === 'https:' || candidate.origin === baseUrl) imageUrl = candidate.toString();
      } catch {}
      if (imageUrl) {
        imageXml = `<image:image><image:loc>${escapeXml(imageUrl)}</image:loc><image:title>${escapeXml(item.title)}</image:title></image:image>`;
      }
    }
    return `<url><loc>${escapeXml(buildSiteUrl(item.slug))}</loc><lastmod>${item.updatedAt.toISOString()}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority>${imageXml}</url>`;
  });

  return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${entries.join('')}</urlset>`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600, s-maxage=3600' },
  });
}
