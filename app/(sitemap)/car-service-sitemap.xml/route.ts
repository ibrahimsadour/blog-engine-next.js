import { db } from '@/lib/db';
import { buildSiteUrl, latestDate, sitemapUrlEntry } from '@/lib/site-url';
import { isAutomotiveSite } from '@/lib/site-profile';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isAutomotiveSite()) return new NextResponse('Not Found', { status: 404 });

  const [cars, services, template] = await Promise.all([
    db.car.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true, carServices: { select: { serviceId: true, updatedAt: true } } },
    }),
    db.service.findMany({ where: { isActive: true }, select: { id: true, slug: true, updatedAt: true } }),
    db.globalCarServiceTemplate.findFirst({ select: { updatedAt: true } }),
  ]);

  const entries = cars.flatMap((car) => services.map((service) => {
    const custom = car.carServices.find((item) => item.serviceId === service.id);
    return sitemapUrlEntry(
      buildSiteUrl(car.slug, service.slug),
      latestDate(car.updatedAt, service.updatedAt, template?.updatedAt, custom?.updatedAt),
      '0.8',
    );
  }));

  return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.join('')}</urlset>`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600, s-maxage=3600' },
  });
}
