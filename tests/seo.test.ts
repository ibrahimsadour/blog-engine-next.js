import assert from 'node:assert/strict';
import test from 'node:test';
import { generateArticleSchema, generateBreadcrumbSchema } from '../lib/schema';
import { buildSiteUrl, encodeSlugSegment, escapeXml, latestDate, sitemapUrlEntry, trustedCanonicalUrl } from '../lib/site-url';

test('sitemap paths normalize and encode every slug segment', () => {
  assert.equal(encodeSlugSegment('  خدمة سيارات & سريعة  '), '%D8%AE%D8%AF%D9%85%D8%A9-%D8%B3%D9%8A%D8%A7%D8%B1%D8%A7%D8%AA-%D8%B3%D8%B1%D9%8A%D8%B9%D8%A9');
  assert.equal(buildSiteUrl('مدينة الكويت', 'فحص & صيانة'), 'https://autogarag.net/%D9%85%D8%AF%D9%8A%D9%86%D8%A9-%D8%A7%D9%84%D9%83%D9%88%D9%8A%D8%AA/%D9%81%D8%AD%D8%B5-%D8%B5%D9%8A%D8%A7%D9%86%D8%A9');
});

test('XML escaping covers URLs and text values', () => {
  assert.equal(escapeXml(`https://site.test/a?x=1&y=<tag>"'`), 'https://site.test/a?x=1&amp;y=&lt;tag&gt;&quot;&apos;');
});

test('canonical URLs remain on the configured site and drop query fragments', () => {
  assert.equal(trustedCanonicalUrl('https://evil.example/post', '/safe-post'), 'https://autogarag.net/safe-post');
  assert.equal(trustedCanonicalUrl('/safe-post?tracking=1#part', '/fallback'), 'https://autogarag.net/safe-post');
});

test('article schema uses publishedAt and one stable publisher organization', () => {
  const publishedAt = new Date('2026-01-02T03:04:05.000Z');
  const schema = generateArticleSchema({
    title: 'مقال',
    createdAt: new Date('2025-01-01T00:00:00.000Z'),
    publishedAt,
    updatedAt: new Date('2026-02-01T00:00:00.000Z'),
  }, 'https://autogarag.net/article');

  assert.equal(schema.datePublished, publishedAt.toISOString());
  assert.equal(schema.publisher['@type'], 'Organization');
  assert.equal(schema.publisher.logo.url, 'https://autogarag.net/logo.png');
  assert.equal(schema.image[0], 'https://autogarag.net/images/og-default.jpg');
});

test('breadcrumb schema rejects an external URL', () => {
  const schema = generateBreadcrumbSchema([{ name: 'صفحة', url: 'https://evil.example/trap' }]);
  assert.doesNotMatch(schema.itemListElement[1].item, /evil\.example/);
});

test('sitemap entries include escaped URLs and the correct last modification date', () => {
  const older = new Date('2026-01-01T00:00:00.000Z');
  const newer = new Date('2026-02-01T00:00:00.000Z');
  const lastModified = latestDate(older, newer);
  const xml = sitemapUrlEntry('https://example.com/a?x=1&y=2', lastModified, '0.8');
  assert.match(xml, /x=1&amp;y=2/);
  assert.match(xml, /2026-02-01T00:00:00.000Z/);
  assert.match(xml, /<priority>0.8<\/priority>/);
});
