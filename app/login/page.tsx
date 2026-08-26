import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  async function handleLogin(formData: FormData) {
    'use server';

    const password = formData.get('password') as string;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword || password !== adminPassword) {
      redirect('/login?error=1');
    }

    const cookieStore = await cookies();
    cookieStore.set('admin_session', 'authenticated_admin', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // صالح لمدة أسبوع
    });

    redirect('/admin');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 font-sans" dir="rtl">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-xs">
        <div className="text-center">
          <h1 className="text-xl font-black text-gray-900">تسجيل الدخول للوحة التحكم</h1>
          <p className="mt-1 text-xs text-gray-500">أدخل كلمة المرور للمتابعة</p>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-xs font-bold text-red-600">
            كلمة المرور غير صحيحة، يرجى المحاولة مجدداً
          </div>
        )}

        <form action={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold text-gray-700">كلمة المرور</label>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••••••"
              className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <button
            type="submit"
            className="w-full cursor-pointer rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-98"
          >
            دخول
          </button>
        </form>
      </div>
    </div>
  );
}