import { Metadata } from 'next';
import { siteConfig } from './site-config';

interface SeoProps {
  title?: string;
  description?: string;
  slug?: string;
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  noIndex?: boolean;
}

export function constructMetadata({
  title,
  description = siteConfig.description,
  slug = '',
  image = siteConfig.ogImage,
  type = 'website',
  publishedTime,
  modifiedTime,
  noIndex = false,
}: SeoProps = {}): Metadata {
  const pageTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name;
  const pageUrl = slug ? `${siteConfig.url}/${slug.replace(/^\//, '')}` : siteConfig.url;
  const ogImageUrl = image.startsWith('http') ? image : `${siteConfig.url}${image}`;

  return {
    title: pageTitle,
    description: description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: pageTitle,
      description: description,
      url: pageUrl,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: type,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title || siteConfig.name,
        },
      ],
      ...(type === 'article' && {
        publishedTime,
        modifiedTime,
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: description,
      images: [ogImageUrl],
      creator: siteConfig.twitterHandle,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}