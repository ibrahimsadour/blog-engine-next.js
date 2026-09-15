import Link from 'next/link';

export default function NotFound() {
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
