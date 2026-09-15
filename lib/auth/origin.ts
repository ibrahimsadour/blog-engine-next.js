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

function firstHeaderValue(value: string | null): string | null {
  return value?.split(',')[0]?.trim() || null;
}

function getRequestHostOrigin(requestHeaders: Headers): string | null {
  const host =
    firstHeaderValue(requestHeaders.get('x-forwarded-host')) ||
    firstHeaderValue(requestHeaders.get('host'));
  if (!host) return null;

  const protocol =
    firstHeaderValue(requestHeaders.get('x-forwarded-proto')) ||
    (process.env.NODE_ENV === 'production' ? 'https' : 'http');

  return normalizeOrigin(`${protocol}://${host}`);
}

function getAllowedOrigins(requestHeaders: Headers): Set<string> {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    getRequestHostOrigin(requestHeaders),
    ...(process.env.ADMIN_ALLOWED_ORIGINS || '').split(','),
  ];

  return new Set(
    candidates
      .map((candidate) => normalizeOrigin(candidate))
      .filter((candidate): candidate is string => Boolean(candidate))
  );
}

export function isTrustedRequestOrigin(requestHeaders: Headers): boolean {
  const requestOrigin = normalizeOrigin(requestHeaders.get('origin'));
  if (!requestOrigin) return false;

  return getAllowedOrigins(requestHeaders).has(requestOrigin);
}

export function assertTrustedRequestOrigin(requestHeaders: Headers): void {
  if (!isTrustedRequestOrigin(requestHeaders)) {
    throw new Error('Untrusted request origin');
  }
}
