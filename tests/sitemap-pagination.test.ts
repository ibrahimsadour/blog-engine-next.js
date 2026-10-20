import test from 'node:test';
import assert from 'node:assert/strict';
import { pageCount, sitemapPage, sitemapSlice, SITEMAP_PAGE_SIZE } from '../lib/sitemap-pagination';

test('sitemaps split at safe URL boundaries without losing entries', () => {
  const records = Array.from({length:SITEMAP_PAGE_SIZE+1},(_,i)=>i);
  assert.equal(pageCount(records.length), 2);
  assert.deepEqual(sitemapSlice(records, 1), records.slice(0,SITEMAP_PAGE_SIZE));
  assert.deepEqual(sitemapSlice(records, 2), [SITEMAP_PAGE_SIZE]);
  assert.equal(pageCount(0), 1);
});
test('invalid sitemap page requests are rejected', () => {
  assert.equal(sitemapPage(null),1);
  assert.equal(sitemapPage('1'),1);
  for(const item of ['0','-1','1.2','x','Infinity','9007199254740992']) {
    assert.equal(sitemapPage(item),null);
  }
});
