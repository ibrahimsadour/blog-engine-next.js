'use client';

import { useState } from 'react';

interface SeoLiveOptimizerProps {
  title: string;
  slug: string;
  metaTitle: string;
  metaDesc: string;
  targetKeyword: string;
  content: string;
  onMetaTitleChange: (val: string) => void;
  onMetaDescChange: (val: string) => void;
}

export default function SeoLiveOptimizer({
  title,
  slug,
  metaTitle,
  metaDesc,
  targetKeyword,
  content,
  onMetaTitleChange,
  onMetaDescChange,
}: SeoLiveOptimizerProps) {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

  // تجهيز النصوص للمعاينة
  const displayTitle = metaTitle.trim() || title.trim() || 'عنوان المقال التجريبي يظهر هنا';
  const displayDesc =
    metaDesc.trim() ||
    'وصف المقال التجريبي الذي سيظهر للمستخدمين عند ظهور الموقع في نتائج محركات البحث جوجل...';
  const displaySlug = slug.trim() || 'article-slug';

  // معايير أطوال النصوص
  const titleLen = metaTitle.length;
  const descLen = metaDesc.length;

  const getTitleStatus = () => {
    if (titleLen === 0) return { color: 'text-gray-400', bg: 'bg-gray-200', text: 'فارغ (سيتم استخدام H1 تلقائياً)' };
    if (titleLen < 40) return { color: 'text-amber-500', bg: 'bg-amber-400', text: 'قصير قليلاً' };
    if (titleLen <= 60) return { color: 'text-emerald-600', bg: 'bg-emerald-500', text: 'مثالي جداً' };
    return { color: 'text-red-500', bg: 'bg-red-500', text: 'طويل (قد يُقتطع في جوجل)' };
  };

  const getDescStatus = () => {
    if (descLen === 0) return { color: 'text-gray-400', bg: 'bg-gray-200', text: 'فارغ' };
    if (descLen < 120) return { color: 'text-amber-500', bg: 'bg-amber-400', text: 'قصير' };
    if (descLen <= 160) return { color: 'text-emerald-600', bg: 'bg-emerald-500', text: 'مثالي جداً' };
    return { color: 'text-red-500', bg: 'bg-red-500', text: 'طويل (سيُقتطع في جوجل)' };
  };

  const titleStatus = getTitleStatus();
  const descStatus = getDescStatus();

  // فحص الكلمة المفتاحية
  const cleanContentText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = cleanContentText.split(' ').filter(Boolean);
  const totalWords = words.length;

  const kw = targetKeyword.trim().toLowerCase();
  const hasKeyword = kw.length > 0;

  // 1. في العنوان
  const inH1 = hasKeyword && (title.toLowerCase().includes(kw) || metaTitle.toLowerCase().includes(kw));
  // 2. في الرابط
  const inSlug = hasKeyword && slug.toLowerCase().includes(kw.replace(/\s+/g, '-'));
  // 3. في الوصف
  const inDesc = hasKeyword && metaDesc.toLowerCase().includes(kw);
  // 4. في أول 100 كلمة
  const first100Words = words.slice(0, 100).join(' ').toLowerCase();
  const inIntro = hasKeyword && first100Words.includes(kw);
  // 5. كثافة الكلمة
  const kwMatches = hasKeyword ? (cleanContentText.toLowerCase().match(new RegExp(kw, 'g')) || []).length : 0;
  const kwDensity = totalWords > 0 && hasKeyword ? ((kwMatches / totalWords) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-sm font-black text-blue-600">
            SEO
          </span>
          <h3 className="text-sm font-bold text-gray-900">مساعد الـ On-Page SEO والمعاينة الحية</h3>
        </div>

        {/* أزرار تبديل نوع العرض */}
        <div className="flex rounded-lg bg-gray-100 p-1 text-xs font-bold text-gray-600">
          <button
            type="button"
            onClick={() => setDevice('desktop')}
            className={`rounded-md px-3 py-1 transition cursor-pointer ${
              device === 'desktop' ? 'bg-white text-blue-600 shadow-xs' : 'hover:text-gray-900'
            }`}
          >
            كمبيوتر
          </button>
          <button
            type="button"
            onClick={() => setDevice('mobile')}
            className={`rounded-md px-3 py-1 transition cursor-pointer ${
              device === 'mobile' ? 'bg-white text-blue-600 shadow-xs' : 'hover:text-gray-900'
            }`}
          >
            هاتف
          </button>
        </div>
      </div>

      {/* نافذة محاكاة نتيجة بحث Google (SERP Preview) */}
      <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
        <span className="mb-2 block text-[11px] font-bold text-gray-400">معاينة النتيجة في Google:</span>

        <div
          className={`rounded-xl bg-white p-4 shadow-xs transition-all ${
            device === 'mobile' ? 'max-w-sm border border-gray-200' : 'w-full'
          }`}
        >
          {/* رابط الموقع والمسار المباشر */}
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
              G
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-gray-800">موقعك الإلكتروني</span>
              <span className="font-mono text-[10px] text-gray-500" dir="ltr">
                https://yourdomain.com/{displaySlug}
              </span>
            </div>
          </div>

          {/* العنوان الأزرق */}
          <h4 className="mt-2 line-clamp-1 cursor-pointer text-base font-medium text-[#1a0dab] hover:underline">
            {displayTitle}
          </h4>

          {/* الوصف */}
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#4d5156]">
            {displayDesc}
          </p>
        </div>
      </div>

      {/* حقول Meta Title & Description مع العدادات الذكية */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <div className="mb-1 flex items-center justify-between text-xs">
            <label className="font-bold text-gray-700">Meta Title (عنوان محرك البحث)</label>
            <span className={`font-mono font-bold ${titleStatus.color}`}>
              {titleLen}/60 ({titleStatus.text})
            </span>
          </div>
          <input
            type="text"
            name="metaTitle"
            value={metaTitle}
            onChange={(e) => onMetaTitleChange(e.target.value)}
            placeholder="عنوان مخصص للظهور في محركات البحث..."
            className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-hidden"
          />
          {/* شريط مؤشر الطول */}
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full transition-all duration-300 ${titleStatus.bg}`}
              style={{ width: `${Math.min((titleLen / 60) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between text-xs">
            <label className="font-bold text-gray-700">Meta Description (الوصف في محرك البحث)</label>
            <span className={`font-mono font-bold ${descStatus.color}`}>
              {descLen}/160 ({descStatus.text})
            </span>
          </div>
          <textarea
            name="metaDesc"
            rows={2}
            value={metaDesc}
            onChange={(e) => onMetaDescChange(e.target.value)}
            placeholder="وصف مخصص للظهور في محركات البحث..."
            className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-hidden"
          />
          {/* شريط مؤشر الطول */}
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full transition-all duration-300 ${descStatus.bg}`}
              style={{ width: `${Math.min((descLen / 160) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* قائمة التدقيق الحية للكلمة المفتاحية (Keyword Checklist) */}
      <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-bold text-gray-800">
            تدقيق الكلمة المفتاحية: {targetKeyword ? <span className="text-blue-600 font-black">"{targetKeyword}"</span> : <span className="text-gray-400">(لم تحدد كلمة بعد)</span>}
          </span>
          <span className="text-[11px] font-bold text-gray-500">
            إجمالي الكلمات: {totalWords} كلمة
          </span>
        </div>

        <div className="grid gap-2 text-xs sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <span>{inH1 ? '✅' : '❌'}</span>
            <span className={inH1 ? 'text-gray-700 font-bold' : 'text-gray-400'}>
              موجودة في العنوان (H1 / Title)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span>{inSlug ? '✅' : '❌'}</span>
            <span className={inSlug ? 'text-gray-700 font-bold' : 'text-gray-400'}>
              موجودة في الرابط (Slug)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span>{inDesc ? '✅' : '❌'}</span>
            <span className={inDesc ? 'text-gray-700 font-bold' : 'text-gray-400'}>
              موجودة في الـ Meta Description
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span>{inIntro ? '✅' : '❌'}</span>
            <span className={inIntro ? 'text-gray-700 font-bold' : 'text-gray-400'}>
              موجودة في مقدمة المقال (أول 100 كلمة)
            </span>
          </div>

          <div className="flex items-center gap-2 sm:col-span-2">
            <span>{kwMatches > 0 ? '📊' : '⚪'}</span>
            <span className="text-gray-700">
              تكرار الكلمة في المحتوى: <strong className="font-bold text-blue-700">{kwMatches} مرات</strong> (الكثافة: <strong className="font-bold text-blue-700">{kwDensity}%</strong>)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}