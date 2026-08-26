import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import PageForm from '@/components/PageForm';

export const dynamic = 'force-dynamic';

export default function NewAdminPage() {
  async function createPageAction(formData: FormData) {
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
      const existing = await db.page.findUnique({
        where: { slug },
      });

      if (existing) {
        return { success: false, error: 'هذا الرابط الدائم (Slug) مستخدم لصفحة أخرى مسبقاً، يرجى اختيار رابط آخر' };
      }

      const created = await db.page.create({
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

      // تفريغ وتحديث الكاش فورياً للصفحة الجديدة، الروابط في الهيدر والفوتر، والسايت ماب
      revalidatePath('/');
      revalidatePath('/', 'layout');
      revalidatePath(`/${created.slug}`);
      revalidatePath('/page-sitemap.xml');
      revalidatePath('/sitemap.xml');
      revalidatePath('/admin/pages');

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'فشل حفظ الصفحة في قاعدة البيانات' };
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">إنشاء صفحة جديدة</h1>
        <p className="mt-1 text-xs text-gray-500">أدخل محتوى الصفحة وتفاصيل ظهورها وإعدادات الـ SEO</p>
      </div>

      <PageForm action={createPageAction} />
    </div>
  );
}