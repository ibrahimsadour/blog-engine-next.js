import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '../../../../lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, slug, description } = await request.json();

    const oldCategory = await db.category.findUnique({
      where: { id },
    });

    const updated = await db.category.update({
      where: { id },
      data: { name, slug, description },
    });

    // تفريغ وتحديث الكاش للمسار القديم والجديد والصفحة الرئيسية والسايت ماب
    revalidatePath('/');
    if (oldCategory && oldCategory.slug !== updated.slug) {
      revalidatePath(`/category/${oldCategory.slug}`);
    }
    revalidatePath(`/category/${updated.slug}`);
    revalidatePath('/category-sitemap.xml');
    revalidatePath('/sitemap.xml');

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: 'تعذر تعديل التصنيف', error: String(error) }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const category = await db.category.findUnique({
      where: { id },
    });

    await db.category.delete({ where: { id } });

    // تفريغ الكاش بعد حذف القسم
    revalidatePath('/');
    if (category) {
      revalidatePath(`/category/${category.slug}`);
    }
    revalidatePath('/category-sitemap.xml');
    revalidatePath('/sitemap.xml');

    return NextResponse.json({ message: 'تم حذف التصنيف' });
  } catch (error) {
    return NextResponse.json({ message: 'تعذر حذف التصنيف', error: String(error) }, { status: 500 });
  }
}