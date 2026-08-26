import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'لم يتم اختيار أي ملف' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // التحقق من نوع الملف
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'نوع الملف غير مدعوم' }, { status: 400 });
    }

    // مجلد الحفظ داخل public/uploads
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // فصل الامتداد عن اسم الملف الأصلي وتنظيف المحارف المحظورة في أنظمة الملفات فقط
    const originalName = file.name;
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext).replace(/[\\/:\*\?"<>|]/g, '-');

    // الحفاظ على الاسم الأصلي أو إضافة رقم تصاعدي في حال التكرار
    let finalFileName = `${baseName}${ext}`;
    let filePath = path.join(uploadDir, finalFileName);
    let counter = 1;

    while (existsSync(filePath)) {
      finalFileName = `${baseName}-${counter}${ext}`;
      filePath = path.join(uploadDir, finalFileName);
      counter++;
    }

    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      url: `/uploads/${finalFileName}`,
    });
  } catch (error) {
    return NextResponse.json({ error: 'فشل في رفع الصورة' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url || !url.startsWith('/uploads/')) {
      return NextResponse.json({ error: 'مسار غير صالح' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'public', url);
    if (existsSync(filePath)) {
      await unlink(filePath);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'فشل في حذف الصورة' }, { status: 500 });
  }
}