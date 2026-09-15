import { db } from '@/lib/db';

const WINDOW_MS = 15 * 60 * 1000;
const BLOCK_MS = 15 * 60 * 1000;
const IP_MAX_ATTEMPTS = 5;
const GLOBAL_MAX_ATTEMPTS = 50;
const GLOBAL_KEY = 'global';

interface LoginRateLimitResult {
  limited: boolean;
  retryAfterSeconds: number;
}

function getClientAddress(requestHeaders: Headers): string {
  const forwardedFor = requestHeaders.get('x-forwarded-for')
    ?.split(',')[0]
    ?.trim();

  return (
    requestHeaders.get('cf-connecting-ip')?.trim() ||
    requestHeaders.get('x-real-ip')?.trim() ||
    forwardedFor ||
    'unknown'
  );
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(value)
  );

  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('');
}

export async function createLoginRateLimitKey(
  requestHeaders: Headers
): Promise<string> {
  return `ip:${await sha256(getClientAddress(requestHeaders))}`;
}

function getRetryAfterSeconds(blockedUntil: Date | null, now: Date): number {
  if (!blockedUntil || blockedUntil <= now) return 0;
  return Math.max(1, Math.ceil((blockedUntil.getTime() - now.getTime()) / 1000));
}

async function getLimitState(key: string, now: Date): Promise<LoginRateLimitResult> {
  const state = await db.loginRateLimit.findUnique({ where: { key } });
  const retryAfterSeconds = getRetryAfterSeconds(state?.blockedUntil ?? null, now);

  return {
    limited: retryAfterSeconds > 0,
    retryAfterSeconds,
  };
}

export async function checkLoginRateLimit(
  clientKey: string
): Promise<LoginRateLimitResult> {
  const now = new Date();
  const [clientState, globalState] = await Promise.all([
    getLimitState(clientKey, now),
    getLimitState(GLOBAL_KEY, now),
  ]);

  return clientState.retryAfterSeconds >= globalState.retryAfterSeconds
    ? clientState
    : globalState;
}

async function recordFailureForKey(
  key: string,
  maxAttempts: number,
  now: Date
): Promise<void> {
  const windowCutoff = new Date(now.getTime() - WINDOW_MS);
  const blockedUntil = new Date(now.getTime() + BLOCK_MS);

  await db.$executeRaw`
    INSERT INTO \`LoginRateLimit\`
      (\`key\`, \`attempts\`, \`windowStartedAt\`, \`blockedUntil\`, \`updatedAt\`)
    VALUES
      (${key}, 1, ${now}, NULL, ${now})
    ON DUPLICATE KEY UPDATE
      \`blockedUntil\` = CASE
        WHEN \`windowStartedAt\` <= ${windowCutoff} THEN NULL
        WHEN \`attempts\` + 1 >= ${maxAttempts} THEN ${blockedUntil}
        ELSE \`blockedUntil\`
      END,
      \`attempts\` = CASE
        WHEN \`windowStartedAt\` <= ${windowCutoff} THEN 1
        ELSE \`attempts\` + 1
      END,
      \`windowStartedAt\` = CASE
        WHEN \`windowStartedAt\` <= ${windowCutoff} THEN ${now}
        ELSE \`windowStartedAt\`
      END,
      \`updatedAt\` = ${now}
  `;
}

export async function recordFailedLogin(
  clientKey: string
): Promise<LoginRateLimitResult> {
  const now = new Date();

  await Promise.all([
    recordFailureForKey(clientKey, IP_MAX_ATTEMPTS, now),
    recordFailureForKey(GLOBAL_KEY, GLOBAL_MAX_ATTEMPTS, now),
  ]);

  return checkLoginRateLimit(clientKey);
}

export async function clearClientLoginFailures(clientKey: string): Promise<void> {
  await db.loginRateLimit.deleteMany({ where: { key: clientKey } });
}
