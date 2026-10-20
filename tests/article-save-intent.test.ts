import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveArticlePublicationIntent } from '../lib/article-save-intent';

test('saving a draft overrides the selected published state', () => {
  assert.equal(resolveArticlePublicationIntent(true, 'draft'), false);
  assert.equal(resolveArticlePublicationIntent(false, 'draft'), false);
});

test('publishing overrides the selected draft state', () => {
  assert.equal(resolveArticlePublicationIntent(false, 'publish'), true);
});

test('keyboard and unrecognized submissions preserve the selected status', () => {
  for (const status of [true, false]) {
    assert.equal(resolveArticlePublicationIntent(status), status);
    assert.equal(resolveArticlePublicationIntent(status, 'unknown'), status);
  }
});
