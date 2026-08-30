import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import CategoriesClient from './CategoriesClient';

export const dynamic = 'force-dynamic';

function sanitizeSlug(text: string): string {
  return (text || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0600-\u06FF\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default async function AdminCategoriesPage() {
  const categories = await db.category.findMany({
    include: {
      _count: {
        select: { articles: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  // حفظ أو تعديل تصنيف
  async function saveCategoryAction(formData: FormData) {
    'use server';
    try {
      const id = (formData.get('id') as string)?.trim();
      const name = (formData.get('name') as string)?.trim() || '';
      const rawSlug = (formData.get('slug') as string)?.trim() || '';
      const description = (formData.get('description') as string)?.trim() || null;
      const showInHeader = formData.get('showInHeader') === 'true'; // استقبال حالة إظهار الهيدر

      if (!name) {
        return { success: false, error: 'اسم التصنيف مطلوب' };
      }

      let slug = sanitizeSlug(rawSlug);
      if (!slug) {
        slug = sanitizeSlug(name);
      }

      // التحقق من عدم تكرار الـ Slug لتصنيف آخر
      const existing = await db.category.findFirst({
        where: {
          slug,
          ...(id ? { NOT: { id } } : {}),
        },
      });

      if (existing) {
        return { success: false, error: 'الرابط الدائم (Slug) مستخدم بالفعل لتصنيف آخر' };
      }

      if (id) {
        // تحديث تصنيف حالي مع حقل showInHeader
        await db.category.update({
          where: { id },
          data: { name, slug, description, showInHeader },
        });
      } else {
        // إنشاء تصنيف جديد مع حقل showInHeader
        await db.category.create({
          data: { name, slug, description, showInHeader },
        });
      }

      revalidatePath('/admin/categories');
      revalidatePath('/admin');
      revalidatePath('/', 'layout');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'تعذر حفظ التصنيف' };
    }
  }

  // حذف تصنيف مع فحص المقالات المربوطة
  async function deleteCategoryAction(id: string) {
    'use server';
    try {
      if (!id) {
        return { success: false, error: 'معرف التصنيف غير صالح' };
      }

      // فحص عدد المقالات المربوطة بالتصنيف
      const articlesCount = await db.article.count({
        where: { categoryId: id },
      });

      if (articlesCount > 0) {
        return {
          success: false,
          error: `لا يمكن حذف هذا التصنيف لأنه مرتبط بـ (${articlesCount}) مقال.`,
        };
      }

      await db.category.delete({
        where: { id },
      });

      revalidatePath('/admin/categories');
      revalidatePath('/admin');
      revalidatePath('/', 'layout');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'تعذر حذف التصنيف' };
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">إدارة التصنيفات</h1>
        <p className="mt-1 text-xs text-gray-500">إضافة وتعديل وحذف أقسام وتصنيفات الخدمات</p>
      </div>

      <CategoriesClient
        categories={categories}
        saveAction={saveCategoryAction}
        deleteAction={deleteCategoryAction}
      />
    </div>
  );
}