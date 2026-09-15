import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from '@/lib/auth/session';
import { getSafeRedirectTarget } from '@/lib/security/redirect';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. تجاوز ملفات النظام والواجهات البرمجية
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. حماية لوحة التحكم
  if (pathname.startsWith('/admin')) {
    const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    if (!(await verifyAdminSessionToken(session))) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  if (pathname === '/login') {
    const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    if (await verifyAdminSessionToken(session)) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  // 3. فحص التوجيه عبر استدعاء API الداخلي
  try {
    const origin = request.nextUrl.origin;
    const res = await fetch(`${origin}/api/redirects?path=${encodeURIComponent(pathname)}`, {
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.destination) {
        const safeTarget = getSafeRedirectTarget(data.destination, origin);

        if (safeTarget) {
          const destination = new URL(safeTarget, request.url);

          return NextResponse.redirect(destination, {
            status: data.permanent ? 301 : 302,
          });
        }
      }
    }
  } catch {}

  // تمرير الرابط لصفحة not-found إذا لم يكن هناك تطابق
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-url', request.url);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
