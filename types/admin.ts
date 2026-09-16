export interface AdminListItem {
  id: string;
  name: string;
  slug: string;
  metaTitle?: string | null;
}

export interface CategorySummary {
  id: string;
  name: string;
  slug: string;
}

export interface ArticleFaq {
  question: string;
  answer: string;
}

export interface ArticleEditorData {
  id?: string;
  title?: string;
  slug?: string;
  targetKeyword?: string | null;
  targetArea?: string | null;
  metaTitle?: string | null;
  metaDesc?: string | null;
  canonicalUrl?: string | null;
  excerpt?: string | null;
  featuredImage?: string | null;
  altText?: string | null;
  content?: string;
  categorySlug?: string;
  category?: CategorySummary | null;
  isPublished?: boolean;
  noIndex?: boolean;
  noFollow?: boolean;
  faqs?: ArticleFaq[] | null;
}

export interface ContentTemplateData {
  descTemplate?: string | null;
  imageTemplates?: string | null;
  titleTemplate?: string | null;
  introTemplates?: string | null;
  outroTemplates?: string | null;
  faqTemplates?: string | null;
  neighborhoodTemplates?: string | null;
  reviewTemplates?: string | null;
  testimonialTemplates?: string | null;
  metaTitleTemplate?: string | null;
  metaDescTemplate?: string | null;
}

export interface ActionResult {
  id?: string;
  success?: boolean;
  error?: string;
}
