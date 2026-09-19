import Link from 'next/link';
import Image from 'next/image';
import { getSiteSettings } from '@/lib/settings';
import { getNavigationData } from '@/lib/navigation';

export default async function Navbar() {
  const [{ siteName, siteLogo, siteLogoWidth, siteLogoHeight, phoneNumber }, navigation] =
    await Promise.all([
      getSiteSettings(),
      getNavigationData(),
    ]);
  const { headerCategories: categories, headerPages } = navigation;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
        <Link href="/" className="flex items-center gap-3">
          {siteLogo ? (
            <div
              className="relative shrink-0"
              style={{
                width: `${siteLogoWidth}px`,
                height: `${siteLogoHeight}px`,
                maxWidth: '55vw',
              }}
            >
              <Image
                src={siteLogo}
                alt={siteName}
                fill
                sizes="(max-width: 640px) 55vw, 400px"
                className="object-contain object-right"
                priority
              />
            </div>
          ) : (
            <span className="text-xl font-black text-blue-900 md:text-2xl">
              {siteName}
            </span>
          )}
        </Link>

        <nav className="flex items-center gap-6 text-sm font-semibold text-gray-700">
          <Link href="/" className="transition hover:text-blue-600">
            الرئيسية
          </Link>

          {/* التصنيفات المخصصة للظهور في الهيدر */}
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/category/${c.slug}`}
              className="hidden transition hover:text-blue-600 sm:inline-block"
            >
              {c.name}
            </Link>
          ))}

          {/* الصفحات المخصصة للرأس */}
          {headerPages.map((page) => (
            <Link
              key={page.id}
              href={`/${page.slug}`}
              className="hidden transition hover:text-blue-600 md:inline-block"
            >
              {page.title}
            </Link>
          ))}

          <a
            href={`tel:${phoneNumber}`}
            className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-700 active:scale-95"
          >
            اتصال فوري
          </a>
        </nav>
      </div>
    </header>
  );
}
