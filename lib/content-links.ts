/**
 * Shared by the editor and HTML sanitizer. Followed links have no special rel token.
 * The configured canonical host and its www alias are treated as the same site.
 */
export function isInternalContentLink(
  href: string | null | undefined,
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL,
): boolean {
  if (!href?.trim()) return false;
  try {
    const base = new URL(siteUrl?.trim() || 'https://content.invalid');
    const destination = new URL(href.trim(), base);
    if (!['http:', 'https:'].includes(destination.protocol)) return false;
    const host = (url: URL) => url.hostname.toLowerCase().replace(/^www\./, '');
    return host(destination) === host(base) && destination.port === base.port;
  } catch {
    return false;
  }
}

export function contentLinkAttributes(
  attributes: { href?: string | null; target?: string | null; rel?: string | null },
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL,
): { target: string | null; rel: string | null } {
  if (isInternalContentLink(attributes.href, siteUrl)) {
    return { target: null, rel: null };
  }

  const target = attributes.target === '_blank' ? '_blank' : null;
  const allowed = new Set(['nofollow', 'sponsored', 'ugc', 'noopener', 'noreferrer']);
  const tokens = new Set(
    (attributes.rel || '').toLowerCase().split(/\s+/).filter((token) => allowed.has(token)),
  );
  if (target) {
    tokens.add('noopener');
    tokens.add('noreferrer');
  }
  return { target, rel: [...tokens].join(' ') || null };
}
