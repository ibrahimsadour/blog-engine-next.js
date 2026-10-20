'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import Link from 'next/link';
import { ArrowRight, ExternalLink, FileText, Link2, Search, Save } from 'lucide-react';
import SeoLiveOptimizer from '@/components/SeoLiveOptimizer';
import EditorBox from '@/components/article/EditorBox';
import { resolveArticlePublicationIntent } from '@/lib/article-save-intent';
import styles from '@/components/article/ArticleEditorLayout.module.css';

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  ssr: false,
  loading: () => (
    <div className="h-48 w-full animate-pulse rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs font-bold text-gray-400">
      جاري تحميل المحرر المرئي...
    </div>
  ),
});

interface PageFormProps {
  siteUrl: string;
  initialData?: {
    id?: string;
    title?: string;
    slug?: string;
    content?: string;
    metaTitle?: string | null;
    metaDesc?: string | null;
    isPublished?: boolean;
    showInHeader?: boolean;
    showInFooter?: boolean;
  };
  action: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
}

export default function PageForm({ initialData, action, siteUrl }: PageFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle || '');
  const [metaDesc, setMetaDesc] = useState(initialData?.metaDesc || '');
  const [isPublished, setIsPublished] = useState(initialData?.isPublished ?? true);
  const origin = siteUrl.replace(/\/$/, '');
  const isEditMode = Boolean(initialData?.id);
  const wordCount = content.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  const saveText = isSubmitting ? 'جاري الحفظ...' : isEditMode ? 'تحديث الصفحة' : isPublished ? 'نشر الصفحة' : 'حفظ المسودة';

  // توليد وتنظيف الـ Slug تلقائياً عند كتابة العنوان في حال كان إنشاء جديد
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!initialData?.id) {
      const generatedSlug = newTitle
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\u0600-\u06FF\-]+/g, '')
        .replace(/\-\-+/g, '-');
      setSlug(generatedSlug);
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = e.target.value
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\u0600-\u06FF\-]+/g, '')
      .replace(/\-\-+/g, '-');
    setSlug(formatted);
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const cleanSlug = slug.trim().replace(/^-+|-+$/g, '');

    if (!title.trim()) {
      toast.error('يرجى إدخال عنوان الصفحة');
      return;
    }
    if (!cleanSlug) {
      toast.error('يرجى إدخال الرابط الدائم (Slug)');
      return;
    }

    formData.set('title', title.trim());
    formData.set('slug', cleanSlug);
    formData.set('content', content);
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const intent = submitter instanceof HTMLButtonElement && submitter.name === 'publicationIntent'
      ? submitter.value : undefined;
    const publishOnSave = resolveArticlePublicationIntent(isPublished, intent);
    formData.set('isPublished', publishOnSave ? 'on' : '');
    formData.set('metaTitle', metaTitle);
    formData.set('metaDesc', metaDesc);

    setIsSubmitting(true);
    const toastId = toast.loading('جاري حفظ الصفحة...');

    try {
      const res = await action(formData);
      if (!res.success) {
        toast.error(res.error || 'حدث خطأ أثناء حفظ الصفحة', { id: toastId });
      } else {
        toast.success('تم حفظ الصفحة بنجاح!', { id: toastId });
        router.push('/admin/pages');
        router.refresh();
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'تعذر الاتصال بالسيرفر لحفظ الصفحة', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.editor} dir="rtl" aria-busy={isSubmitting}>
      <header className={styles.toolbar}>
        <div className={styles.toolbarTitle}>
          <Link href="/admin/pages" className={styles.backLink} aria-label="العودة إلى الصفحات"><ArrowRight size={19} /></Link>
          <div><h1>{isEditMode ? 'تعديل الصفحة' : 'إضافة صفحة جديدة'}</h1><p>الصفحات / {isEditMode ? 'تحرير' : 'إضافة جديد'}</p></div>
        </div>
        <div className={styles.toolbarActions}>
          <span className={styles.saveStatus} role="status">{isSubmitting ? 'جاري حفظ الصفحة...' : 'احفظ التغييرات قبل مغادرة الصفحة'}</span>
          {initialData?.slug && <a href={`/${initialData.slug}`} target="_blank" rel="noopener noreferrer" className={styles.secondaryButton}><ExternalLink size={14} />معاينة المحفوظ</a>}
          <button type="submit" disabled={isSubmitting} className={styles.primaryButton}><Save size={15} />{saveText}</button>
        </div>
      </header>
      <fieldset disabled={isSubmitting} className={styles.formFields}>
        <div className={styles.columns}>
          <div className={styles.mainColumn}>
            <section className={styles.titleSection}>
              <label htmlFor="page-title" className={styles.srOnly}>عنوان الصفحة</label>
              <input id="page-title" name="title" type="text" required maxLength={160} value={title} onChange={handleTitleChange}
                placeholder="أضف عنوان الصفحة هنا" className={styles.titleInput} />
              <div className={styles.permalink}>
                <label htmlFor="page-slug"><Link2 size={14} aria-hidden="true" />الرابط الدائم</label>
                <div className={styles.permalinkInput}>
                  {origin && <span dir="ltr">{origin}/</span>}
                  <input id="page-slug" name="slug" required maxLength={200} dir="ltr" value={slug}
                    onChange={handleSlugChange} placeholder="about-us" autoCapitalize="none" spellCheck={false} />
                </div>
              </div>
              {isEditMode && <p className={styles.help}>تغيير رابط صفحة منشورة قد يتطلب تحويل الرابط القديم إلى الجديد.</p>}
            </section>
            <section className={styles.box} aria-label="محتوى الصفحة">
              <div className={styles.boxHeader}><h2 className={styles.boxHeading}><FileText size={16} aria-hidden="true" />محتوى الصفحة</h2></div>
              <div className={styles.contentEditor}><RichTextEditor content={content} onChange={setContent} /></div>
              <div className={styles.editorFooter}><span>عدد الكلمات: {wordCount}</span><span>محرر مرئي وHTML</span></div>
            </section>
            <EditorBox title="إعدادات السيو ومعاينة البحث" icon={<Search size={16} aria-hidden="true" />} collapsible={false}>
              <SeoLiveOptimizer title={title} slug={slug} metaTitle={metaTitle} metaDesc={metaDesc}
                targetKeyword="" content={content} onMetaTitleChange={setMetaTitle} onMetaDescChange={setMetaDesc}
                siteUrl={origin} variant="classic" />
            </EditorBox>
          </div>
          <aside className={styles.sideColumn} aria-label="إعدادات الصفحة">
            <div className={styles.publishBox}>
              <EditorBox title="نشر الصفحة" collapsible={false}>
                <div className={styles.publishStatus}><span className={isPublished ? styles.liveDot : styles.draftDot} />{isPublished ? 'ستكون الصفحة منشورة' : 'ستُحفظ كمسودة'}</div>
                <div className={styles.field}>
                  <label htmlFor="page-status">حالة الصفحة</label>
                  <select id="page-status" value={isPublished ? 'published' : 'draft'} onChange={(e) => setIsPublished(e.target.value === 'published')}>
                    <option value="published">منشورة — ظاهرة للزوار</option>
                    <option value="draft">مسودة — غير ظاهرة للزوار</option>
                  </select>
                </div>
                <div className={styles.publishActions}>
                  {initialData?.slug ? (
                    <a href={`/${initialData.slug}`} target="_blank" rel="noopener noreferrer" className={styles.secondaryButton}><ExternalLink size={14} aria-hidden="true" />معاينة الصفحة</a>
                  ) : (
                    <button type="button" disabled className={styles.secondaryButton} title="احفظ المسودة أولًا لإتاحة المعاينة">معاينة الصفحة</button>
                  )}
                  <button type="submit" name="publicationIntent" value={isPublished ? 'publish' : 'draft'} disabled={isSubmitting} className={styles.primaryButton}>{saveText}</button>
                  {!initialData?.isPublished && <button type="submit" name="publicationIntent" value="draft" disabled={isSubmitting} className={styles.secondaryButton}>حفظ المسودة</button>}
                </div>
                {!initialData?.slug && <p className={styles.help}>احفظ المسودة أولًا ثم افتحها لإتاحة المعاينة.</p>}
              </EditorBox>
            </div>
            <EditorBox title="الظهور في قوائم الموقع" collapsible={false}>
              <label className={styles.checkbox}><input type="checkbox" name="showInHeader" defaultChecked={initialData?.showInHeader ?? false} />إظهار في القائمة العلوية (Header)</label>
              <label className={styles.checkbox}><input type="checkbox" name="showInFooter" defaultChecked={initialData?.showInFooter ?? true} />إظهار في الفوتر (Footer)</label>
              <p className={styles.help}>اختر أماكن عرض رابط الصفحة في قوائم الموقع.</p>
            </EditorBox>
          </aside>
        </div>
      </fieldset>
    </form>
  );
}
