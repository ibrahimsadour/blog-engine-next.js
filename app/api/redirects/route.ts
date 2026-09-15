import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSafeRedirectTarget } from '@/lib/security/redirect';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');

  if (!path) {
    return NextResponse.json({ destination: null }, { status: 400 });
  }

  const decodedPath = decodeURIComponent(path);

  try {
    const redirectRule = await db.redirect.findFirst({
      where: {
        OR: [
          { sourcePath: decodedPath },
          { sourcePath: path },
          { sourcePath: decodedPath.replace(/\/$/, '') },
          { sourcePath: `${decodedPath}/` },
        ],
      },
    });

    if (redirectRule) {
      const destination = getSafeRedirectTarget(
        redirectRule.targetPath,
        new URL(request.url).origin
      );

      if (!destination) {
        return NextResponse.json({ destination: null }, { status: 404 });
      }

      return NextResponse.json({
        destination,
        permanent: redirectRule.statusCode === 301,
      });
    }

    return NextResponse.json({ destination: null }, { status: 404 });
  } catch {
    return NextResponse.json({ destination: null }, { status: 500 });
  }
}
