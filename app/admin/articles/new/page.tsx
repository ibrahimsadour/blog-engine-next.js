import { db } from '@/lib/db';
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

  return (
    <div className="mx-auto max-w-4xl rounded-2xl border border-gray-200 bg-white p-6 shadow-xs sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900">إضافة مقال جديد</h1>
          <p className="mt-1 text-xs text-gray-500">نشر محتوى جديد متوافق مع معايير الـ SEO</p>
        </div>
        <Link
          href="/admin/categories"
          className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100"
        >
          + إدارة التصنيفات
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
          <p className="font-bold text-amber-800">لا يوجد أي تصنيف حالياً في الموقع</p>
          <p className="mt-1 text-xs text-amber-600">يجب إضافة تصنيف واحد على الأقل قبل إنشاء مقال جديد.</p>
          <Link
            href="/admin/categories"
            className="mt-4 inline-block rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700"
          >
            الذهاب لإضافة تصنيف
          </Link>
        </div>
      ) : (
        <ArticleForm categories={categories} action={createArticleAction} />
      )}
    </div>
  );
}