import { buildSiteUrl, getSiteUrl } from '@/lib/site-url';

interface ServiceSchemaInput {
  name: string;
  serviceName: string;
  subjectName: string;
  subjectSlug: string;
  serviceSlug: string;
  siteName: string;
  phone?: string;
  kind: 'city' | 'car';
}

/** Describes what the page offers, without pretending that a service is a business. */
export function generateServicePageSchema(input: ServiceSchemaInput) {
  const baseUrl = getSiteUrl();
  const url = buildSiteUrl(input.subjectSlug, input.serviceSlug);
  const businessId = `${baseUrl}/#business`;
  const serviceId = `${url}#service`;
  const pageId = `${url}#webpage`;
  const business = {
    '@type': 'LocalBusiness',
    '@id': businessId,
    name: input.siteName,
    url: baseUrl,
    ...(input.phone && input.phone !== '+96500000000' ? { telephone: input.phone } : {}),
  };
  return {
    '@context': 'https://schema.org',
    '@graph': [
      business,
      {
        '@type': 'Service',
        '@id': serviceId,
        name: input.name,
        serviceType: input.serviceName,
        provider: { '@id': businessId },
        ...(input.kind === 'city' ? {
          areaServed: { '@type': 'AdministrativeArea', name: input.subjectName },
        } : {}),
      },
      {
        '@type': 'WebPage',
        '@id': pageId,
        name: input.name,
        url,
        inLanguage: 'ar',
        mainEntity: { '@id': serviceId },
      },
    ],
  };
}
