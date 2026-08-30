import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';

type Props = {
  params: Promise<{ slug: string; service: string }>;
};

function parseTemplate(template: string, cityName: string, serviceName: string): string {
  return template
    .replace(/{city}/g, cityName)
    .replace(/{service}/g, serviceName);
}

function getStableItem(items: string[], seed: string): string {
  if (!items || items.length === 0) return '';
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % items.length;
  return items[index];
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: citySlug, service: serviceSlug } = await params;

  const [city, service] = await Promise.all([
    db.city.findUnique({ where: { slug: citySlug, isActive: true } }),
    db.service.findUnique({ where: { slug: serviceSlug, isActive: true } }),
  ]);

  if (!city || !service) return {};

  const template = await db.globalServiceTemplate.findFirst();

  // بنك خيارات Meta Title
  const metaTitleList = template?.metaTitleTemplate 
    ? template.metaTitleTemplate.split('---').map(s => s.trim()).filter(Boolean) 
    : [];
  const rawMetaTitle = getStableItem(metaTitleList, `metatitle-${citySlug}-${serviceSlug}`);
  const metaTitle = rawMetaTitle 
    ? parseTemplate(rawMetaTitle, city.name, service.name)
    : `${service.metaTitle || service.name} في ${city.name}`;

  // بنك خيارات Meta Description
  const metaDescList = template?.metaDescTemplate 
    ? template.metaDescTemplate.split('---').map(s => s.trim()).filter(Boolean) 
    : [];
  const rawMetaDesc = getStableItem(metaDescList, `metadesc-${citySlug}-${serviceSlug}`);
  const metaDesc = rawMetaDesc
    ? parseTemplate(rawMetaDesc, city.name, service.name)
    : service.metaDesc || `أفضل خدمات ${service.name} في ${city.name}.`;

  return {
    title: metaTitle,
    description: metaDesc,
    keywords: `${service.keywords || ''}, ${city.keywords || ''}, ${service.name} ${city.name}`,
  };
}

