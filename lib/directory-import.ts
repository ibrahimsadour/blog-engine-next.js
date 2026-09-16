import { DirectoryInput, InputValidationError, validateDirectoryInput } from '@/lib/content-input';

function pick(row: Record<string, string>, ...keys: string[]): string {
  for (const key of keys) {
    if (row[key]?.trim()) return row[key].trim();
  }
  return '';
}

export function validateDirectoryRows(
  rows: Record<string, string>[],
  localizedName: string,
  topLevel: boolean,
): DirectoryInput[] {
  const validated: DirectoryInput[] = [];
  const slugs = new Set<string>();

  rows.forEach((row, index) => {
    try {
      const item = validateDirectoryInput({
        name: pick(row, 'name', 'Name', localizedName),
        slug: pick(row, 'slug', 'Slug', 'الرابط'),
        description: pick(row, 'description', 'Description', 'الوصف'),
        metaTitle: pick(row, 'metaTitle', 'MetaTitle', 'عنوان_السييو'),
        metaDesc: pick(row, 'metaDesc', 'MetaDesc', 'وصف_السييو'),
        keywords: pick(row, 'keywords', 'Keywords', 'الكلمات_المفتاحية'),
      }, { topLevel });

      if (slugs.has(item.slug)) {
        throw new InputValidationError('الرابط الدائم مكرر داخل ملف Excel', 'slug', 409, 'DUPLICATE_SLUG');
      }
      slugs.add(item.slug);
      validated.push(item);
    } catch (error) {
      if (error instanceof InputValidationError) {
        throw new InputValidationError(`خطأ في صف Excel رقم ${index + 2}: ${error.message}`, error.field, error.status, error.code);
      }
      throw error;
    }
  });

  return validated;
}
