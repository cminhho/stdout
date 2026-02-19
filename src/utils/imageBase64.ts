/**
 * Image ↔ Base64 helpers and constants. File reading use readFileAsDataURL from @/utils/fileUpload.
 */

export const IMAGE_BASE64_ACCEPT = "image/*";
export const IMAGE_BASE64_DOWNLOAD_FILENAME = "image.png";
export const IMAGE_BASE64_PLACEHOLDER_INPUT = "Paste Base64 string here...";
export const IMAGE_BASE64_PLACEHOLDER_OUTPUT = "Base64 string will appear here...";
export const IMAGE_BASE64_PREVIEW_PLACEHOLDER = "Image preview...";

/** Normalize base64 string to a data URL for preview/download. */
export function base64ToDataUrl(input: string): string {
  if (!input.trim()) return "";
  try {
    return input.startsWith("data:") ? input : `data:image/png;base64,${input}`;
  } catch {
    return "";
  }
}

/** Format file size for display (e.g. "12.5 KB"). */
export function formatFileSizeKb(bytes: number): string {
  return (bytes / 1024).toFixed(1) + " KB";
}
