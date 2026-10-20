import { getSiteUrl } from '@/lib/site-url';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { requireAdminAction } from '@/lib/auth/authorization';
import { revalidatePath } from 'next/cache';
import PageForm from '@/components/PageForm';
import { assertTopLevelSlugAvailable, publicError, validatePageInput } from '@/lib/content-input';

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
    await requireAdminAction();

    try {
      const input = validatePageInput({
        title: formData.get('title'), slug: formData.get('slug'), content: formData.get('content'),
        metaTitle: formData.get('metaTitle'), metaDesc: formData.get('metaDesc'),
        isPublished: formData.get('isPublished') === 'on', showInHeader: formData.get('showInHeader') === 'on',
        showInFooter: formData.get('showInFooter') === 'on',
      });
      const oldSlug = page?.slug;
      await db.$transaction(async (tx) => {
        await assertTopLevelSlugAvailable(tx, input.slug, { owner: 'page', id });
        await tx.page.update({ where: { id }, data: input });
      });

      // تفريغ وتحديث الكاش للمسار القديم والجديد والـ Layout والسايت ماب
      revalidatePath('/');
      revalidatePath('/', 'layout');
      if (oldSlug && oldSlug !== input.slug) {
        revalidatePath(`/${oldSlug}`);
      }
      revalidatePath(`/${input.slug}`);
      revalidatePath('/page-sitemap.xml');
      revalidatePath('/sitemap.xml');
      revalidatePath('/admin/pages');

      return { success: true };
    } catch (error) {
      return { success: false, error: publicError(error).message };
    }
  }

  return (
    <div className="w-full min-w-0">
      <PageForm siteUrl={getSiteUrl()} initialData={page} action={updatePageAction} />
    </div>
  );
}
