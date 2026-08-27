import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink, mkdir, chmod } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

// تنظيف اسم الملف وجعله آمناً تماماً للروابط وسيرفرات Linux
function sanitizeFileName(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  let baseName = path.basename(fileName, ext);

  // استبدال المسافات والرموز الخاصة بشرطات
  baseName = baseName
    .normalize('NFKD') // توحيد الترميز
    .replace(/[\s_]+/g, '-') // تحويل المسافات والـ underscores إلى شرطات
    .replace(/[^a-zA-Z0-9\u0600-\u06FF-]/g, '') // السماح بالأحرف الإنجليزية، العربية، الأرقام والشرطات فقط
    .replace(/-+/g, '-') // إزالة تكرار الشرطات
    .replace(/^-+|-+$/g, '') // إزالة الشرطة من البداية أو النهاية
    .toLowerCase();

  // في حال كان الاسم فارغاً بعد التنظيف
  if (!baseName) {
    baseName = `file-${Date.now()}`;
  }

  return `${baseName}${ext}`;
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'لم يتم اختيار أي ملف' }, { status: 400 });
    }

    // التحقق من نوع الملف
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'نوع الملف غير مدعوم' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // مجلد الحفظ داخل public/uploads
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true, mode: 0o755 });
    }

    // تنظيف الاسم والامتداد
    const cleanName = sanitizeFileName(file.name);
    const ext = path.extname(cleanName);
    const baseName = path.basename(cleanName, ext);

    let finalFileName = cleanName;
    let filePath = path.join(uploadDir, finalFileName);
    let counter = 1;

    // إضافة رقم تسلسلي فريد عند التكرار
    while (existsSync(filePath)) {
      finalFileName = `${baseName}-${counter}${ext}`;
      filePath = path.join(uploadDir, finalFileName);
      counter++;
    }

    // كتابة الملف
    await writeFile(filePath, buffer);

    // تطبيق صلاحية القراءة العامة للملف فوراً
    await chmod(filePath, 0o644);

    return NextResponse.json({
      success: true,
      url: `/uploads/${finalFileName}`,
    });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'فشل في رفع الصورة' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    // التحقق من صحة المسار ومنع Path Traversal
    if (!url || typeof url !== 'string' || !url.startsWith('/uploads/') || url.includes('..')) {
      return NextResponse.json({ error: 'مسار غير صالح' }, { status: 400 });
    }

    const safePath = path.normalize(url).replace(/^(\.\.[\/\\])+/, '');
    const filePath = path.join(process.cwd(), 'public', safePath);

    if (existsSync(filePath)) {
      await unlink(filePath);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete Error:', error);
    return NextResponse.json({ error: 'فشل في حذف الصورة' }, { status: 500 });
  }
}