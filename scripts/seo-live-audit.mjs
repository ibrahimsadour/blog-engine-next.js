#!/usr/bin/env node
/**
 * Crawl the server response of two dynamic service pages.
 * Usage: node scripts/seo-live-audit.mjs https://example.com /toyota/service /city/service
 * For deployment verification, use the canonical public origin, not localhost.
 */
const [origin, ...paths] = process.argv.slice(2);
if (!origin || paths.length === 0) {
  console.error('Usage: node scripts/seo-live-audit.mjs https://example.com /car/service /city/service');
  process.exit(2);
}
const errors = [];
for (const path of paths) {
  const url = new URL(path, origin);
  if (url.origin !== new URL(origin).origin) {
    console.error('Off-site URL rejected:', path);
    process.exitCode = 1;
    continue;
  }
  try {
    const response = await fetch(url, { redirect: 'follow', headers: { 'User-Agent': 'SEO-Audit/1.0' } });
    const html = await response.text();
    const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '';
    const h1 = html.match(/<h1(?:\s[^>]*)?>([\s\S]*?)<\/h1>/i)?.[1] ?? '';
    const canonical = html.match(/<link(?=[^>]*\brel=["']canonical["'])[^>]*\bhref=["']([^"']+)/i)?.[1];
    const scripts = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
    const types = new Set();
    let jsonErrors = 0;
    for (const [, jsonText] of scripts) {
      try {
        const parsed = JSON.parse(jsonText);
        for (const obj of parsed['@graph'] ?? [parsed]) if (obj['@type']) types.add(obj['@type']);
      } catch { jsonErrors++; }
    }
    const checks = {
      'HTTP 200': response.status === 200,
      title: Boolean(title.trim()),
      H1: Boolean(h1.trim()),
      'canonical self': canonical === url.href,
      'valid JSON-LD': scripts.length > 0 && jsonErrors === 0,
      Service: types.has('Service'),
      WebPage: types.has('WebPage'),
      BreadcrumbList: types.has('BreadcrumbList'),
      'no noindex': !/<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html),
    };
    const problems = Object.entries(checks).filter(([, pass]) => !pass).map(([key]) => key);
    if (problems.length) errors.push({ url: url.href, problems });
    console.log(JSON.stringify({ url: url.href, status: response.status, bytes: Buffer.byteLength(html), checks }, null, 2));
  } catch (error) {
    errors.push({ url: url.href, problems: [String(error)] });
    console.error(url.href, error);
  }
}
if (errors.length) {
  console.error('SEO smoke audit failures:', JSON.stringify(errors, null, 2));
  process.exitCode = 1;
}
