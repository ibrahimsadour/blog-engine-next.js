'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import ArticleEditorLayout from '@/components/article/ArticleEditorLayout';
import { resolveArticlePublicationIntent } from '@/lib/article-save-intent';
import { getErrorMessage } from '@/lib/errors';
import type { ArticleEditorData, ArticleFaq, CategorySummary } from '@/types/admin';

interface EditArticleFormProps {
  siteUrl?: string;
  article: Omit<ArticleEditorData, 'faqs'> & { id: string; faqs?: unknown };
  categories: CategorySummary[];
  updateAction: (formData: FormData) => Promise<void>;
}

export default function EditArticleForm({
  article,
  categories,
  updateAction,
  siteUrl = '',
}: EditArticleFormProps) {
  const router = useRouter();
  const storageKey = `draft_article_${article.id}`;

  const [title, setTitle] = useState(article.title || '');
  const [slug, setSlug] = useState(article.slug || '');
  const [targetKeyword, setTargetKeyword] = useState(article.targetKeyword || '');
  const [targetArea, setTargetArea] = useState(article.targetArea || 'الكويت');
  const [categorySlug, setCategorySlug] = useState(article.category?.slug || categories[0]?.slug || '');
  const [excerpt, setExcerpt] = useState(article.excerpt || '');
  const [featuredImage, setFeaturedImage] = useState(article.featuredImage || '');
  const [altText, setAltText] = useState(article.altText || '');
  const [metaTitle, setMetaTitle] = useState(article.metaTitle || '');
  const [metaDesc, setMetaDesc] = useState(article.metaDesc || '');
  const [canonicalUrl, setCanonicalUrl] = useState(article.canonicalUrl || '');
  const [content, setContent] = useState(article.content || '');
  const [isPublished, setIsPublished] = useState<boolean>(article.isPublished ?? true);
  const [noIndex, setNoIndex] = useState<boolean>(article.noIndex ?? false);
  const [noFollow, setNoFollow] = useState<boolean>(article.noFollow ?? false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialFaqs: ArticleFaq[] =
    Array.isArray(article.faqs) && article.faqs.length > 0
      ? article.faqs.filter((faq): faq is ArticleFaq =>
          typeof faq === 'object' && faq !== null &&
          typeof (faq as ArticleFaq).question === 'string' &&
          typeof (faq as ArticleFaq).answer === 'string')
      : [{ question: '', answer: '' }];

  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>(initialFaqs);
  const [hasDraft, setHasDraft] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return false;
      const parsed = JSON.parse(saved) as Partial<ArticleEditorData>;
      return Boolean(parsed.title || parsed.content);
    } catch { return false; }
  });
  const [isSavedLocally, setIsSavedLocally] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (!title && !content && !excerpt && !targetKeyword) return;

    const timer = setTimeout(() => {
      setIsDirty(true);
      setIsSavedLocally(false);
      const draftData = {
        title,
        slug,
        targetKeyword,
        targetArea,
        categorySlug,
        excerpt,
        featuredImage,
        altText,
        metaTitle,
        metaDesc,
        canonicalUrl,
        content,
        isPublished,
        noIndex,
        noFollow,
        faqs,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(storageKey, JSON.stringify(draftData));
      setIsSavedLocally(true);
    }, 600);

    return () => clearTimeout(timer);
  }, [
    title,
    slug,
    targetKeyword,
    targetArea,
    categorySlug,
    excerpt,
    featuredImage,
    altText,
    metaTitle,
    metaDesc,
    canonicalUrl,
    content,
    isPublished,
    noIndex,
    noFollow,
    faqs,
    storageKey,
  ]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleRestoreDraft = () => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.title !== undefined) setTitle(parsed.title);
        if (parsed.slug !== undefined) setSlug(parsed.slug);
        if (parsed.targetKeyword !== undefined) setTargetKeyword(parsed.targetKeyword);
        if (parsed.targetArea !== undefined) setTargetArea(parsed.targetArea);
        if (parsed.categorySlug !== undefined) setCategorySlug(parsed.categorySlug);
        if (parsed.excerpt !== undefined) setExcerpt(parsed.excerpt);
        if (parsed.featuredImage !== undefined) setFeaturedImage(parsed.featuredImage);
        if (parsed.altText !== undefined) setAltText(parsed.altText);
        if (parsed.metaTitle !== undefined) setMetaTitle(parsed.metaTitle);
        if (parsed.metaDesc !== undefined) setMetaDesc(parsed.metaDesc);
        if (parsed.canonicalUrl !== undefined) setCanonicalUrl(parsed.canonicalUrl);
        if (parsed.content !== undefined) setContent(parsed.content);
        if (parsed.isPublished !== undefined) setIsPublished(parsed.isPublished);
        if (parsed.noIndex !== undefined) setNoIndex(parsed.noIndex);
        if (parsed.noFollow !== undefined) setNoFollow(parsed.noFollow);
        if (parsed.faqs !== undefined) setFaqs(parsed.faqs);

        setHasDraft(false);
        toast.success('تمت استعادة كافة البيانات المحفوظة بنجاح!');
      }
    } catch {
      toast.error('تعذر استرجاع المسودة');
    }
  };

  const handleDiscardDraft = () => {
    if (window.confirm('هل تريد حذف المسودة المحفوظة تلقائياً؟')) {
      localStorage.removeItem(storageKey);
      setHasDraft(false);
      toast.info('تم تجاهل المسودة');
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

  const addFaq = () => {
    setFaqs([...faqs, { question: '', answer: '' }]);
  };

  const removeFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const handleFaqChange = (index: number, field: 'question' | 'answer', value: string) => {
    const updated = [...faqs];
    updated[index][field] = value;
    setFaqs(updated);
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formElement = event.currentTarget;
    const formData = new FormData(formElement);
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const intent = submitter instanceof HTMLButtonElement && submitter.name === 'publicationIntent' ? submitter.value : undefined;
    const publishOnSave = resolveArticlePublicationIntent(isPublished, intent);

    const cleanSlug = slug.trim().replace(/^-+|-+$/g, '');
    const finalCategorySlug = (formData.get('categorySlug') as string) || categorySlug;

    if (!title.trim()) {
      toast.error('يرجى إدخال عنوان المقال الرئيسي (H1)');
      return;
    }

    if (!cleanSlug) {
      toast.error('يرجى إدخال الرابط الدائم (Slug)');
      return;
    }

    if (!finalCategorySlug) {
      toast.error('يرجى اختيار التصنيف');
      return;
    }

    if (!content.trim() || content === '<p></p>') {
      toast.error('محتوى المقال لا يمكن أن يكون فارغاً');
      return;
    }

    const validFaqs = faqs.filter(
      (f) => f.question.trim() !== '' && f.answer.trim() !== ''
    );

    formData.set('title', title);
    formData.set('slug', cleanSlug);
    formData.set('targetKeyword', targetKeyword);
    formData.set('targetArea', targetArea);
    formData.set('categorySlug', finalCategorySlug);
    formData.set('excerpt', excerpt);
    formData.set('featuredImage', featuredImage);
    formData.set('altText', altText);
    formData.set('metaTitle', metaTitle);
    formData.set('metaDesc', metaDesc);
    formData.set('canonicalUrl', canonicalUrl);
    formData.set('content', content);
    formData.set('faqs', JSON.stringify(validFaqs));
    formData.set('isPublished', publishOnSave ? 'true' : 'false');
    formData.set('noIndex', noIndex ? 'true' : 'false');
    formData.set('noFollow', noFollow ? 'true' : 'false');

    setIsSubmitting(true);
    const toastId = toast.loading('جاري حفظ التعديلات...');

    try {
      await updateAction(formData);
      setIsPublished(publishOnSave);

      localStorage.removeItem(storageKey);
      setIsDirty(false);

      toast.success(publishOnSave ? 'تم حفظ وتحديث المقال بنجاح!' : 'تم حفظ التعديلات كمسودة بنجاح!', {
        id: toastId,
      });

      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error, 'تعذر تحديث المقال، يرجى المحاولة لاحقاً'), { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ArticleEditorLayout
      values={{ title, slug, targetKeyword, targetArea, categorySlug, excerpt, featuredImage, altText, metaTitle, metaDesc, canonicalUrl, content, isPublished, noIndex, noFollow }}
      onChange={{ title: setTitle, slug: setSlug, targetKeyword: setTargetKeyword, targetArea: setTargetArea, categorySlug: setCategorySlug, excerpt: setExcerpt, featuredImage: setFeaturedImage, altText: setAltText, metaTitle: setMetaTitle, metaDesc: setMetaDesc, canonicalUrl: setCanonicalUrl, content: setContent, isPublished: setIsPublished, noIndex: setNoIndex, noFollow: setNoFollow }}
      categories={categories}
      faqs={faqs}
      isEditMode={true}
      isPublishedOnServer={article.isPublished ?? false}
      isSubmitting={isSubmitting}
      isSavedLocally={isSavedLocally}
      isDirty={isDirty}
      hasDraft={hasDraft}
      previewSlug={article.slug}
      siteUrl={siteUrl}
      onSubmit={handleSubmit}
      onSlugChange={handleSlugChange}
      onRestoreDraft={handleRestoreDraft}
      onDiscardDraft={handleDiscardDraft}
      onAddFaq={addFaq}
      onRemoveFaq={removeFaq}
      onFaqChange={handleFaqChange}
    />
  );
}
