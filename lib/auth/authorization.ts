import { cache } from 'react';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from '@/lib/auth/session';
import { isTrustedRequestOrigin } from '@/lib/auth/origin';

export interface AdminSession {
  role: 'admin';
}

export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!(await verifyAdminSessionToken(token))) {
    return null;
  }

  return { role: 'admin' };
});

export async function isAdminAuthenticated(): Promise<boolean> {
  return Boolean(await getAdminSession());
}

export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();

  if (!session) {
    redirect('/login');
  }

  return session;
}

export async function requireAdminAction(): Promise<AdminSession> {
  const session = await requireAdmin();

  if (!isTrustedRequestOrigin(await headers())) {
    throw new Error('Untrusted request origin');
  }

  return session;
}

export async function authorizeAdminApiRequest(
  request: Request
): Promise<NextResponse | null> {
  if (await isAdminAuthenticated()) {
    if (isTrustedRequestOrigin(request.headers)) {
      return null;
    }

    return NextResponse.json(
      { error: 'مصدر الطلب غير موثوق' },
      {
        status: 403,
        headers: { 'Cache-Control': 'no-store' },
      }
    );
  }

  return NextResponse.json(
    { error: 'غير مصرح بتنفيذ هذه العملية' },
    {
      status: 401,
      headers: { 'Cache-Control': 'no-store' },
    }
  );
}
