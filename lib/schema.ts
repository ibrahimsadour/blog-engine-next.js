import { siteConfig } from './site-config';

interface ArticleData {
  title: string;
  excerpt?: string | null;
  metaDescription?: string | null;
  featuredImage?: string | null;
  createdAt: Date;
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

interface LocalBusinessData {
  name: string;
  description?: string;
  telephone?: string;
  areaServed?: string;
  url?: string;
}

// 1. Article / BlogPosting Schema
export function generateArticleSchema(article: ArticleData, url: string) {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url || 'http://localhost:3000').replace(/\/$/, '');
  
  let imageUrl = siteConfig.ogImage;
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
    datePublished: article.createdAt.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
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
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url || 'http://localhost:3000').replace(/\/$/, '');

  const itemListElement = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'الرئيسية',
      item: baseUrl,
    },
    ...items.map((item, index) => {
      const targetUrl = item.url.startsWith('http')
        ? item.url
        : `${baseUrl}${item.url.startsWith('/') ? item.url : `/${item.url}`}`;

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

// 4. Local Business Schema (لتعزيز السيو المحلي)
export function generateLocalBusinessSchema(data: LocalBusinessData) {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url || 'http://localhost:3000').replace(/\/$/, '');

  return {
    '@context': 'https://schema.org',
    '@type': 'AutoRepair',
    name: data.name || siteConfig.name,
    description: data.description || siteConfig.description,
    url: data.url || baseUrl,
    telephone: data.telephone || '',
    areaServed: {
      '@type': 'AdministrativeArea',
      name: data.areaServed || 'الكويت',
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'KW',
      addressRegion: data.areaServed || 'الكويت',
    },
    priceRange: '$$',
  };
}