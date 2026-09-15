import assert from 'node:assert/strict';
import test from 'node:test';
import {
  sanitizeContentHtml,
  sanitizeCustomHeadCode,
  serializeJsonLd,
} from '../lib/security/content';

test('rich HTML removes scripts, event handlers, and dangerous protocols', () => {
  const result = sanitizeContentHtml(`
    <h2 id="safe">عنوان</h2>
    <script>alert(1)</script>
    <a href="javascript:alert(1)" onclick="alert(2)">سيئ</a>
    <a href="https://example.com" target="_blank">آمن</a>
    <img src="data:image/svg+xml,bad" onerror="alert(3)">
  `);

  assert.doesNotMatch(result, /script|javascript:|onclick|onerror|data:/i);
  assert.match(result, /<h2 id="safe">عنوان<\/h2>/);
  assert.match(result, /href="https:\/\/example\.com"/);
  assert.match(result, /rel="noopener noreferrer"/);
});

test('rich HTML blocks unencrypted external images but keeps local and HTTPS images', () => {
  const result = sanitizeContentHtml(`
    <img src="http://evil.example/a.jpg">
    <img src="/uploads/local.jpg">
    <img src="https://cdn.example/a.jpg">
  `);

  assert.doesNotMatch(result, /http:\/\/evil\.example/);
  assert.match(result, /src="\/uploads\/local\.jpg"/);
  assert.match(result, /src="https:\/\/cdn\.example\/a\.jpg"/);
});

test('custom head accepts constrained trusted HTTPS resources only', () => {
  const result = sanitizeCustomHeadCode(`
    <meta name="verification" content="abc">
    <meta http-equiv="refresh" content="0;url=https://evil.example">
    <script>alert(1)</script>
    <script src="http://www.googletagmanager.com/a.js"></script>
    <script src="https://evil.example/a.js"></script>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-1"></script>
  `);

  assert.doesNotMatch(result, /alert|http-equiv|http:\/\/|evil\.example/i);
  assert.match(result, /https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-1/);
});

test('JSON-LD serialization cannot close its script element', () => {
  const attack = '</script><img src=x onerror=alert(1)>\u2028';
  const serialized = serializeJsonLd({ value: attack });

  assert.doesNotMatch(serialized, /</);
  assert.doesNotMatch(serialized, /\u2028/);
  assert.deepEqual(JSON.parse(serialized), { value: attack });
});
