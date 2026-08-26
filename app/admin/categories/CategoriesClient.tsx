'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import CategoryForm, { CategoryEditData } from './CategoryForm';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count?: { articles: number };
}

interface CategoriesClientProps {
  categories: CategoryItem[];
  saveAction: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
  deleteAction: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export default function CategoriesClient({
  categories,
  saveAction,
  deleteAction,
}: CategoriesClientProps) {
  const router = useRouter();
  const [editingCategory, setEditingCategory] = useState<CategoryEditData | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(cat: CategoryItem) {
    const articlesCount = cat._count?.articles ?? 0;

    // منع الحذف في حال وجود مقالات مربوطة
    if (articlesCount > 0) {
      toast.error(
        `لا يمكن حذف هذا التصنيف لأنه مرتبط بـ (${articlesCount}) مقال. قم بتغيير تصنيف المقالات أولاً.`
      );
      return;
    }

    if (!confirm(`هل أنت متأكد من رغبتك في حذف تصنيف "${cat.name}"؟`)) {
      return;
    }

    setDeletingId(cat.id);
    const toastId = toast.loading('جاري حذف التصنيف...');

    try {
      const res = await deleteAction(cat.id);
      if (!res.success) {
        toast.error(res.error || 'تعذر حذف التصنيف', { id: toastId });
      } else {
        toast.success('تم حذف التصنيف بنجاح!', { id: toastId });
        if (editingCategory?.id === cat.id) {
          setEditingCategory(null);
        }
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err?.message || 'حدث خطأ غير متوقع', { id: toastId });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* عمود نموذج الإضافة والتعديل */}
      <CategoryForm
        action={saveAction}
        editCategory={editingCategory}
        onCancelEdit={() => setEditingCategory(null)}
      />

      {/* عمود قائمة التصنيفات المتاحة */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs lg:col-span-2">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="text-sm font-bold text-gray-800">التصنيفات المتاحة</h2>
          <span className="text-xs font-bold text-gray-400">الإجمالي: {categories.length}</span>
        </div>

        <div className="mt-4 divide-y divide-gray-100">
          {categories.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">لا توجد تصنيفات مضافة حالياً</div>
          ) : (
            categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between py-3.5">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{cat.name}</h3>
                  <p className="text-xs font-mono text-gray-400" dir="ltr">
                    /category/{cat.slug}
                  </p>
                  {cat.description && (
                    <p className="mt-1 text-xs text-gray-500 line-clamp-1">{cat.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                      (cat._count?.articles ?? 0) > 0
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {cat._count?.articles ?? 0} مقال
                  </span>

                  {/* زر التعديل */}
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCategory({
                        id: cat.id,
                        name: cat.name,
                        slug: cat.slug,
                        description: cat.description,
                      });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="cursor-pointer rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 transition hover:bg-blue-100 active:scale-95"
                  >
                    تعديل
                  </button>

                  {/* زر الحذف */}
                  <button
                    type="button"
                    onClick={() => handleDelete(cat)}
                    disabled={deletingId === cat.id}
                    className="cursor-pointer rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-100 active:scale-95 disabled:opacity-50"
                  >
                    {deletingId === cat.id ? '...' : 'حذف'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}