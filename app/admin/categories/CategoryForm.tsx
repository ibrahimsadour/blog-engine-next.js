'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export interface CategoryEditData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  showInHeader?: boolean;
}

interface CategoryFormProps {
  action: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
  editCategory?: CategoryEditData | null;
  onCancelEdit?: () => void;
}

export default function CategoryForm({ action, editCategory, onCancelEdit }: CategoryFormProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [showInHeader, setShowInHeader] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // تحديث الحقول عند اختيار تصنيف للتعديل أو إلغاء التعديل
  useEffect(() => {
    if (editCategory) {
      setName(editCategory.name || '');
      setSlug(editCategory.slug || '');
      setDescription(editCategory.description || '');
      setShowInHeader(editCategory.showInHeader ?? true);
    } else {
      setName('');
      setSlug('');
      setDescription('');
      setShowInHeader(true);
    }
  }, [editCategory]);

  // توليد الـ slug تلقائياً أثناء كتابة الاسم في حال لم يكن في وضع التعديل
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!editCategory) {
      const formatted = val
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\u0600-\u06FF\-]+/g, '')
        .replace(/\-\-+/g, '-');
      setSlug(formatted);
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = e.target.value
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\u0600-\u06FF\-]+/g, '')
      .replace(/\-\-+/g, '-');
    setSlug(formatted);
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      toast.error('يرجى إدخال اسم التصنيف');
      return;
    }

    const formData = new FormData();
    if (editCategory?.id) {
      formData.set('id', editCategory.id);
    }
    formData.set('name', name.trim());
    formData.set('slug', slug.trim().replace(/^-+|-+$/g, ''));
    formData.set('description', description.trim());
    formData.set('showInHeader', showInHeader ? 'true' : 'false');

    setIsSubmitting(true);
    const toastId = toast.loading(editCategory ? 'جاري تحديث التصنيف...' : 'جاري إضافة التصنيف...');

    try {
      const res = await action(formData);
      if (!res.success) {
        toast.error(res.error || 'تعذر حفظ التصنيف', { id: toastId });
      } else {
        toast.success(editCategory ? 'تم تحديث التصنيف بنجاح!' : 'تمت إضافة التصنيف بنجاح!', { id: toastId });
        if (!editCategory) {
          setName('');
          setSlug('');
          setDescription('');
          setShowInHeader(true);
        }
        if (onCancelEdit) onCancelEdit();
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error?.message || 'حدث خطأ غير متوقع', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs lg:col-span-1">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <h2 className="text-lg font-bold text-gray-900">
          {editCategory ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
        </h2>
        {editCategory && onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="cursor-pointer text-xs font-bold text-gray-400 hover:text-gray-600"
          >
            إلغاء التعديل ✕
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label className="mb-1 block text-xs font-bold text-gray-700">
            اسم التصنيف <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={name}
            onChange={handleNameChange}
            required
            placeholder="مثال: تبديل بطاريات"
            className="w-full rounded-xl border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-gray-700">الرابط الدائم (Slug)</label>
          <input
            type="text"
            name="slug"
            value={slug}
            onChange={handleSlugChange}
            placeholder="battery-replacement"
            dir="ltr"
            className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-mono focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-gray-700">الوصف (SEO)</label>
          <textarea
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="وصف مختصر للتصنيف وخدماته..."
            className="w-full rounded-xl border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <input
            type="checkbox"
            id="showInHeader"
            name="showInHeader"
            checked={showInHeader}
            onChange={(e) => setShowInHeader(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <label htmlFor="showInHeader" className="text-sm font-bold text-gray-700 cursor-pointer">
            إظهار التصنيف في شريط التنقل العلوي (الهيدر)
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full cursor-pointer rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 active:scale-98 disabled:opacity-50"
        >
          {isSubmitting
            ? 'جاري الحفظ...'
            : editCategory
            ? 'تحديث بيانات التصنيف'
            : 'إضافة التصنيف فوراً'}
        </button>
      </form>
    </div>
  );
}