import { readFile } from 'node:fs/promises';
import { NextResponse } from 'next/server';
import { getStoredFilePath } from '@/lib/media/storage';

export const dynamic = 'force-dynamic';

const contentTypes: Record<string, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  try {
    const filePath = getStoredFilePath(filename);
    const file = await readFile(filePath);
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    const contentType = contentTypes[extension];

    if (!contentType) {
      return NextResponse.json({ error: 'الملف غير موجود' }, { status: 404 });
    }

    return new Response(new Uint8Array(file), {
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(file.byteLength),
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return NextResponse.json({ error: 'الملف غير موجود' }, { status: 404 });
  }
}
