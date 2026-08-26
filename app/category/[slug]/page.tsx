import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';
import { generateBreadcrumbSchema } from '@/lib/schema';
import Breadcrumbs from '@/components/Breadcrumbs';

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).trim().toLowerCase();

  const category = await db.category.findFirst({
    where: {
      OR: [{ slug: decodedSlug }, { slug }],
    },
  });

  if (!category) {
    return {
      title: 'القسم غير موجود',
    };
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
  const url = `${siteUrl}/category/${category.slug}`;
  const title = category.metaTitle || `${category.name} | دليل الخدمات`;
  const description =
    category.metaDesc ||
    category.description ||
    `تصفح مقالات ودليل خدمات ${category.name} في الكويت على مدار الساعة بأفضل الأسعار.`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      locale: 'ar_KW',
      siteName: 'دليل الخدمات',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).trim().toLowerCase();

  const category = await db.category.findFirst({
    where: {
      OR: [{ slug: decodedSlug }, { slug }],
    },
    include: {
      articles: {
        where: { isPublished: true, noIndex: false },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!category) {
    notFound();
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
  const pageUrl = `${siteUrl}/category/${category.slug}`;

  const breadcrumbItems = [{ name: category.name, url: `/category/${category.slug}` }];
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);

  // سكيما صفحة التصنيف وقائمة المقالات بالروابط المباشرة
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.name,
    description: category.description || `أرشيف خدمات ومقالات قسم ${category.name}`,
    url: pageUrl,
    inLanguage: 'ar',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: category.articles.map((article, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        url: `${siteUrl}/${article.slug}`,
        name: article.title,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />

      <main className="min-h-screen bg-gray-50 px-4 py-10 md:px-8">
        <div className="mx-auto max-w-5xl">
          <Breadcrumbs items={breadcrumbItems} />

          <header className="my-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-xs md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-blue-600">تصنيف الخدمات والمقالات</span>
                <h1 className="mt-1 text-2xl font-black text-gray-900 md:text-3xl">{category.name}</h1>
              </div>
              <span className="rounded-xl bg-blue-50 px-3.5 py-1.5 text-xs font-bold text-blue-700">
                {category.articles.length} {category.articles.length === 1 ? 'مقال' : 'مقالات'}
              </span>
            </div>

            {category.description && (
              <p className="mt-4 border-t border-gray-100 pt-4 text-sm leading-relaxed text-gray-600 sm:text-base">
                {category.description}
              </p>
            )}
          </header>

          <section>
            {category.articles.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center text-sm font-medium text-gray-500">
                لا توجد مقالات منشورة في هذا القسم حالياً
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {category.articles.map((article) => (
                  <article
                    key={article.id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xs transition hover:-translate-y-1 hover:shadow-md"
                  >
                    {article.featuredImage && (
                      <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                        <Image
                          src={article.featuredImage}
                          alt={article.altText || article.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover transition duration-300 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-5">
                      <h2 className="line-clamp-2 text-base font-bold text-gray-900 group-hover:text-blue-600">
                        <Link href={`/${article.slug}`}>
                          {article.title}
                        </Link>
                      </h2>

                      {article.excerpt && (
                        <p className="mt-2.5 line-clamp-3 flex-1 text-xs leading-relaxed text-gray-600">
                          {article.excerpt}
                        </p>
                      )}

                      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-[11px] text-gray-400">
                        <time dateTime={article.createdAt.toISOString()}>
                          {new Date(article.createdAt).toLocaleDateString('ar-EG', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </time>
                        <Link
                          href={`/${article.slug}`}
                          className="font-bold text-blue-600 hover:text-blue-800"
                        >
                          اقرأ المزيد ←
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}