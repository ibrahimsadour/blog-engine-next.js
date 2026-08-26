'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import ImageUploader from '@/components/ImageUploader';

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  ssr: false,
  loading: () => (
    <div className="h-48 w-full animate-pulse rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs font-bold text-gray-400">
      جاري تحميل المحرر المرئي...
    </div>
  ),
});

interface SettingsFormProps {
  initialSettings: Record<string, string>;
  saveIdentityAction: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
  saveHeroAction: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
  saveHomeContentAction: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
  saveSocialAction: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
  saveHomeSeoAction: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
  saveFooterAction: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
  saveHeadCodeAction: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
  saveRobotsTxtAction: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
}

export default function SettingsForm({
  initialSettings,
  saveIdentityAction,
  saveHeroAction,
  saveHomeContentAction,
  saveSocialAction,
  saveHomeSeoAction,
  saveFooterAction,
  saveHeadCodeAction,
  saveRobotsTxtAction,
}: SettingsFormProps) {
  const router = useRouter();

  const [loadingIdentity, setLoadingIdentity] = useState(false);
  const [loadingHero, setLoadingHero] = useState(false);
  const [loadingHomeContent, setLoadingHomeContent] = useState(false);
  const [homeContent, setHomeContent] = useState(initialSettings['home_custom_content'] || '');
  const [loadingSocial, setLoadingSocial] = useState(false);
  const [loadingHomeSeo, setLoadingHomeSeo] = useState(false);
  const [loadingFooter, setLoadingFooter] = useState(false);
  const [loadingHead, setLoadingHead] = useState(false);
  const [loadingRobots, setLoadingRobots] = useState(false);

  const defaultRobots = `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /login\nDisallow: /api/`;

  // 1. حفظ الهوية وبيانات الاتصال
  async function handleIdentitySubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const siteName = (formData.get('siteName') as string)?.trim();
    const phoneNumber = (formData.get('phoneNumber') as string)?.trim();
    const whatsappNumber = (formData.get('whatsappNumber') as string)?.trim();

    if (!siteName) {
      toast.error('يرجى إدخال اسم الموقع');
      return;
    }

    if (!phoneNumber) {
      toast.error('يرجى إدخال رقم الهاتف العام');
      return;
    }

    const phoneRegex = /^[+]?[\d\s-]{7,18}$/;
    if (!phoneRegex.test(phoneNumber)) {
      toast.error('صيغة رقم الهاتف غير صحيحة');
      return;
    }

    if (whatsappNumber && !/^\d{7,18}$/.test(whatsappNumber)) {
      toast.error('رقم الواتساب يجب أن يتكون من أرقام فقط مع رمز الدولة (بدون + أو مسافات)');
      return;
    }

    setLoadingIdentity(true);
    const toastId = toast.loading('جاري حفظ بيانات الهوية والاتصال...');

    try {
      const res = await saveIdentityAction(formData);
      if (!res.success) {
        toast.error(res.error || 'تعذر حفظ البيانات', { id: toastId });
      } else {
        toast.success('تم حفظ بيانات الهوية والاتصال بنجاح!', { id: toastId });
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err?.message || 'حدث خطأ غير متوقع', { id: toastId });
    } finally {
      setLoadingIdentity(false);
    }
  }

  // 2. حفظ قسم الهيرو (الصفحة الرئيسية)
  async function handleHeroSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const heroTitle = (formData.get('heroTitle') as string)?.trim();
    if (!heroTitle) {
      toast.error('يرجى إدخال العنوان الرئيسي لواجهة الهيرو');
      return;
    }

    setLoadingHero(true);
    const toastId = toast.loading('جاري حفظ تخصيص واجهة الهيرو...');

    try {
      const res = await saveHeroAction(formData);
      if (!res.success) {
        toast.error(res.error || 'تعذر حفظ واجهة الهيرو', { id: toastId });
      } else {
        toast.success('تم حفظ وتحديث واجهة الهيرو بنجاح!', { id: toastId });
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err?.message || 'حدث خطأ غير متوقع', { id: toastId });
    } finally {
      setLoadingHero(false);
    }
  }

  // 3. حفظ المحتوى المخصص بالصفحة الرئيسية
  async function handleHomeContentSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData();
    formData.set('homeCustomContent', homeContent);

    setLoadingHomeContent(true);
    const toastId = toast.loading('جاري حفظ محتوى الصفحة الرئيسية...');

    try {
      const res = await saveHomeContentAction(formData);
      if (!res.success) {
        toast.error(res.error || 'تعذر حفظ المحتوى', { id: toastId });
      } else {
        toast.success('تم حفظ ونشر محتوى الصفحة الرئيسية بنجاح!', { id: toastId });
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err?.message || 'حدث خطأ غير متوقع', { id: toastId });
    } finally {
      setLoadingHomeContent(false);
    }
  }

  // 4. حفظ روابط التواصل الاجتماعي
  async function handleSocialSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    setLoadingSocial(true);
    const toastId = toast.loading('جاري حفظ روابط التواصل الاجتماعي...');

    try {
      const res = await saveSocialAction(formData);
      if (!res.success) {
        toast.error(res.error || 'تعذر حفظ روابط التواصل', { id: toastId });
      } else {
        toast.success('تم حفظ روابط التواصل بنجاح!', { id: toastId });
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err?.message || 'حدث خطأ غير متوقع', { id: toastId });
    } finally {
      setLoadingSocial(false);
    }
  }

  // 5. حفظ سيو الصفحة الرئيسية
  async function handleHomeSeoSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    setLoadingHomeSeo(true);
    const toastId = toast.loading('جاري حفظ إعدادات SEO الصفحة الرئيسية...');

    try {
      const res = await saveHomeSeoAction(formData);
      if (!res.success) {
        toast.error(res.error || 'تعذر حفظ إعدادات الـ SEO', { id: toastId });
      } else {
        toast.success('تم تحديث بيانات SEO الصفحة الرئيسية بنجاح!', { id: toastId });
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err?.message || 'حدث خطأ غير متوقع', { id: toastId });
    } finally {
      setLoadingHomeSeo(false);
    }
  }

  // 6. حفظ الفوتر
  async function handleFooterSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    setLoadingFooter(true);
    const toastId = toast.loading('جاري حفظ إعدادات الفوتر...');

    try {
      const res = await saveFooterAction(formData);
      if (!res.success) {
        toast.error(res.error || 'تعذر حفظ الفوتر', { id: toastId });
      } else {
        toast.success('تم حفظ إعدادات الفوتر بنجاح!', { id: toastId });
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err?.message || 'حدث خطأ غير متوقع', { id: toastId });
    } finally {
      setLoadingFooter(false);
    }
  }

  // 7. حفظ أكواد الـ Head
  async function handleHeadSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    setLoadingHead(true);
    const toastId = toast.loading('جاري حفظ أكواد الـ Head...');

    try {
      const res = await saveHeadCodeAction(formData);
      if (!res.success) {
        toast.error(res.error || 'تعذر حفظ الأكواد', { id: toastId });
      } else {
        toast.success('تم حفظ وتفعيل أكواد الـ Head بنجاح!', { id: toastId });
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err?.message || 'حدث خطأ غير متوقع', { id: toastId });
    } finally {
      setLoadingHead(false);
    }
  }

  // 8. حفظ ملف Robots.txt
  async function handleRobotsSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    setLoadingRobots(true);
    const toastId = toast.loading('جاري تحديث ملف Robots.txt...');

    try {
      const res = await saveRobotsTxtAction(formData);
      if (!res.success) {
        toast.error(res.error || 'تعذر تحديث ملف Robots.txt', { id: toastId });
      } else {
        toast.success('تم تحديث ملف Robots.txt بنجاح!', { id: toastId });
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err?.message || 'حدث خطأ غير متوقع', { id: toastId });
    } finally {
      setLoadingRobots(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* 1. قسم الهوية وبيانات الاتصال */}
      <form onSubmit={handleIdentitySubmit} className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="text-sm font-bold text-gray-800">الهوية البصرية وبيانات الاتصال</h2>
          <span className="text-[11px] text-gray-400">الاسم، الشعار، وأرقام التحويل السريع</span>
        </div>

        <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <label className="mb-2 block text-xs font-bold text-gray-700">شعار الموقع (Logo)</label>
          <div className="max-w-md">
            <ImageUploader initialImage={initialSettings['site_logo'] || ''} name="siteLogo" />
          </div>
          <p className="mt-1.5 text-[11px] text-gray-400">
            يمكنك رفع الشعار مباشرة بصيغة WebP أو PNG أو JPG مع إمكانية حذفه أو استبداله
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-bold text-gray-700">
              اسم الموقع <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="siteName"
              defaultValue={initialSettings['site_name'] || 'دليل الخدمات السريعة'}
              required
              className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-gray-700">
              رقم الهاتف للاتصال <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="phoneNumber"
              defaultValue={initialSettings['phone_number'] || '+96500000000'}
              placeholder="+965XXXXXXXX"
              dir="ltr"
              required
              className="w-full rounded-xl border border-gray-300 p-3 text-sm font-mono focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-gray-700">
              رقم الواتساب (بدون +) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="whatsappNumber"
              defaultValue={
                initialSettings['whatsapp_number'] ||
                initialSettings['phone_number']?.replace(/[^\d]/g, '') ||
                '96500000000'
              }
              placeholder="965XXXXXXXX"
              dir="ltr"
              required
              className="w-full rounded-xl border border-gray-300 p-3 text-sm font-mono focus:border-blue-500 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loadingIdentity}
            className="cursor-pointer rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700 active:scale-98 disabled:opacity-50"
          >
            {loadingIdentity ? 'جاري الحفظ...' : 'حفظ بيانات الهوية والاتصال'}
          </button>
        </div>
      </form>

      {/* 2. قسم تخصيص واجهة الهيرو (Hero Section) */}
      <form onSubmit={handleHeroSubmit} className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="text-sm font-bold text-gray-800">واجهة الاستقبال (Hero Section) - الصفحة الرئيسية</h2>
          <span className="text-[11px] text-gray-400">صورة الخلفية، العنوان الرئيسي، والنصوص الترويجية</span>
        </div>

        <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <label className="mb-2 block text-xs font-bold text-gray-700">صورة خلفية الهيرو (Background Image)</label>
          <div className="max-w-md">
            <ImageUploader initialImage={initialSettings['hero_bg_image'] || ''} name="heroBgImage" />
          </div>
          <p className="mt-1.5 text-[11px] text-gray-400">
            صورة عالية الدقة تظهر في خلفية القسم الرئيسي مع طبقة تعتيم احترافية لقراءة النصوص
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold text-gray-700">نص الشارة العلوية (Badge Text)</label>
            <input
              type="text"
              name="heroBadge"
              defaultValue={initialSettings['hero_badge'] || 'خدمات سريعة على مدار 24 ساعة'}
              placeholder="مثال: خدمات سريعة على مدار 24 ساعة"
              className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-gray-700">
              العنوان الرئيسي (Hero Title) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="heroTitle"
              defaultValue={
                initialSettings['hero_title'] || 'دليلك الشامل لأفضل وأسرع الخدمات الميدانية في الكويت'
              }
              required
              placeholder="مثال: دليلك الشامل لأفضل وأسرع الخدمات الميدانية في الكويت"
              className="w-full rounded-xl border border-gray-300 p-3 text-sm font-bold focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-gray-700">النص الوصفي التوضيحي (Subtitle)</label>
            <textarea
              name="heroSubtitle"
              rows={3}
              defaultValue={
                initialSettings['hero_subtitle'] ||
                'نخبة من الفنيين والخبراء المجهزين بأحدث المعدات للوصول إليك أينما كنت وفي أسرع وقت ممكن وبأعلى جودة.'
              }
              placeholder="نص وصفي موجز يظهر أسفل العنوان الرئيسي..."
              className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loadingHero}
            className="cursor-pointer rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700 active:scale-98 disabled:opacity-50"
          >
            {loadingHero ? 'جاري الحفظ...' : 'حفظ واجهة الهيرو'}
          </button>
        </div>
      </form>

      {/* 3. قسم محتوى الصفحة الرئيسية المخصص (بين التصنيفات والمقالات) */}
      <form onSubmit={handleHomeContentSubmit} className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-gray-800">محتوى الصفحة الرئيسية المخصص</h2>
            <p className="text-[11px] text-gray-400">يظهر هذا المحتوى بين أقسام الخدمات وقائمة المقالات في الصفحة الرئيسية</p>
          </div>
        </div>

        <div>
          <RichTextEditor content={homeContent} onChange={setHomeContent} />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loadingHomeContent}
            className="cursor-pointer rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700 active:scale-98 disabled:opacity-50"
          >
            {loadingHomeContent ? 'جاري الحفظ...' : 'حفظ ونشر المحتوى المخصص'}
          </button>
        </div>
      </form>

      {/* 4. قسم روابط التواصل الاجتماعي */}
      <form onSubmit={handleSocialSubmit} className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="text-sm font-bold text-gray-800">حسابات التواصل الاجتماعي للموقع</h2>
          <span className="text-[11px] text-gray-400">فيسبوك وإنستغرام</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-bold text-gray-700">رابط صفحة الفيسبوك (Facebook URL)</label>
            <input
              type="url"
              name="facebookUrl"
              defaultValue={initialSettings['facebook_url'] || ''}
              placeholder="https://facebook.com/your-page"
              dir="ltr"
              className="w-full rounded-xl border border-gray-300 p-3 text-sm font-mono focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-gray-700">رابط حساب الإنستغرام (Instagram URL)</label>
            <input
              type="url"
              name="instagramUrl"
              defaultValue={initialSettings['instagram_url'] || ''}
              placeholder="https://instagram.com/your-account"
              dir="ltr"
              className="w-full rounded-xl border border-gray-300 p-3 text-sm font-mono focus:border-blue-500 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loadingSocial}
            className="cursor-pointer rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700 active:scale-98 disabled:opacity-50"
          >
            {loadingSocial ? 'جاري الحفظ...' : 'حفظ حسابات التواصل'}
          </button>
        </div>
      </form>

      {/* 5. قسم إعدادات SEO الصفحة الرئيسية */}
      <form onSubmit={handleHomeSeoSubmit} className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="text-sm font-bold text-gray-800">إعدادات SEO الصفحة الرئيسية (Meta Tags)</h2>
          <span className="text-[11px] text-gray-400">العنوان، الوصف، والكلمات المفتاحية لمحركات البحث</span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold text-gray-700">Meta Title (عنوان الصفحة الرئيسية في جوجل)</label>
            <input
              type="text"
              name="homeMetaTitle"
              defaultValue={initialSettings['home_meta_title'] || ''}
              placeholder="مثال: دليل الخدمات والصيانة السريعة في الكويت | متوفر 24 ساعة"
              className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-gray-700">Meta Description (الوصف في محركات البحث)</label>
            <textarea
              name="homeMetaDesc"
              rows={3}
              defaultValue={initialSettings['home_meta_desc'] || ''}
              placeholder="وصف جذاب ومختصر يظهر في نتائج البحث تحت العنوان (150-160 حرف)..."
              className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-gray-700">الكلمات المفتاحية المستهدفة (Keywords)</label>
            <input
              type="text"
              name="homeKeywords"
              defaultValue={initialSettings['home_keywords'] || ''}
              placeholder="خدمات الكويت, تصليح سيارات, فني صحي, كهربائي منازل"
              className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loadingHomeSeo}
            className="cursor-pointer rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700 active:scale-98 disabled:opacity-50"
          >
            {loadingHomeSeo ? 'جاري الحفظ...' : 'حفظ إعدادات الـ SEO'}
          </button>
        </div>
      </form>

      {/* 6. قسم تخصيص الفوتر */}
      <form onSubmit={handleFooterSubmit} className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="text-sm font-bold text-gray-800">تخصيص الفوتر (Footer)</h2>
          <span className="text-[11px] text-gray-400">النصوص وروابط أسفل الموقع</span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold text-gray-700">النص التعريفي أسفل الشعار</label>
            <textarea
              name="footerDescription"
              rows={3}
              defaultValue={
                initialSettings['footer_description'] ||
                'دليل الخدمات الميدانية والصيانة السريعة في الكويت على مدار 24 ساعة بأعلى معايير الجودة والسرعة.'
              }
              className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-gray-700">نص قسم "تواصل معنا"</label>
            <input
              type="text"
              name="footerContactText"
              defaultValue={initialSettings['footer_contact_text'] || 'خدمات سريعة على مدار 24 ساعة'}
              className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loadingFooter}
            className="cursor-pointer rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700 active:scale-98 disabled:opacity-50"
          >
            {loadingFooter ? 'جاري الحفظ...' : 'حفظ إعدادات الفوتر'}
          </button>
        </div>
      </form>

      {/* 7. قسم كود الـ Head */}
      <form onSubmit={handleHeadSubmit} className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="text-sm font-bold text-gray-800">أكواد الـ &lt;head&gt; المخصصة</h2>
          <span className="text-[11px] text-gray-400">Google Analytics, Pixel, إلخ</span>
        </div>

        <div>
          <textarea
            name="headCode"
            rows={7}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            defaultValue={initialSettings['custom_head_code'] || ''}
            placeholder={`<!-- Google Analytics -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXX"></script>`}
            className="w-full rounded-xl border border-gray-300 bg-gray-900 p-4 font-mono text-xs text-green-400 placeholder:text-gray-600 focus:border-blue-500 focus:outline-hidden"
            dir="ltr"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loadingHead}
            className="cursor-pointer rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700 active:scale-98 disabled:opacity-50"
          >
            {loadingHead ? 'جاري الحفظ...' : 'حفظ أكواد Head'}
          </button>
        </div>
      </form>

      {/* 8. قسم ملف Robots.txt */}
      <form onSubmit={handleRobotsSubmit} className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="text-sm font-bold text-gray-800">محتوى ملف Robots.txt</h2>
          <span className="text-[11px] text-gray-400">توجيه عناكب محركات البحث</span>
        </div>

        <div>
          <textarea
            name="robotsTxt"
            rows={5}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            defaultValue={initialSettings['custom_robots_txt'] || defaultRobots}
            className="w-full rounded-xl border border-gray-300 bg-gray-900 p-4 font-mono text-xs text-blue-400 placeholder:text-gray-600 focus:border-blue-500 focus:outline-hidden"
            dir="ltr"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loadingRobots}
            className="cursor-pointer rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700 active:scale-98 disabled:opacity-50"
          >
            {loadingRobots ? 'جاري التحديث...' : 'حفظ ملف Robots.txt'}
          </button>
        </div>
      </form>
    </div>
  );
}