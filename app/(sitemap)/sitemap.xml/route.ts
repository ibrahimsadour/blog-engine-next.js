import { NextResponse } from 'next/server';
import { escapeXml, getSiteUrl } from '@/lib/site-url';
import { isAutomotiveSite, isDynamicContentEnabled } from '@/lib/site-profile';
import { db } from '@/lib/db';
import { pageCount } from '@/lib/sitemap-pagination';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = getSiteUrl();
  const sitemap = (path: string) => `  <sitemap>
    <loc>${escapeXml(`${baseUrl}/${path}`)}</loc>
  </sitemap>`;

  const dynamicContent = isDynamicContentEnabled();
  const automotive = isAutomotiveSite();
  const [cityCount, serviceCount, carCount, articleCount] = await Promise.all([
    ...(dynamicContent ? [
    db.city.count({ where: { isActive: true } }),
    db.service.count({ where: { isActive: true } }),
    automotive ? db.car.count({ where: { isActive: true } }) : Promise.resolve(0),
    ] : [Promise.resolve(0), Promise.resolve(0), Promise.resolve(0)]),
    db.article.count({ where: { isPublished: true, noIndex: false } }),
  ]);
  const shards = (path: string, total: number) => Array.from(
    { length: pageCount(total) }, (_, index) => sitemap(`${path}?page=${index + 1}`)
  );
  const entries = [
    sitemap('page-sitemap.xml'),
    ...shards('post-sitemap.xml', articleCount),
    sitemap('category-sitemap.xml'),
    ...(dynamicContent
      ? [
          sitemap('directory-sitemap.xml'),
          ...shards('city-service-sitemap.xml', cityCount * serviceCount),
          ...(automotive ? shards('car-service-sitemap.xml', carCount * serviceCount) : []),
        ]
      : []),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</sitemapindex>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
