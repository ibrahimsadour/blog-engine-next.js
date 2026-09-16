import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE } from '@/lib/auth/session';
import { isTrustedRequestOrigin } from '@/lib/auth/origin';
import { getSiteUrl } from '@/lib/site-url';

export async function POST(request: Request) {
  if (!isTrustedRequestOrigin(request.headers)) {
    return NextResponse.json(
      { error: 'مصدر الطلب غير موثوق' },
      { status: 403, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const response = NextResponse.redirect(new URL('/login', getSiteUrl()));
  response.cookies.set(ADMIN_SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
