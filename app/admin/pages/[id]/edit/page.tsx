import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import PageForm from '@/components/PageForm';

export const dynamic = 'force-dynamic';

interface EditPageAdminProps {
  params: Promise<{ id: string }>;
}

export default async function EditAdminPage({ params }: EditPageAdminProps) {
  const { id } = await params;

  const page = await db.page.findUnique({
    where: { id },
  });

  if (!page) {
    notFound();
  }

  async function updatePageAction(formData: FormData) {
    'use server';

    const title = (formData.get('title') as string)?.trim();
    const slug = (formData.get('slug') as string)?.trim().toLowerCase();
    const content = (formData.get('content') as string) || '';
    const metaTitle = (formData.get('metaTitle') as string)?.trim() || null;
    const metaDesc = (formData.get('metaDesc') as string)?.trim() || null;
    const isPublished = formData.get('isPublished') === 'on';
    const showInHeader = formData.get('showInHeader') === 'on';
    const showInFooter = formData.get('showInFooter') === 'on';

    if (!title || !slug) {
      return { success: false, error: 'العنوان والرابط الدائم مطلوبان' };
    }

    try {
      // التحقق من عدم استخدام الـ Slug في صفحة أخرى
      const existing = await db.page.findFirst({
        where: {
          slug,
          NOT: { id },
        },
      });

      if (existing) {
        return {
          success: false,
          error: 'هذا الرابط الدائم (Slug) مستخدم لصفحة أخرى، يرجى اختيار رابط مختلف',
        };
      }

      const oldSlug = page?.slug;

      await db.page.update({
        where: { id },
        data: {
          title,
          slug,
          content,
          metaTitle,
          metaDesc,
          isPublished,
          showInHeader,
          showInFooter,
        },
      });

      // تفريغ وتحديث الكاش للمسار القديم والجديد والـ Layout والسايت ماب
      revalidatePath('/');
      revalidatePath('/', 'layout');
      if (oldSlug && oldSlug !== slug) {
        revalidatePath(`/${oldSlug}`);
      }
      revalidatePath(`/${slug}`);
      revalidatePath('/page-sitemap.xml');
      revalidatePath('/sitemap.xml');
      revalidatePath('/admin/pages');

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'فشل تحديث بيانات الصفحة' };
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">تعديل الصفحة: {page.title}</h1>
        <p className="mt-1 text-xs text-gray-500">تعديل المحتوى، الرابط الدائم، وإعدادات الظهور والـ SEO</p>
      </div>

      <PageForm initialData={page} action={updatePageAction} />
    </div>
  );
}