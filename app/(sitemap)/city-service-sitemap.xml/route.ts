import { db } from '@/lib/db';
import { isDynamicContentEnabled } from '@/lib/site-profile';
import { buildSiteUrl, latestDate, sitemapUrlEntry } from '@/lib/site-url';
import { NextRequest, NextResponse } from 'next/server';
import { pageCount, sitemapPage, SITEMAP_PAGE_SIZE } from '@/lib/sitemap-pagination';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!isDynamicContentEnabled()) return new NextResponse('Not Found', { status: 404 });
  const [cities, services, template] = await Promise.all([
    db.city.findMany({
      where: { isActive: true },
      orderBy: { id: 'asc' },
      select: { slug: true, updatedAt: true, cityServices: { select: { serviceId: true, updatedAt: true } } },
    }),
    db.service.findMany({ where: { isActive: true }, orderBy: { id: 'asc' }, select: { id: true, slug: true, updatedAt: true } }),
    db.globalServiceTemplate.findFirst({ select: { updatedAt: true } }),
  ]);

  const page = sitemapPage(request.nextUrl.searchParams.get('page'));
  if (page === null || page > pageCount(cities.length * services.length)) return new NextResponse('Not Found', { status: 404 });

  const entries: string[] = [];
  const total = cities.length * services.length;
  const start = (page - 1) * SITEMAP_PAGE_SIZE;
  const end = Math.min(start + SITEMAP_PAGE_SIZE, total);
  for (let index = start; index < end; index++) {
    const city = cities[Math.floor(index / services.length)];
    const service = services[index % services.length];
    const custom = city.cityServices.find(item => item.serviceId === service.id);
    entries.push(sitemapUrlEntry(
      buildSiteUrl(city.slug, service.slug),
      latestDate(city.updatedAt, service.updatedAt, template?.updatedAt, custom?.updatedAt),
      '0.8',
    ));
  }

  return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.join('')}</urlset>`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600, s-maxage=3600' },
  });
}
