'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { toast } from 'sonner';
import ImageUploader from '@/components/ImageUploader';
import SeoLiveOptimizer from '@/components/SeoLiveOptimizer';
import { RotateCcw, AlertTriangle, CheckCircle2, ExternalLink, Save, ArrowRight } from 'lucide-react';

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
  const storageKey = `draft_article_${article.id}`;

  const [title, setTitle] = useState(article.title || '');
  const [slug, setSlug] = useState(article.slug || '');
  const [targetKeyword, setTargetKeyword] = useState(article.targetKeyword || '');
  const [targetArea, setTargetArea] = useState(article.targetArea || 'الكويت');
  const [categorySlug, setCategorySlug] = useState(article.category?.slug || categories[0]?.slug || '');
  const [excerpt, setExcerpt] = useState(article.excerpt || '');
  const [featuredImage, setFeaturedImage] = useState(article.featuredImage || '');
  const [altText, setAltText] = useState(article.altText || '');
  const [metaTitle, setMetaTitle] = useState(article.metaTitle || '');
  const [metaDesc, setMetaDesc] = useState(article.metaDesc || '');
  const [canonicalUrl, setCanonicalUrl] = useState(article.canonicalUrl || '');
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
  const [hasDraft, setHasDraft] = useState(false);
  const [isSavedLocally, setIsSavedLocally] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.title || parsed.content) {
          setHasDraft(true);
        }
      }
    } catch {}
  }, [storageKey]);

  useEffect(() => {
    if (!title && !content && !excerpt && !targetKeyword) return;

    setIsDirty(true);
    setIsSavedLocally(false);

    const timer = setTimeout(() => {
      const draftData = {
        title,
        slug,
        targetKeyword,
        targetArea,
        categorySlug,
        excerpt,
        featuredImage,
        altText,
        metaTitle,
        metaDesc,
        canonicalUrl,
        content,
        isPublished,
        noIndex,
        noFollow,
        faqs,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(storageKey, JSON.stringify(draftData));
      setIsSavedLocally(true);
    }, 600);

    return () => clearTimeout(timer);
  }, [
    title,
    slug,
    targetKeyword,
    targetArea,
    categorySlug,
    excerpt,
    featuredImage,
    altText,
    metaTitle,
    metaDesc,
    canonicalUrl,
    content,
    isPublished,
    noIndex,
    noFollow,
    faqs,
    storageKey,
  ]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleRestoreDraft = () => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.title !== undefined) setTitle(parsed.title);
        if (parsed.slug !== undefined) setSlug(parsed.slug);
        if (parsed.targetKeyword !== undefined) setTargetKeyword(parsed.targetKeyword);
        if (parsed.targetArea !== undefined) setTargetArea(parsed.targetArea);
        if (parsed.categorySlug !== undefined) setCategorySlug(parsed.categorySlug);
        if (parsed.excerpt !== undefined) setExcerpt(parsed.excerpt);
        if (parsed.featuredImage !== undefined) setFeaturedImage(parsed.featuredImage);
        if (parsed.altText !== undefined) setAltText(parsed.altText);
        if (parsed.metaTitle !== undefined) setMetaTitle(parsed.metaTitle);
        if (parsed.metaDesc !== undefined) setMetaDesc(parsed.metaDesc);
        if (parsed.canonicalUrl !== undefined) setCanonicalUrl(parsed.canonicalUrl);
        if (parsed.content !== undefined) setContent(parsed.content);
        if (parsed.isPublished !== undefined) setIsPublished(parsed.isPublished);
        if (parsed.noIndex !== undefined) setNoIndex(parsed.noIndex);
        if (parsed.noFollow !== undefined) setNoFollow(parsed.noFollow);
        if (parsed.faqs !== undefined) setFaqs(parsed.faqs);

        setHasDraft(false);
        toast.success('تمت استعادة كافة البيانات المحفوظة بنجاح!');
      }
    } catch {
      toast.error('تعذر استرجاع المسودة');
    }
  };

  const handleDiscardDraft = () => {
    if (window.confirm('هل تريد حذف المسودة المحفوظة تلقائياً؟')) {
      localStorage.removeItem(storageKey);
      setHasDraft(false);
      toast.info('تم تجاهل المسودة');
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
    const finalCategorySlug = (formData.get('categorySlug') as string) || categorySlug;

    if (!title.trim()) {
      toast.error('يرجى إدخال عنوان المقال الرئيسي (H1)');
      return;
    }

    if (!cleanSlug) {
      toast.error('يرجى إدخال الرابط الدائم (Slug)');
      return;
    }

    if (!finalCategorySlug) {
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
    formData.set('targetArea', targetArea);
    formData.set('categorySlug', finalCategorySlug);
    formData.set('excerpt', excerpt);
    formData.set('featuredImage', featuredImage);
    formData.set('altText', altText);
    formData.set('metaTitle', metaTitle);
    formData.set('metaDesc', metaDesc);
    formData.set('canonicalUrl', canonicalUrl);
    formData.set('content', content);
    formData.set('faqs', JSON.stringify(validFaqs));
    formData.set('isPublished', isPublished ? 'true' : 'false');
    formData.set('noIndex', noIndex ? 'true' : 'false');
    formData.set('noFollow', noFollow ? 'true' : 'false');

    setIsSubmitting(true);
    const toastId = toast.loading('جاري حفظ التعديلات...');

    try {
      await updateAction(formData);

      localStorage.removeItem(storageKey);
      setIsDirty(false);

      toast.success(isPublished ? 'تم حفظ وتحديث المقال بنجاح!' : 'تم حفظ التعديلات كمسودة بنجاح!', {
        id: toastId,
      });

      router.refresh();
    } catch (error: any) {
      toast.error(error?.message || 'تعذر تحديث المقال، يرجى المحاولة لاحقاً', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* شريط التحكم العلوي المثبت */}
      <div className="sticky top-16 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-sm backdrop-blur">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="flex items-center gap-1 rounded-xl bg-gray-100 p-2 text-xs font-bold text-gray-700 hover:bg-gray-200 transition"
            title="العودة للوحة التحكم"
          >
            <ArrowRight size={18} />
            <span className="hidden sm:inline">الرئيسية</span>
          </Link>
          <span className="text-xs font-bold text-gray-800 sm:text-sm">تعديل المقال</span>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400 bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-full">
            {isSavedLocally ? (
              <>
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                <span className="text-emerald-700 font-semibold">محفوظ محلياً</span>
              </>
            ) : isDirty ? (
              <span className="text-amber-600">تغييرات غير محفوظة</span>
            ) : (
              <span>كل شيء محفوظ</span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* زر المعاينة / عرض المقال */}
          {slug && (
            <a
              href={`/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-bold text-gray-700 shadow-xs hover:bg-gray-50 hover:text-blue-600 transition"
            >
              <ExternalLink size={14} />
              <span>{isPublished ? 'عرض المقال' : 'معاينة المسودة'}</span>
            </a>
          )}

          {/* زر حفظ التعديلات العلوي */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-bold text-white shadow-xs transition active:scale-95 disabled:opacity-50 ${
              isPublished ? 'bg-blue-600 hover:bg-blue-700' : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            <Save size={14} />
            <span>{isSubmitting ? 'جاري الحفظ...' : 'حفظ التعديلات'}</span>
          </button>
        </div>
      </div>

      {/* شريط استرجاع المسودة */}
      {hasDraft && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900 sm:text-sm">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <span>يوجد نسخة محفوظة تلقائياً لهذا المقال من جلستك السابقة، هل ترغب باستعادتها؟</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRestoreDraft}
              className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-amber-700 transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>استعادة البيانات</span>
            </button>
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="rounded-xl bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 border border-slate-200 hover:bg-slate-50 transition"
            >
              تجاهل
            </button>
          </div>
        </div>
      )}

      {/* العنوان والرابط الدائم */}
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

      {/* التصنيف والمنطقة الجغرافية فقط (بدون الكلمة المفتاحية) */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-bold text-gray-700">التصنيف</label>
          <select
            name="categorySlug"
            value={categorySlug}
            onChange={(e) => setCategorySlug(e.target.value)}
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
          <label className="mb-1 block text-xs font-bold text-gray-700">المنطقة المستهدفة</label>
          <input
            type="text"
            name="targetArea"
            value={targetArea}
            onChange={(e) => setTargetArea(e.target.value)}
            className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-hidden"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold text-gray-700">المقتطف (Excerpt)</label>
        <textarea
          name="excerpt"
          rows={2}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-hidden"
        />
      </div>

      {/* إعدادات الصورة البارزة */}
      <div className="space-y-4 rounded-2xl border border-gray-100 bg-gray-50/50 p-5">
        <h3 className="text-xs font-bold text-gray-800">إعدادات الصورة البارزة (Featured Image & SEO)</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <ImageUploader
              initialImage={featuredImage}
              name="featuredImage"
              onChange={(url) => setFeaturedImage(url)}
            />
          </div>

          <div className="flex flex-col justify-start">
            <label className="mb-1 block text-xs font-bold text-gray-700">النص البديل للصورة (Alt Text)</label>
            <input
              type="text"
              name="altText"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="مثال: ورشة تصليح وصيانة سيارات في الكويت"
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

      {/* قسم حالة النشر والتحكم في محركات البحث */}
      <div className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
        <div>
          <h3 className="text-xs font-bold text-gray-800">حالة النشر والظهور في محركات البحث</h3>
          <p className="text-[11px] text-gray-400">تحكم في حالة المقال وتوجيهات عناكب الأرشفة</p>
        </div>

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

      {/* قسم الـ SEO المدمج: الكلمة المفتاحية + العنوان والوصف + المعاين المباشر */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs space-y-4">
        <div>
          <h3 className="text-xs font-bold text-gray-800">تحسين محركات البحث (SEO Settings)</h3>
          <p className="text-[11px] text-gray-400">حدد الكلمة المفتاحية المستهدفة وعنوان ووصف السيو</p>
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-gray-700">
            الكلمة المفتاحية المستهدفة (Focus Target Keyword)
          </label>
          <input
            type="text"
            name="targetKeyword"
            value={targetKeyword}
            onChange={(e) => setTargetKeyword(e.target.value)}
            placeholder="مثال: تبديل بطارية سيارات"
            className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-hidden"
          />
          <p className="mt-1 text-[11px] text-gray-400">
            العبارة الأساسية التي يستهدفها المقال ويتم فحص كثافتها وتوزيعها في المحتوى
          </p>
        </div>

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
      </div>

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

      {/* الرابط الكنسي */}
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

      {/* زر الحفظ السفلي */}
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
  );
}