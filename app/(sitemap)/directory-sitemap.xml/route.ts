import { db } from '@/lib/db';
import { buildSiteUrl, sitemapUrlEntry } from '@/lib/site-url';
import { isAutomotiveSite } from '@/lib/site-profile';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [cities, cars] = await Promise.all([
    db.city.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
    isAutomotiveSite()
      ? db.car.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } })
      : Promise.resolve([]),
  ]);
  const entries = [
    ...cities.map((item) => sitemapUrlEntry(buildSiteUrl(item.slug), item.updatedAt, '0.8')),
    ...cars.map((item) => sitemapUrlEntry(buildSiteUrl(item.slug), item.updatedAt, '0.8')),
  ];

  return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.join('')}</urlset>`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600, s-maxage=3600' },
  });
}
