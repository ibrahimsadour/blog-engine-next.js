import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import { authorizeAdminApiRequest } from '@/lib/auth/authorization';
import {
  MAX_IMAGE_BYTES,
  MAX_UPLOAD_REQUEST_BYTES,
  validateImageUpload,
} from '@/lib/media/image-validation';
import {
  getLegacyFileNameFromUrl,
  getLegacyFilePath,
  getStoredFileNameFromUrl,
  getStoredFilePath,
  getUploadStorageDirectory,
  MEDIA_URL_PREFIX,
} from '@/lib/media/storage';

const MAX_WRITE_ATTEMPTS = 3;

function validateRequestSize(request: NextRequest): NextResponse | null {
  const contentLength = request.headers.get('content-length');
  if (!contentLength) return null;

  if (!/^\d+$/.test(contentLength)) {
    return NextResponse.json({ error: 'حجم الطلب غير صالح' }, { status: 400 });
  }

  if (Number(contentLength) > MAX_UPLOAD_REQUEST_BYTES) {
    return NextResponse.json(
      { error: 'حجم طلب الرفع يتجاوز الحد الأقصى المسموح' },
      { status: 413 }
    );
  }

  return null;
}

async function writeImageAtomically(
  buffer: Buffer,
  extension: string
): Promise<string> {
  await mkdir(getUploadStorageDirectory(), { recursive: true, mode: 0o755 });

  for (let attempt = 0; attempt < MAX_WRITE_ATTEMPTS; attempt++) {
    const fileName = `${randomUUID()}.${extension}`;

    try {
      await writeFile(getStoredFilePath(fileName), buffer, {
        flag: 'wx',
        mode: 0o644,
      });
      return fileName;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
    }
  }

  throw new Error('Unable to allocate a unique media file name');
}

export async function POST(request: NextRequest) {
  const unauthorized = await authorizeAdminApiRequest(request);
  if (unauthorized) return unauthorized;

  const invalidRequestSize = validateRequestSize(request);
  if (invalidRequestSize) return invalidRequestSize;

  if (!request.headers.get('content-type')?.startsWith('multipart/form-data')) {
    return NextResponse.json({ error: 'صيغة طلب الرفع غير مدعومة' }, { status: 415 });
  }

  try {
    const data = await request.formData();
    const file = data.get('file');

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: 'لم يتم اختيار أي ملف' }, { status: 400 });
    }

    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { error: 'حجم الصورة يتجاوز 5 ميغابايت' },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const imageType = validateImageUpload(file.name, file.type, buffer);

    if (!imageType) {
      return NextResponse.json(
        { error: 'يُسمح فقط بصور JPG وPNG وWebP المطابقة لمحتواها الحقيقي' },
        { status: 415 }
      );
    }

    const fileName = await writeImageAtomically(buffer, imageType.extension);

    return NextResponse.json({
      success: true,
      url: `${MEDIA_URL_PREFIX}${fileName}`,
    });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'فشل في رفع الصورة' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const unauthorized = await authorizeAdminApiRequest(request);
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    let targetUrl: unknown = searchParams.get('src') || searchParams.get('url');

    if (!targetUrl) {
      try {
        const body = (await request.json()) as { url?: unknown; src?: unknown };
        targetUrl = body.url || body.src;
      } catch {
        targetUrl = null;
      }
    }

    if (typeof targetUrl !== 'string') {
      return NextResponse.json({ error: 'مسار غير صالح' }, { status: 400 });
    }

    const storedFileName = getStoredFileNameFromUrl(targetUrl);
    const legacyFileName = getLegacyFileNameFromUrl(targetUrl);
    const filePath = storedFileName
      ? getStoredFilePath(storedFileName)
      : legacyFileName
        ? getLegacyFilePath(legacyFileName)
        : null;

    if (!filePath) {
      return NextResponse.json({ error: 'مسار غير صالح' }, { status: 400 });
    }

    try {
      await unlink(filePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return NextResponse.json(
          { error: 'الملف غير موجود على السيرفر' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'تم حذف الصورة بنجاح من السيرفر',
    });
  } catch (error) {
    console.error('Delete Error:', error);
    return NextResponse.json({ error: 'فشل في حذف الصورة' }, { status: 500 });
  }
}
