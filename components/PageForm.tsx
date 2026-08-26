'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  ssr: false,
  loading: () => (
    <div className="h-48 w-full animate-pulse rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs font-bold text-gray-400">
      جاري تحميل المحرر المرئي...
    </div>
  ),
});

interface PageFormProps {
  initialData?: {
    id?: string;
    title?: string;
    slug?: string;
    content?: string;
    metaTitle?: string | null;
    metaDesc?: string | null;
    isPublished?: boolean;
    showInHeader?: boolean;
    showInFooter?: boolean;
  };
  action: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
}

export default function PageForm({ initialData, action }: PageFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // توليد وتنظيف الـ Slug تلقائياً عند كتابة العنوان في حال كان إنشاء جديد
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!initialData?.id) {
      const generatedSlug = newTitle
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\u0600-\u06FF\-]+/g, '')
        .replace(/\-\-+/g, '-');
      setSlug(generatedSlug);
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
    const form = event.currentTarget;
    const formData = new FormData(form);

    const cleanSlug = slug.trim().replace(/^-+|-+$/g, '');

    if (!title.trim()) {
      toast.error('يرجى إدخال عنوان الصفحة');
      return;
    }
    if (!cleanSlug) {
      toast.error('يرجى إدخال الرابط الدائم (Slug)');
      return;
    }

    formData.set('title', title.trim());
    formData.set('slug', cleanSlug);
    formData.set('content', content);

    setIsSubmitting(true);
    const toastId = toast.loading('جاري حفظ الصفحة...');

    try {
      const res = await action(formData);
      if (!res.success) {
        toast.error(res.error || 'حدث خطأ أثناء حفظ الصفحة', { id: toastId });
      } else {
        toast.success('تم حفظ الصفحة بنجاح!', { id: toastId });
        router.push('/admin/pages');
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err?.message || 'تعذر الاتصال بالسيرفر لحفظ الصفحة', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-bold text-gray-700">
            عنوان الصفحة <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            required
            value={title}
            onChange={handleTitleChange}
            placeholder="مثال: من نحن أو سياسة الخصوصية"
            className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-hidden"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-gray-700">
            الرابط الدائم (Slug) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="slug"
            required
            value={slug}
            onChange={handleSlugChange}
            placeholder="about-us"
            className="w-full rounded-xl border border-gray-300 p-3 text-sm font-mono focus:border-blue-500 focus:outline-hidden"
            dir="ltr"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-bold text-gray-700">محتوى الصفحة</label>
        <RichTextEditor content={content} onChange={setContent} />
      </div>

      {/* إعدادات SEO وخيارات العرض */}
      <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
        <h3 className="text-xs font-bold text-gray-800">إعدادات الـ SEO والعرض</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-bold text-gray-700">Meta Title</label>
            <input
              type="text"
              name="metaTitle"
              defaultValue={initialData?.metaTitle || ''}
              placeholder="عنوان مخصص للظهور في محرك البحث"
              className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-hidden"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-gray-700">Meta Description</label>
            <input
              type="text"
              name="metaDesc"
              defaultValue={initialData?.metaDesc || ''}
              placeholder="وصف مختصر للصفحة في محرك البحث"
              className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-6 border-t border-gray-100 pt-3">
          <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-gray-700">
            <input
              type="checkbox"
              name="isPublished"
              defaultChecked={initialData ? initialData.isPublished : true}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            نشر الصفحة مباشرة
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-gray-700">
            <input
              type="checkbox"
              name="showInHeader"
              defaultChecked={initialData?.showInHeader || false}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            إظهار في القائمة العلوية (Header)
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-gray-700">
            <input
              type="checkbox"
              name="showInFooter"
              defaultChecked={initialData ? initialData.showInFooter : true}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            إظهار في الفوتر (Footer)
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full cursor-pointer rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-xs transition hover:bg-blue-700 active:scale-98 disabled:opacity-50"
      >
        {isSubmitting ? 'جاري الحفظ...' : 'حفظ ونشر الصفحة'}
      </button>
    </form>
  );
}