import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as XLSX from 'xlsx';

export async function GET() {
  try {
    const cars = await db.car.findMany({ orderBy: { sortOrder: 'asc' } });
    return NextResponse.json(cars);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch cars' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

      const buffer = Buffer.from(await file.arrayBuffer());
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const rows: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      let importedCount = 0;
      for (const row of rows) {
        const name = row.name || row.Name || row.السيارة;
        const slug = row.slug || row.Slug || row.الرابط;
        if (!name || !slug) continue;

        await db.car.upsert({
          where: { slug: String(slug) },
          update: {
            name: String(name),
            description: row.description || row.Description || row.الوصف || '',
            metaTitle: row.metaTitle || row.MetaTitle || row.عنوان_السييو || '',
            metaDesc: row.metaDesc || row.MetaDesc || row.وصف_السييو || '',
            keywords: row.keywords || row.Keywords || row.الكلمات_المفتاحية || '',
          },
          create: {
            name: String(name),
            slug: String(slug),
            description: row.description || row.Description || row.الوصف || '',
            metaTitle: row.metaTitle || row.MetaTitle || row.عنوان_السييو || '',
            metaDesc: row.metaDesc || row.MetaDesc || row.وصف_السييو || '',
            keywords: row.keywords || row.Keywords || row.الكلمات_المفتاحية || '',
          },
        });
        importedCount++;
      }

      return NextResponse.json({ success: true, count: importedCount });
    }

    const body = await request.json();
    const { name, slug, description, metaTitle, metaDesc, keywords, image, sortOrder, isActive } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    const car = await db.car.create({
      data: { name, slug, description, metaTitle, metaDesc, keywords, image, sortOrder, isActive },
    });

    return NextResponse.json(car);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const deleted = await db.car.deleteMany({});
    return NextResponse.json({ success: true, count: deleted.count });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete all cars' }, { status: 500 });
  }
}