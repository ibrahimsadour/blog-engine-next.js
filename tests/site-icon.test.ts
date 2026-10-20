import assert from 'node:assert/strict';
import test from 'node:test';
import { getSiteIconUrl } from '../lib/site-icon';

test('uploaded icons change URL on replacement and each saved version', () => {
  assert.equal(getSiteIconUrl('/api/media/first.webp', '10'), '/api/media/first.webp?v=10');
  assert.equal(getSiteIconUrl('/api/media/second.png', '11'), '/api/media/second.png?v=11');
  assert.notEqual(getSiteIconUrl('/api/media/second.png', '11'), getSiteIconUrl('/api/media/second.png', '12'));
});

test('external icon versions preserve queries and fragments and replace old versions', () => {
  const url = new URL(getSiteIconUrl('https://cdn.example/icon.png?size=512&v=old#icon', '20'));
  assert.equal(url.searchParams.get('size'), '512');
  assert.deepEqual(url.searchParams.getAll('v'), ['20']);
  assert.equal(url.hash, '#icon');
  assert.equal(getSiteIconUrl('/api/media/icon.png#image', '21'), '/api/media/icon.png?v=21#image');
});

test('removing an icon restores a versioned default', () => {
  assert.equal(getSiteIconUrl('', '30'), '/favicon-default.ico?v=30');
  assert.equal(getSiteIconUrl('   ', ''), '/favicon-default.ico?v=1');
});

test('invalid sources and conventional favicon URLs cannot cause unsafe or recursive redirects', () => {
  for (const value of ['javascript:alert(1)', '//other.example/icon.png', 'http://cdn.example/icon.png', 'https://user:pass@example.com/icon.png', '/favicon.ico?v=old', 'https://example.com/favicon.ico']) {
    assert.equal(getSiteIconUrl(value, '40'), '/favicon-default.ico?v=40');
  }
});
