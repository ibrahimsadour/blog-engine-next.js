'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function isManagedImageUrl(url: string): boolean {
  return url.startsWith('/api/media/') || url.startsWith('/uploads/');
}

interface ImageUploaderProps {
  initialImage?: string;
  value?: string;
  compact?: boolean;
  name?: string;
  onChange?: (url: string) => void;
}

export default function ImageUploader({
  initialImage = '',
  value,
  compact = false,
  name = 'featuredImage',
  onChange,
}: ImageUploaderProps) {
  const [internalImageUrl, setImageUrl] = useState(initialImage);
  const imageUrl = value ?? internalImageUrl;
  const [isUploading, setIsUploading] = useState(false);
  const [useCustomUrl, setUseCustomUrl] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateImageUrl = (newUrl: string) => {
    setImageUrl(newUrl);
    onChange?.(newUrl);
  };

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      toast.error('يُسمح فقط بصور JPG وPNG وWebP');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      toast.error('حجم الصورة كبير جداً (الحد الأقصى 5 ميغابايت)');
      e.target.value = '';
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading('جاري رفع الصورة...');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'فشل الرفع');

      updateImageUrl(data.url);
      toast.success('تم رفع الصورة بنجاح!', { id: toastId });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'حدث خطأ أثناء الرفع';
      toast.error(message, { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleRemoveImage() {
    if (isManagedImageUrl(imageUrl)) {
      try {
        await fetch('/api/upload', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: imageUrl }),
        });
      } catch {
        // حذف الرابط حتى وإن تعذر حذف الملف الفيزيائي
      }
    }
    updateImageUrl('');
    toast.info('تمت إزالة الصورة');
  }

  function applyCustomUrl() {
    try {
      const url = new URL(customUrl.trim());
      if (url.protocol !== 'https:' || url.username || url.password) throw new Error('invalid');
      updateImageUrl(url.toString());
      setUseCustomUrl(false);
    } catch {
      toast.error('أدخل رابط صورة صحيحًا يبدأ بـ https://');
    }
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={imageUrl} />
      <input ref={fileInputRef} type="file" disabled={isUploading}
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        onChange={handleFileUpload} className="hidden" aria-label="اختيار ملف الصورة" />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-bold text-gray-700">{compact ? 'رفع الصورة' : 'الصورة البارزة للمقال'}</span>
        <button type="button" disabled={isUploading}
          onClick={() => { setCustomUrl(imageUrl); setUseCustomUrl(!useCustomUrl); }}
          aria-expanded={useCustomUrl}
          className="cursor-pointer text-[11px] font-bold text-blue-600 hover:underline">
          {useCustomUrl ? 'إلغاء الرابط الخارجي' : 'استخدام رابط خارجي'}
        </button>
      </div>

      {useCustomUrl && (
        <div className="space-y-2 rounded border border-gray-200 bg-gray-50 p-3">
          <label className="block text-xs text-gray-700">
            رابط الصورة الخارجي
            <input type="text" inputMode="url" dir="ltr" value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyCustomUrl(); } }}
              placeholder="https://example.com/image.webp"
              className="mt-2 w-full rounded border border-gray-300 bg-white p-2 text-xs" />
          </label>
          <button type="button" onClick={applyCustomUrl} className="rounded border border-blue-600 bg-white px-3 py-1.5 text-xs text-blue-700">اعتماد الصورة</button>
        </div>
      )}

      {imageUrl ? (
        <div className="overflow-hidden rounded border border-gray-200 bg-gray-50 p-2">
          <div className={`relative w-full overflow-hidden rounded bg-gray-100 ${compact ? 'aspect-video' : 'h-52'}`}>
            <Image src={imageUrl} alt="معاينة الصورة" fill className={compact ? 'object-contain' : 'object-cover'}
              sizes={compact ? '(min-width: 1280px) 248px, 100vw' : '(max-width: 768px) 100vw, 50vw'} />
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <button type="button" disabled={isUploading} onClick={() => fileInputRef.current?.click()}
              className="text-xs text-blue-700 underline">{isUploading ? 'جاري الرفع...' : 'استبدال الصورة'}</button>
            <button type="button" disabled={isUploading} onClick={handleRemoveImage}
              className="text-xs text-red-600 underline">إزالة الصورة</button>
          </div>
        </div>
      ) : (
        <button type="button" disabled={isUploading} onClick={() => fileInputRef.current?.click()}
          className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center hover:border-blue-500 hover:bg-blue-50 disabled:opacity-50">
          <span className="text-2xl" aria-hidden="true">▧</span>
          <span className="text-xs font-semibold text-blue-700">{isUploading ? 'جاري رفع الصورة...' : 'تعيين الصورة البارزة'}</span>
          <span className="text-[11px] text-gray-500">JPG · PNG · WebP — حتى 5MB</span>
        </button>
      )}
    </div>
  );
}
