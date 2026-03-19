export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

/** Returns an error message string, or null if valid. */
export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Invalid file type. Please upload JPG, PNG, or WEBP.';
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return 'File too large. Maximum size is 5MB.';
  }
  return null;
}
