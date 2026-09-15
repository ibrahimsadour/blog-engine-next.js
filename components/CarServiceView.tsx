import Link from 'next/link';
import Image from 'next/image';
import Breadcrumbs from '@/components/Breadcrumbs';
import { generateBreadcrumbSchema } from '@/lib/schema';
import { sanitizeContentHtml, serializeJsonLd } from '@/lib/security/content';

interface CarServiceViewProps {
  car: { id: string; name: string; slug: string };
  service: { id: string; name: string; slug: string; description: string | null };
  template: ServiceTemplate | null;
  otherCars: Array<{ id: string; name: string; slug: string }>;
  otherServices: Array<{ id: string; name: string; slug: string }>;
  phone: string;
  siteName: string;
  customContent?: { customTitle: string | null; customDescription: string | null } | null;
}

interface ServiceTemplate {
  titleTemplate: string; descTemplate: string; introTemplates?: string | null; outroTemplates?: string | null;
  faqTemplates?: string | null; neighborhoodTemplates?: string | null; testimonialTemplates?: string | null;
  imageTemplates?: string | null;
}

function parseCarTemplate(
  template: string,
  carName: string,
  serviceName: string,
  formattedPhone: string,
  siteName: string
): string {
  if (!template) return '';
  return template
    .replace(/{car}/gi, carName)
    .replace(/{service}/gi, serviceName)
    .replace(/{phone_number}/gi, formattedPhone)
    .replace(/{phone}/gi, formattedPhone)
    .replace(/{siteName}/g, siteName)
    .replace(/{site_name}/g, siteName);
}

function getStableItem(items: string[], seed: string): string {
  if (!items || items.length === 0) return '';
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return items[Math.abs(hash) % items.length];
}

