'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import ImageUploader from '@/components/ImageUploader';
import SeoLiveOptimizer from '@/components/SeoLiveOptimizer';

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  ssr: false,
  loading: () => (
    <div className="h-48 w-full animate-pulse rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs font-bold text-gray-400">
      جاري تحميل المحرر المرئي...
    </div>
  ),
});

interface EditArticleFormProps {
  article: any;
  categories: any[];
  updateAction: (formData: FormData) => Promise<void>;
}

export default function EditArticleForm({
  article,
  categories,
  updateAction,
}: EditArticleFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(article.title || '');
  const [slug, setSlug] = useState(article.slug || '');
  const [targetKeyword, setTargetKeyword] = useState(article.targetKeyword || '');
  const [metaTitle, setMetaTitle] = useState(article.metaTitle || '');
  const [metaDesc, setMetaDesc] = useState(article.metaDesc || '');
  const [content, setContent] = useState(article.content || '');
  const [isPublished, setIsPublished] = useState<boolean>(article.isPublished ?? true);
  const [noIndex, setNoIndex] = useState<boolean>(article.noIndex ?? false);
  const [noFollow, setNoFollow] = useState<boolean>(article.noFollow ?? false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialFaqs =
    Array.isArray(article.faqs) && article.faqs.length > 0
      ? article.faqs
      : [{ question: '', answer: '' }];

  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>(initialFaqs);

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = e.target.value
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\u0600-\u06FF\-]+/g, '')
      .replace(/\-\-+/g, '-');
    setSlug(formatted);
  };

  const addFaq = () => {
    setFaqs([...faqs, { question: '', answer: '' }]);
  };

  const removeFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const handleFaqChange = (index: number, field: 'question' | 'answer', value: string) => {
    const updated = [...faqs];
    updated[index][field] = value;
    setFaqs(updated);
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formElement = event.currentTarget;
    const formData = new FormData(formElement);

    const cleanSlug = slug.trim().replace(/^-+|-+$/g, '');
    const categorySlug = (formData.get('categorySlug') as string) || '';

    if (!title.trim()) {
      toast.error('يرجى إدخال عنوان المقال الرئيسي (H1)');
      return;
    }

    if (!cleanSlug) {
      toast.error('يرجى إدخال الرابط الدائم (Slug)');
      return;
    }

    if (!categorySlug) {
      toast.error('يرجى اختيار التصنيف');
      return;
    }

    if (!content.trim() || content === '<p></p>') {
      toast.error('محتوى المقال لا يمكن أن يكون فارغاً');
      return;
    }

    const validFaqs = faqs.filter(
      (f) => f.question.trim() !== '' && f.answer.trim() !== ''
    );

    formData.set('title', title);
    formData.set('slug', cleanSlug);
    formData.set('targetKeyword', targetKeyword);
    formData.set('metaTitle', metaTitle);
    formData.set('metaDesc', metaDesc);
    formData.set('content', content);
    formData.set('faqs', JSON.stringify(validFaqs));
    formData.set('isPublished', isPublished ? 'true' : 'false');
    formData.set('noIndex', noIndex ? 'true' : 'false');
    formData.set('noFollow', noFollow ? 'true' : 'false');

    setIsSubmitting(true);
    const toastId = toast.loading('جاري حفظ التعديلات...');

    try {
      await updateAction(formData);
      toast.success('تم تحديث المقال بنجاح!', { id: toastId });
      router.push('/admin');
      router.refresh();
    } catch (error: any) {
      toast.error(error?.message || 'تعذر تحديث المقال، يرجى المحاولة لاحقاً', { id: toastId });
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl rounded-2xl border border-gray-200 bg-white p-6 shadow-xs sm:p-8">
      <h1 className="text-xl font-black text-gray-900">تعديل المقال</h1>
      <p className="mt-1 text-xs text-gray-500">تعديل المقال وبيانات الـ SEO وحالة النشر مباشرة</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-bold text-gray-700">العنوان الرئيسي</label>
            <input
              type="text"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-hidden"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-gray-700">الرابط الدائم (Slug)</label>
            <input
              type="text"
              name="slug"
              value={slug}
              onChange={handleSlugChange}
              required
              className="w-full rounded-xl border border-gray-300 p-3 text-sm font-mono focus:border-blue-500 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-bold text-gray-700">التصنيف</label>
            <select
              name="categorySlug"
              defaultValue={article.category?.slug}
              className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-hidden"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-gray-700">الكلمة المفتاحية</label>
            <input
              type="text"
              name="targetKeyword"
              value={targetKeyword}
              onChange={(e) => setTargetKeyword(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-hidden"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-gray-700">المنطقة المستهدفة</label>
            <input
              type="text"
              name="targetArea"
              defaultValue={article.targetArea || 'الكويت'}
              className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-hidden"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-gray-700">المقتطف (Excerpt)</label>
          <textarea
            name="excerpt"
            rows={2}
            defaultValue={article.excerpt || ''}
            className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        {/* إعدادات الصورة البارزة */}
        <div className="space-y-4 rounded-2xl border border-gray-100 bg-gray-50/50 p-5">
          <h3 className="text-xs font-bold text-gray-800">إعدادات الصورة البارزة (Featured Image & SEO)</h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <ImageUploader initialImage={article.featuredImage || ''} name="featuredImage" />
            </div>

            <div className="flex flex-col justify-start">
              <label className="mb-1 block text-xs font-bold text-gray-700">النص البديل للصورة (Alt Text)</label>
              <input
                type="text"
                name="altText"
                placeholder="مثال: ورشة تصليح وصيانة سيارات في الكويت"
                defaultValue={article.altText || ''}
                className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm focus:border-blue-500 focus:outline-hidden"
              />
              <p className="mt-1 text-[11px] text-gray-400">ضروري جداً لمحركات البحث ولظهور الصورة في Google Images</p>
            </div>
          </div>
        </div>

        {/* محرر النصوص المرئي */}
        <div>
          <label className="mb-2 block text-xs font-bold text-gray-700">محتوى المقال (محرر مرئي متقدم)</label>
          <RichTextEditor content={content} onChange={setContent} />
        </div>

        {/* قسم حالة النشر والتحكم في محركات البحث (Robots Directives) */}
        <div className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
          <div>
            <h3 className="text-xs font-bold text-gray-800">حالة النشر والظهور في محركات البحث</h3>
            <p className="text-[11px] text-gray-400">تحكم في حالة المقال وتوجيهات عناكب الأرشفة</p>
          </div>

          {/* 1. حالة النشر (منشور / مسودة) */}
          <div className="flex flex-wrap items-center gap-6 rounded-xl border border-gray-100 bg-gray-50/70 p-4">
            <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-gray-800">
              <input
                type="radio"
                name="publishStatus"
                checked={isPublished === true}
                onChange={() => setIsPublished(true)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span>منشور (ظاهر لجميع زوار الموقع)</span>
            </label>

            <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-gray-800">
              <input
                type="radio"
                name="publishStatus"
                checked={isPublished === false}
                onChange={() => setIsPublished(false)}
                className="h-4 w-4 text-amber-600 focus:ring-amber-500"
              />
              <span>مسودة (مخفي عن الزوار)</span>
            </label>
          </div>

          {/* 2. توجيهات الروبوتس */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={noIndex}
                  onChange={(e) => setNoIndex(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded-sm text-red-600 focus:ring-red-500"
                />
                <div>
                  <span className="block text-xs font-bold text-gray-800">منع الفهرسة (noindex)</span>
                  <span className="text-[11px] text-gray-500">
                    توجيه جوجل بعدم إظهار هذا المقال في نتائج البحث.
                  </span>
                </div>
              </label>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={noFollow}
                  onChange={(e) => setNoFollow(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded-sm text-red-600 focus:ring-red-500"
                />
                <div>
                  <span className="block text-xs font-bold text-gray-800">عدم تتبع الروابط (nofollow)</span>
                  <span className="text-[11px] text-gray-500">
                    توجيه محركات البحث بعدم تتبع الروابط الموجودة بالمقال.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* فاحص ومعاين الـ SEO الحي المباشر */}
        <SeoLiveOptimizer
          title={title}
          slug={slug}
          metaTitle={metaTitle}
          metaDesc={metaDesc}
          targetKeyword={targetKeyword}
          content={content}
          onMetaTitleChange={setMetaTitle}
          onMetaDescChange={setMetaDesc}
        />

        {/* الأسئلة الشائعة FAQ */}
        <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="block text-xs font-bold text-gray-700">الأسئلة الشائعة (FAQ Schema)</span>
            <button
              type="button"
              onClick={addFaq}
              className="cursor-pointer rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 hover:bg-blue-100"
            >
              + إضافة سؤال
            </button>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="space-y-2 rounded-lg border border-gray-200 bg-white p-3">
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => handleFaqChange(idx, 'question', e.target.value)}
                    placeholder={`السؤال ${idx + 1}...`}
                    className="w-full rounded-lg border border-gray-300 p-2 text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                  {faqs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFaq(idx)}
                      className="cursor-pointer text-xs font-bold text-red-500 hover:text-red-700"
                    >
                      حذف
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={faq.answer}
                  onChange={(e) => handleFaqChange(idx, 'answer', e.target.value)}
                  placeholder="الإجابة..."
                  className="w-full rounded-lg border border-gray-300 p-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            ))}
          </div>
        </div>

        {/* قسم الرابط الكنسي */}
        <div>
          <label className="mb-1 block text-xs font-bold text-gray-700">الرابط الكنسي (Canonical URL)</label>
          <input
            type="url"
            name="canonicalUrl"
            placeholder="اتركه فارغاً ليكون الرابط التلقائي للمقال"
            defaultValue={article.canonicalUrl || ''}
            className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm font-mono focus:border-blue-500 focus:outline-hidden"
          />
          <p className="mt-1 text-[11px] text-gray-400">يُستخدم لتحديد المصدر الأساسي لتجنب مشاكل المحتوى المكرر</p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full cursor-pointer rounded-xl py-3.5 text-base font-bold text-white shadow-sm transition active:scale-98 disabled:opacity-50 ${
            isPublished ? 'bg-blue-600 hover:bg-blue-700' : 'bg-amber-600 hover:bg-amber-700'
          }`}
        >
          {isSubmitting ? 'جاري حفظ التعديلات...' : 'حفظ التعديلات وتحديث المقال'}
        </button>
      </form>
    </div>
  );
}