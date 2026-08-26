'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';

interface ImageUploaderProps {
  initialImage?: string;
  name?: string;
}

export default function ImageUploader({
  initialImage = '',
  name = 'featuredImage',
}: ImageUploaderProps) {
  const [imageUrl, setImageUrl] = useState(initialImage);
  const [isUploading, setIsUploading] = useState(false);
  const [useCustomUrl, setUseCustomUrl] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الصورة كبير جداً (الحد الأقصى 5 ميغابايت)');
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

      setImageUrl(data.url);
      toast.success('تم رفع الصورة بنجاح!', { id: toastId });
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ أثناء الرفع', { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleRemoveImage() {
    if (imageUrl.startsWith('/uploads/')) {
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
    setImageUrl('');
    toast.info('تمت إزالة الصورة');
  }

  return (
    <div className="space-y-3">
      {/* حقل القيمة المخفي الذي يُرسل مع النموذج */}
      <input type="hidden" name={name} value={imageUrl} />

      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-gray-700">الصورة البارزة للمقال</label>
        <button
          type="button"
          onClick={() => setUseCustomUrl(!useCustomUrl)}
          className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
        >
          {useCustomUrl ? 'الرفع من الجهاز' : 'استخدام رابط خارجي'}
        </button>
      </div>

      {imageUrl ? (
        <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-2">
          <div className="relative h-52 w-full rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={imageUrl}
              alt="معاينة الصورة"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="mt-2 flex items-center justify-between px-1">
            <span className="truncate text-xs font-mono text-gray-500 max-w-[70%]" dir="ltr">
              {imageUrl}
            </span>
            <button
              type="button"
              onClick={handleRemoveImage}
              className="rounded-lg bg-red-50 px-3 py-1 text-xs font-bold text-red-600 hover:bg-red-100 cursor-pointer"
            >
              حذف الصورة
            </button>
          </div>
        </div>
      ) : useCustomUrl ? (
        <div>
          <input
            type="url"
            placeholder="https://example.com/banner.webp"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm font-mono focus:border-blue-500 focus:outline-hidden"
          />
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white p-6 text-center transition hover:border-blue-500 hover:bg-blue-50/20"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <div className="text-3xl mb-1">🖼️</div>
          <p className="text-xs font-bold text-gray-700">
            {isUploading ? 'جاري الرفع...' : 'اضغط لاختيار صورة من جهازك'}
          </p>
          <p className="mt-1 text-[11px] text-gray-400">PNG, JPG, WebP (بحد أقصى 5MB)</p>
        </div>
      )}
    </div>
  );
}