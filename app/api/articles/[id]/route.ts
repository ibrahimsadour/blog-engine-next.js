import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
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
    await db.article.delete({ where: { id } });
    return NextResponse.json({ message: 'تم الحذف بنجاح' });
  } catch (error) {
    return NextResponse.json({ message: 'تعذر حذف المقال' }, { status: 500 });
  }
}