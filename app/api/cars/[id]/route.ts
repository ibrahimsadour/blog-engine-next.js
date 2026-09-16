import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authorizeAdminApiRequest } from '@/lib/auth/authorization';
import { assertTopLevelSlugAvailable, publicError, validateDirectoryInput } from '@/lib/content-input';
import { revalidateDirectory } from '@/lib/revalidate-directory';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await authorizeAdminApiRequest(request); if (unauthorized) return unauthorized;
  try {
    const { id } = await params; const input = validateDirectoryInput(await request.json(), { topLevel: true });
    const { oldSlug, car } = await db.$transaction(async (tx) => {
      const current = await tx.car.findUniqueOrThrow({ where: { id }, select: { slug: true } });
      await assertTopLevelSlugAvailable(tx, input.slug, { owner: 'car', id });
      return { oldSlug: current.slug, car: await tx.car.update({ where: { id }, data: input }) };
    });
    revalidateDirectory('car', car.slug, oldSlug); return NextResponse.json(car);
  } catch (error) { const result = publicError(error); return NextResponse.json({ error: result.message, field: result.field, code: result.code }, { status: result.status }); }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await authorizeAdminApiRequest(request); if (unauthorized) return unauthorized;
  try { const { id } = await params; const car = await db.car.delete({ where: { id } }); revalidateDirectory('car', undefined, car.slug); return NextResponse.json({ success: true }); }
  catch (error) { const result = publicError(error); return NextResponse.json({ error: result.message, code: result.code }, { status: result.status }); }
}
