import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '../../../../lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const article = await db.article.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!article) return NextResponse.json({ message: 'المقال غير موجود' }, { status: 404 });
    return NextResponse.json(article);
  } catch (error) {
    return NextResponse.json({ message: 'خطأ في جلب المقال' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      title,
      slug,
      content,
      excerpt,
      categorySlug,
      targetKeyword,
      targetArea,
      metaTitle,
      metaDesc,
      faqs,
      isPublished,
    } = body;

    const category = await db.category.findUnique({
      where: { slug: categorySlug },
    });

    if (!category) {
      return NextResponse.json({ message: 'التصنيف غير موجود' }, { status: 404 });
    }

    // جلب المقال الحالي لمعرفة الرابط القديم في حال تم تغيير الـ slug
    const oldArticle = await db.article.findUnique({
      where: { id },
    });

    const updated = await db.article.update({
      where: { id },
      data: {
        title,
        slug,
        content,
        excerpt,
        targetKeyword,
        targetArea,
        metaTitle,
        metaDesc,
        faqs,
        isPublished,
        categoryId: category.id,
      },
    });

    // تفريغ وتحديث كاش المسارات المتأثرة
    revalidatePath('/');
    if (oldArticle && oldArticle.slug !== updated.slug) {
      revalidatePath(`/${oldArticle.slug}`);
    }
    revalidatePath(`/${updated.slug}`);
    revalidatePath(`/category/${categorySlug}`);
    revalidatePath('/post-sitemap.xml');
    revalidatePath('/sitemap.xml');

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: 'تعذر تحديث المقال', error: String(error) }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const article = await db.article.findUnique({
      where: { id },
      include: { category: true },
    });

    await db.article.delete({ where: { id } });

    // تفريغ الكاش بعد الحذف
    revalidatePath('/');
    if (article) {
      revalidatePath(`/${article.slug}`);
      if (article.category) {
        revalidatePath(`/category/${article.category.slug}`);
      }
    }
    revalidatePath('/post-sitemap.xml');
    revalidatePath('/sitemap.xml');

    return NextResponse.json({ message: 'تم الحذف بنجاح' });
  } catch (error) {
    return NextResponse.json({ message: 'تعذر حذف المقال' }, { status: 500 });
  }
}