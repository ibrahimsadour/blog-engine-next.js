import Link from 'next/link';
import { ArrowLeft, BookOpen, CalendarDays, Phone, MessageCircle } from 'lucide-react';
import ServiceIcon from '@/components/ServiceIcon';
import Image from 'next/image';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { getSiteSettings } from '@/lib/settings';
import CallToAction from '@/components/CallToAction';
import { sanitizeContentHtml, serializeJsonLd } from '@/lib/security/content';
import { getSiteUrl } from '@/lib/site-url';
import { isAutomotiveSite } from '@/lib/site-profile';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteUrl = getSiteUrl();

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
      images: [{ url: settings.heroBgImage || `${siteUrl}/images/og-default.jpg` }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [settings.heroBgImage || `${siteUrl}/images/og-default.jpg`],
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

  const siteUrl = getSiteUrl();
  const visibleCategories = categories.filter((category) => category._count.articles > 0);
  const cleanWhatsapp = settings.whatsappNumber.replace(/[^0-9]/g, '');

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
    '@type': isAutomotiveSite() ? 'AutoRepair' : 'HomeAndConstructionBusiness',
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
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(localBusinessSchema) }}
      />

      <main className="public-surface min-h-screen bg-slate-50">
        <section className="home-hero relative isolate overflow-hidden px-4 py-16 text-white sm:py-20 lg:py-24">
          {settings.heroBgImage && (
            <div className="absolute inset-0 -z-20">
              <Image
                src={settings.heroBgImage}
                alt=""
                fill
                priority
                sizes="100vw"
                className="object-cover"
                style={{ objectPosition: settings.heroBgPosition }}
              />
              <div
                className="absolute inset-0"
                style={{ backgroundColor: `rgba(3, 7, 18, ${settings.heroOverlayOpacity / 100})` }}
              />
            </div>
          )}
          <div className="home-hero-glow pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
          <div className="relative mx-auto max-w-4xl text-center">
            {settings.heroBadge && (
              <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold leading-relaxed text-blue-50 backdrop-blur-sm sm:text-sm">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sky-300" aria-hidden="true" />
                {settings.heroBadge}
              </span>
            )}
            <h1 className="mx-auto mt-6 max-w-4xl text-balance text-3xl font-extrabold leading-[1.55] sm:text-4xl lg:text-5xl lg:leading-[1.45]">
              {settings.heroTitle}
            </h1>
            {settings.heroSubtitle && (
              <p className="mx-auto mt-5 max-w-2xl whitespace-pre-line text-pretty text-sm leading-8 text-slate-200 sm:text-base sm:leading-8">
                {settings.heroSubtitle}
              </p>
            )}
            <div className="mx-auto mt-8 grid max-w-md grid-cols-1 gap-3 min-[360px]:grid-cols-2">
              <a href={`tel:${settings.phoneNumber}`} className="public-button bg-white text-blue-900 shadow-lg hover:bg-blue-50">
                <Phone size={18} aria-hidden="true" />
                اتصل بنا الآن
              </a>
              <a href={`https://wa.me/${cleanWhatsapp}`} target="_blank" rel="noopener noreferrer" className="public-button border border-white/25 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20">
                <MessageCircle size={19} aria-hidden="true" />
                محادثة واتساب
              </a>
            </div>
            {visibleCategories.length > 0 && (
              <a href="#service-categories" className="mt-8 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-blue-100 transition hover:text-white">
                تصفح أقسام الخدمات
                <ArrowLeft size={16} aria-hidden="true" />
              </a>
            )}
          </div>
        </section>

        <div className="mx-auto max-w-6xl space-y-14 px-4 py-10 sm:space-y-20 sm:py-16 md:px-8">
          {visibleCategories.length > 0 && (
            <section id="service-categories" className="scroll-mt-28">
              <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="public-eyebrow">تصفح حسب احتياجك</p>
                  <h2 className="public-section-title">أقسام الخدمات</h2>
                </div>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500">
                  {visibleCategories.length} أقسام
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visibleCategories.map((category) => (
                  <Link key={category.id} href={`/category/${category.slug}`} className="public-card group flex h-full flex-col p-6">
                    <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                      <ServiceIcon name={`${category.name} ${category.slug}`} />
                    </span>
                    <h3 className="text-lg font-bold leading-relaxed text-slate-900 group-hover:text-blue-700">{category.name}</h3>
                    {category.description && (
                      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-7 text-slate-500">{category.description}</p>
                    )}
                    <span className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs font-semibold text-blue-700">
                      <span>استعرض الخدمات · {category._count.articles} مقال</span>
                      <ArrowLeft size={17} className="transition-transform group-hover:-translate-x-1" aria-hidden="true" />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {settings.homeCustomContent && (
            <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-8 lg:p-10">
              <div className="public-prose prose prose-lg max-w-none text-slate-700 prose-headings:font-bold prose-headings:text-slate-900 prose-a:text-blue-700 hover:prose-a:underline"
                dangerouslySetInnerHTML={{ __html: sanitizeContentHtml(settings.homeCustomContent) }}
              />
            </section>
          )}

          {latestArticles.length > 0 && (
            <section>
              <div className="mb-7">
                <p className="public-eyebrow">معلومات تساعدك على الاختيار</p>
                <h2 className="public-section-title">أحدث المقالات والدلائل الفنية</h2>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {latestArticles.map((article) => (
                  <article key={article.id} className="public-card group flex h-full flex-col overflow-hidden">
                    <Link href={`/${article.slug}`} tabIndex={-1} aria-hidden="true" className="relative block aspect-video overflow-hidden bg-slate-100">
                      {article.featuredImage ? (
                        <Image src={article.featuredImage} alt="" fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 text-blue-300">
                          <BookOpen size={44} strokeWidth={1.25} />
                        </span>
                      )}
                    </Link>
                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                      <Link href={`/category/${article.category.slug}`} className="mb-3 w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100">
                        {article.category.name}
                      </Link>
                      <h3 className="line-clamp-2 text-lg font-bold leading-8 text-slate-900">
                        <Link href={`/${article.slug}`} className="hover:text-blue-700">{article.title}</Link>
                      </h3>
                      {article.excerpt && <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-500">{article.excerpt}</p>}
                      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
                        <span className="flex items-center gap-1.5 text-xs text-slate-500">
                          <CalendarDays size={14} aria-hidden="true" />
                          <time dateTime={(article.publishedAt || article.createdAt).toISOString()}>
                            {new Date(article.publishedAt || article.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </time>
                        </span>
                        <Link href={`/${article.slug}`} aria-label={`اقرأ: ${article.title}`} className="inline-flex items-center gap-1 rounded-lg py-2 text-xs font-bold text-blue-700">
                          اقرأ التفاصيل <ArrowLeft size={14} aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
          <CallToAction />
        </div>
      </main>
    </>
  );
}
