'use server';

import { db } from '@/lib/db';
import { requireAdminAction } from '@/lib/auth/authorization';
import { revalidatePath } from 'next/cache';
import { validateCustomServiceContent } from '@/lib/content-input';
import { sanitizeContentHtml } from '@/lib/security/content';

function sanitizeSlug(text: string): string {
  return (text || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0600-\u06FF\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function deleteArticleAction(id: string) {
  await requireAdminAction();

  try {
    await db.article.delete({
      where: { id },
    });

    revalidatePath('/admin');
    revalidatePath('/');
  } catch (error) {
    throw new Error('تعذر حذف المقال من قاعدة البيانات');
  }
}

export async function createArticleAction(formData: FormData) {
  await requireAdminAction();

  const title = (formData.get('title') as string) || '';
  const rawSlug = (formData.get('slug') as string) || '';
  const slug = sanitizeSlug(rawSlug);
  const categorySlug = (formData.get('categorySlug') as string) || '';
  const targetKeyword = (formData.get('targetKeyword') as string) || null;
  const targetArea = (formData.get('targetArea') as string) || null;
  const excerpt = (formData.get('excerpt') as string) || null;
  const content = formData.get('content') as string;
  const featuredImage = (formData.get('featuredImage') as string) || null;
  const altText = (formData.get('altText') as string) || null;
  const canonicalUrl = (formData.get('canonicalUrl') as string) || null;
  const metaTitle = (formData.get('metaTitle') as string) || null;
  const metaDesc = (formData.get('metaDesc') as string) || null;
  const faqsRaw = formData.get('faqs') as string;

  if (!slug) {
    throw new Error('الرابط الدائم (Slug) غير صالح');
  }

  let faqs = null;
  if (faqsRaw) {
    try {
      faqs = JSON.parse(faqsRaw);
    } catch {
      faqs = null;
    }
  }

  const category = await db.category.findUnique({
    where: { slug: categorySlug },
  });

  if (!category) {
    throw new Error('التصنيف المحدد غير موجود');
  }

  await db.article.create({
    data: {
      title,
      slug,
      content,
      excerpt,
      featuredImage,
      altText,
      canonicalUrl,
      targetKeyword,
      targetArea,
      metaTitle,
      metaDesc,
      faqs,
      categoryId: category.id,
      isPublished: true,
      publishedAt: new Date(),
    },
  });

  revalidatePath('/admin');
  revalidatePath('/');
  revalidatePath(`/category/${categorySlug}`);
}

export async function updateArticleAction(id: string, formData: FormData) {
  await requireAdminAction();

  const title = (formData.get('title') as string) || '';
  const rawSlug = (formData.get('slug') as string) || '';
  const slug = sanitizeSlug(rawSlug);
  const categorySlug = (formData.get('categorySlug') as string) || '';
  const targetKeyword = (formData.get('targetKeyword') as string) || null;
  const targetArea = (formData.get('targetArea') as string) || null;
  const excerpt = (formData.get('excerpt') as string) || null;
  const content = formData.get('content') as string;
  const featuredImage = (formData.get('featuredImage') as string) || null;
  const altText = (formData.get('altText') as string) || null;
  const canonicalUrl = (formData.get('canonicalUrl') as string) || null;
  const metaTitle = (formData.get('metaTitle') as string) || null;
  const metaDesc = (formData.get('metaDesc') as string) || null;
  const faqsRaw = formData.get('faqs') as string;

  if (!slug) {
    throw new Error('الرابط الدائم (Slug) غير صالح');
  }

  let faqs = null;
  if (faqsRaw) {
    try {
      faqs = JSON.parse(faqsRaw);
    } catch {
      faqs = null;
    }
  }

  const category = await db.category.findUnique({
    where: { slug: categorySlug },
  });

  if (!category) {
    throw new Error('التصنيف المحدد غير موجود');
  }

  await db.article.update({
    where: { id },
    data: {
      title,
      slug,
      content,
      excerpt,
      featuredImage,
      altText,
      canonicalUrl,
      targetKeyword,
      targetArea,
      metaTitle,
      metaDesc,
      faqs,
      categoryId: category.id,
    },
  });

  revalidatePath('/admin');
  revalidatePath('/');
  revalidatePath(`/blog/${slug}`);
  revalidatePath(`/category/${categorySlug}`);
}

export async function saveCityServiceContentAction(formData: FormData) {
  await requireAdminAction();

  const { ownerId: cityId, serviceId, customTitle, customDescription, metaTitle, metaDesc } =
    validateCustomServiceContent({ ownerId: formData.get('cityId'), serviceId: formData.get('serviceId'), customTitle: formData.get('customTitle'), customDescription: formData.get('customDescription'), metaTitle: formData.get('metaTitle'), metaDesc: formData.get('metaDesc') }, 'city');

  await db.cityServiceContent.upsert({
    where: {
      cityId_serviceId: { cityId, serviceId },
    },
    update: {
      customTitle,
      customDescription,
      metaTitle,
      metaDesc,
    },
    create: {
      cityId,
      serviceId,
      customTitle,
      customDescription,
      metaTitle,
      metaDesc,
    },
  });

  revalidatePath('/admin/city-services');
  revalidatePath('/city-service-sitemap.xml');
  const [city, service] = await Promise.all([
    db.city.findUnique({ where: { id: cityId }, select: { slug: true } }),
    db.service.findUnique({ where: { id: serviceId }, select: { slug: true } }),
  ]);
  if (city && service) revalidatePath(`/${city.slug}/${service.slug}`);
}

export async function saveGlobalServiceTemplateAction(formData: FormData) {
  await requireAdminAction();

  const titleTemplate = (formData.get('titleTemplate') as string) || '';
  const descTemplate = sanitizeContentHtml(formData.get('descTemplate'));
  const introTemplates = sanitizeContentHtml(formData.get('introTemplates'));
  const outroTemplates = sanitizeContentHtml(formData.get('outroTemplates'));
  const faqTemplates = (formData.get('faqTemplates') as string) || '';
  const neighborhoodTemplates = sanitizeContentHtml(formData.get('neighborhoodTemplates'));
  const testimonialTemplates = (formData.get('testimonialTemplates') as string) || '';
  const metaTitleTemplate = (formData.get('metaTitleTemplate') as string) || '';
  const metaDescTemplate = (formData.get('metaDescTemplate') as string) || '';
  const imageTemplates = (formData.get('imageTemplates') as string) || '';

  const existing = await db.globalServiceTemplate.findFirst();

  const payload = {
    titleTemplate,
    descTemplate,
    introTemplates,
    outroTemplates,
    faqTemplates,
    neighborhoodTemplates,
    testimonialTemplates,
    metaTitleTemplate,
    metaDescTemplate,
    imageTemplates,
  };

  if (existing) {
    await db.globalServiceTemplate.update({
      where: { id: existing.id },
      data: payload,
    });
  } else {
    await db.globalServiceTemplate.create({
      data: payload,
    });
  }

  revalidatePath('/admin/service-templates');
  revalidatePath('/city-service-sitemap.xml');
}
export async function saveCarServiceContentAction(formData: FormData) {
  await requireAdminAction();

  const { ownerId: carId, serviceId, customTitle, customDescription, metaTitle, metaDesc } =
    validateCustomServiceContent({ ownerId: formData.get('carId'), serviceId: formData.get('serviceId'), customTitle: formData.get('customTitle'), customDescription: formData.get('customDescription'), metaTitle: formData.get('metaTitle'), metaDesc: formData.get('metaDesc') }, 'car');

  await db.carServiceContent.upsert({
    where: {
      carId_serviceId: { carId, serviceId },
    },
    update: {
      customTitle,
      customDescription,
      metaTitle,
      metaDesc,
    },
    create: {
      carId,
      serviceId,
      customTitle,
      customDescription,
      metaTitle,
      metaDesc,
    },
  });

  revalidatePath('/admin/car-services');
  revalidatePath('/car-service-sitemap.xml');
  const [car, service] = await Promise.all([
    db.car.findUnique({ where: { id: carId }, select: { slug: true } }),
    db.service.findUnique({ where: { id: serviceId }, select: { slug: true } }),
  ]);
  if (car && service) revalidatePath(`/${car.slug}/${service.slug}`);
}

export async function saveGlobalCarServiceTemplateAction(formData: FormData) {
  await requireAdminAction();

  const titleTemplate = (formData.get('titleTemplate') as string) || '';
  const descTemplate = sanitizeContentHtml(formData.get('descTemplate'));
  const introTemplates = sanitizeContentHtml(formData.get('introTemplates'));
  const outroTemplates = sanitizeContentHtml(formData.get('outroTemplates'));
  const faqTemplates = (formData.get('faqTemplates') as string) || '';
  const neighborhoodTemplates = sanitizeContentHtml(formData.get('neighborhoodTemplates'));
  const testimonialTemplates = (formData.get('testimonialTemplates') as string) || '';
  const metaTitleTemplate = (formData.get('metaTitleTemplate') as string) || '';
  const metaDescTemplate = (formData.get('metaDescTemplate') as string) || '';
  const imageTemplates = (formData.get('imageTemplates') as string) || '';

  const existing = await db.globalCarServiceTemplate.findFirst();

  const payload = {
    titleTemplate,
    descTemplate,
    introTemplates,
    outroTemplates,
    faqTemplates,
    neighborhoodTemplates,
    testimonialTemplates,
    metaTitleTemplate,
    metaDescTemplate,
    imageTemplates,
  };

  if (existing) {
    await db.globalCarServiceTemplate.update({
      where: { id: existing.id },
      data: payload,
    });
  } else {
    await db.globalCarServiceTemplate.create({
      data: payload,
    });
  }

  revalidatePath('/admin/car-service-templates');
  revalidatePath('/car-service-sitemap.xml');
}
