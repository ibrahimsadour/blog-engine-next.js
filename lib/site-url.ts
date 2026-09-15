import { normalizeSlug } from '@/lib/content-input';

const DEFAULT_SITE_URL = 'https://autogarag.net';

export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_URL;
  try {
    const url = new URL(configured);
    if (url.protocol !== 'https:' && url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
      return DEFAULT_SITE_URL;
    }
    return url.origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export function encodeSlugSegment(slug: string): string {
  const normalized = normalizeSlug(slug);
  return encodeURIComponent(normalized);
}

export function buildSiteUrl(...segments: string[]): string {
  const path = segments.map(encodeSlugSegment).filter(Boolean).join('/');
  return path ? `${getSiteUrl()}/${path}` : getSiteUrl();
}

export function trustedCanonicalUrl(value: unknown, fallbackPath: string): string {
  const fallback = new URL(fallbackPath, `${getSiteUrl()}/`).toString();
  if (typeof value !== 'string' || !value.trim()) return fallback;

  try {
    const candidate = new URL(value, getSiteUrl());
    if (candidate.origin !== new URL(getSiteUrl()).origin) return fallback;
    candidate.search = '';
    candidate.hash = '';
    return candidate.toString();
  } catch {
    return fallback;
  }
}

export function escapeXml(value: unknown): string {
  return String(value ?? '').replace(/[<>&'\"]/g, (character) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    "'": '&apos;',
    '"': '&quot;',
  })[character] ?? character);
}

export function sitemapUrlEntry(url: string, lastModified: Date, priority: string): string {
  return `<url><loc>${escapeXml(url)}</loc><lastmod>${lastModified.toISOString()}</lastmod><changefreq>weekly</changefreq><priority>${priority}</priority></url>`;
}

export function latestDate(...dates: Array<Date | null | undefined>): Date {
  const timestamps = dates.filter(Boolean).map((date) => date!.getTime());
  return new Date(timestamps.length ? Math.max(...timestamps) : 0);
}
