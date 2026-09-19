import { NextResponse } from 'next/server';
import { isDynamicContentEnabled } from '@/lib/site-profile';
import { db } from '@/lib/db';
import { authorizeAdminApiRequest } from '@/lib/auth/authorization';
import { assertTopLevelSlugAvailable, publicError, validateDirectoryInput } from '@/lib/content-input';
import { revalidateDirectory } from '@/lib/revalidate-directory';
function dynamicContentFeatureDisabled() {
  return NextResponse.json({ error: 'ميزة المحتوى الديناميكي غير مفعلة لهذا الموقع', code: 'FEATURE_DISABLED' }, { status: 404 });
}


export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isDynamicContentEnabled()) return dynamicContentFeatureDisabled();
  const unauthorized = await authorizeAdminApiRequest(request);
  if (unauthorized) return unauthorized;
  try {
    const { id } = await params;
    const input = validateDirectoryInput(await request.json(), { topLevel: true });
    const { oldSlug, city } = await db.$transaction(async (tx) => {
      const current = await tx.city.findUniqueOrThrow({ where: { id }, select: { slug: true } });
      await assertTopLevelSlugAvailable(tx, input.slug, { owner: 'city', id });
      return { oldSlug: current.slug, city: await tx.city.update({ where: { id }, data: input }) };
    });
    revalidateDirectory('city', city.slug, oldSlug);
    return NextResponse.json(city);
  } catch (error) {
    const result = publicError(error);
    return NextResponse.json({ error: result.message, field: result.field, code: result.code }, { status: result.status });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isDynamicContentEnabled()) return dynamicContentFeatureDisabled();
  const unauthorized = await authorizeAdminApiRequest(request);
  if (unauthorized) return unauthorized;
  try {
    const { id } = await params;
    const city = await db.city.delete({ where: { id } });
    revalidateDirectory('city', undefined, city.slug);
    return NextResponse.json({ success: true });
  } catch (error) {
    const result = publicError(error);
    return NextResponse.json({ error: result.message, code: result.code }, { status: result.status });
  }
}
