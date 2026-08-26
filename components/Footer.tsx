import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';
import { getSiteSettings } from '@/lib/settings';

export default async function Footer() {
  const [
    { siteName, siteLogo, phoneNumber, footerDescription, footerContactText },
    categories,
    footerPages,
  ] = await Promise.all([
    getSiteSettings(),
    db.category.findMany({
      take: 6,
      orderBy: { name: 'asc' },
    }),
    db.page.findMany({
      where: {
        isPublished: true,
        showInFooter: true,
      },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  return (
    <footer className="border-t border-gray-100 bg-gray-900 py-12 text-gray-300">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* قسم الشعار والوصف التعريفي */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              {siteLogo ? (
                <div className="relative h-10 w-36 brightness-0 invert">
                  <Image
                    src={siteLogo}
                    alt={siteName}
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <span className="text-xl font-black text-white">{siteName}</span>
              )}
            </Link>
            <p className="text-xs leading-relaxed text-gray-400">
              {footerDescription}
            </p>
          </div>

          {/* روابط سريعة ديناميكية للأقسام */}
          <div>
            <h3 className="mb-3 text-sm font-bold text-white">أقسام الخدمات</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="transition hover:text-white">
                  الرئيسية
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link href={`/category/${c.slug}`} className="transition hover:text-white">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* الصفحات التعريفية والمعلوماتية */}
          <div>
            <h3 className="mb-3 text-sm font-bold text-white">معلومات الموقع</h3>
            <ul className="space-y-2 text-xs">
              {footerPages.length > 0 ? (
                footerPages.map((page) => (
                  <li key={page.id}>
                    <Link href={`/${page.slug}`} className="transition hover:text-white">
                      {page.title}
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-gray-500">لا توجد صفحات مضافة</li>
              )}
            </ul>
          </div>

          {/* معلومات الاتصال وزر الاتصال المباشر */}
          <div>
            <h3 className="mb-3 text-sm font-bold text-white">تواصل معنا</h3>
            <p className="text-xs text-gray-400">{footerContactText}</p>
            <div className="mt-4 flex flex-col items-start gap-2">
              <span className="font-mono text-sm text-gray-200" dir="ltr">
                {phoneNumber}
              </span>
              <a
                href={`tel:${phoneNumber}`}
                className="inline-block rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-700 active:scale-95"
              >
                اتصال فوري
              </a>
            </div>
          </div>
        </div>

        {/* سطر الحقوق والروابط القانونية السريعة */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-gray-800 pt-6 text-xs text-gray-500 sm:flex-row">
          <div>
            جميع الحقوق محفوظة © {new Date().getFullYear()} {siteName}
          </div>
          {footerPages.length > 0 && (
            <div className="flex flex-wrap gap-4">
              {footerPages.map((p) => (
                <Link key={p.id} href={`/${p.slug}`} className="hover:text-gray-300">
                  {p.title}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}