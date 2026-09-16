function normalizeOrigin(value: string | null | undefined): string | null {
  if (!value) return null;

  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    if (url.username || url.password) return null;
    return url.origin;
  } catch {
    return null;
  }
}

function getAllowedRedirectOrigins(currentOrigin?: string): Set<string> {
  const candidates = [
    currentOrigin,
    process.env.NEXT_PUBLIC_SITE_URL,
    ...(process.env.REDIRECT_ALLOWED_ORIGINS || '').split(','),
  ];

  return new Set(
    candidates
      .map((candidate) => normalizeOrigin(candidate))
      .filter((candidate): candidate is string => Boolean(candidate))
  );
}

export function normalizeInternalRedirectPath(value: string): string | null {
  const path = value.trim();

  if (
    !path.startsWith('/') ||
    path.startsWith('//') ||
    path.includes('\\') ||
    /[\r\n\0]/.test(path)
  ) {
    return null;
  }

  return path;
}

export function getSafeRedirectTarget(
  value: string,
  currentOrigin?: string
): string | null {
  const target = value.trim();
  if (!target || /[\r\n\0]/.test(target) || target.includes('\\')) return null;

  const internalPath = normalizeInternalRedirectPath(target);
  if (internalPath) return internalPath;

  try {
    const url = new URL(target);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    if (url.username || url.password) return null;

    const allowedOrigins = getAllowedRedirectOrigins(currentOrigin);
    if (!allowedOrigins.has(url.origin)) return null;

    const current = normalizeOrigin(currentOrigin);
    const configuredSite = normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL);
    if (url.origin === current || url.origin === configuredSite) {
      return `${url.pathname}${url.search}${url.hash}`;
    }

    return url.toString();
  } catch {
    return null;
  }
}
