import { db } from '@/lib/db';
import { saveCityServiceContentAction } from '../actions';

export default async function AdminCityServicesPage() {
  const [cities, services, contents] = await Promise.all([
    db.city.findMany({ orderBy: { sortOrder: 'asc' } }),
    db.service.findMany({ orderBy: { sortOrder: 'asc' } }),
    db.cityServiceContent.findMany({ include: { city: true, service: true } }),
  ]);

  return (
    <main className="p-8 max-w-5xl mx-auto space-y-10">
      <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">إدارة وتخصيص محتوى خدمات المدن</h1>

        <form action={saveCityServiceContentAction} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اختر المدينة</label>
              <select name="cityId" required className="w-full border rounded-lg p-2.5 bg-white">
                <option value="">-- اختر المدينة --</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اختر الخدمة</label>
              <select name="serviceId" required className="w-full border rounded-lg p-2.5 bg-white">
                <option value="">-- اختر الخدمة --</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>{service.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">العنوان المخصص (H1)</label>
            <input type="text" name="customTitle" placeholder="مثال: تصليح هيدروليك حولي الاحترافي" className="w-full border rounded-lg p-2.5" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الوصف المخصص</label>
            <textarea name="customDescription" rows={3} placeholder="تفاصيل وصف الخدمة في هذه المدينة..." className="w-full border rounded-lg p-2.5" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">عنوان الميتا (Meta Title)</label>
              <input type="text" name="metaTitle" className="w-full border rounded-lg p-2.5" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">وصف الميتا (Meta Description)</label>
              <input type="text" name="metaDesc" className="w-full border rounded-lg p-2.5" />
            </div>
          </div>

          <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition">
            حفظ أو تحديث المحتوى المخصص
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-gray-900">المحتويات المخصصة المسجلة</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="border-b bg-gray-50 text-sm text-gray-700">
                <th className="p-3">المدينة</th>
                <th className="p-3">الخدمة</th>
                <th className="p-3">العنوان المخصص</th>
                <th className="p-3">ميتا تايتل</th>
              </tr>
            </thead>
            <tbody>
              {contents.map((item) => (
                <tr key={item.id} className="border-b text-sm text-gray-600">
                  <td className="p-3 font-medium text-gray-900">{item.city.name}</td>
                  <td className="p-3 font-medium text-gray-900">{item.service.name}</td>
                  <td className="p-3">{item.customTitle || '-'}</td>
                  <td className="p-3">{item.metaTitle || '-'}</td>
                </tr>
              ))}
              {contents.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-400">لا توجد محتويات مخصصة مسجلة بعد.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}