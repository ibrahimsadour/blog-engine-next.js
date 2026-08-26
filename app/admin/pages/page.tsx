import Link from 'next/link';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export default async function AdminPagesList() {
  const pages = await db.page.findMany({
    orderBy: { createdAt: 'desc' },
  });

  async function deletePage(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    if (!id) return;

    const targetPage = await db.page.findUnique({
      where: { id },
    });

    await db.page.delete({ where: { id } });

    revalidatePath('/admin/pages');
    revalidatePath('/', 'layout');
    if (targetPage) {
      revalidatePath(`/${targetPage.slug}`);
    }
    revalidatePath('/page-sitemap.xml');
    revalidatePath('/sitemap.xml');
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">إدارة الصفحات</h1>
          <p className="text-xs text-gray-500">إنشاء وتعديل الصفحات التعريفية وصفحات الموقع العامة</p>
        </div>
        <Link
          href="/admin/pages/new"
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700 active:scale-98"
        >
          + إنشاء صفحة جديدة
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-bold text-gray-900">قائمة الصفحات المتاحة</h2>
        </div>

        {pages.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-500">
            لا توجد صفحات منشأة حالياً. اضغط على "إنشاء صفحة جديدة" لإضافة صفحات مثل (من نحن، اتصل بنا، سياسة الخصوصية).
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="border-b border-gray-100 bg-gray-50 text-xs font-bold text-gray-500">
                <tr>
                  <th className="p-4">عنوان الصفحة</th>
                  <th className="p-4">الرابط (Slug)</th>
                  <th className="p-4">أماكن الظهور</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4 text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {pages.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50">
                    <td className="p-4 font-bold text-gray-900">
                      <Link href={`/${p.slug}`} target="_blank" className="hover:text-blue-600">
                        {p.title}
                      </Link>
                    </td>
                    <td className="p-4 font-mono text-xs text-gray-500" dir="ltr">
                      /{p.slug}
                    </td>
                    <td className="p-4 text-xs">
                      <div className="flex gap-1.5">
                        {p.showInHeader && (
                          <span className="rounded bg-blue-50 px-2 py-0.5 font-bold text-blue-700">الرأس</span>
                        )}
                        {p.showInFooter && (
                          <span className="rounded bg-gray-100 px-2 py-0.5 font-bold text-gray-700">الفوتر</span>
                        )}
                        {!p.showInHeader && !p.showInFooter && (
                          <span className="text-gray-400">مباشر فقط</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          p.isPublished ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {p.isPublished ? 'منشورة' : 'مسودة'}
                      </span>
                    </td>
                    <td className="p-4 text-left">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/pages/${p.id}/edit`}
                          className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600 hover:bg-blue-100"
                        >
                          تعديل
                        </Link>
                        <Link
                          href={`/${p.slug}`}
                          target="_blank"
                          className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-bold text-gray-600 hover:bg-gray-100"
                        >
                          معاينة
                        </Link>
                        <form action={deletePage}>
                          <input type="hidden" name="id" value={p.id} />
                          <button
                            type="submit"
                            className="cursor-pointer rounded-lg bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600 transition hover:bg-red-100"
                          >
                            حذف
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}