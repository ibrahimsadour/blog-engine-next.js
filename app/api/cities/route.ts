import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authorizeAdminApiRequest } from '@/lib/auth/authorization';
import { isSpreadsheetImportError, readXlsxRows } from '@/lib/import-spreadsheet';

export async function GET() {
  try {
    const cities = await db.city.findMany({ orderBy: { sortOrder: 'asc' } });
    return NextResponse.json(cities);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch cities' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const unauthorized = await authorizeAdminApiRequest(request);
  if (unauthorized) return unauthorized;

  try {
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

      const rows = await readXlsxRows(file);

      let importedCount = 0;
      for (const row of rows) {
        const name = row.name || row.Name || row.المدينة;
        const slug = row.slug || row.Slug || row.الرابط;
        if (!name || !slug) continue;

        await db.city.upsert({
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

    const city = await db.city.create({
      data: { name, slug, description, metaTitle, metaDesc, keywords, image, sortOrder, isActive },
    });

    return NextResponse.json(city);
  } catch (error: unknown) {
    const status = isSpreadsheetImportError(error) ? 400 : 500;
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status });
  }
}
