import { MAX_INPUT_LENGTH } from "@/contexts/workspaceStore";

/**
 * Parses a stdout:// deep link URL.
 * @returns { toolId, params } or null if invalid
 */
export function parseDeepLinkUrl(
  url: string
): { toolId: string; params: Record<string, string> } | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "stdout:") return null;
    const hostname = parsed.hostname?.trim() || parsed.host?.trim();
    if (!hostname) return null;
    const params: Record<string, string> = {};
    parsed.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return { toolId: hostname, params };
  } catch {
    return null;
  }
}

/**
 * Extracts and normalizes input from deep link params (input or token).
 * Decodes, trims, and caps length to MAX_INPUT_LENGTH.
 */
export function getDeepLinkInput(params: Record<string, string>): string {
  const raw = params.input ?? params.token ?? "";
  if (typeof raw !== "string") return "";
  try {
    const decoded = decodeURIComponent(raw).trim();
    return decoded.slice(0, MAX_INPUT_LENGTH);
  } catch {
    return raw.slice(0, MAX_INPUT_LENGTH);
  }
}
