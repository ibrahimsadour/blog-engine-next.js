import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import CityServiceView from '@/components/CityServiceView';
import CarServiceView from '@/components/CarServiceView';
import { buildSiteUrl } from '@/lib/site-url';
import { cache } from 'react';
import { getSiteSettings } from '@/lib/settings';
import { isAutomotiveSite, isDynamicContentEnabled } from '@/lib/site-profile';

type Props = {
  params: Promise<{ slug: string; service: string }>;
};

const getServiceRouteData = cache(async (slug: string, serviceSlug: string) => {
  if (!isDynamicContentEnabled()) return { city: null, car: null, service: null, customContent: null, template: null };
  const [city, car, service] = await Promise.all([
    db.city.findUnique({ where: { slug, isActive: true } }),
    isAutomotiveSite()
      ? db.car.findUnique({ where: { slug, isActive: true } })
      : Promise.resolve(null),
    db.service.findUnique({ where: { slug: serviceSlug, isActive: true } }),
  ]);
  if ((!city && !car) || !service) return { city, car, service, customContent: null, template: null };
  const [customContent, template] = car
    ? await Promise.all([
        db.carServiceContent.findUnique({ where: { carId_serviceId: { carId: car.id, serviceId: service.id } } }),
        db.globalCarServiceTemplate.findFirst(),
      ])
    : await Promise.all([
        db.cityServiceContent.findUnique({ where: { cityId_serviceId: { cityId: city!.id, serviceId: service.id } } }),
        db.globalServiceTemplate.findFirst(),
      ]);
  return { city, car, service, customContent, template };
});

function parseTemplate(
  template: string,
  targetName: string,
  serviceName: string,
  formattedPhone: string = '',
  siteName: string = ''
): string {
  if (!template) return '';
  return template
    .replace(/{city}|{car}/gi, targetName)
    .replace(/{service}/gi, serviceName)
    .replace(/{phone_number}|{phone}/gi, formattedPhone)
    .replace(/{siteName}|{site_name}/gi, siteName);
}

function getStableItem(items: string[], seed: string): string {
  if (!items || items.length === 0) return '';
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return items[Math.abs(hash) % items.length];
}

function generateLocalizedKeywords(
  service: { name: string; keywords?: string | null },
  targetName: string,
  limit: number = 8
): string {
  const result: string[] = [];
  const sName = service.name.trim();

  result.push(`${sName} ${targetName}`);
  result.push(`${sName} في ${targetName}`);
  result.push(`افضل ${sName} ${targetName}`);
  result.push(`ارخص ${sName} ${targetName}`);
  result.push(`خدمة ${sName} ${targetName}`);
  result.push(`تصليح ${sName} ${targetName}`);

  if (service.keywords) {
    const rawList = service.keywords
      .split(/[,،\n]/)
      .map((k) => k.trim())
      .filter(Boolean);

    for (const kw of rawList) {
      if (kw.includes('الكويت')) {
        result.push(kw.replace(/الكويت/g, targetName));
      } else if (!kw.includes(targetName)) {
        result.push(`${kw} ${targetName}`);
      } else {
        result.push(kw);
      }
    }
  }

  result.push(`${sName} الكويت`);
  return Array.from(new Set(result)).filter(Boolean).slice(0, limit).join('، ');
}

