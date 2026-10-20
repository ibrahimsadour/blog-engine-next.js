import { db } from '@/lib/db';
import { getSiteSettings } from '@/lib/settings';
import { buildSiteUrl } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

type Finding = { severity: 'high' | 'medium'; url: string; issue: string };

export default async function SeoAuditPage() {
  const [articles, pages, redirects, settings, cities, cars, services] = await Promise.all([
    db.article.findMany({ where: { isPublished: true }, select: {
      slug: true, title: true, metaTitle: true, metaDesc: true, noIndex: true,
      featuredImage: true, altText: true, targetKeyword: true, content: true,
    }}),
    db.page.findMany({ where: { isPublished: true }, select: {
      slug: true, title: true, metaTitle: true, metaDesc: true, noIndex: true,
    }}),
    db.redirect.findMany({ select: { sourcePath: true, targetPath: true } }),
    getSiteSettings(),
    db.city.findMany({ where: { isActive: true }, select: { slug: true, name: true } }),
    db.car.findMany({ where: { isActive: true }, select: { slug: true, name: true } }),
    db.service.findMany({ where: { isActive: true }, select: { slug: true, name: true } }),
  ]);
  const findings: Finding[] = [];
  const add = (severity: Finding['severity'], url: string, issue: string) =>
    findings.push({ severity, url, issue });
  const titles = new Map<string, string>();
  const keywords = new Map<string, string>();
  const entries = [...articles.map(a => ({ ...a, type: 'article' as const })),
    ...pages.map(p => ({ ...p, type: 'page' as const }))];
  for (const entry of entries) {
    const url = buildSiteUrl(entry.slug);
    const title = (entry.metaTitle || entry.title).trim().toLowerCase();
    if (titles.has(title)) add('high', url, 'عنوان SEO مكرر مع ' + titles.get(title));
    else titles.set(title, url);
    if (!entry.metaDesc?.trim()) add('medium', url, 'وصف Meta غير مخصص');
    if (entry.noIndex) add('medium', url, 'صفحة منشورة مع noindex — راجع القرار');
    if (entry.type === 'article') {
      if (!entry.featuredImage) add('medium', url, 'لا توجد صورة رئيسية');
      if (entry.featuredImage && !entry.altText?.trim()) add('medium', url, 'الصورة الرئيسية دون Alt مخصص');
      if (!entry.content?.trim()) add('high', url, 'محتوى فارغ');
      const keyword = entry.targetKeyword?.trim().toLowerCase();
      if (keyword) {
        if (keywords.has(keyword)) add('medium', url, 'عبارة مستهدفة مشتركة مع ' + keywords.get(keyword));
        else keywords.set(keyword, url);
      }
    }
  }
  const citySlugs = new Set(cities.map(c => c.slug));
  for (const car of cars) if (citySlugs.has(car.slug))
    add('high', buildSiteUrl(car.slug), 'تضارب مسار مدينة وسيارة: ' + car.name);
  const otherSlugs = new Set([...articles.map(a => a.slug), ...pages.map(p => p.slug)]);
  for (const city of cities) if (otherSlugs.has(city.slug))
    add('high', buildSiteUrl(city.slug), 'تضارب مسار المدينة مع مقال أو صفحة');
  for (const car of cars) if (otherSlugs.has(car.slug))
    add('high', buildSiteUrl(car.slug), 'تضارب مسار السيارة مع مقال أو صفحة');
  for (const service of services) if (!service.slug.trim())
    add('high', buildSiteUrl(), 'خدمة دون مسار صالح');
  if (!settings.phoneNumber || settings.phoneNumber === '+96500000000')
    add('high', buildSiteUrl(), 'رقم هاتف النشاط غير مُهيأ');
  for (const r of redirects) {
    if (r.sourcePath === r.targetPath) add('high', r.sourcePath, 'تحويل يشير إلى نفسه');
    if (!r.targetPath.startsWith('/')) add('medium', r.sourcePath, 'راجع وجهة التحويل');
  }
  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-bold">SEO Audit Center — التدقيق الداخلي</h1>
      <p className="text-sm text-gray-600">نتائج قاعدة البيانات لهذا الموقع فقط. لا تشمل تقارير Google Search Console أو الزحف المباشر أو قياسات الأداء.</p>
      <div className="rounded-xl bg-white p-5">المقالات: {articles.length} | الصفحات: {pages.length} | تركيبات المدن والخدمات: {cities.length * services.length} | تركيبات السيارات والخدمات: {cars.length * services.length} | التنبيهات: {findings.length}</div>
      <div className="overflow-x-auto rounded-xl bg-white">
        <table className="w-full text-right text-sm">
          <thead><tr className="border-b"><th className="p-3">الأولوية</th><th className="p-3">الصفحة</th><th className="p-3">الملاحظة</th></tr></thead>
          <tbody>{findings.map((f, i) => <tr key={i} className="border-b">
            <td className="p-3">{f.severity === 'high' ? 'عالية' : 'متوسطة'}</td>
            <td className="p-3 break-all"><a className="text-blue-700 underline" href={f.url} target="_blank" rel="noopener noreferrer">{f.url}</a></td>
            <td className="p-3">{f.issue}</td>
          </tr>)}</tbody>
        </table>
        {findings.length === 0 && <p className="p-5">لا توجد تنبيهات ضمن الفحوصات الحالية. هذا لا يعني خلو الموقع من جميع مشكلات SEO.</p>}
      </div>
    </section>
  );
}
