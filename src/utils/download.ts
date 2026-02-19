/**
 * Trigger browser download of a string or Blob. Use with SaveButton for consistent save-as-file behavior.
 */
export function downloadAsFile(
  content: string | Blob,
  filename: string,
  mimeType?: string
): void {
  const blob =
    typeof content === "string"
      ? new Blob([content], { type: mimeType ?? "application/octet-stream" })
      : content;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
