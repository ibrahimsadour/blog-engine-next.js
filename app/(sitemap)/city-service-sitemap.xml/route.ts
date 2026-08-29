import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

  const [cities, services] = await Promise.all([
    db.city.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
    db.service.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
  ]);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  for (const city of cities) {
    for (const service of services) {
      xml += `
        <url>
          <loc>${baseUrl}/${city.slug}/${service.slug}</loc>
          <changefreq>weekly</changefreq>
          <priority>0.8</priority>
        </url>
      `;
    }
  }

  xml += `</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}