import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { db } from '@/lib/db';
import {
  generateArticleSchema,
  generateFaqSchema,
  generateBreadcrumbSchema,
} from '@/lib/schema';
import { injectInternalLinks, InternalLinkRule } from '@/lib/internal-links';
import Breadcrumbs from '@/components/Breadcrumbs';
import TableOfContents from '@/components/TableOfContents';
import FaqSection from '@/components/FaqSection';
import CallToAction from '@/components/CallToAction';
import RelatedArticles from '@/components/RelatedArticles';
import StickyFloatingBar from '@/components/StickyFloatingBar';
import { isAdminAuthenticated } from '@/lib/auth/authorization';
import { sanitizeContentHtml, serializeJsonLd } from '@/lib/security/content';
import { buildSiteUrl, getSiteUrl, trustedCanonicalUrl } from '@/lib/site-url';
import { getSiteSettings } from '@/lib/settings';

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

function parseContentVariables(
  content: string, 
  phone: string = '', 
  siteName: string = ''
): string {
  if (!content) return '';
  return content
    .replace(/{phone_number}/gi, phone)
    .replace(/{phone}/gi, phone)
    .replace(/{siteName}/gi, siteName)
    .replace(/{site_name}/gi, siteName);
}

function slugifyHeading(text: string): string {
  return text
    .toString()
    .trim()
    .replace(/<[^>]*>/g, '')
    .replace(/[^\w\u0600-\u06FF\- ]+/g, '')
    .replace(/\s+/g, '-')
    .replace(/\-\-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function injectHeadingIds(html: string): {
  htmlWithIds: string;
  headings: { id: string; text: string; level: number }[];
} {
  const headings: { id: string; text: string; level: number }[] = [];

  const htmlWithIds = html.replace(
    /<h([2-3])([^>]*)>(.*?)<\/h\1>/gi,
    (match, level, attrs, innerHtml) => {
      const cleanText = innerHtml.replace(/<[^>]*>/g, '').trim();
      if (!cleanText) return match;

      const existingIdMatch = attrs.match(/id=["']([^"']+)["']/i);
      const id = existingIdMatch ? existingIdMatch[1] : slugifyHeading(cleanText);

      headings.push({
        id,
        text: cleanText,
        level: parseInt(level, 10),
      });

      if (existingIdMatch) {
        return match;
      }

      return `<h${level}${attrs} id="${id}">${innerHtml}</h${level}>`;
    }
  );

  return { htmlWithIds, headings };
}

async function getSiteConfig() {
  const settings = await getSiteSettings();
  return { phone: settings.phoneNumber, siteName: settings.siteName };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const rawSlug = slug.trim();
  const decodedSlug = decodeURIComponent(rawSlug).trim();
  const siteUrl = getSiteUrl();
  const { phone, siteName } = await getSiteConfig();

  // 1. التحقق من المدن
  const city = await db.city.findFirst({
    where: {
      OR: [{ slug: rawSlug }, { slug: decodedSlug }, { slug: decodedSlug.toLowerCase() }],
      isActive: true,
    },
  });

  if (city) {
    const title = parseContentVariables(city.metaTitle || `خدماتنا في ${city.name}`, phone, siteName);
    const description = parseContentVariables(city.metaDesc || `استعرض أفضل الخدمات المتوفرة لدينا في ${city.name}.`, phone, siteName);

    return {
      title,
      description,
      keywords: city.keywords || undefined,
      alternates: {
        canonical: buildSiteUrl(city.slug),
      },
    };
  }

  // 1.5. التحقق من السيارات
  const car = await db.car.findFirst({
    where: {
      OR: [{ slug: rawSlug }, { slug: decodedSlug }, { slug: decodedSlug.toLowerCase() }],
      isActive: true,
    },
  });

  if (car) {
    const title = parseContentVariables(car.metaTitle || `خدمات صيانة وإصلاح سيارات ${car.name}`, phone, siteName);
    const description = parseContentVariables(car.metaDesc || car.description || `استعرض جميع خدمات الصيانة والإصلاح المتوفرة لسيارات ${car.name}.`, phone, siteName);

    return {
      title,
      description,
      keywords: car.keywords || undefined,
      alternates: {
        canonical: buildSiteUrl(car.slug),
      },
      openGraph: {
        title,
        description,
        url: `${siteUrl}/${car.slug}`,
        type: 'website',
        ...(car.image ? { images: [{ url: car.image }] } : {}),
      },
    };
  }

  // 2. التحقق من المقالات
  const article = await db.article.findFirst({
    where: {
      OR: [{ slug: rawSlug }, { slug: decodedSlug }, { slug: decodedSlug.toLowerCase() }],
      isPublished: true,
    },
    include: { category: true },
  });

  if (article) {
    const url = buildSiteUrl(article.slug);
    const ogImageUrl = article.featuredImage
      ? article.featuredImage.startsWith('http')
        ? article.featuredImage
        : `${siteUrl}${article.featuredImage}`
      : `${siteUrl}/images/og-default.jpg`;

    const rawTitle = article.metaTitle || article.title;
    const rawDesc = article.metaDesc || article.excerpt || undefined;

    const title = parseContentVariables(rawTitle, phone, siteName);
    const description = rawDesc ? parseContentVariables(rawDesc, phone, siteName) : undefined;

    const keywordsValue =
      article.targetKeyword && article.targetKeyword.trim() ? article.targetKeyword.trim() : article.title;

    return {
      title,
      description,
      keywords: keywordsValue,
      alternates: {
        canonical: trustedCanonicalUrl(article.canonicalUrl, `/${article.slug}`),
      },
      robots: {
        index: !article.noIndex,
        follow: !article.noFollow,
        googleBot: {
          index: !article.noIndex,
          follow: !article.noFollow,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      openGraph: {
        title,
        description,
        url,
        type: 'article',
        locale: 'ar_KW',
        publishedTime: (article.publishedAt || article.createdAt).toISOString(),
        modifiedTime: article.updatedAt.toISOString(),
        section: article.category?.name || 'خدمات',
        images: [{ url: ogImageUrl }],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImageUrl],
      },
    };
  }

  // 3. التحقق من الصفحات الثابتة
  const page = await db.page.findFirst({
    where: {
      OR: [{ slug: rawSlug }, { slug: decodedSlug }, { slug: decodedSlug.toLowerCase() }],
    },
  });

  if (page && page.isPublished) {
    const title = parseContentVariables(page.metaTitle || page.title, phone, siteName);
    const description = page.metaDesc ? parseContentVariables(page.metaDesc, phone, siteName) : undefined;

    return {
      title,
      description,
      alternates: {
        canonical: buildSiteUrl(page.slug),
      },
      robots: {
        index: !page.noIndex,
        follow: !page.noFollow,
      },
    };
  }

  return {
    title: 'الصفحة غير موجودة',
  };
}

export default async function DynamicSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const rawSlug = slug.trim();
  const decodedSlug = decodeURIComponent(rawSlug).trim();

  const isAdmin = await isAdminAuthenticated();

  const { phone, siteName } = await getSiteConfig();

  // 1. فحص ما إذا كان الـ slug يعود لمدينة (City)
  const city = await db.city.findFirst({
    where: {
      OR: [{ slug: rawSlug }, { slug: decodedSlug }, { slug: decodedSlug.toLowerCase() }],
      isActive: true,
    },
  });

  if (city) {
    const services = await db.service.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    const breadcrumbItems = [
      { name: 'الرئيسية', url: '/' },
      { name: 'المدن', url: '/cities' },
      { name: city.name, url: `/${city.slug}` },
    ];
    const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }}
        />
        <main className="min-h-screen bg-gray-50 px-4 py-10 pb-24 md:px-8 md:pb-12">
          <div className="mx-auto max-w-4xl space-y-8">
            <Breadcrumbs items={breadcrumbItems} />

            <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-4">
              <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900">
                خدماتنا في مدينة {city.name}
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed">
                {parseContentVariables(city.description || `نقدم لك أفضل الخدمات الاحترافية في ${city.name} بجودة عالية وضمان شامل.`, phone, siteName)}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.map((service) => (
                <Link
                  key={service.id}
                  href={`/${city.slug}/${service.slug}`}
                  className="bg-white p-6 rounded-xl border shadow-sm hover:border-blue-500 hover:shadow-md transition block space-y-2"
                >
                  <h3 className="text-xl font-bold text-gray-900">
                    {service.name} {city.name}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {parseContentVariables(service.description || `أفضل خدمات ${service.name} في ${city.name} بجودة عالية.`, phone, siteName)}
                  </p>
                  <span className="inline-block text-blue-600 text-sm font-bold pt-2">عرض التفاصيل ←</span>
                </Link>
              ))}
            </div>

            {services.length === 0 && (
              <div className="bg-white p-8 rounded-xl text-center text-gray-500">
                لا توجد خدمات متاحة حالياً في هذه المدينة.
              </div>
            )}
          </div>
        </main>
        <StickyFloatingBar />
      </>
    );
  }

  // 1.5. فحص ما إذا كان الـ slug يعود لسيارة (Car)
  const car = await db.car.findFirst({
    where: {
      OR: [{ slug: rawSlug }, { slug: decodedSlug }, { slug: decodedSlug.toLowerCase() }],
      isActive: true,
    },
  });

  if (car) {
    const services = await db.service.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    const breadcrumbItems = [
      { name: 'الرئيسية', url: '/' },
      { name: 'السيارات', url: '/cars' },
      { name: car.name, url: `/${car.slug}` },
    ];
    const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }}
        />
        <main className="min-h-screen bg-gray-50 px-4 py-10 pb-24 md:px-8 md:pb-12" dir="rtl">
          <div className="mx-auto max-w-4xl space-y-8">
            <Breadcrumbs items={breadcrumbItems} />

            <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-4">
              <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900">
                خدمات صيانة وإصلاح سيارات {car.name}
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed">
                {parseContentVariables(car.description || `نقدم لك أفضل خدمات الصيانة والإصلاح لسيارات ${car.name} بجودة عالية وضمان شامل.`, phone, siteName)}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.map((service) => (
                <Link
                  key={service.id}
                  href={`/${car.slug}/${service.slug}`}
                  className="bg-white p-6 rounded-xl border shadow-sm hover:border-blue-500 hover:shadow-md transition block space-y-2"
                >
                  <h3 className="text-xl font-bold text-gray-900">
                    {service.name} {car.name}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {parseContentVariables(service.description || `أفضل خدمات ${service.name} لسيارات ${car.name} بجودة عالية.`, phone, siteName)}
                  </p>
                  <span className="inline-block text-blue-600 text-sm font-bold pt-2">عرض التفاصيل والطلب ←</span>
                </Link>
              ))}
            </div>

            {services.length === 0 && (
              <div className="bg-white p-8 rounded-xl text-center text-gray-500">
                لا توجد خدمات متاحة حالياً لهذه السيارة.
              </div>
            )}
          </div>
        </main>
        <StickyFloatingBar />
      </>
    );
  }

  // 2. فحص ما إذا كان الـ slug يعود لمقال (Article)
  const article = await db.article.findFirst({
    where: {
      OR: [{ slug: rawSlug }, { slug: decodedSlug }, { slug: decodedSlug.toLowerCase() }],
      ...(isAdmin ? {} : { isPublished: true }),
    },
    include: { category: true, author: true },
  });

  if (article) {
    const otherArticles = await db.article.findMany({
      where: {
        id: { not: article.id },
        isPublished: true,
        noIndex: false,
      },
      select: {
        title: true,
        slug: true,
        targetKeyword: true,
      },
      take: 50,
    });

    const internalLinkRules: InternalLinkRule[] = [];
    otherArticles.forEach((item) => {
      if (item.targetKeyword && item.targetKeyword.trim()) {
        internalLinkRules.push({
          keyword: item.targetKeyword.trim(),
          url: `/${item.slug}`,
          maxReplacements: 1,
        });
      } else if (item.title && item.title.trim()) {
        internalLinkRules.push({
          keyword: item.title.trim(),
          url: `/${item.slug}`,
          maxReplacements: 1,
        });
      }
    });

    const relatedArticles = await db.article.findMany({
      where: {
        id: { not: article.id },
        isPublished: true,
        noIndex: false,
        OR: [
          { categoryId: article.categoryId },
          ...(article.targetArea ? [{ targetArea: article.targetArea }] : []),
        ],
      },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });

    const pageUrl = buildSiteUrl(article.slug);

    const parsedTitle = parseContentVariables(article.title, phone, siteName);
    const parsedExcerpt = article.excerpt ? parseContentVariables(article.excerpt, phone, siteName) : '';
    const parsedMetaDesc = article.metaDesc ? parseContentVariables(article.metaDesc, phone, siteName) : undefined;
    const parsedContent = sanitizeContentHtml(parseContentVariables(article.content, phone, siteName));

    const articleSchema = generateArticleSchema(
      {
        title: parsedTitle,
        excerpt: parsedExcerpt,
        metaDescription: parsedMetaDesc,
        featuredImage: article.featuredImage,
        createdAt: article.createdAt,
        publishedAt: article.publishedAt,
        updatedAt: article.updatedAt,
        author: article.author ? { name: article.author.name } : null,
      },
      pageUrl
    );

    const breadcrumbItems = [
      ...(article.category ? [{ name: article.category.name, url: `/category/${article.category.slug}` }] : []),
      { name: parsedTitle, url: `/${article.slug}` },
    ];
    const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);

    const rawFaqs = (article.faqs as unknown as Array<{ question: string; answer: string }>) || [];
    const faqs = rawFaqs.map((f) => ({
      question: parseContentVariables(f.question, phone, siteName),
      answer: parseContentVariables(f.answer, phone, siteName),
    }));
    const faqSchema = faqs.length > 0 ? generateFaqSchema(faqs) : null;

    const { htmlWithIds, headings } = injectHeadingIds(parsedContent);
    const processedContent = sanitizeContentHtml(injectInternalLinks(htmlWithIds, internalLinkRules, `/${article.slug}`));

    return (
      <>
        {article.isPublished && !article.noIndex && (
          <>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleSchema) }}
            />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }}
            />
            {faqSchema && (
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqSchema) }}
              />
            )}
          </>
        )}

        <main className="min-h-screen bg-gray-50 px-4 py-10 pb-24 md:px-8 md:pb-12">
          <article className="relative mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow-sm md:p-10">
            {isAdmin && (!article.isPublished || article.noIndex || article.noFollow) && (
              <div className="mb-6 flex flex-wrap gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <span className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  تنبيهات المسؤول:
                </span>
                {!article.isPublished && (
                  <span className="rounded bg-red-100 px-2.5 py-0.5 text-[11px] font-bold text-red-700">هذا المقال (مسودة) وغير ظاهر للزوار</span>
                )}
                {article.noIndex && (
                  <span className="rounded bg-orange-100 px-2.5 py-0.5 text-[11px] font-bold text-orange-700">noindex (غير مفهرس)</span>
                )}
                {article.noFollow && (
                  <span className="rounded bg-orange-100 px-2.5 py-0.5 text-[11px] font-bold text-orange-700">nofollow</span>
                )}
              </div>
            )}

            <Breadcrumbs items={breadcrumbItems} />

            <header className="my-6 border-b border-gray-100 pb-6">
              <h1 className="text-2xl font-extrabold text-gray-900 md:text-4xl md:leading-tight">
                {parsedTitle}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                {article.author && <span>الكاتب: {article.author.name}</span>}
                {article.category && (
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {article.category.name}
                  </span>
                )}
                <time dateTime={(article.publishedAt || article.createdAt).toISOString()}>
                  {new Date(article.publishedAt || article.createdAt).toLocaleDateString('ar-EG', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </div>
            </header>

            {article.featuredImage && (
              <div className="relative mb-8 h-72 w-full overflow-hidden rounded-xl md:h-96">
                <Image
                  src={article.featuredImage}
                  alt={article.altText || parsedTitle}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 896px"
                  className="object-cover"
                />
              </div>
            )}

            {headings.length > 0 && <TableOfContents headings={headings} />}

            <div
              className="prose prose-lg max-w-none leading-relaxed text-gray-800 prose-headings:scroll-mt-24 prose-headings:font-bold prose-h2:text-2xl prose-h3:text-xl"
              dangerouslySetInnerHTML={{ __html: processedContent }}
            />

            <CallToAction />

            {faqs.length > 0 && <FaqSection faqs={faqs} />}

            {relatedArticles.length > 0 && (
              <RelatedArticles articles={relatedArticles} />
            )}
          </article>
        </main>
        <StickyFloatingBar />
      </>
    );
  }

  // 3. فحص ما إذا كان الـ slug يعود لصفحة ثابتة (Page)
  const page = await db.page.findFirst({
    where: {
      OR: [{ slug: rawSlug }, { slug: decodedSlug }, { slug: decodedSlug.toLowerCase() }],
      ...(isAdmin ? {} : { isPublished: true }),
    },
  });

  if (page) {
    const parsedPageTitle = parseContentVariables(page.title, phone, siteName);
    const parsedPageContent = sanitizeContentHtml(parseContentVariables(page.content, phone, siteName));

    const breadcrumbs = [
      { name: 'الرئيسية', url: '/' },
      { name: parsedPageTitle, url: `/${page.slug}` },
    ];

    return (
      <>
        <main className="min-h-screen bg-gray-50 px-4 py-10 pb-24 md:px-8 md:pb-12">
          <article className="mx-auto max-w-4xl rounded-2xl border border-gray-100 bg-white p-6 shadow-xs md:p-10">
            <Breadcrumbs items={breadcrumbs} />

            <header className="my-6 border-b border-gray-100 pb-6">
              <h1 className="text-2xl font-black text-gray-900 md:text-4xl md:leading-tight">
                {parsedPageTitle}
              </h1>
              <div className="mt-3 flex items-center gap-2 text-xs font-medium text-gray-400">
                <span>آخر تحديث:</span>
                <time dateTime={page.updatedAt.toISOString()}>
                  {new Date(page.updatedAt).toLocaleDateString('ar-EG', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </div>
            </header>

            <div
              className="prose prose-lg max-w-none text-gray-800 prose-headings:font-bold prose-headings:text-gray-900 prose-p:leading-relaxed prose-a:text-blue-600 hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: parsedPageContent }}
            />
          </article>
        </main>
        <StickyFloatingBar />
      </>
    );
  }

  notFound();
}
