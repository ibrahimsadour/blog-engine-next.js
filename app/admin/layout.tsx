import Link from 'next/link';
import AdminSidebar from '@/components/admin/AdminSidebar';
import styles from '@/components/admin/AdminSidebar.module.css';
import { FileText, Files, Folder, MapPin, Car, Wrench, PanelsTopLeft, Settings, ArrowLeftRight, Plus, ExternalLink, LogOut } from 'lucide-react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_SESSION_COOKIE } from '@/lib/auth/session';
import { requireAdmin, requireAdminAction } from '@/lib/auth/authorization';
import { isAutomotiveSite, isDynamicContentEnabled } from '@/lib/site-profile';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  const dynamicContent = isDynamicContentEnabled();
  const automotive = dynamicContent && isAutomotiveSite();

  async function logoutAction() {
    'use server';
    await requireAdminAction();

    const cookieStore = await cookies();
    cookieStore.delete(ADMIN_SESSION_COOKIE);
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900" dir="rtl">
      <div className="flex flex-col lg:flex-row">
        {/* الشريط الجانبي (Sidebar) المخصص للوحة الإدارة */}
        <AdminSidebar>
        <aside className={styles.sidebar}>
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
                <FileText size={17} aria-hidden="true" className="shrink-0" />
                <span>إدارة المقالات</span>
              </Link>

              <Link
                href="/admin/pages"
                className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
              >
                <Files size={17} aria-hidden="true" className="shrink-0" />
                <span>إدارة الصفحات</span>
              </Link>

              <Link
                href="/admin/categories"
                className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
              >
                <Folder size={17} aria-hidden="true" className="shrink-0" />
                <span>التصنيفات</span>
              </Link>

              {dynamicContent && (
                <>
                <Link
                  href="/admin/cities"
                  className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
                >
                  <MapPin size={17} aria-hidden="true" className="shrink-0" />
                  <span>المدن</span>
                </Link>
  
                {automotive && (
                  <>
                    <Link
                      href="/admin/cars"
                      className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
                    >
                      <Folder size={17} aria-hidden="true" className="shrink-0" />
                      <span>السيارات</span>
                    </Link>
  
                    <Link
                      href="/admin/car-service-templates"
                      className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
                    >
                      <Car size={17} aria-hidden="true" className="shrink-0" />
                      <span>قوالب الخدمات والسيارات</span>
                    </Link>
                  </>
                )}
  
                <Link
                  href="/admin/services"
                  className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
                >
                  <Wrench size={17} aria-hidden="true" className="shrink-0" />
                  <span>الخدمات</span>
                </Link>
  
                <Link
                  href="/admin/service-templates"
                  className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
                >
                  <PanelsTopLeft size={17} aria-hidden="true" className="shrink-0" />
                  <span>قوالب الخدمات والمدن</span>
                </Link>
  
                  </>
              )}

              <Link
                href="/admin/settings"
                className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
              >
                <Settings size={17} aria-hidden="true" className="shrink-0" />
                <span>إعدادات الـ Head و SEO</span>
              </Link>

              <Link
                href="/admin/redirects"
                className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
              >
                <ArrowLeftRight size={17} aria-hidden="true" className="shrink-0" />
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
                <Plus size={16} aria-hidden="true" />
                <span>إنشاء مقال جديد</span>
              </Link>

              <Link
                href="/"
                target="_blank"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-xs font-bold text-gray-700 transition hover:bg-gray-100"
              >
                <span>معاينة الموقع</span>
                <ExternalLink size={14} aria-hidden="true" />
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
                <LogOut size={17} aria-hidden="true" className="shrink-0" />
                <span>تسجيل الخروج</span>
              </button>
            </form>
          </div>
        </aside>
        </AdminSidebar>

        {/* مساحة عرض الصفحات الداخلية */}
        <main className="min-w-0 flex-1 bg-[#f0f0f1] p-4 sm:p-5">
          <div className="mx-auto w-full max-w-[1600px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
