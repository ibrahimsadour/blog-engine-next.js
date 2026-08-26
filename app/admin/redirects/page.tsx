import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export default async function RedirectsAdminPage() {
  const redirects = await db.redirect.findMany({
    orderBy: { createdAt: 'desc' },
  });

  async function addRedirectAction(formData: FormData) {
    'use server';

    let sourcePath = (formData.get('sourcePath') as string).trim();
    let targetPath = (formData.get('targetPath') as string).trim();
    const statusCode = parseInt(formData.get('statusCode') as string, 10) || 301;

    if (!sourcePath.startsWith('/')) sourcePath = `/${sourcePath}`;
    if (!targetPath.startsWith('/') && !targetPath.startsWith('http')) {
      targetPath = `/${targetPath}`;
    }

    await db.redirect.upsert({
      where: { sourcePath },
      update: { targetPath, statusCode },
      create: { sourcePath, targetPath, statusCode },
    });

    revalidatePath('/admin/redirects');
  }

  async function deleteRedirectAction(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    await db.redirect.delete({ where: { id } });
    revalidatePath('/admin/redirects');
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900">إدارة التحويلات (301 / 302 Redirects)</h1>
        <p className="mt-1 text-xs text-gray-500">
          معالجة الروابط المعطلة (404) وتحويل مسارات الصفحات القديمة للحفاظ على تصدر محركات البحث.
        </p>
      </div>

      {/* نموذج إضافة قاعدة جديدة */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
        <h2 className="mb-4 text-sm font-bold text-gray-800">+ إضافة تحويل جديد</h2>
        <form action={addRedirectAction} className="grid grid-cols-1 gap-4 md:grid-cols-12">
          <div className="md:col-span-4">
            <label className="mb-1 block text-xs font-bold text-gray-700">الرابط القديم (Source Path)</label>
            <input
              type="text"
              name="sourcePath"
              required
              placeholder="/old-page-name"
              className="w-full rounded-xl border border-gray-300 p-2.5 text-xs text-left font-mono focus:border-blue-500 focus:outline-hidden"
              dir="ltr"
            />
          </div>

          <div className="md:col-span-5">
            <label className="mb-1 block text-xs font-bold text-gray-700">الرابط الجديد (Target Path)</label>
            <input
              type="text"
              name="targetPath"
              required
              placeholder="/blog/new-article أو رابط خارجي"
              className="w-full rounded-xl border border-gray-300 p-2.5 text-xs text-left font-mono focus:border-blue-500 focus:outline-hidden"
              dir="ltr"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-bold text-gray-700">نوع التحويل</label>
            <select
              name="statusCode"
              defaultValue="301"
              className="w-full rounded-xl border border-gray-300 p-2.5 text-xs font-bold focus:border-blue-500 focus:outline-hidden"
            >
              <option value="301">301 (دائم)</option>
              <option value="302">302 (مؤقت)</option>
            </select>
          </div>

          <div className="flex items-end md:col-span-1">
            <button
              type="submit"
              className="w-full cursor-pointer rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700 active:scale-98"
            >
              إضافة
            </button>
          </div>
        </form>
      </div>

      {/* جدول عرض القواعد الحالية */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs">
        <table className="w-full text-right text-xs">
          <thead className="border-b border-gray-100 bg-gray-50 text-gray-500">
            <tr>
              <th className="p-4 font-bold">الرابط القديم</th>
              <th className="p-4 font-bold">الرابط الموجه إليه</th>
              <th className="p-4 font-bold">النوع</th>
              <th className="p-4 font-bold text-center">إجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {redirects.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-400 font-bold">
                  لا توجد روابط محولة حالياً.
                </td>
              </tr>
            ) : (
              redirects.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/60">
                  <td className="p-4 font-mono font-bold text-red-600" dir="ltr">
                    {item.sourcePath}
                  </td>
                  <td className="p-4 font-mono font-bold text-green-700" dir="ltr">
                    {item.targetPath}
                  </td>
                  <td className="p-4">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                        item.statusCode === 301
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {item.statusCode}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <form action={deleteRedirectAction}>
                      <input type="hidden" name="id" value={item.id} />
                      <button
                        type="submit"
                        className="cursor-pointer font-bold text-red-500 hover:text-red-700"
                      >
                        حذف
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}