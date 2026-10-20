import { db } from '@/lib/db';
import { buildSiteUrl, latestDate, sitemapUrlEntry } from '@/lib/site-url';
import { isAutomotiveSite, isDynamicContentEnabled } from '@/lib/site-profile';
import { NextRequest, NextResponse } from 'next/server';
import { pageCount, sitemapPage, SITEMAP_PAGE_SIZE } from '@/lib/sitemap-pagination';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!isDynamicContentEnabled() || !isAutomotiveSite()) return new NextResponse('Not Found', { status: 404 });

  const [cars, services, template] = await Promise.all([
    db.car.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true, carServices: { select: { serviceId: true, updatedAt: true } } },
    }),
    db.service.findMany({ where: { isActive: true }, select: { id: true, slug: true, updatedAt: true } }),
    db.globalCarServiceTemplate.findFirst({ select: { updatedAt: true } }),
  ]);

  const page = sitemapPage(request.nextUrl.searchParams.get('page'));
  if (page === null || page > pageCount(cars.length * services.length)) return new NextResponse('Not Found', { status: 404 });

  const entries: string[] = [];
  const total = cars.length * services.length;
  const start = (page - 1) * SITEMAP_PAGE_SIZE;
  const end = Math.min(start + SITEMAP_PAGE_SIZE, total);
  for (let index = start; index < end; index++) {
    const car = cars[Math.floor(index / services.length)];
    const service = services[index % services.length];
    const custom = car.carServices.find(item => item.serviceId === service.id);
    entries.push(sitemapUrlEntry(
      buildSiteUrl(car.slug, service.slug),
      latestDate(car.updatedAt, service.updatedAt, template?.updatedAt, custom?.updatedAt),
      '0.8',
    ));
  }

  return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.join('')}</urlset>`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600, s-maxage=3600' },
  });
}
