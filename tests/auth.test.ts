import assert from 'node:assert/strict';
import test from 'node:test';
import { verifyAdminPassword } from '../lib/auth/password';
import { createAdminSessionToken, verifyAdminSessionToken } from '../lib/auth/session';
import { isTrustedRequestOrigin } from '../lib/auth/origin';
import { getAdminApiAuthorizationStatus } from '../lib/auth/authorization';

test('creates signed admin sessions and rejects tampering', async () => {
  process.env.SESSION_SECRET = 'test-secret-with-at-least-thirty-two-characters';
  const token = await createAdminSessionToken();
  assert.equal(await verifyAdminSessionToken(token), true);
  assert.equal(await verifyAdminSessionToken(`${token.slice(0, -1)}x`), false);
  assert.equal(await verifyAdminSessionToken('invalid'), false);
});

test('compares the configured admin password safely', () => {
  assert.equal(verifyAdminPassword('correct', 'correct'), true);
  assert.equal(verifyAdminPassword('wrong', 'correct'), false);
  assert.equal(verifyAdminPassword('anything', undefined), false);
});

test('accepts trusted origins and rejects CSRF origins', () => {
  process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';
  assert.equal(isTrustedRequestOrigin(new Headers({ origin: 'https://example.com' })), true);
  assert.equal(isTrustedRequestOrigin(new Headers({ origin: 'https://evil.example' })), false);
});

test('API authorization distinguishes unauthenticated and untrusted requests', () => {
  process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';
  const trusted = new Headers({ origin: 'https://example.com' });
  const untrusted = new Headers({ origin: 'https://evil.example' });
  assert.equal(getAdminApiAuthorizationStatus(false, trusted), 401);
  assert.equal(getAdminApiAuthorizationStatus(true, untrusted), 403);
  assert.equal(getAdminApiAuthorizationStatus(true, trusted), 200);
});
