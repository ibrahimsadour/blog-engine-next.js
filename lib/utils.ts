export function formatSlug(text: string): string {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-') // تحويل المسافات إلى شرطات
    .replace(/[^\w\u0600-\u06FF\-]+/g, '') // إزالة الرموز الخاصة مع دعم الحروف العربية والإنجليزية
    .replace(/\-\-+/g, '-') // منع تكرار الشرطات المتتالية
    .replace(/^-+/, '') // إزالة الشرطة من البداية
    .replace(/-+$/, ''); // إزالة الشرطة من النهاية
}