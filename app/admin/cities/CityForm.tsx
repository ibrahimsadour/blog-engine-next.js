'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function CityForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    metaTitle: initialData?.metaTitle || '',
    metaDesc: initialData?.metaDesc || '',
    keywords: initialData?.keywords || '',
    sortOrder: initialData?.sortOrder ?? 0,
    isActive: initialData?.isActive ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = initialData ? `/api/cities/${initialData.id}` : '/api/cities';
      const method = initialData ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error('فشل حفظ المدينة');

      toast.success('تم الحفظ بنجاح');
      router.push('/admin/cities');
      router.refresh();
    } catch (error) {
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-white p-6 rounded-xl border shadow-sm">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">اسم المدينة</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border rounded-lg p-2.5 text-sm"
            placeholder="مثال: مدينة الكويت"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">الرابط اللطيف (Slug)</label>
          <input
            type="text"
            required
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="w-full border rounded-lg p-2.5 text-sm"
            placeholder="kuwait-city"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">الوصف</label>
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full border rounded-lg p-2.5 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">ترتيب العرض</label>
          <input
            type="number"
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
            className="w-full border rounded-lg p-2.5 text-sm"
          />
        </div>
        <div className="flex items-center pt-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-blue-600"
            />
            <span className="text-sm font-bold text-gray-700">المدينة مفعلة</span>
          </label>
        </div>
      </div>

      <div className="border-t pt-4 space-y-4">
        <h3 className="font-bold text-gray-900">إعدادات محركات البحث (SEO)</h3>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">عنوان الميتا (Meta Title)</label>
          <input
            type="text"
            value={form.metaTitle}
            onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
            className="w-full border rounded-lg p-2.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">وصف الميتا (Meta Description)</label>
          <textarea
            rows={2}
            value={form.metaDesc}
            onChange={(e) => setForm({ ...form, metaDesc: e.target.value })}
            className="w-full border rounded-lg p-2.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">الكلمات المفتاحية (Keywords)</label>
          <input
            type="text"
            value={form.keywords}
            onChange={(e) => setForm({ ...form, keywords: e.target.value })}
            className="w-full border rounded-lg p-2.5 text-sm"
            placeholder="كلمة1، كلمة2، كلمة3"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700 transition"
      >
        {loading ? 'جاري الحفظ...' : 'حفظ المدينة'}
      </button>
    </form>
  );
}