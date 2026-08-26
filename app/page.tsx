import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { getSiteSettings } from '@/lib/settings';
import CallToAction from '@/components/CallToAction';
import StickyFloatingBar from '@/components/StickyFloatingBar';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

  const title = settings.homeMetaTitle || `${settings.siteName} | أسرع دليل خدمات وصيانة ميدانية 24 ساعة`;
  const description = settings.homeMetaDesc || settings.footerDescription || 'دليل خدمات وصيانة متكامل في الكويت على مدار الساعة بأفضل الأسعار.';

  return {
    title,
    description,
    keywords: settings.homeKeywords ? settings.homeKeywords.split(',').map((k) => k.trim()) : undefined,
    alternates: {
      canonical: siteUrl,
    },
    robots: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
    openGraph: {
      title,
      description,
      url: siteUrl,
      type: 'website',
      locale: 'ar_KW',
      siteName: settings.siteName,
      images: settings.heroBgImage ? [{ url: settings.heroBgImage }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: settings.heroBgImage ? [settings.heroBgImage] : [],
    },
  };
}

export default async function HomePage() {
  const [settings, categories, latestArticles] = await Promise.all([
    getSiteSettings(),
    db.category.findMany({
      include: {
        _count: {
          select: { articles: { where: { isPublished: true, noIndex: false } } },
        },
      },
      orderBy: { name: 'asc' },
    }),
    db.article.findMany({
      where: { isPublished: true, noIndex: false },
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: { category: true },
    }),
  ]);

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

  // 1. WebSite Schema
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: settings.siteName,
    url: siteUrl,
    inLanguage: 'ar',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  // 2. LocalBusiness Schema
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    name: settings.siteName,
    description: settings.homeMetaDesc || settings.footerDescription,
    url: siteUrl,
    telephone: settings.phoneNumber,
    areaServed: {
      '@type': 'AdministrativeArea',
      name: 'الكويت',
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'KW',
      addressRegion: 'الكويت',
    },
    priceRange: '$$',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      <main className="min-h-screen bg-gray-50 pb-24 md:pb-12">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-blue-800 to-indigo-900 px-4 py-16 text-center text-white md:py-24">
          {settings.heroBgImage && (
            <div className="absolute inset-0 z-0">
              <Image
                src={settings.heroBgImage}
                alt={settings.heroTitle}
                fill
                priority
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gray-950/75 backdrop-blur-[2px]" />
            </div>
          )}

          <div className="relative z-10 mx-auto max-w-4xl">
            {settings.heroBadge && (
              <span className="inline-block rounded-full bg-blue-600/80 px-4 py-1.5 text-xs font-semibold tracking-wider text-blue-100 backdrop-blur-md">
                {settings.heroBadge}
              </span>
            )}

            <h1 className="mt-4 text-3xl font-extrabold md:text-5xl md:leading-tight">
              {settings.heroTitle}
            </h1>

            {settings.heroSubtitle && (
              <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-blue-100 md:text-lg">
                {settings.heroSubtitle}
              </p>
            )}

            {/* أزرار الاتصال والتحويل السريع */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href={`tel:${settings.phoneNumber}`}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-blue-700 active:scale-95"
              >
                <span>📞</span>
                <span>اتصل بنا الآن</span>
              </a>
              <a
                href={`https://wa.me/${settings.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-emerald-700 active:scale-95"
              >
                <span>💬</span>
                <span>محادثة واتساب</span>
              </a>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
          {/* 1. أقسام الخدمات */}
          {categories.length > 0 && (
            <section className="mb-14">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 md:text-2xl">أقسام الخدمات</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/category/${category.slug}`}
                    className="group flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-xs transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
                  >
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 transition group-hover:text-blue-600">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                          {category.description}
                        </p>
                      )}
                    </div>
                    <span className="mt-4 inline-block text-xs font-semibold text-blue-600">
                      {category._count.articles} مقال متوفر &larr;
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* 2. المحتوى المخصص بالصفحة الرئيسية */}
          {settings.homeCustomContent && (
            <section className="mb-14">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs md:p-8">
                <div
                  className="prose prose-lg max-w-none text-gray-800 prose-headings:font-bold prose-headings:text-gray-900 prose-p:leading-relaxed prose-a:text-blue-600 hover:prose-a:underline"
                  dangerouslySetInnerHTML={{ __html: settings.homeCustomContent }}
                />
              </div>
            </section>
          )}

          {/* 3. أحدث المقالات المنشورة بالروابط المباشرة */}
          <section className="mb-14">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 md:text-2xl">أحدث المقالات والدلائل الفنية</h2>
            </div>

            {latestArticles.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">
                لا توجد مقالات منشورة حالياً
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {latestArticles.map((article) => (
                  <article
                    key={article.id}
                    className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xs transition hover:-translate-y-1 hover:shadow-md"
                  >
                    {article.featuredImage && (
                      <div className="relative h-48 w-full">
                        <Image
                          src={article.featuredImage}
                          alt={article.altText || article.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-5">
                      <span className="mb-2 text-xs font-semibold text-blue-600">
                        {article.category.name}
                      </span>
                      <h3 className="line-clamp-2 text-lg font-bold text-gray-900">
                        <Link href={`/${article.slug}`} className="hover:text-blue-600">
                          {article.title}
                        </Link>
                      </h3>
                      {article.excerpt && (
                        <p className="mt-2 line-clamp-3 flex-1 text-sm text-gray-600">
                          {article.excerpt}
                        </p>
                      )}
                      <div className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-400">
                        <time dateTime={article.createdAt.toISOString()}>
                          {new Date(article.createdAt).toLocaleDateString('ar-EG', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </time>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* شريط التحويل والاتصال */}
          <CallToAction />
        </div>
      </main>

      {/* شريط الاتصال والواتساب العائم في أسفل الشاشة */}
      <StickyFloatingBar />
    </>
  );
}