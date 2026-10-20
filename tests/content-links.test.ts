import assert from 'node:assert/strict';
import test from 'node:test';
import StarterKit from '@tiptap/starter-kit';
import { renderToHTMLString } from '@tiptap/static-renderer/pm/html-string';
import { contentLinkAttributes, isInternalContentLink } from '../lib/content-links';
import { ContentLink } from '../lib/editor-content-link';
import { sanitizeContentHtml } from '../lib/security/content';

test('internal classification handles relative URLs and canonical/www aliases only', () => {
  const site = 'https://carstopkuwait.com';
  for (const href of ['/service', './service', '../service', '#part', '?page=2',
    'https://carstopkuwait.com/service', 'https://www.carstopkuwait.com/service',
    'http://carstopkuwait.com/service']) {
    assert.equal(isInternalContentLink(href, site), true, href);
    assert.deepEqual(contentLinkAttributes({ href, target: '_blank', rel: 'nofollow' }, site),
      { target: null, rel: null });
  }
  for (const href of ['https://carstopkuwait.com.evil.test/service',
    'https://carstopkuwait.com@evil.test', 'https://cdn.carstopkuwait.com/service',
    'https://carstopkuwait.com:444/service', '//evil.test/service',
    'mailto:info@carstopkuwait.com', 'tel:+96512345678', 'javascript:alert(1)', '']) {
    assert.equal(isInternalContentLink(href, site), false, href);
  }
});

test('external links default to follow and same tab; explicit options can be cleared', () => {
  const href = 'https://external.example.test';
  assert.deepEqual(contentLinkAttributes({ href }, 'https://carstopkuwait.com'),
    { target: null, rel: null });
  assert.deepEqual(contentLinkAttributes({ href, target: null, rel: null }, 'https://carstopkuwait.com'),
    { target: null, rel: null });
  assert.deepEqual(contentLinkAttributes({ href, rel: 'nofollow' }, 'https://carstopkuwait.com'),
    { target: null, rel: 'nofollow' });
  assert.deepEqual(contentLinkAttributes({ href, target: '_blank', rel: 'nofollow' }, 'https://carstopkuwait.com'),
    { target: '_blank', rel: 'nofollow noopener noreferrer' });
});

test('external rel tokens are whitelisted, normalized and deduplicated', () => {
  assert.deepEqual(contentLinkAttributes({
    href: 'https://external.example.test', target: 'named-window',
    rel: 'NOFOLLOW nofollow sponsored ugc opener arbitrary',
  }, 'https://carstopkuwait.com'), { target: null, rel: 'nofollow sponsored ugc' });
});

function renderLink(attrs: Record<string, string | null>) {
  return renderToHTMLString({
    extensions: [StarterKit.configure({ link: false }), ContentLink],
    content: {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{
        type: 'text', text: 'service', marks: [{ type: 'link', attrs }],
      }] }],
    },
  });
}

test('editor serialization and sanitization fix legacy internal links without a database rewrite', (t) => {
  const previous = process.env.NEXT_PUBLIC_SITE_URL;
  process.env.NEXT_PUBLIC_SITE_URL = 'https://carstopkuwait.com';
  t.after(() => {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = previous;
  });
  for (const href of ['/service', 'https://carstopkuwait.com/service', 'https://www.carstopkuwait.com/service']) {
    const legacy = { href, target: '_blank', rel: 'nofollow noopener noreferrer' };
    const rendered = renderLink(legacy);
    assert.doesNotMatch(rendered, /target=|rel=|dofollow/);
    const oldHtml = '<p><a href="' + href + '" target="_blank" rel="nofollow">service</a></p>';
    const clean = sanitizeContentHtml(oldHtml);
    assert.match(clean, /href=/);
    assert.doesNotMatch(clean, /target=|rel=/);
    assert.equal(sanitizeContentHtml(clean), clean);
  }
});

test('editor and sanitizer retain explicit external nofollow in either tab mode', () => {
  const href = 'https://external.example.test/service';
  for (const target of [null, '_blank']) {
    const html = renderLink({ href, target, rel: 'nofollow' });
    assert.match(html, /nofollow/);
    const clean = sanitizeContentHtml(html);
    assert.match(clean, /nofollow/);
    if (target) {
      assert.match(clean, /target="_blank"/);
      assert.match(clean, /noopener/);
      assert.match(clean, /noreferrer/);
    } else {
      assert.doesNotMatch(clean, /target=/);
    }
  }
  const defaults = sanitizeContentHtml(renderLink({ href }));
  assert.doesNotMatch(defaults, /target=|rel=/);
});

test('custom editor renderer retains parent protection against unsafe protocols', () => {
  const html = sanitizeContentHtml(renderLink({ href: 'javascript:alert(1)' }));
  assert.doesNotMatch(html, /javascript:|alert\(/i);
});
