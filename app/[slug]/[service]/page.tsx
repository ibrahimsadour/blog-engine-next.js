import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import CityServiceView from '@/components/CityServiceView';
import CarServiceView from '@/components/CarServiceView';

type Props = {
  params: Promise<{ slug: string; service: string }>;
};

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
  try {
    const settings = await db.setting.findMany();
    const settingsMap = Object.fromEntries(
      settings.map((s) => [s.key.trim().toLowerCase(), s.value?.trim() || ''])
    );

    const rawPhone =
      settingsMap['phone_number'] ||
      settingsMap['phone'] ||
      settingsMap['site_phone'] ||
      settingsMap['contact_phone'] ||
      settingsMap['cta_phone'] ||
      settingsMap['mobile'] ||
      '';

    let phone = rawPhone.trim();
    if (phone && !phone.startsWith('+')) {
      phone = phone.startsWith('965') ? `+${phone}` : `+965${phone}`;
    }

    const siteName =
      settingsMap['site_name'] ||
      settingsMap['sitename'] ||
      settingsMap['title'] ||
      'أوتو كراج';

    return { phone, siteName };
  } catch {
    return { phone: '', siteName: 'أوتو كراج' };
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, service: serviceSlug } = await params;

  const [city, car, service] = await Promise.all([
    db.city.findUnique({ where: { slug, isActive: true } }),
    db.car.findUnique({ where: { slug, isActive: true } }),
    db.service.findUnique({ where: { slug: serviceSlug, isActive: true } }),
  ]);

  if ((!city && !car) || !service) return {};

  const isCar = Boolean(car);
  const targetName = isCar ? car!.name : city!.name;
  const { phone, siteName } = await getSiteConfig();
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://autogarag.net').replace(/\/$/, '');
  const canonicalUrl = `${baseUrl}/${slug}/${serviceSlug}`;

  // فحص المحتوى المخصص المدخل يدوياً أولاً
  const customContent = isCar
    ? await db.carServiceContent.findUnique({
        where: { carId_serviceId: { carId: car!.id, serviceId: service.id } },
      })
    : await db.cityServiceContent.findUnique({
        where: { cityId_serviceId: { cityId: city!.id, serviceId: service.id } },
      });

  const template = isCar
    ? await db.globalCarServiceTemplate.findFirst()
    : await db.globalServiceTemplate.findFirst();

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
  const { slug, service: serviceSlug } = await params;

  const [city, car, service] = await Promise.all([
    db.city.findUnique({ where: { slug, isActive: true } }),
    db.car.findUnique({ where: { slug, isActive: true } }),
    db.service.findUnique({ where: { slug: serviceSlug, isActive: true } }),
  ]);

  if ((!city && !car) || !service) {
    notFound();
  }

  const { phone, siteName } = await getSiteConfig();

  // معالجة صفحات المدن مع الخدمة
  if (city) {
    const [template, customContent, otherCities, otherServices] = await Promise.all([
      db.globalServiceTemplate.findFirst(),
      db.cityServiceContent.findUnique({
        where: { cityId_serviceId: { cityId: city.id, serviceId: service.id } },
        select: { customTitle: true, customDescription: true },
      }),
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
  const [template, customContent, otherCars, otherServices] = await Promise.all([
    db.globalCarServiceTemplate.findFirst(),
    db.carServiceContent.findUnique({
      where: { carId_serviceId: { carId: car!.id, serviceId: service.id } },
      select: { customTitle: true, customDescription: true },
    }),
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
