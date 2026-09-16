const encoder = new TextEncoder();

export const ADMIN_SESSION_COOKIE = 'admin_session';
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export const adminSessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: ADMIN_SESSION_MAX_AGE,
  priority: 'high',
} as const;

interface AdminSessionPayload {
  version: 1;
  role: 'admin';
  issuedAt: number;
  expiresAt: number;
  nonce: string;
}

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET must contain at least 32 characters');
  }

  return secret;
}

function encodeBase64Url(value: string | Uint8Array): string {
  const bytes = typeof value === 'string' ? encoder.encode(value) : value;
  let binary = '';

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function decodeBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index++) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

async function getSigningKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(getSessionSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

function createNonce(): string {
  return encodeBase64Url(crypto.getRandomValues(new Uint8Array(16)));
}

export async function createAdminSessionToken(): Promise<string> {
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload: AdminSessionPayload = {
    version: 1,
    role: 'admin',
    issuedAt,
    expiresAt: issuedAt + ADMIN_SESSION_MAX_AGE,
    nonce: createNonce(),
  };

  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = await crypto.subtle.sign(
    'HMAC',
    await getSigningKey(),
    encoder.encode(encodedPayload)
  );

  return `${encodedPayload}.${encodeBase64Url(new Uint8Array(signature))}`;
}

export async function verifyAdminSessionToken(
  token: string | undefined
): Promise<boolean> {
  if (!token) return false;

  const parts = token.split('.');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return false;

  try {
    const [encodedPayload, encodedSignature] = parts;
    const isValidSignature = await crypto.subtle.verify(
      'HMAC',
      await getSigningKey(),
      decodeBase64Url(encodedSignature),
      encoder.encode(encodedPayload)
    );

    if (!isValidSignature) return false;

    const payload = JSON.parse(
      new TextDecoder().decode(decodeBase64Url(encodedPayload))
    ) as Partial<AdminSessionPayload>;
    const now = Math.floor(Date.now() / 1000);

    return (
      payload.version === 1 &&
      payload.role === 'admin' &&
      typeof payload.issuedAt === 'number' &&
      typeof payload.expiresAt === 'number' &&
      typeof payload.nonce === 'string' &&
      payload.nonce.length >= 16 &&
      payload.issuedAt <= now + 60 &&
      payload.expiresAt > now &&
      payload.expiresAt - payload.issuedAt === ADMIN_SESSION_MAX_AGE
    );
  } catch {
    return false;
  }
}
