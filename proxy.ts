import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/auth/session';
import { findRedirectRule } from '@/lib/redirect-rules';
import { getSafeRedirectTarget } from '@/lib/security/redirect';

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith('/admin')) {
    const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    if (!(await verifyAdminSessionToken(session))) return NextResponse.redirect(new URL('/login', request.url));
    return NextResponse.next();
  }

  if (pathname === '/login') {
    const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    if (await verifyAdminSessionToken(session)) return NextResponse.redirect(new URL('/admin', request.url));
    return NextResponse.next();
  }

  const rule = await findRedirectRule(pathname);
  if (rule) {
    const target = getSafeRedirectTarget(rule.targetPath, request.nextUrl.origin);
    if (target) return NextResponse.redirect(new URL(target, request.url), { status: rule.statusCode === 301 ? 301 : 302 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
