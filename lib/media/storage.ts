import path from 'node:path';

export const MEDIA_URL_PREFIX = '/api/media/';
export const LEGACY_MEDIA_URL_PREFIX = '/uploads/';

const storedFileNamePattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpg|png|webp)$/i;
const legacyFileNamePattern = /^[a-zA-Z0-9\u0600-\u06FF-]+\.(jpg|jpeg|png|webp|gif)$/;

export function getUploadStorageDirectory(): string {
  const configuredPath = process.env.UPLOAD_STORAGE_DIR?.trim();
  return path.resolve(
    /* turbopackIgnore: true */
    configuredPath || path.join(process.cwd(), 'storage', 'uploads')
  );
}

export function getStoredFileNameFromUrl(url: string): string | null {
  if (!url.startsWith(MEDIA_URL_PREFIX)) return null;

  const fileName = url.slice(MEDIA_URL_PREFIX.length);
  return storedFileNamePattern.test(fileName) ? fileName : null;
}

export function getLegacyFileNameFromUrl(url: string): string | null {
  if (!url.startsWith(LEGACY_MEDIA_URL_PREFIX)) return null;

  const fileName = url.slice(LEGACY_MEDIA_URL_PREFIX.length);
  return legacyFileNamePattern.test(fileName) ? fileName : null;
}

export function isManagedImageUrl(url: string): boolean {
  return Boolean(
    getStoredFileNameFromUrl(url) || getLegacyFileNameFromUrl(url)
  );
}

export function getStoredFilePath(fileName: string): string {
  if (!storedFileNamePattern.test(fileName)) {
    throw new Error('Invalid stored media file name');
  }

  return path.join(
    /* turbopackIgnore: true */
    getUploadStorageDirectory(),
    fileName
  );
}

export function getLegacyFilePath(fileName: string): string {
  if (!legacyFileNamePattern.test(fileName)) {
    throw new Error('Invalid legacy media file name');
  }

  return path.join(process.cwd(), 'public', 'uploads', fileName);
}
