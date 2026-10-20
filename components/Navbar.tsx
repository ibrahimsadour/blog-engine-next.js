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
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-1 md:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
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

        <nav aria-label="التنقل الرئيسي" className="flex shrink-0 items-center gap-2 text-sm font-semibold text-gray-700 lg:gap-6">
          <div className="hidden items-center gap-6 lg:flex">
            <Link href="/" className="transition hover:text-blue-600">
              الرئيسية
            </Link>

            {/* التصنيفات المخصصة للظهور في الهيدر */}
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                className="transition hover:text-blue-600"
              >
                {c.name}
              </Link>
            ))}

            {/* الصفحات المخصصة للرأس */}
            {headerPages.map((page) => (
              <Link
                key={page.id}
                href={`/${page.slug}`}
                className="transition hover:text-blue-600"
              >
                {page.title}
              </Link>
            ))}

          </div>

          <a
            href={`tel:${phoneNumber}`}
            className="whitespace-nowrap rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-700 active:scale-95 lg:px-4"
          >
            اتصال فوري
          </a>
          <MobileNavigation links={mobileLinks} />
        </nav>
      </div>
    </header>
  );
}
