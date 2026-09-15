import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE } from '@/lib/auth/session';
import { isTrustedRequestOrigin } from '@/lib/auth/origin';

export async function POST(request: Request) {
  if (!isTrustedRequestOrigin(request.headers)) {
    return NextResponse.json(
      { error: 'مصدر الطلب غير موثوق' },
      { status: 403, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const response = NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'));
  response.cookies.set(ADMIN_SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
