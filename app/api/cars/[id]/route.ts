import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, slug, description, metaTitle, metaDesc, keywords, image, sortOrder, isActive } = body;

    const updatedCar = await db.car.update({
      where: { id },
      data: { name, slug, description, metaTitle, metaDesc, keywords, image, sortOrder, isActive },
    });

    return NextResponse.json(updatedCar);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update car' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.car.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete car' }, { status: 500 });
  }
}