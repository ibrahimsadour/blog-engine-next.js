import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('page sitemap suppresses duplicate directory landing slugs', () => {
  const code = readFileSync('app/(sitemap)/page-sitemap.xml/route.ts', 'utf8');
  assert.match(code, /reserved\.add\('cities'\)/);
  assert.match(code, /reserved\.add\('cars'\)/);
  assert.match(code, /\$\{uniquePages/);
});

test('directory sitemap never overrides built-in /cities and /cars routes', () => {
  const code = readFileSync('app/(sitemap)/directory-sitemap.xml/route.ts', 'utf8');
  assert.equal((code.match(/\['cities', 'cars'\]/g) || []).length, 2);
});
