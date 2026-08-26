import Link from 'next/link';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const [articles, categories] = await Promise.all([
    db.article.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    }),
    db.category.findMany({
      include: { _count: { select: { articles: true } } },
      orderBy: { name: 'asc' },
    }),
  ]);

  // دالة الحذف المباشرة من السيرفر
  async function deleteArticle(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    if (!id) return;

    await db.article.delete({
      where: { id },
    });

    revalidatePath('/admin');
    revalidatePath('/');
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">إدارة المقالات</h1>
          <p className="text-xs text-gray-500">نظرة عامة على المقالات المنشورة وحالتها</p>
        </div>
        <Link
          href="/admin/articles/new"
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-xs hover:bg-blue-700"
        >
          + كتابة مقال جديد
        </Link>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-bold text-gray-400">إجمالي المقالات</span>
          <p className="mt-2 text-2xl font-black text-blue-900">{articles.length}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-bold text-gray-400">التصنيفات المتاحة</span>
          <p className="mt-2 text-2xl font-black text-blue-900">{categories.length}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs sm:col-span-2 lg:col-span-1">
          <span className="text-xs font-bold text-gray-400">المقالات المنشورة</span>
          <p className="mt-2 text-2xl font-black text-emerald-600">
            {articles.filter((a) => a.isPublished).length}
          </p>
        </div>
      </div>

      {/* جدول عرض المقالات */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-bold text-gray-900">قائمة المقالات</h2>
        </div>

        {articles.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-500">
            لا توجد مقالات منشورة حتى الآن.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="border-b border-gray-100 bg-gray-50 text-xs font-bold text-gray-500">
                <tr>
                  <th className="p-4">العنوان</th>
                  <th className="p-4">التصنيف</th>
                  <th className="p-4">تاريخ النشر</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4 text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {articles.map((art) => (
                  <tr key={art.id} className="hover:bg-gray-50/50">
                    <td className="p-4 font-bold text-gray-900">
                      <Link href={`/${art.slug}`} target="_blank" className="hover:text-blue-600">
                        {art.title}
                      </Link>
                      <div className="text-xs font-mono text-gray-400" dir="ltr">
                        /{art.slug}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                        {art.category.name}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-gray-500">
                      {new Date(art.createdAt).toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                          art.isPublished ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {art.isPublished ? 'منشور' : 'مسودة'}
                      </span>
                    </td>
                    <td className="p-4 text-left">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/articles/${art.id}/edit`}
                          className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600 hover:bg-blue-100"
                        >
                          تعديل
                        </Link>
                        <Link
                          href={`/${art.slug}`}
                          target="_blank"
                          className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-bold text-gray-600 hover:bg-gray-100"
                        >
                          معاينة
                        </Link>
                        <form action={deleteArticle}>
                          <input type="hidden" name="id" value={art.id} />
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