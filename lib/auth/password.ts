import { createHash, timingSafeEqual } from 'node:crypto';

const MAX_PASSWORD_LENGTH = 4096;

function hashSecret(value: string): Buffer {
  return createHash('sha256').update(value, 'utf8').digest();
}

export function verifyAdminPassword(
  providedPassword: unknown,
  configuredPassword: string | undefined
): boolean {
  const provided = typeof providedPassword === 'string' ? providedPassword : '';
  const configured = configuredPassword ?? '';

  if (
    provided.length > MAX_PASSWORD_LENGTH ||
    configured.length > MAX_PASSWORD_LENGTH
  ) {
    return false;
  }

  const passwordsMatch = timingSafeEqual(
    hashSecret(provided),
    hashSecret(configured)
  );

  return Boolean(configuredPassword) && passwordsMatch;
}
