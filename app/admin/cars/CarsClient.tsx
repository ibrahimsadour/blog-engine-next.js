'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Upload, Trash2, Edit, Plus, Download } from 'lucide-react';

export default function CarsClient({ initialCars }: { initialCars: any[] }) {
  const router = useRouter();
  const [cars, setCars] = useState(initialCars);
  const [uploading, setUploading] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    try {
      const res = await fetch(`/api/cars/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('فشل الحذف');
      setCars(cars.filter((c) => c.id !== id));
      toast.success('تم الحذف بنجاح');
    } catch (error) {
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('تحذير: هل أنت متأكد من حذف جميع السيارات نهائياً؟')) return;
    try {
      const res = await fetch('/api/cars', { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل الحذف');

      setCars([]);
      toast.success(`تم حذف جميع السيارات (${data.count}) بنجاح`);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ أثناء الحذف الجماعي');
    }
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/cars', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل الاستيراد');

      toast.success(`تم استيراد ${data.count} سيارة بنجاح!`);
      router.refresh();
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ أثناء رفع الملف');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">إدارة السيارات</h1>
        <div className="flex gap-3 flex-wrap">

          <label className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-green-700 transition text-sm font-bold">
            <Upload className="w-4 h-4" />
            {uploading ? 'جاري الرفع...' : 'رفع Excel'}
            <input type="file" accept=".xlsx, .xls" onChange={handleExcelUpload} className="hidden" />
          </label>
          <Link
            href="/admin/cars/new"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-bold"
          >
            <Plus className="w-4 h-4" /> إضافة سيارة
          </Link>
          <button
            onClick={handleDeleteAll}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm font-bold"
          >
            <Trash2 className="w-4 h-4" /> حذف الكل
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-right border-collapse">
          <thead className="bg-gray-50 border-b text-xs text-gray-500 uppercase">
            <tr>
              <th className="p-4">اسم السيارة</th>
              <th className="p-4">الرابط</th>
              <th className="p-4">عنوان الـ SEO</th>
              <th className="p-4 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {cars.map((car) => (
              <tr key={car.id} className="hover:bg-gray-50">
                <td className="p-4 font-bold">{car.name}</td>
                <td className="p-4 font-mono text-gray-500">{car.slug}</td>
                <td className="p-4 text-gray-600 truncate max-w-xs">{car.metaTitle || '-'}</td>
                <td className="p-4 flex justify-center gap-2">
                  <Link href={`/admin/cars/${car.id}/edit`} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                    <Edit className="w-4 h-4 text-blue-600" />
                  </Link>
                  <button onClick={() => handleDelete(car.id)} className="p-2 bg-red-50 rounded-lg hover:bg-red-100">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </td>
              </tr>
            ))}
            {cars.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-400">لا توجد سيارات مضافة حالياً.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}