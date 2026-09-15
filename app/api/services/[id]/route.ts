import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authorizeAdminApiRequest } from '@/lib/auth/authorization';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await authorizeAdminApiRequest(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, slug, description, metaTitle, metaDesc, keywords, image, sortOrder, isActive } = body;

    const updatedService = await db.service.update({
      where: { id },
      data: { name, slug, description, metaTitle, metaDesc, keywords, image, sortOrder, isActive },
    });

    return NextResponse.json(updatedService);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await authorizeAdminApiRequest(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    await db.service.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
  }
}
