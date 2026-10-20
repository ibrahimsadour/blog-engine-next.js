import { getSiteUrl } from '@/lib/site-url';
import { db } from '@/lib/db';
import { requireAdminAction } from '@/lib/auth/authorization';
import { revalidatePath } from 'next/cache';
import PageForm from '@/components/PageForm';
import { assertTopLevelSlugAvailable, publicError, validatePageInput } from '@/lib/content-input';

export const dynamic = 'force-dynamic';

export default function NewAdminPage() {
  async function createPageAction(formData: FormData) {
    'use server';
    await requireAdminAction();

    try {
      const input = validatePageInput({
        title: formData.get('title'), slug: formData.get('slug'), content: formData.get('content'),
        metaTitle: formData.get('metaTitle'), metaDesc: formData.get('metaDesc'),
        isPublished: formData.get('isPublished') === 'on', showInHeader: formData.get('showInHeader') === 'on',
        showInFooter: formData.get('showInFooter') === 'on',
      });
      const created = await db.$transaction(async (tx) => {
        await assertTopLevelSlugAvailable(tx, input.slug);
        return tx.page.create({ data: input });
      });

      // تفريغ وتحديث الكاش فورياً للصفحة الجديدة، الروابط في الهيدر والفوتر، والسايت ماب
      revalidatePath('/');
      revalidatePath('/', 'layout');
      revalidatePath(`/${created.slug}`);
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
      <PageForm siteUrl={getSiteUrl()} action={createPageAction} />
    </div>
  );
}
