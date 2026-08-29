import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  async function logoutAction() {
    'use server';
    const cookieStore = await cookies();
    cookieStore.delete('admin_session');
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900" dir="rtl">
      <div className="flex">
        {/* الشريط الجانبي (Sidebar) المخصص للوحة الإدارة */}
        <aside className="sticky top-0 flex h-screen w-64 flex-col justify-between border-l border-gray-200 bg-white p-5 shadow-xs">
          <div>
            {/* عنوان اللوحة والشعار */}
            <div className="mb-8 flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="text-lg font-black text-blue-900">لوحة التحكم</span>
                <p className="text-[11px] font-bold text-gray-400">إدارة المحتوى والـ SEO</p>
              </div>
              <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                v2.0
              </span>
            </div>

            {/* أقسام اللوحة الرئيسية */}
            <nav className="space-y-1.5">
              <Link
                href="/admin"
                className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
              >
                <span>📄</span>
                <span>إدارة المقالات</span>
              </Link>

              <Link
                href="/admin/pages"
                className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
              >
                <span>📑</span>
                <span>إدارة الصفحات</span>
              </Link>

              <Link
                href="/admin/categories"
                className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
              >
                <span>📁</span>
                <span>التصنيفات</span>
              </Link>

              <Link
                href="/admin/cities"
                className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
              >
                <span>📁</span>
                <span>المدن</span>
              </Link>

              <Link
                href="/admin/cars"
                className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
              >
                <span>📁</span>
                <span>السيارات</span>
              </Link>

              <Link
                href="/admin/services"
                className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
              >
                <span>📁</span>
                <span>الخدمات</span>
              </Link>

              <Link
                href="/admin/service-templates"
                className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
              >
                <span>📐</span>
                <span>قوالب الخدمات والمدن</span>
              </Link>

              <Link
                href="/admin/settings"
                className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
              >
                <span>⚙️</span>
                <span>إعدادات الـ Head و SEO</span>
              </Link>

              <Link
                href="/admin/redirects"
                className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
              >
                <span>🔀</span>
                <span>إدارة التحويلات (Redirects)</span>
              </Link>
            </nav>

            <div className="my-6 border-t border-gray-100" />

            {/* إجراءات سريعة */}
            <div className="space-y-2">
              <span className="px-3 text-[10px] font-black uppercase tracking-wider text-gray-400">
                إجراءات سريعة
              </span>
              <Link
                href="/admin/articles/new"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700 active:scale-98"
              >
                <span>+</span>
                <span>إنشاء مقال جديد</span>
              </Link>

              <Link
                href="/"
                target="_blank"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-xs font-bold text-gray-700 transition hover:bg-gray-100"
              >
                <span>معاينة الموقع</span>
                <span className="text-xs">↗</span>
              </Link>
            </div>
          </div>

          {/* زر تسجيل الخروج في أسفل الشريط الجانبي */}
          <div className="border-t border-gray-100 pt-4">
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-100 active:scale-98"
              >
                <span>🚪</span>
                <span>تسجيل الخروج</span>
              </button>
            </form>
          </div>
        </aside>

        {/* مساحة عرض الصفحات الداخلية */}
        <main className="flex-1 p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
