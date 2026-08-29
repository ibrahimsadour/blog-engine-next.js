'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

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
  const cityId = (formData.get('cityId') as string) || '';
  const serviceId = (formData.get('serviceId') as string) || '';
  const customTitle = (formData.get('customTitle') as string) || null;
  const customDescription = (formData.get('customDescription') as string) || null;
  const metaTitle = (formData.get('metaTitle') as string) || null;
  const metaDesc = (formData.get('metaDesc') as string) || null;

  if (!cityId || !serviceId) {
    throw new Error('الرجاء تحديد المدينة والخدمة');
  }

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
}

export async function saveGlobalServiceTemplateAction(formData: FormData) {
  const titleTemplate = (formData.get('titleTemplate') as string) || '';
  const descTemplate = (formData.get('descTemplate') as string) || '';
  const introTemplates = (formData.get('introTemplates') as string) || '';
  const outroTemplates = (formData.get('outroTemplates') as string) || '';
  const faqTemplates = (formData.get('faqTemplates') as string) || '';
  const neighborhoodTemplates = (formData.get('neighborhoodTemplates') as string) || '';
  const testimonialTemplates = (formData.get('testimonialTemplates') as string) || '';
  const metaTitleTemplate = (formData.get('metaTitleTemplate') as string) || null;
  const metaDescTemplate = (formData.get('metaDescTemplate') as string) || null;

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
}