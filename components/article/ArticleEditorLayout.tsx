'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import type { ChangeEventHandler, FormEventHandler, ReactNode } from 'react';
import { ArrowRight, CheckCircle2, ChevronDown, ExternalLink, Save, FileText, Link2, Search, ImageIcon, Settings2 } from 'lucide-react';
import ImageUploader from '@/components/ImageUploader';
import SeoLiveOptimizer from '@/components/SeoLiveOptimizer';
import DraftRecoveryBanner from '@/components/article/DraftRecoveryBanner';
import type { ArticleFaq, CategorySummary } from '@/types/admin';
import styles from './ArticleEditorLayout.module.css';

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  ssr: false,
  loading: () => <div className="min-h-80 animate-pulse bg-gray-50 p-6 text-sm text-gray-500">جاري تحميل المحرر...</div>,
});

export interface ArticleEditorValues {
  title: string;
  slug: string;
  targetKeyword: string;
  targetArea: string;
  categorySlug: string;
  excerpt: string;
  featuredImage: string;
  altText: string;
  metaTitle: string;
  metaDesc: string;
  canonicalUrl: string;
  content: string;
  isPublished: boolean;
  noIndex: boolean;
  noFollow: boolean;
}

interface ArticleEditorLayoutProps {
  values: ArticleEditorValues;
  onChange: { [K in keyof ArticleEditorValues]: (value: ArticleEditorValues[K]) => void };
  categories: CategorySummary[];
  faqs: ArticleFaq[];
  isEditMode: boolean;
  isSubmitting: boolean;
  isSavedLocally: boolean;
  isDirty: boolean;
  hasDraft: boolean;
  previewSlug?: string;
  siteUrl: string;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onSlugChange: ChangeEventHandler<HTMLInputElement>;
  onRestoreDraft: () => void;
  onDiscardDraft: () => void;
  onAddFaq: () => void;
  onRemoveFaq: (index: number) => void;
  onFaqChange: (index: number, field: 'question' | 'answer', value: string) => void;
}

function EditorBox({ title, icon, children, collapsible = true }: {
  title: string; icon?: ReactNode; children: ReactNode; collapsible?: boolean;
}) {
  const heading = <span className={styles.boxHeading}>{icon}{title}</span>;
  return collapsible ? (
    <details className={styles.box} open>
      <summary className={styles.boxHeader}>{heading}<ChevronDown size={16} aria-hidden="true" /></summary>
      <div className={styles.boxBody}>{children}</div>
    </details>
  ) : (
    <section className={styles.box}>
      <div className={styles.boxHeader}><h2>{heading}</h2></div>
      <div className={styles.boxBody}>{children}</div>
    </section>
  );
}

