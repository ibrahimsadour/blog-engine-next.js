export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_UPLOAD_REQUEST_BYTES = 6 * 1024 * 1024;

export interface ValidatedImageType {
  extension: 'jpg' | 'png' | 'webp';
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
}

const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);

function startsWith(bytes: Uint8Array, signature: number[]): boolean {
  return signature.every((byte, index) => bytes[index] === byte);
}

export function detectImageType(bytes: Uint8Array): ValidatedImageType | null {
  if (bytes.length >= 3 && startsWith(bytes, [0xff, 0xd8, 0xff])) {
    return { extension: 'jpg', mimeType: 'image/jpeg' };
  }

  if (
    bytes.length >= 8 &&
    startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  ) {
    return { extension: 'png', mimeType: 'image/png' };
  }

  if (
    bytes.length >= 12 &&
    startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return { extension: 'webp', mimeType: 'image/webp' };
  }

  return null;
}

function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.');
  return lastDot >= 0 ? fileName.slice(lastDot).toLowerCase() : '';
}

export function validateImageUpload(
  fileName: string,
  claimedMimeType: string,
  bytes: Uint8Array
): ValidatedImageType | null {
  const extension = getFileExtension(fileName);
  if (!allowedExtensions.has(extension)) return null;

  const detectedType = detectImageType(bytes);
  if (!detectedType || detectedType.mimeType !== claimedMimeType) return null;

  const extensionMatches =
    extension === `.${detectedType.extension}` ||
    (detectedType.extension === 'jpg' && extension === '.jpeg');

  return extensionMatches ? detectedType : null;
}
