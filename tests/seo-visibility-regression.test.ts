import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('metadata and HTML resolve the same entity for colliding city and car slugs', () => {
 const file=readFileSync('app/[slug]/[service]/page.tsx','utf8');
 assert.match(file,/const \[customContent, template\] = car && !city/);
 assert.match(file,/const isCar = Boolean\(car && !city\)/);
});
test('sitemap index advertises every dynamic shard', () => {
 const file=readFileSync('app/(sitemap)/sitemap.xml/route.ts','utf8');
 assert.match(file,/shards\('city-service-sitemap.xml'/);
 assert.match(file,/shards\('car-service-sitemap.xml'/);
 assert.match(file,/shards\('post-sitemap.xml'/);
});
test('custom robots preserves a sitemap entry', () => {
 const file=readFileSync('app/robots.ts','utf8');
 assert.match(file,/sitemap: customSitemap \|\|/);
});
