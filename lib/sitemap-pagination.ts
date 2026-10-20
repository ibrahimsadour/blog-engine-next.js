/** Conservative per-file limit below the protocol's 50,000 URL ceiling. */
export const SITEMAP_PAGE_SIZE = 10000;

export function pageCount(total: number): number {
  return Math.max(1, Math.ceil(total / SITEMAP_PAGE_SIZE));
}

export function sitemapPage(value: string | null): number | null {
  if (value === null) return 1;
  if (!/^[1-9]\d*$/.test(value)) return null;
  const page = Number(value);
  return Number.isSafeInteger(page) ? page : null;
}

export function sitemapSlice<T>(values: T[], page: number): T[] {
  return values.slice((page - 1) * SITEMAP_PAGE_SIZE, page * SITEMAP_PAGE_SIZE);
}
