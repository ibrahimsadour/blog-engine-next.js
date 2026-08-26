import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

function cleanSlug(slug: string): string {
  const clean = (slug || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0600-\u06FF\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+|-+$/g, '');
  return encodeURI(clean);
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case '\'':
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
}

export async function GET() {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

  let articles: {
    title: string;
    slug: string;
    featuredImage: string | null;
    updatedAt: Date;
  }[] = [];

  try {
    articles = await db.article.findMany({
      where: {
        isPublished: true,
        noIndex: false,
      },
      select: {
        title: true,
        slug: true,
        featuredImage: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  } catch {}

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  ${articles
    .map((item) => {
      const pageUrl = `${baseUrl}/${cleanSlug(item.slug)}`;
      let imageXml = '';

      if (item.featuredImage) {
        const imgUrl = item.featuredImage.startsWith('http')
          ? item.featuredImage
          : `${baseUrl}${item.featuredImage}`;
        imageXml = `
      <image:image>
        <image:loc>${escapeXml(imgUrl)}</image:loc>
        <image:title>${escapeXml(item.title)}</image:title>
      </image:image>`;
      }

      return `
    <url>
      <loc>${pageUrl}</loc>
      <lastmod>${new Date(item.updatedAt).toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>${imageXml}
    </url>`;
    })
    .join('')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}