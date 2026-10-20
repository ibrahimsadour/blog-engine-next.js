import Link from 'next/link';
import Image from 'next/image';
import MobileNavigation from '@/components/MobileNavigation';
import { getSiteSettings } from '@/lib/settings';
import { getNavigationData } from '@/lib/navigation';

export default async function Navbar() {
  const [{ siteName, siteLogo, siteLogoWidth, siteLogoHeight, phoneNumber }, navigation] =
    await Promise.all([
      getSiteSettings(),
      getNavigationData(),
    ]);
  const { headerCategories: categories, headerPages } = navigation;
  const mobileLinks = [
    { id: 'home', label: 'الرئيسية', href: '/' },
    ...categories.map((category) => ({
      id: `category-${category.id}`,
      label: category.name,
      href: `/category/${category.slug}`,
    })),
    ...headerPages.map((page) => ({
      id: `page-${page.id}`,
      label: page.title,
      href: `/${page.slug}`,
    })),
  ];

  return (
    <header className="public-surface sticky top-0 z-50 border-b border-slate-200/70 bg-white/95 shadow-[0_2px_12px_rgba(15,23,42,0.03)] backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-1 md:px-8">
        <Link href="/" className="flex min-w-0 shrink-0 items-center gap-3 rounded-lg">
          {siteLogo ? (
            <div
              className="relative shrink-0"
              style={{
                width: `${siteLogoWidth}px`,
                height: `${siteLogoHeight}px`,
                maxWidth: '40vw',
              }}
            >
              <Image
                src={siteLogo}
                alt={siteName}
                fill
                sizes="(max-width: 640px) 40vw, 400px"
                className="object-contain object-right"
                priority
              />
            </div>
          ) : (
            <span className="max-w-[40vw] truncate text-xl font-black text-blue-900 md:text-2xl">
              {siteName}
            </span>
          )}
        </Link>

        <nav aria-label="التنقل الرئيسي" className="flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-600 lg:gap-4">
          <div className="hidden flex-wrap items-center justify-end gap-x-4 gap-y-1 lg:flex">
            <Link href="/" className="rounded-lg py-2 text-xs leading-relaxed transition hover:text-blue-700 xl:text-sm">
              الرئيسية
            </Link>

            {/* التصنيفات المخصصة للظهور في الهيدر */}
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                className="rounded-lg py-2 text-xs leading-relaxed transition hover:text-blue-700 xl:text-sm"
              >
                {c.name}
              </Link>
            ))}

            {/* الصفحات المخصصة للرأس */}
            {headerPages.map((page) => (
              <Link
                key={page.id}
                href={`/${page.slug}`}
                className="rounded-lg py-2 text-xs leading-relaxed transition hover:text-blue-700 xl:text-sm"
              >
                {page.title}
              </Link>
            ))}

          </div>

          <a
            href={`tel:${phoneNumber}`}
            className="inline-flex min-h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 lg:px-4"
          >
            اتصال فوري
          </a>
          <MobileNavigation links={mobileLinks} />
        </nav>
      </div>
    </header>
  );
}
