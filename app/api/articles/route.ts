import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '../../../lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

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

    // التحقق من الحقول الأساسية
    if (!title || !slug || !content || !categorySlug) {
      return NextResponse.json(
        { message: 'الحقول المطلوبة: title, slug, content, categorySlug' },
        { status: 400 }
      );
    }

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
    const article = await db.article.upsert({
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
    console.error('Article API Error:', error);
    return NextResponse.json(
      { message: 'حدث خطأ أثناء معالجة الطلب', error: String(error) },
      { status: 500 }
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