import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authorizeAdminApiRequest } from '@/lib/auth/authorization';
import { assertTopLevelSlugAvailable, publicError, validateDirectoryInput } from '@/lib/content-input';
import { validateDirectoryRows } from '@/lib/directory-import';
import { readXlsxRows } from '@/lib/import-spreadsheet';
import { revalidateDirectory } from '@/lib/revalidate-directory';

export async function GET() {
  try { return NextResponse.json(await db.car.findMany({ orderBy: { sortOrder: 'asc' } })); }
  catch { return NextResponse.json({ error: 'تعذر جلب السيارات', code: 'DATABASE_ERROR' }, { status: 500 }); }
}

export async function POST(request: Request) {
  const unauthorized = await authorizeAdminApiRequest(request); if (unauthorized) return unauthorized;
  try {
    if ((request.headers.get('content-type') || '').includes('multipart/form-data')) {
      const file = (await request.formData()).get('file');
      if (!(file instanceof File)) return NextResponse.json({ error: 'ملف Excel مطلوب', code: 'FILE_REQUIRED' }, { status: 400 });
      const items = validateDirectoryRows(await readXlsxRows(file), 'السيارة', true);
      await db.$transaction(async (tx) => {
        for (const item of items) {
          const existing = await tx.car.findUnique({ where: { slug: item.slug }, select: { id: true } });
          await assertTopLevelSlugAvailable(tx, item.slug, existing ? { owner: 'car', id: existing.id } : undefined);
          await tx.car.upsert({ where: { slug: item.slug }, update: item, create: item });
        }
      });
      revalidateDirectory('car');
      return NextResponse.json({ success: true, count: items.length });
    }
    const input = validateDirectoryInput(await request.json(), { topLevel: true });
    const car = await db.$transaction(async (tx) => { await assertTopLevelSlugAvailable(tx, input.slug); return tx.car.create({ data: input }); });
    revalidateDirectory('car', car.slug);
    return NextResponse.json(car, { status: 201 });
  } catch (error) {
    const result = publicError(error);
    return NextResponse.json({ error: result.message, field: result.field, code: result.code }, { status: result.status });
  }
}
