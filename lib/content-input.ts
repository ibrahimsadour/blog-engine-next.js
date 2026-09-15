import { Prisma } from '@prisma/client';
import { sanitizeContentHtml } from '@/lib/security/content';

export const CONTENT_LIMITS = {
  name: 160,
  slug: 200,
  description: 10_000,
  content: 1_000_000,
  metaTitle: 300,
  metaDescription: 500,
  keywords: 1_000,
  url: 2_048,
  sortOrderMin: -100_000,
  sortOrderMax: 100_000,
} as const;

const RESERVED_TOP_LEVEL_SLUGS = new Set([
  'admin', 'api', 'login', 'cars', 'cities', 'category', 'robots.txt', 'sitemap.xml',
  'post-sitemap.xml', 'page-sitemap.xml', 'category-sitemap.xml', 'city-service-sitemap.xml',
]);

export class InputValidationError extends Error {
  readonly field?: string;
  readonly status: number;
  readonly code: string;

  constructor(
    message: string,
    field?: string,
    status = 400,
    code = 'INVALID_INPUT',
  ) {
    super(message);
    this.field = field;
    this.status = status;
    this.code = code;
  }
}

export function normalizeSlug(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value
    .normalize('NFKC')
    .trim()
    .toLocaleLowerCase('en-US')
    .replace(/[\s_]+/gu, '-')
    .replace(/[^\p{L}\p{N}-]+/gu, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function requiredText(value: unknown, field: string, label: string, max: number): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new InputValidationError(`${label} مطلوب`, field);
  }
  const clean = value.trim();
  if (clean.length > max) {
    throw new InputValidationError(`${label} يجب ألا يتجاوز ${max} حرفًا`, field);
  }
  return clean;
}

function optionalText(value: unknown, field: string, label: string, max: number): string | null {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string') {
    throw new InputValidationError(`${label} يجب أن يكون نصًا`, field);
  }
  const clean = value.trim();
  if (clean.length > max) {
    throw new InputValidationError(`${label} يجب ألا يتجاوز ${max} حرفًا`, field);
  }
  return clean || null;
}

function optionalBoolean(value: unknown, field: string, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  if (typeof value !== 'boolean') {
    throw new InputValidationError(`${field} يجب أن يكون true أو false`, field);
  }
  return value;
}

function optionalInteger(value: unknown): number {
  if (value === undefined || value === null || value === '') return 0;
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < CONTENT_LIMITS.sortOrderMin || parsed > CONTENT_LIMITS.sortOrderMax) {
    throw new InputValidationError('ترتيب العرض يجب أن يكون رقمًا صحيحًا ضمن النطاق المسموح', 'sortOrder');
  }
  return parsed;
}

function validatedSlug(value: unknown, topLevel: boolean): string {
  const slug = normalizeSlug(value);
  if (!slug) throw new InputValidationError('الرابط الدائم غير صالح', 'slug');
  if (slug.length > CONTENT_LIMITS.slug) {
    throw new InputValidationError(`الرابط الدائم يجب ألا يتجاوز ${CONTENT_LIMITS.slug} حرفًا`, 'slug');
  }
  if (topLevel && RESERVED_TOP_LEVEL_SLUGS.has(slug)) {
    throw new InputValidationError('هذا الرابط محجوز من النظام، اختر رابطًا آخر', 'slug', 409, 'RESERVED_SLUG');
  }
  return slug;
}

export type DirectoryInput = ReturnType<typeof validateDirectoryInput>;

export function validateDirectoryInput(value: unknown, options: { topLevel?: boolean } = {}) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new InputValidationError('بيانات الطلب غير صالحة');
  }
  const input = value as Record<string, unknown>;
  return {
    name: requiredText(input.name, 'name', 'الاسم', CONTENT_LIMITS.name),
    slug: validatedSlug(input.slug, options.topLevel ?? false),
    description: optionalText(input.description, 'description', 'الوصف', CONTENT_LIMITS.description),
    metaTitle: optionalText(input.metaTitle, 'metaTitle', 'عنوان الميتا', CONTENT_LIMITS.metaTitle),
    metaDesc: optionalText(input.metaDesc, 'metaDesc', 'وصف الميتا', CONTENT_LIMITS.metaDescription),
    keywords: optionalText(input.keywords, 'keywords', 'الكلمات المفتاحية', CONTENT_LIMITS.keywords),
    image: optionalText(input.image, 'image', 'رابط الصورة', CONTENT_LIMITS.url),
    sortOrder: optionalInteger(input.sortOrder),
    isActive: optionalBoolean(input.isActive, 'isActive', true),
  };
}

export function validatePageInput(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new InputValidationError('بيانات الصفحة غير صالحة');
  }
  const input = value as Record<string, unknown>;
  return {
    title: requiredText(input.title, 'title', 'العنوان', CONTENT_LIMITS.name),
    slug: validatedSlug(input.slug, true),
    content: sanitizeContentHtml(requiredText(input.content, 'content', 'المحتوى', CONTENT_LIMITS.content)),
    metaTitle: optionalText(input.metaTitle, 'metaTitle', 'عنوان الميتا', CONTENT_LIMITS.metaTitle),
    metaDesc: optionalText(input.metaDesc, 'metaDesc', 'وصف الميتا', CONTENT_LIMITS.metaDescription),
    isPublished: optionalBoolean(input.isPublished, 'isPublished', true),
    showInHeader: optionalBoolean(input.showInHeader, 'showInHeader', false),
    showInFooter: optionalBoolean(input.showInFooter, 'showInFooter', true),
  };
}

