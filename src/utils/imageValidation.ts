export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

export function isValidImageFile(file: File): boolean {
  if (!file) return false;
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return false;
  if (file.size > MAX_IMAGE_BYTES) return false;
  return true;
}


