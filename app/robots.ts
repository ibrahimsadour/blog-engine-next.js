import { MetadataRoute } from 'next';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

  let customRobots = '';

  try {
    const setting = await db.setting.findUnique({
      where: { key: 'custom_robots_txt' },
    });
    customRobots = setting?.value?.trim() || '';
  } catch {
    // في حال عدم توفر قاعدة البيانات
  }

  // في حال تخصيص الروبوتس من لوحة التحكم، يتم تطبيقه مباشرة
  if (customRobots) {
    const rules: MetadataRoute.Robots['rules'] = [];
    const lines = customRobots.split('\n');

    let currentUserAgent = '*';
    let allowList: string[] = [];
    let disallowList: string[] = [];

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;

      if (line.toLowerCase().startsWith('user-agent:')) {
        if (allowList.length > 0 || disallowList.length > 0) {
          rules.push({
            userAgent: currentUserAgent,
            allow: allowList.length > 0 ? allowList : undefined,
            disallow: disallowList.length > 0 ? disallowList : undefined,
          });
          allowList = [];
          disallowList = [];
        }
        currentUserAgent = line.split(':')[1]?.trim() || '*';
      } else if (line.toLowerCase().startsWith('allow:')) {
        const path = line.split(':')[1]?.trim();
        if (path) allowList.push(path);
      } else if (line.toLowerCase().startsWith('disallow:')) {
        const path = line.split(':')[1]?.trim();
        if (path) disallowList.push(path);
      }
    }

    if (allowList.length > 0 || disallowList.length > 0 || currentUserAgent) {
      rules.push({
        userAgent: currentUserAgent,
        allow: allowList.length > 0 ? allowList : undefined,
        disallow: disallowList.length > 0 ? disallowList : undefined,
      });
    }

    return {
      rules,
      sitemap: `${baseUrl}/sitemap.xml`,
      host: baseUrl,
    };
  }

  // الإعداد الافتراضي المحسن للسيو
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/login', '/api/'],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: ['/uploads/', '/_next/image'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}