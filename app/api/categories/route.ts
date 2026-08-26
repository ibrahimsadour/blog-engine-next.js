import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '../../../lib/db';

// جلب جميع التصنيفات
export async function GET() {
  try {
    const categories = await db.category.findMany({
      include: {
        _count: {
          select: { articles: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ message: 'تعذر جلب التصنيفات', error: String(error) }, { status: 500 });
  }
}

// إنشاء تصنيف جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, description, metaTitle, metaDesc } = body;

    if (!name || !slug) {
      return NextResponse.json({ message: 'الاسم والرابط الدائم مطلوبان' }, { status: 400 });
    }

    const existing = await db.category.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json({ message: 'هذا الرابط مستخدم لتصنيف آخر' }, { status: 400 });
    }

    const category = await db.category.create({
      data: {
        name,
        slug,
        description,
        metaTitle,
        metaDesc,
      },
    });

    // تفريغ وتحديث الكاش للمسارات المتأثرة بالتصنيف الجديد
    revalidatePath('/');
    revalidatePath(`/category/${category.slug}`);
    revalidatePath('/category-sitemap.xml');
    revalidatePath('/sitemap.xml');

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'حدث خطأ أثناء حفظ التصنيف', error: String(error) }, { status: 500 });
  }
}