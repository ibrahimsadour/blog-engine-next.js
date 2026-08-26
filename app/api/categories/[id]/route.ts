import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '../../../../lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, slug, description } = await request.json();

    const updated = await db.category.update({
      where: { id },
      data: { name, slug, description },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: 'تعذر تعديل التصنيف', error: String(error) }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.category.delete({ where: { id } });
    return NextResponse.json({ message: 'تم حذف التصنيف' });
  } catch (error) {
    return NextResponse.json({ message: 'تعذر حذف التصنيف', error: String(error) }, { status: 500 });
  }
}