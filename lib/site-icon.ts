const DEFAULT_SITE_ICON = '/favicon-default.ico';
const ICON_ORIGIN = 'https://site-icon.invalid';

/** Build a cache-busted icon URL without changing query parameters or fragments. */
export function getSiteIconUrl(siteIcon: string, version: string): string {
  const value = siteIcon.trim();
  let url: URL;
  try {
    if (value.startsWith('/') && !value.startsWith('//')) {
      url = new URL(value, ICON_ORIGIN);
    } else {
      url = new URL(value);
      if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Invalid icon URL');
    }
    // A saved /favicon.ico must not redirect back to this compatibility route.
    if (url.pathname === '/favicon.ico') throw new Error('Recursive icon URL');
  } catch {
    url = new URL(DEFAULT_SITE_ICON, ICON_ORIGIN);
  }
  url.searchParams.set('v', version || '1');
  return url.origin === ICON_ORIGIN ? url.pathname + url.search + url.hash : url.href;
}
