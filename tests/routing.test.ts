import assert from 'node:assert/strict';
import test from 'node:test';
import { getSafeRedirectTarget, normalizeInternalRedirectPath } from '../lib/security/redirect';

test('redirects allow safe internal paths and reject open redirects', () => {
  assert.equal(normalizeInternalRedirectPath('/old-page'), '/old-page');
  assert.equal(getSafeRedirectTarget('/new-page?from=old', 'https://example.com'), '/new-page?from=old');
  assert.equal(getSafeRedirectTarget('https://evil.example/trap', 'https://example.com'), null);
  assert.equal(getSafeRedirectTarget('//evil.example/trap', 'https://example.com'), null);
  assert.equal(getSafeRedirectTarget('javascript:alert(1)', 'https://example.com'), null);
});

test('404 lookup paths reject malformed request paths', () => {
  assert.equal(normalizeInternalRedirectPath('missing'), null);
  assert.equal(normalizeInternalRedirectPath('/safe\\evil'), null);
  assert.equal(normalizeInternalRedirectPath('/safe\nlocation:/evil'), null);
});
