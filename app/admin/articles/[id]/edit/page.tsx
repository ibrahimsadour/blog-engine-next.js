import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import EditArticleForm from './EditArticleForm';

export const dynamic = 'force-dynamic';

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [article, categories] = await Promise.all([
    db.article.findUnique({
      where: { id },
      include: { category: true },
    }),
    db.category.findMany({
      orderBy: { name: 'asc' },
    }),
  ]);

  if (!article) {
    notFound();
  }

  async function updateArticleAction(formData: FormData) {
    'use server';

    const title = (formData.get('title') as string)?.trim();
    const slug = (formData.get('slug') as string)?.trim();
    const categorySlug = (formData.get('categorySlug') as string)?.trim();
    const targetKeyword = (formData.get('targetKeyword') as string)?.trim() || null;
    const targetArea = (formData.get('targetArea') as string)?.trim() || null;
    const excerpt = (formData.get('excerpt') as string)?.trim() || null;
    const content = (formData.get('content') as string)?.trim();
    const featuredImage = (formData.get('featuredImage') as string)?.trim() || null;
    const altText = (formData.get('altText') as string)?.trim() || null;
    const canonicalUrl = (formData.get('canonicalUrl') as string)?.trim() || null;
    const metaTitle = (formData.get('metaTitle') as string)?.trim() || null;
    const metaDesc = (formData.get('metaDesc') as string)?.trim() || null;
    const faqsRaw = formData.get('faqs') as string;

    const isPublished = formData.get('isPublished') === 'true';
    const noIndex = formData.get('noIndex') === 'true';
    const noFollow = formData.get('noFollow') === 'true';

    let faqs = null;
    if (faqsRaw) {
      try {
        faqs = JSON.parse(faqsRaw);
      } catch {
        faqs = null;
      }
    }

    const [cat, currentArticle] = await Promise.all([
      db.category.findUnique({ where: { slug: categorySlug } }),
      db.article.findUnique({ where: { id } }),
    ]);

    if (!cat || !currentArticle) return;

    await db.article.update({
      where: { id },
      data: {
        title,
        slug,
        targetKeyword,
        targetArea,
        excerpt,
        content,
        featuredImage,
        altText,
        canonicalUrl,
        metaTitle,
        metaDesc,
        faqs,
        isPublished,
        publishedAt: isPublished ? currentArticle.publishedAt || new Date() : null,
        noIndex,
        noFollow,
        categoryId: cat.id,
      },
    });

    revalidatePath('/admin');
    revalidatePath('/');
    revalidatePath(`/${slug}`);
    revalidatePath(`/${currentArticle.slug}`);
    revalidatePath(`/category/${categorySlug}`);
  }

  return (
    <EditArticleForm
      article={article}
      categories={categories}
      updateAction={updateArticleAction}
    />
  );
}