export default function ArticleEditorLayout({
  values: v, onChange: change, categories, faqs, isEditMode, isSubmitting,
  isSavedLocally, isDirty, hasDraft, previewSlug, siteUrl, onSubmit, onSlugChange,
  onRestoreDraft, onDiscardDraft, onAddFaq, onRemoveFaq, onFaqChange,
}: ArticleEditorLayoutProps) {
  const origin = siteUrl.replace(/\/$/, '');
  const articleUrl = origin ? `${origin}/${v.slug}` : `/${v.slug}`;
  const wordCount = v.content.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  const saveText = isSubmitting ? 'جاري الحفظ...' : isEditMode ? 'تحديث المقال' : v.isPublished ? 'نشر المقال' : 'حفظ المسودة';
  const savedLabel = isSavedLocally ? 'مسودة محفوظة على هذا الجهاز' : isDirty ? 'تغييرات غير محفوظة على الموقع' : isEditMode ? 'تم تحميل المقال' : 'مقال جديد';

  return (
    <form onSubmit={onSubmit} className={styles.editor} dir="rtl" aria-busy={isSubmitting}>
      <header className={styles.toolbar}>
        <div className={styles.toolbarTitle}>
          <Link href="/admin" className={styles.backLink} aria-label="العودة إلى المقالات"><ArrowRight size={19} /></Link>
          <div>
            <h1>{isEditMode ? 'تعديل المقال' : 'إضافة مقال جديد'}</h1>
            <p>المقالات / {isEditMode ? 'تحرير' : 'إضافة جديد'}</p>
          </div>
        </div>
        <div className={styles.toolbarActions}>
          <span className={styles.saveStatus} role="status">
            {isSavedLocally && <CheckCircle2 size={14} aria-hidden="true" />}{savedLabel}
          </span>
          {previewSlug && (
            <a href={`/${previewSlug}`} target="_blank" rel="noopener noreferrer" className={styles.secondaryButton}>
              <ExternalLink size={14} aria-hidden="true" />معاينة المحفوظ
            </a>
          )}
          <button type="submit" disabled={isSubmitting} className={styles.primaryButton}>
            <Save size={15} aria-hidden="true" />{saveText}
          </button>
        </div>
      </header>

      {hasDraft && <DraftRecoveryBanner onRestore={onRestoreDraft} onDiscard={onDiscardDraft} />}

      <fieldset disabled={isSubmitting} className={styles.formFields}>
        <div className={styles.columns}>
          <div className={styles.mainColumn}>
            <section className={styles.titleSection}>
              <label htmlFor="article-title" className={styles.srOnly}>عنوان المقال</label>
              <input id="article-title" name="title" type="text" required value={v.title}
                onChange={(e) => change.title(e.target.value)} placeholder="أضف عنوان المقال هنا"
                className={styles.titleInput} />
              <div className={styles.permalink}>
                <label htmlFor="article-slug"><Link2 size={14} aria-hidden="true" />الرابط الدائم</label>
                <div className={styles.permalinkInput}>
                  {origin && <span dir="ltr">{origin}/</span>}
                  <input id="article-slug" name="slug" required dir="ltr" value={v.slug}
                    onChange={onSlugChange} placeholder="article-slug" autoCapitalize="none" spellCheck={false} />
                </div>
              </div>
              {isEditMode && <p className={styles.help}>تغيير رابط مقال منشور قد يتطلب تحويل الرابط القديم إلى الجديد.</p>}
            </section>

            <section className={styles.box} aria-label="محتوى المقال">
              <div className={styles.boxHeader}><h2 className={styles.boxHeading}><FileText size={16} aria-hidden="true" />محتوى المقال</h2></div>
              <div className={styles.contentEditor}><RichTextEditor content={v.content} onChange={change.content} /></div>
              <div className={styles.editorFooter}><span>عدد الكلمات: {wordCount}</span><span>محرر مرئي وHTML</span></div>
            </section>

            <EditorBox title="إعدادات السيو ومعاينة البحث" icon={<Search size={16} aria-hidden="true" />} collapsible={false}>
              <div className={styles.field}>
                <label htmlFor="article-keyword">العبارة المفتاحية الرئيسية</label>
                <input id="article-keyword" name="targetKeyword" value={v.targetKeyword}
                  onChange={(e) => change.targetKeyword(e.target.value)} placeholder="العبارة التي يتناولها المقال" />
              </div>
              <SeoLiveOptimizer title={v.title} slug={v.slug} metaTitle={v.metaTitle} metaDesc={v.metaDesc}
                targetKeyword={v.targetKeyword} content={v.content}
                onMetaTitleChange={change.metaTitle} onMetaDescChange={change.metaDesc}
                siteUrl={origin} variant="classic" />
              <details className={styles.advanced}>
                <summary><Settings2 size={15} aria-hidden="true" />إعدادات الفهرسة والرابط الأساسي<ChevronDown size={15} aria-hidden="true" /></summary>
                <div className={styles.field}>
                  <label htmlFor="article-canonical">الرابط الأساسي Canonical</label>
                  <input id="article-canonical" type="url" name="canonicalUrl" dir="ltr" value={v.canonicalUrl}
                    onChange={(e) => change.canonicalUrl(e.target.value)} placeholder={articleUrl} />
                  <p className={styles.help}>اتركه فارغًا لاستخدام رابط المقال تلقائيًا.</p>
                </div>
                <label className={styles.checkbox}><input type="checkbox" checked={v.noIndex} onChange={(e) => change.noIndex(e.target.checked)} />منع فهرسة المقال في نتائج البحث (noindex)</label>
                <label className={styles.checkbox}><input type="checkbox" checked={v.noFollow} onChange={(e) => change.noFollow(e.target.checked)} />عدم تتبع روابط الصفحة (nofollow)</label>
                {(v.noIndex || v.noFollow) && <p className={styles.warning}>تم تفعيل توجيهات تقيّد ظهور الصفحة أو تتبع روابطها.</p>}
              </details>
            </EditorBox>

            <EditorBox title="المقتطف">
              <div className={styles.field}>
                <label htmlFor="article-excerpt" className={styles.srOnly}>مقتطف المقال</label>
                <textarea id="article-excerpt" name="excerpt" rows={3} value={v.excerpt}
                  onChange={(e) => change.excerpt(e.target.value)} placeholder="ملخص قصير يظهر في بطاقات المقالات" />
                <p className={styles.help}>اكتب ملخصًا يوضح موضوع المقال للقارئ.</p>
              </div>
            </EditorBox>

            <EditorBox title="الأسئلة الشائعة">
              <div className={styles.faqList}>
                {faqs.map((faq, index) => (
                  <div className={styles.faqItem} key={index}>
                    <div className={styles.faqHeading}>
                      <label htmlFor={`article-faq-q-${index}`}>السؤال {index + 1}</label>
                      <button type="button" className={styles.dangerLink} onClick={() => onRemoveFaq(index)} aria-label={`حذف السؤال ${index + 1}`}>حذف</button>
                    </div>
                    <input id={`article-faq-q-${index}`} value={faq.question} onChange={(e) => onFaqChange(index, 'question', e.target.value)} placeholder="اكتب السؤال" />
                    <label htmlFor={`article-faq-a-${index}`} className={styles.srOnly}>إجابة السؤال {index + 1}</label>
                    <textarea id={`article-faq-a-${index}`} rows={3} value={faq.answer} onChange={(e) => onFaqChange(index, 'answer', e.target.value)} placeholder="اكتب الإجابة" />
                  </div>
                ))}
              </div>
              <button type="button" className={styles.secondaryButton} onClick={onAddFaq}>+ إضافة سؤال</button>
            </EditorBox>
          </div>

          <aside className={styles.sideColumn} aria-label="إعدادات المقال">
            <EditorBox title="نشر" collapsible={false}>
              <div className={styles.publishStatus}><span className={v.isPublished ? styles.liveDot : styles.draftDot} />{v.isPublished ? 'سيكون المقال منشورًا' : 'سيُحفظ كمسودة'}</div>
              <div className={styles.field}>
                <label htmlFor="article-status">حالة المقال</label>
                <select id="article-status" value={v.isPublished ? 'published' : 'draft'} onChange={(e) => change.isPublished(e.target.value === 'published')}>
                  <option value="published">منشور — ظاهر للزوار</option>
                  <option value="draft">مسودة — غير ظاهر للزوار</option>
                </select>
              </div>
              <p className={styles.help}>تُطبّق الحالة عند الضغط على زر الحفظ.</p>
              {(v.noIndex || v.noFollow) && <p className={styles.warning}>راجع إعدادات الفهرسة المفعّلة قبل النشر.</p>}
              <div className={styles.publishActions}>
                {previewSlug && <a href={`/${previewSlug}`} target="_blank" rel="noopener noreferrer" className={styles.textLink}>معاينة النسخة المحفوظة ↗</a>}
                <button type="submit" disabled={isSubmitting} className={styles.primaryButton}>{saveText}</button>
              </div>
              <p className={styles.help}>الحفظ التلقائي المحلي لا ينشر المقال على الموقع.</p>
            </EditorBox>

            <EditorBox title="التصنيف" collapsible={false}>
              <div className={styles.field}>
                <label htmlFor="article-category" className={styles.srOnly}>تصنيف المقال</label>
                <select id="article-category" name="categorySlug" required value={v.categorySlug} onChange={(e) => change.categorySlug(e.target.value)}>
                  {categories.map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}
                </select>
              </div>
              <Link href="/admin/categories" target="_blank" rel="noopener noreferrer" className={styles.textLink}>+ إدارة التصنيفات ↗</Link>
            </EditorBox>

            <EditorBox title="الصورة البارزة" icon={<ImageIcon size={16} aria-hidden="true" />}>
              <ImageUploader name="featuredImage" value={v.featuredImage} onChange={change.featuredImage} compact />
              <div className={styles.field}>
                <label htmlFor="article-image-alt">النص البديل للصورة</label>
                <input id="article-image-alt" name="altText" value={v.altText} onChange={(e) => change.altText(e.target.value)} placeholder="وصف مختصر لما يظهر في الصورة" />
                <p className={styles.help}>يساعد على فهم الصورة عند تعذر عرضها.</p>
              </div>
            </EditorBox>

            <EditorBox title="المنطقة المستهدفة">
              <div className={styles.field}>
                <label htmlFor="article-area">المنطقة الجغرافية</label>
                <input id="article-area" name="targetArea" value={v.targetArea} onChange={(e) => change.targetArea(e.target.value)} placeholder="الكويت" />
              </div>
            </EditorBox>
          </aside>
        </div>
      </fieldset>
    </form>
  );
}
