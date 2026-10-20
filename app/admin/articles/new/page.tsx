import { getSiteUrl } from '@/lib/site-url';
import { db } from '@/lib/db';
import { requireAdminAction } from '@/lib/auth/authorization';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import ArticleForm from '@/components/ArticleForm';

export const dynamic = 'force-dynamic';

export default async function NewArticlePage() {
  const categories = await db.category.findMany({
    orderBy: { name: 'asc' },
  });

  async function createArticleAction(formData: FormData) {
    'use server';
    await requireAdminAction();

    const title = (formData.get('title') as string)?.trim();
    let slug = (formData.get('slug') as string)?.trim();
    const categorySlug = (formData.get('categorySlug') as string)?.trim();
    const targetKeyword = (formData.get('targetKeyword') as string)?.trim();
    const targetArea = (formData.get('targetArea') as string)?.trim();
    const excerpt = (formData.get('excerpt') as string)?.trim();
    const content = (formData.get('content') as string)?.trim();
    const metaTitle = (formData.get('metaTitle') as string)?.trim();
    const metaDesc = (formData.get('metaDesc') as string)?.trim();
    const canonicalUrl = (formData.get('canonicalUrl') as string)?.trim();
    const featuredImage = (formData.get('featuredImage') as string)?.trim();
    const altText = (formData.get('altText') as string)?.trim();

    // استقبال حالة النشر وتوجيهات الروبوتس
    const isPublished = formData.get('isPublished') === 'true';
    const noIndex = formData.get('noIndex') === 'true';
    const noFollow = formData.get('noFollow') === 'true';

    // معالجة الأسئلة الشائعة
    let faqs: { question: string; answer: string }[] = [];
    try {
      const rawFaqs = formData.get('faqs') as string;
      if (rawFaqs) {
        faqs = JSON.parse(rawFaqs);
      }
    } catch {
      faqs = [];
    }

    if (!title || !categorySlug || !content) {
      throw new Error('يرجى ملء جميع الحقول الإجبارية');
    }

    if (!slug) {
      slug = title
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\u0621-\u064A-]+/g, '');
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
        targetKeyword: targetKeyword || null,
        targetArea: targetArea || 'الكويت',
        excerpt: excerpt || null,
        content,
        featuredImage: featuredImage || null,
        altText: altText || null,
        metaTitle: metaTitle || title,
        metaDesc: metaDesc || excerpt || null,
        canonicalUrl: canonicalUrl || null,
        faqs,
        isPublished,
        publishedAt: isPublished ? new Date() : null,
        noIndex,
        noFollow,
        categoryId: category.id,
      },
    });

    revalidatePath('/admin');
    revalidatePath('/');
    revalidatePath(`/category/${categorySlug}`);
    redirect('/admin');
  }

  return categories.length === 0 ? (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center">
      <h1 className="text-xl font-semibold text-gray-900">إضافة مقال جديد</h1>
      <p className="mt-3 font-bold text-amber-800">أضف تصنيفًا واحدًا على الأقل قبل إنشاء المقال.</p>
      <Link href="/admin/categories" className="mt-4 inline-block rounded border border-amber-700 bg-amber-600 px-4 py-2 text-sm text-white">
        إضافة تصنيف
      </Link>
    </div>
  ) : (
    <ArticleForm categories={categories} action={createArticleAction} siteUrl={getSiteUrl()} />
  );
}
