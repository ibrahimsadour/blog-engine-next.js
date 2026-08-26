import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

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
      return NextResponse.json({
        destination: redirectRule.targetPath,
        permanent: redirectRule.statusCode === 301,
      });
    }

    return NextResponse.json({ destination: null }, { status: 404 });
  } catch {
    return NextResponse.json({ destination: null }, { status: 500 });
  }
}