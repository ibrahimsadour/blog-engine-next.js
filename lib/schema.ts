import { siteConfig } from './site-config';
import { getSiteUrl, trustedCanonicalUrl } from './site-url';

interface ArticleData {
  title: string;
  excerpt?: string | null;
  metaDescription?: string | null;
  featuredImage?: string | null;
  createdAt: Date;
  publishedAt?: Date | null;
  updatedAt: Date;
  author?: {
    name: string;
  } | null;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

// 1. Article / BlogPosting Schema
export function generateArticleSchema(article: ArticleData, url: string) {
  const baseUrl = getSiteUrl();
  
  let imageUrl = `${baseUrl}${siteConfig.ogImage}`;
  if (article.featuredImage) {
    imageUrl = article.featuredImage.startsWith('http')
      ? article.featuredImage
      : `${baseUrl}${article.featuredImage}`;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.metaDescription || article.excerpt || article.title,
    image: [imageUrl],
    inLanguage: 'ar',
    datePublished: (article.publishedAt || article.createdAt).toISOString(),
    dateModified: article.updatedAt.toISOString(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': trustedCanonicalUrl(url, '/'),
    },
    author: {
      '@type': 'Person',
      name: article.author?.name || siteConfig.author || 'فريق التحرير',
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
  };
}

// 2. FAQ Schema
export function generateFaqSchema(faqs: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

// 3. Breadcrumb Schema
export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  const baseUrl = getSiteUrl();

  const itemListElement = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'الرئيسية',
      item: baseUrl,
    },
    ...items.map((item, index) => {
      const targetUrl = trustedCanonicalUrl(item.url, '/');

      return {
        '@type': 'ListItem',
        position: index + 2,
        name: item.name,
        item: encodeURI(targetUrl),
      };
    }),
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement,
  };
}