export default async function CityServicePage({ params }: Props) {
  const { slug: citySlug, service: serviceSlug } = await params;

  const [city, service, otherCities, otherServices] = await Promise.all([
    db.city.findUnique({ where: { slug: citySlug, isActive: true } }),
    db.service.findUnique({ where: { slug: serviceSlug, isActive: true } }),
    db.city.findMany({ 
      where: { slug: { not: citySlug }, isActive: true }, 
      take: 8, 
      orderBy: { sortOrder: 'asc' } 
    }),
    db.service.findMany({ 
      where: { slug: { not: serviceSlug }, isActive: true }, 
      take: 8, 
      orderBy: { sortOrder: 'asc' } 
    }),
  ]);

  if (!city || !service) {
    notFound();
  }

  const template = await db.globalServiceTemplate.findFirst();

  // بنك خيارات العنوان الرئيسي (H1)
  const titleList = template?.titleTemplate 
    ? template.titleTemplate.split('---').map(s => s.trim()).filter(Boolean) 
    : [];
  const rawTitle = getStableItem(titleList, `title-${citySlug}-${serviceSlug}`);
  const pageTitle = rawTitle 
    ? parseTemplate(rawTitle, city.name, service.name) 
    : `أفضل خدمات ${service.name} في ${city.name}`;

  const coreDescription = template?.descTemplate 
    ? parseTemplate(template.descTemplate, city.name, service.name) 
    : service.description || `نقدم لك أفضل خدمات ${service.name} الاحترافية في ${city.name} بجودة عالية وضمان شامل.`;

  const introList = template?.introTemplates ? template.introTemplates.split('---').map(s => s.trim()).filter(Boolean) : [];
  const outroList = template?.outroTemplates ? template.outroTemplates.split('---').map(s => s.trim()).filter(Boolean) : [];
  const neighborhoodList = template?.neighborhoodTemplates ? template.neighborhoodTemplates.split('---').map(s => s.trim()).filter(Boolean) : [];

  const rawIntro = getStableItem(introList, `intro-${citySlug}-${serviceSlug}`);
  const rawOutro = getStableItem(outroList, `outro-${citySlug}-${serviceSlug}`);
  const rawNeighborhood = getStableItem(neighborhoodList, `neighborhood-${citySlug}-${serviceSlug}`);

  const selectedIntro = rawIntro ? parseTemplate(rawIntro, city.name, service.name) : '';
  const selectedOutro = rawOutro ? parseTemplate(rawOutro, city.name, service.name) : '';
  const selectedNeighborhood = rawNeighborhood ? parseTemplate(rawNeighborhood, city.name, service.name) : '';

  const allFaqs = template?.faqTemplates ? template.faqTemplates.split('---').map(block => {
    const lines = block.trim().split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length >= 2) {
      return { 
        q: parseTemplate(lines[0], city.name, service.name), 
        a: parseTemplate(lines.slice(1).join(' '), city.name, service.name) 
      };
    }
    return null;
  }).filter(Boolean) as Array<{q: string, a: string}> : [];

  const selectedFaqs = getStableMultiple(allFaqs, `faq-${citySlug}-${serviceSlug}`, 3);

  const allTestimonials = template?.testimonialTemplates ? template.testimonialTemplates.split('---').map(block => {
    const lines = block.trim().split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length >= 2) {
      return {
        name: parseTemplate(lines[0], city.name, service.name),
        comment: parseTemplate(lines.slice(1).join(' '), city.name, service.name)
      };
    }
    return null;
  }).filter(Boolean) as Array<{name: string, comment: string}> : [];

  const selectedTestimonials = getStableMultiple(allTestimonials, `testimonial-${citySlug}-${serviceSlug}`, 2);

  const fullHtmlContent = `
    ${selectedIntro ? `<div class="mb-6 text-lg font-medium">${selectedIntro}</div>` : ''}
    <div>${coreDescription}</div>
    ${selectedNeighborhood ? `<div class="my-6 p-4 bg-gray-50 rounded-lg border text-base text-gray-700">${selectedNeighborhood}</div>` : ''}
    ${selectedOutro ? `<div class="mt-6 text-lg font-medium">${selectedOutro}</div>` : ''}
  `;

  const faqSchema = selectedFaqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": selectedFaqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  } : null;

  const reviewSchema = selectedTestimonials.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": `${service.name} في ${city.name}`,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": selectedTestimonials.length.toString()
    },
    "review": selectedTestimonials.map(t => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": t.name
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5"
      },
      "reviewBody": t.comment
    }))
  } : null;

  return (
    <main className="container mx-auto px-4 py-12 space-y-8">
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      {reviewSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }}
        />
      )}

      <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-4">
        <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900">
          {pageTitle}
        </h1>
        <div 
          className="text-gray-600 text-lg leading-relaxed prose max-w-none"
          dangerouslySetInnerHTML={{ __html: fullHtmlContent }}
        />
      </div>

      {selectedTestimonials.length > 0 && (
        <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">آراء وتقييمات العملاء في {city.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedTestimonials.map((t, index) => (
              <div key={index} className="p-5 rounded-xl border bg-gray-50 space-y-2">
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
        <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">الأسئلة الشائعة حول {service.name} في {city.name}</h2>
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

      {/* الربط الداخلي الجغرافي والخدمي الذكي */}
      <div className="space-y-8">
        {otherCities.length > 0 && (
          <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-gray-900">
              خدمة {service.name} متوفرة أيضاً في المدن والمناطق التالية
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {otherCities.map((c) => (
                <Link
                  key={c.id}
                  href={`/${c.slug}/${service.slug}`}
                  className="p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-700 transition text-center"
                >
                  {service.name} في {c.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {otherServices.length > 0 && (
          <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-gray-900">
              خدمات أخرى متوفرة في {city.name}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {otherServices.map((s) => (
                <Link
                  key={s.id}
                  href={`/${city.slug}/${s.slug}`}
                  className="p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-700 transition text-center"
                >
                  {s.name} في {city.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl flex justify-between items-center">
        <div>
          <h3 className="font-bold text-blue-900 text-lg">تحتاج خدمة {service.name} فوراً في {city.name}؟</h3>
          <p className="text-blue-700 text-sm mt-1">فريقنا جاهز لخدمتك على مدار الساعة طوال أيام الأسبوع.</p>
        </div>
      </div>
    </main>
  );
}