async function getSiteConfig() {
  const settings = await getSiteSettings();
  let phone = settings.phoneNumber.trim();
  if (phone && !phone.startsWith('+')) phone = phone.startsWith('965') ? `+${phone}` : `+965${phone}`;
  return { phone, siteName: settings.siteName };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isDynamicContentEnabled()) notFound();
  const { slug, service: serviceSlug } = await params;

  const { city, car, service, customContent, template } = await getServiceRouteData(slug, serviceSlug);

  if ((!city && !car) || !service) return {};

  const isCar = Boolean(car);
  const targetName = isCar ? car!.name : city!.name;
  const { phone, siteName } = await getSiteConfig();
  const canonicalUrl = buildSiteUrl(slug, serviceSlug);

  // فحص المحتوى المخصص المدخل يدوياً أولاً
  const seed = `${isCar ? 'car' : 'city'}-${slug}-${serviceSlug}`;

  // Meta Title
  let metaTitle = '';
  if (customContent?.metaTitle) {
    metaTitle = parseTemplate(customContent.metaTitle, targetName, service.name, phone, siteName);
  } else {
    const metaTitleList = template?.metaTitleTemplate
      ? template.metaTitleTemplate.split('---').map((s) => s.trim()).filter(Boolean)
      : [];
    const rawMetaTitle = getStableItem(metaTitleList, `metatitle-${seed}`);
    const fallbackTitle = isCar
      ? `{service} لسيارات {car} | صيانة وفحص`
      : `{service} في {city} | خدمة فورية`;
    metaTitle = parseTemplate(rawMetaTitle || fallbackTitle, targetName, service.name, phone, siteName);
  }

  // Meta Description
  let metaDesc = '';
  if (customContent?.metaDesc) {
    metaDesc = parseTemplate(customContent.metaDesc, targetName, service.name, phone, siteName);
  } else {
    const metaDescList = template?.metaDescTemplate
      ? template.metaDescTemplate.split('---').map((s) => s.trim()).filter(Boolean)
      : [];
    const rawMetaDesc = getStableItem(metaDescList, `metadesc-${seed}`);
    const fallbackDesc = isCar
      ? `أفضل خدمات {service} لسيارات {car} مع الضمان.`
      : `أفضل خدمات {service} في {city} على مدار الساعة.`;
    metaDesc = parseTemplate(rawMetaDesc || fallbackDesc, targetName, service.name, phone, siteName);
  }

  // Meta Image
  const imageList = template?.imageTemplates
    ? template.imageTemplates.split('---').map((s) => s.trim()).filter(Boolean)
    : [];
  const rawImage = getStableItem(imageList, `image-${seed}`);
  const selectedImage = rawImage
    ? parseTemplate(rawImage, targetName, service.name, phone, siteName)
    : '';

  const dynamicKeywords = generateLocalizedKeywords(service, targetName, 8);

  return {
    title: metaTitle,
    description: metaDesc,
    keywords: dynamicKeywords,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: metaTitle,
      description: metaDesc,
      url: canonicalUrl,
      type: 'article',
      ...(selectedImage ? { images: [{ url: selectedImage }] } : {}),
    },
  };
}

export default async function DynamicServiceCityOrCarPage({ params }: Props) {
  if (!isDynamicContentEnabled()) notFound();
  const { slug, service: serviceSlug } = await params;

  const { city, car, service, customContent, template } = await getServiceRouteData(slug, serviceSlug);

  if ((!city && !car) || !service) {
    notFound();
  }

  const { phone, siteName } = await getSiteConfig();

  // معالجة صفحات المدن مع الخدمة
  if (city) {
    const [otherCities, otherServices] = await Promise.all([
      db.city.findMany({
        where: { slug: { not: city.slug }, isActive: true },
        take: 8,
        orderBy: { sortOrder: 'asc' },
      }),
      db.service.findMany({
        where: { slug: { not: service.slug }, isActive: true },
        take: 8,
        orderBy: { sortOrder: 'asc' },
      }),
    ]);

    return (
      <CityServiceView
        city={city}
        service={service}
        template={template}
        otherCities={otherCities}
        otherServices={otherServices}
        phone={phone}
        siteName={siteName}
        customContent={customContent}
      />
    );
  }

  // معالجة صفحات السيارات مع الخدمة
  const [otherCars, otherServices] = await Promise.all([
    db.car.findMany({
      where: { slug: { not: car!.slug }, isActive: true },
      take: 8,
      orderBy: { sortOrder: 'asc' },
    }),
    db.service.findMany({
      where: { slug: { not: service.slug }, isActive: true },
      take: 8,
      orderBy: { sortOrder: 'asc' },
    }),
  ]);

  return (
    <CarServiceView
      car={car!}
      service={service}
      template={template}
      otherCars={otherCars}
      otherServices={otherServices}
      phone={phone}
      siteName={siteName}
      customContent={customContent}
    />
  );
}
