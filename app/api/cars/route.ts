import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authorizeAdminApiRequest } from '@/lib/auth/authorization';
import { assertTopLevelSlugAvailable, InputValidationError, publicError, validateDirectoryInput } from '@/lib/content-input';
import { validateDirectoryRows } from '@/lib/directory-import';
import { readXlsxRows } from '@/lib/import-spreadsheet';
import { revalidateDirectory } from '@/lib/revalidate-directory';
import { isAutomotiveSite } from '@/lib/site-profile';

function automotiveFeatureDisabled() {
  return NextResponse.json({ error: 'ميزة السيارات غير مفعلة لهذا الموقع', code: 'FEATURE_DISABLED' }, { status: 404 });
}

export async function GET() {
  if (!isAutomotiveSite()) return automotiveFeatureDisabled();
  try { return NextResponse.json(await db.car.findMany({ orderBy: { sortOrder: 'asc' } })); }
  catch { return NextResponse.json({ error: 'تعذر جلب السيارات', code: 'DATABASE_ERROR' }, { status: 500 }); }
}

export async function POST(request: Request) {
  if (!isAutomotiveSite()) return automotiveFeatureDisabled();
  const unauthorized = await authorizeAdminApiRequest(request); if (unauthorized) return unauthorized;
  try {
    if ((request.headers.get('content-type') || '').includes('multipart/form-data')) {
      const file = (await request.formData()).get('file');
      if (!(file instanceof File)) return NextResponse.json({ error: 'ملف Excel مطلوب', code: 'FILE_REQUIRED' }, { status: 400 });
      const items = validateDirectoryRows(await readXlsxRows(file), 'السيارة', true);
      await db.$transaction(async (tx) => {
        const slugs = items.map((item) => item.slug);
        const [existing, city, article, page] = await Promise.all([
          tx.car.findMany({ where: { slug: { in: slugs } }, select: { slug: true } }),
          tx.city.findFirst({ where: { slug: { in: slugs } }, select: { slug: true } }),
          tx.article.findFirst({ where: { slug: { in: slugs } }, select: { slug: true } }),
          tx.page.findFirst({ where: { slug: { in: slugs } }, select: { slug: true } }),
        ]);
        const collision = city || article || page;
        if (collision) throw new InputValidationError(`الرابط ${collision.slug} مستخدم في نوع محتوى آخر`, 'slug', 409, 'DUPLICATE_SLUG');
        const existingSlugs = new Set(existing.map((item) => item.slug));
        await tx.car.createMany({ data: items.filter((item) => !existingSlugs.has(item.slug)), skipDuplicates: true });
        await Promise.all(items.filter((item) => existingSlugs.has(item.slug)).map((item) => tx.car.update({ where: { slug: item.slug }, data: item })));
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