function getStableMultiple<T>(items: T[], seed: string, count: number = 3): T[] {
  if (!items || items.length === 0) return [];
  const shuffled = [...items];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  let seedNum = Math.abs(hash);
  for (let i = shuffled.length - 1; i > 0; i--) {
    seedNum = (seedNum * 9301 + 49297) % 233280;
    const j = Math.floor((seedNum / 233280) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

export default function CarServiceView({
  car,
  service,
  template,
  otherCars,
  otherServices,
  phone,
  siteName,
  customContent,
}: CarServiceViewProps) {
  const seed = `car-${car.slug}-${service.slug}`;

  const titleList = template?.titleTemplate ? template.titleTemplate.split('---').map((s: string) => s.trim()).filter(Boolean) : [];
  const rawTitle = getStableItem(titleList, `title-${seed}`);
  const pageTitle = customContent?.customTitle
    ? parseCarTemplate(customContent.customTitle, car.name, service.name, phone, siteName)
    : rawTitle
    ? parseCarTemplate(rawTitle, car.name, service.name, phone, siteName)
    : `أفضل خدمات ${service.name} لسيارات ${car.name}`;

  const imageList = template?.imageTemplates ? template.imageTemplates.split('---').map((s: string) => s.trim()).filter(Boolean) : [];
  const rawImage = getStableItem(imageList, `image-${seed}`);
  const selectedImage = rawImage ? parseCarTemplate(rawImage, car.name, service.name, phone, siteName) : '';

  const coreDescription = customContent?.customDescription
    ? parseCarTemplate(customContent.customDescription, car.name, service.name, phone, siteName)
    : template?.descTemplate
    ? parseCarTemplate(template.descTemplate, car.name, service.name, phone, siteName)
    : service.description || `نقدم لك خدمات ${service.name} المعتمدة لسيارات ${car.name} بأحدث أجهزة الفحص وقطع الغيار الأصلية.`;

  const introList = template?.introTemplates ? template.introTemplates.split('---').map((s: string) => s.trim()).filter(Boolean) : [];
  const outroList = template?.outroTemplates ? template.outroTemplates.split('---').map((s: string) => s.trim()).filter(Boolean) : [];
  const neighborhoodList = template?.neighborhoodTemplates ? template.neighborhoodTemplates.split('---').map((s: string) => s.trim()).filter(Boolean) : [];

  const rawIntro = getStableItem(introList, `intro-${seed}`);
  const rawOutro = getStableItem(outroList, `outro-${seed}`);
  const rawNeighborhood = getStableItem(neighborhoodList, `neighborhood-${seed}`);

  const selectedIntro = rawIntro ? parseCarTemplate(rawIntro, car.name, service.name, phone, siteName) : '';
  const selectedOutro = rawOutro ? parseCarTemplate(rawOutro, car.name, service.name, phone, siteName) : '';
  const selectedNeighborhood = rawNeighborhood ? parseCarTemplate(rawNeighborhood, car.name, service.name, phone, siteName) : '';

  const allFaqs = template?.faqTemplates
    ? template.faqTemplates.split('---').map((block: string) => {
        const lines = block.trim().split('\n').map((l: string) => l.trim()).filter(Boolean);
        if (lines.length >= 2) {
          return {
            q: parseCarTemplate(lines[0], car.name, service.name, phone, siteName),
            a: parseCarTemplate(lines.slice(1).join(' '), car.name, service.name, phone, siteName),
          };
        }
        return null;
      }).filter(Boolean) as Array<{ q: string; a: string }>
    : [];

  const selectedFaqs = getStableMultiple(allFaqs, `faq-${seed}`, 3);

  const allTestimonials = template?.testimonialTemplates
    ? template.testimonialTemplates.split('---').map((block: string) => {
        const lines = block.trim().split('\n').map((l: string) => l.trim()).filter(Boolean);
        if (lines.length >= 2) {
          return {
            name: parseCarTemplate(lines[0], car.name, service.name, phone, siteName),
            comment: parseCarTemplate(lines.slice(1).join(' '), car.name, service.name, phone, siteName),
          };
        }
        return null;
      }).filter(Boolean) as Array<{ name: string; comment: string }>
    : [];

  const selectedTestimonials = getStableMultiple(allTestimonials, `testimonial-${seed}`, 2);

  const fullHtmlContent = sanitizeContentHtml(`
    ${selectedIntro ? `<div class="mb-6 text-lg font-medium">${selectedIntro}</div>` : ''}
    <div>${coreDescription}</div>
    ${selectedNeighborhood ? `<div class="my-6 p-4 bg-gray-50 rounded-lg border text-base text-gray-700">${selectedNeighborhood}</div>` : ''}
    ${selectedOutro ? `<div class="mt-6 text-lg font-medium">${selectedOutro}</div>` : ''}
  `);

  const breadcrumbItems = [
    { name: 'الرئيسية', url: '/' },
    { name: 'السيارات', url: '/cars' },
    { name: car.name, url: `/${car.slug}` },
    { name: `${service.name} ${car.name}`, url: `/${car.slug}/${service.slug}` },
  ];
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);

  const faqSchema = selectedFaqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": selectedFaqs.map((faq) => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": { "@type": "Answer", "text": faq.a },
    })),
  } : null;

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    "name": `${service.name} سيارات ${car.name}`,
    "provider": {
      "@type": "AutoRepair",
      "name": siteName || "أوتو كراج",
      ...(phone ? { "telephone": phone } : {}),
    },
    ...(selectedTestimonials.length > 0 ? {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": selectedTestimonials.length.toString(),
      },
      "review": selectedTestimonials.map((t) => ({
        "@type": "Review",
        "author": { "@type": "Person", "name": t.name },
        "reviewRating": { "@type": "Rating", "ratingValue": "5" },
        "reviewBody": t.comment,
      })),
    } : {}),
  };

  return (
    <main className="container mx-auto px-4 py-12 space-y-8" dir="rtl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqSchema) }} />
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(serviceSchema) }} />

      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        {selectedImage && (
          <div className="relative w-full h-[320px] md:h-[420px] mb-4 overflow-hidden rounded-xl border border-gray-200">
            <Image
              src={selectedImage}
              alt={`${service.name} سيارات ${car.name}`}
              fill
              sizes="(max-width: 768px) 100vw, 896px"
              className="object-cover"
              priority={true}
            />
          </div>
        )}

        <div className="pb-4 mb-2 border-b border-gray-100">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900">{pageTitle}</h1>
        <div className="text-gray-600 text-lg leading-relaxed prose max-w-none" dangerouslySetInnerHTML={{ __html: fullHtmlContent }} />
      </div>

      {selectedTestimonials.length > 0 && (
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xs space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">آراء وتقييمات ملاك سيارات {car.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedTestimonials.map((t, index) => (
              <div key={index} className="p-5 rounded-xl border border-gray-200 bg-gray-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900">{t.name}</span>
                  <span className="text-amber-500 font-bold text-sm">★★★★★</span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{t.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedFaqs.length > 0 && (
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xs space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">الأسئلة الشائعة حول {service.name} لسيارات {car.name}</h2>
          <div className="space-y-4">
            {selectedFaqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-100 pb-4 last:border-0">
                <h3 className="font-bold text-lg text-blue-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-8">
        {otherCars.length > 0 && (
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <h2 className="text-xl font-bold text-gray-900">خدمة {service.name} متوفرة أيضاً لماركات السيارات التالية</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {otherCars.map((c) => (
                <Link
                  key={c.id}
                  href={`/${c.slug}/${service.slug}`}
                  className="p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-700 transition text-center"
                >
                  {service.name} سيارات {c.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {otherServices.length > 0 && (
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <h2 className="text-xl font-bold text-gray-900">خدمات أخرى متوفرة لسيارات {car.name}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {otherServices.map((s) => (
                <Link
                  key={s.id}
                  href={`/${car.slug}/${s.slug}`}
                  className="p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-700 transition text-center"
                >
                  {s.name} {car.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="font-bold text-blue-900 text-lg">تحتاج خدمة {service.name} فوراً لسيارتك {car.name}؟</h3>
          <p className="text-blue-700 text-sm mt-1">متخصصون في صيانة {car.name} بأعلى معايير الجودة.</p>
        </div>
        {phone && (
          <a
            href={`tel:${phone}`}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition active:scale-95 whitespace-nowrap"
          >
            اتصال فوري: {phone}
          </a>
        )}
      </div>
    </main>
  );
}
