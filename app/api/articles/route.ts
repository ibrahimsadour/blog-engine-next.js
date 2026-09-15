import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '../../../lib/db';
import { authorizeAdminApiRequest } from '@/lib/auth/authorization';
import { assertTopLevelSlugAvailable, publicError, validateArticleInput } from '@/lib/content-input';

export async function POST(request: NextRequest) {
  const unauthorized = await authorizeAdminApiRequest(request);
  if (unauthorized) return unauthorized;

  try {
    const body = validateArticleInput(await request.json());
    const {
      title,
      slug,
      content,
      excerpt,
      featuredImage,
      altText,
      metaTitle,
      metaDesc,
      canonicalUrl,
      targetKeyword,
      targetArea,
      faqs,
      categorySlug,
      authorSlug,
      isPublished = true,
    } = body;

    // جلب أو التحقق من وجود التصنيف
    const category = await db.category.findUnique({
      where: { slug: categorySlug },
    });

    if (!category) {
      return NextResponse.json(
        { message: `التصنيف (${categorySlug}) غير موجود` },
        { status: 404 }
      );
    }

    // جلب الكاتب إن وجد
    let authorId: string | undefined = undefined;
    if (authorSlug) {
      const author = await db.author.findUnique({
        where: { slug: authorSlug },
      });
      if (author) authorId = author.id;
    }

    // حفظ المقال أو تحديثه إذا كان موجوداً مسبقاً
    const article = await db.$transaction(async (tx) => {
      const existing = await tx.article.findUnique({ where: { slug }, select: { id: true } });
      await assertTopLevelSlugAvailable(tx, slug, existing ? { owner: 'article', id: existing.id } : undefined);
      return tx.article.upsert({
        where: { slug },
        update: {
        title,
        content,
        excerpt,
        featuredImage,
        altText,
        metaTitle,
        metaDesc,
        canonicalUrl,
        targetKeyword,
        targetArea,
        faqs,
        isPublished,
        publishedAt: isPublished ? new Date() : null,
        categoryId: category.id,
        authorId,
      },
        create: {
        title,
        slug,
        content,
        excerpt,
        featuredImage,
        altText,
        metaTitle,
        metaDesc,
        canonicalUrl,
        targetKeyword,
        targetArea,
        faqs,
        isPublished,
        publishedAt: isPublished ? new Date() : null,
        categoryId: category.id,
        authorId,
        },
      });
    });

    // تفريغ وتحديث الكاش فورياً للمقال والقسم والصفحة الرئيسية والخرائط
    revalidatePath('/');
    revalidatePath(`/${article.slug}`);
    revalidatePath(`/category/${categorySlug}`);
    revalidatePath('/post-sitemap.xml');
    revalidatePath('/sitemap.xml');

    return NextResponse.json(
      {
        message: 'تم حفظ المقال بنجاح',
        article: {
          id: article.id,
          slug: article.slug,
          title: article.title,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    const result = publicError(error);
    return NextResponse.json(
      { message: result.message, field: result.field, code: result.code },
      { status: result.status }
    );
  }
}

export async function GET() {
  try {
    const articles = await db.article.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        title: true,
        slug: true,
        createdAt: true,
        category: {
          select: { name: true, slug: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(articles);
  } catch (error) {
    return NextResponse.json({ message: 'Database error' }, { status: 500 });
  }
}
