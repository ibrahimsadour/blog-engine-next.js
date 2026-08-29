'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Upload, Trash2, Edit, Plus } from 'lucide-react';

export default function CitiesClient({ initialCities }: { initialCities: any[] }) {
  const router = useRouter();
  const [cities, setCities] = useState(initialCities);
  const [uploading, setUploading] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه المدينة؟')) return;
    try {
      const res = await fetch(`/api/cities/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('فشل الحذف');
      setCities(cities.filter((c) => c.id !== id));
      toast.success('تم الحذف بنجاح');
    } catch (error) {
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/cities', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل الاستيراد');

      toast.success(`تم استيراد ${data.count} مدينة بنجاح!`);
      router.refresh();
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ أثناء رفع ملف الإكسل');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">إدارة المدن</h1>
        <div className="flex gap-3">
          <label className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-green-700 transition text-sm font-bold">
            <Upload className="w-4 h-4" />
            {uploading ? 'جاري الرفع...' : 'رفع ملف Excel'}
            <input type="file" accept=".xlsx, .xls" onChange={handleExcelUpload} className="hidden" />
          </label>
          <Link
            href="/admin/cities/new"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-bold"
          >
            <Plus className="w-4 h-4" /> إضافة مدينة جديدة
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-right border-collapse">
          <thead className="bg-gray-50 border-b text-xs text-gray-500 uppercase">
            <tr>
              <th className="p-4">اسم المدينة</th>
              <th className="p-4">الرابط (Slug)</th>
              <th className="p-4">عنوان الـ SEO</th>
              <th className="p-4 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {cities.map((city) => (
              <tr key={city.id} className="hover:bg-gray-50">
                <td className="p-4 font-bold">{city.name}</td>
                <td className="p-4 font-mono text-gray-500">{city.slug}</td>
                <td className="p-4 text-gray-600 truncate max-w-xs">{city.metaTitle || '-'}</td>
                <td className="p-4 flex justify-center gap-2">
                  <Link href={`/admin/cities/${city.id}/edit`} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                    <Edit className="w-4 h-4 text-blue-600" />
                  </Link>
                  <button onClick={() => handleDelete(city.id)} className="p-2 bg-red-50 rounded-lg hover:bg-red-100">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </td>
              </tr>
            ))}
            {cities.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-400">لا توجد مدن مضافة حالياً.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}