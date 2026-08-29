'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Upload, Trash2, Edit, Plus } from 'lucide-react';

export default function ServicesClient({ initialServices }: { initialServices: any[] }) {
  const router = useRouter();
  const [services, setServices] = useState(initialServices);
  const [uploading, setUploading] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('فشل الحذف');
      setServices(services.filter((s) => s.id !== id));
      toast.success('تم الحذف بنجاح');
    } catch (error) {
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('تحذير: هل أنت متأكد من حذف جميع الخدمات نهائياً؟')) return;
    try {
      const res = await fetch('/api/services', { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل الحذف');

      setServices([]);
      toast.success(`تم حذف جميع الخدمات (${data.count}) بنجاح`);
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
      const res = await fetch('/api/services', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل الاستيراد');

      toast.success(`تم استيراد ${data.count} خدمة بنجاح!`);
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
        <h1 className="text-2xl font-bold">إدارة الخدمات</h1>
        <div className="flex gap-3 flex-wrap">
          <label className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-green-700 transition text-sm font-bold">
            <Upload className="w-4 h-4" />
            {uploading ? 'جاري الرفع...' : 'رفع Excel'}
            <input type="file" accept=".xlsx, .xls" onChange={handleExcelUpload} className="hidden" />
          </label>
          <Link
            href="/admin/services/new"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-bold"
          >
            <Plus className="w-4 h-4" /> إضافة خدمة
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
              <th className="p-4">اسم الخدمة</th>
              <th className="p-4">الرابط</th>
              <th className="p-4">عنوان الـ SEO</th>
              <th className="p-4 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {services.map((service) => (
              <tr key={service.id} className="hover:bg-gray-50">
                <td className="p-4 font-bold">{service.name}</td>
                <td className="p-4 font-mono text-gray-500">{service.slug}</td>
                <td className="p-4 text-gray-600 truncate max-w-xs">{service.metaTitle || '-'}</td>
                <td className="p-4 flex justify-center gap-2">
                  <Link href={`/admin/services/${service.id}/edit`} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                    <Edit className="w-4 h-4 text-blue-600" />
                  </Link>
                  <button onClick={() => handleDelete(service.id)} className="p-2 bg-red-50 rounded-lg hover:bg-red-100">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-400">لا توجد خدمات مضافة حالياً.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}