export function validateArticleInput(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new InputValidationError('بيانات المقال غير صالحة');
  }
  const input = value as Record<string, unknown>;
  const faqs = input.faqs ?? null;
  if (faqs !== null && JSON.stringify(faqs).length > 50_000) {
    throw new InputValidationError('بيانات الأسئلة الشائعة تتجاوز الحجم المسموح', 'faqs');
  }
  return {
    title: requiredText(input.title, 'title', 'عنوان المقال', CONTENT_LIMITS.name),
    slug: validatedSlug(input.slug, true),
    content: sanitizeContentHtml(requiredText(input.content, 'content', 'محتوى المقال', CONTENT_LIMITS.content)),
    excerpt: optionalText(input.excerpt, 'excerpt', 'المقتطف', CONTENT_LIMITS.description),
    featuredImage: optionalText(input.featuredImage, 'featuredImage', 'رابط الصورة', CONTENT_LIMITS.url),
    altText: optionalText(input.altText, 'altText', 'النص البديل', CONTENT_LIMITS.name),
    metaTitle: optionalText(input.metaTitle, 'metaTitle', 'عنوان الميتا', CONTENT_LIMITS.metaTitle),
    metaDesc: optionalText(input.metaDesc, 'metaDesc', 'وصف الميتا', CONTENT_LIMITS.metaDescription),
    canonicalUrl: optionalText(input.canonicalUrl, 'canonicalUrl', 'الرابط الأساسي', CONTENT_LIMITS.url),
    targetKeyword: optionalText(input.targetKeyword, 'targetKeyword', 'الكلمة المستهدفة', CONTENT_LIMITS.name),
    targetArea: optionalText(input.targetArea, 'targetArea', 'المنطقة المستهدفة', CONTENT_LIMITS.name),
    categorySlug: validatedSlug(input.categorySlug, false),
    authorSlug: input.authorSlug ? validatedSlug(input.authorSlug, false) : null,
    faqs: faqs === null ? Prisma.JsonNull : faqs as Prisma.InputJsonValue,
    isPublished: optionalBoolean(input.isPublished, 'isPublished', true),
  };
}

export function validateCustomServiceContent(value: unknown, owner: 'city' | 'car') {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new InputValidationError('بيانات المحتوى المخصص غير صالحة');
  const input = value as Record<string, unknown>;
  const customDescription = optionalText(input.customDescription, 'customDescription', 'الوصف المخصص', CONTENT_LIMITS.description);
  return {
    ownerId: requiredText(input.ownerId, `${owner}Id`, owner === 'city' ? 'المدينة' : 'السيارة', 64),
    serviceId: requiredText(input.serviceId, 'serviceId', 'الخدمة', 64),
    customTitle: optionalText(input.customTitle, 'customTitle', 'العنوان المخصص', CONTENT_LIMITS.name),
    customDescription: customDescription ? sanitizeContentHtml(customDescription) : null,
    metaTitle: optionalText(input.metaTitle, 'metaTitle', 'عنوان الميتا', CONTENT_LIMITS.metaTitle),
    metaDesc: optionalText(input.metaDesc, 'metaDesc', 'وصف الميتا', CONTENT_LIMITS.metaDescription),
  };
}

type SlugOwner = 'city' | 'car' | 'article' | 'page';
type SlugClient = Prisma.TransactionClient | {
  city: Prisma.TransactionClient['city'];
  car: Prisma.TransactionClient['car'];
  article: Prisma.TransactionClient['article'];
  page: Prisma.TransactionClient['page'];
};

export async function assertTopLevelSlugAvailable(
  client: SlugClient,
  slug: string,
  current?: { owner: SlugOwner; id: string },
): Promise<void> {
  const [city, car, article, page] = await Promise.all([
    client.city.findFirst({ where: { slug, ...(current?.owner === 'city' ? { NOT: { id: current.id } } : {}) }, select: { id: true } }),
    client.car.findFirst({ where: { slug, ...(current?.owner === 'car' ? { NOT: { id: current.id } } : {}) }, select: { id: true } }),
    client.article.findFirst({ where: { slug, ...(current?.owner === 'article' ? { NOT: { id: current.id } } : {}) }, select: { id: true } }),
    client.page.findFirst({ where: { slug, ...(current?.owner === 'page' ? { NOT: { id: current.id } } : {}) }, select: { id: true } }),
  ]);
  if (city || car || article || page) {
    throw new InputValidationError('هذا الرابط الدائم مستخدم بالفعل في مدينة أو سيارة أو مقال أو صفحة', 'slug', 409, 'DUPLICATE_SLUG');
  }
}

export function publicError(error: unknown): { message: string; field?: string; code: string; status: number } {
  if (error instanceof InputValidationError) {
    return { message: error.message, field: error.field, code: error.code, status: error.status };
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') return { message: 'توجد قيمة مكررة في حقل يجب أن يكون فريدًا', code: 'DUPLICATE_VALUE', status: 409 };
    if (error.code === 'P2025') return { message: 'السجل المطلوب غير موجود', code: 'NOT_FOUND', status: 404 };
    if (error.code === 'P2003') return { message: 'لا يمكن تنفيذ العملية بسبب ارتباط السجل ببيانات أخرى', code: 'RELATED_DATA', status: 409 };
  }
  return { message: 'حدث خطأ غير متوقع أثناء معالجة الطلب', code: 'INTERNAL_ERROR', status: 500 };
}
