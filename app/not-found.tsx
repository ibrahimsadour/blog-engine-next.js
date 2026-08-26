import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';

export default async function NotFound() {
  const headersList = await headers();
  // جلب الرابط المطلوب الذي سبب خطأ 404
  const headerUrl = headersList.get('x-url') || headersList.get('referer') || '';
  let pathname = '';

  try {
    if (headerUrl.startsWith('http')) {
      pathname = new URL(headerUrl).pathname;
    }
  } catch {}

  // إذا تم العثور على مسار، نفحص جدول التحويلات مباشرة
  if (pathname) {
    const decodedPath = decodeURIComponent(pathname);
    const rule = await db.redirect.findFirst({
      where: {
        OR: [
          { sourcePath: decodedPath },
          { sourcePath: pathname },
          { sourcePath: decodedPath.replace(/\/$/, '') },
          { sourcePath: `${decodedPath}/` },
        ],
      },
    });

    if (rule) {
      redirect(rule.targetPath);
    }
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-8xl font-black text-blue-600">404</h1>
      <h2 className="mt-4 text-2xl font-bold text-gray-800">الصفحة المطلوبة غير موجودة</h2>
      <p className="mt-2 text-sm text-gray-500">ربما تم حذف الصفحة أو تغيير الرابط الخاص بها.</p>
      <Link
        href="/"
        className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
      >
        العودة للرئيسية
      </Link>
    </div>
  );
}