import { MAX_INPUT_LENGTH } from "@/contexts/workspaceStore";
import { downloadAsFile } from "@/utils/download";
import type { PerToolState } from "@/types/workspace";
import type { SnippetPayload } from "@/types/snippet";

/** Max length for the encoded snippet query string; beyond this, share URL is not offered. */
export const MAX_SNIPPET_URL_LENGTH = 2000;

function sanitizeState(state: PerToolState): PerToolState {
  const out: PerToolState = {};
  if (typeof state.input === "string") {
    out.input = state.input.slice(0, MAX_INPUT_LENGTH);
  }
  if (typeof state.scrollPosition === "number") {
    out.scrollPosition = state.scrollPosition;
  }
  if (typeof state.splitPercent === "number") {
    out.splitPercent = state.splitPercent;
  }
  return out;
}

/**
 * Builds a snippet payload with sanitized state (input capped at MAX_INPUT_LENGTH).
 */
export function createSnippetPayload(toolId: string, state: PerToolState): SnippetPayload {
  return {
    id: crypto.randomUUID(),
    toolId,
    state: sanitizeState(state),
    createdAt: Date.now(),
  };
}

/** UTF-8-safe base64 encode for JSON (browser). */
function base64EncodeUnicode(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}

/**
 * Returns stdout:// URL with snippet param, or null if encoded length would exceed MAX_SNIPPET_URL_LENGTH.
 */
export function getShareableUrl(toolId: string, state: PerToolState): string | null {
  const payload = createSnippetPayload(toolId, state);
  const json = JSON.stringify(payload);
  const encoded = base64EncodeUnicode(json);
  if (encoded.length > MAX_SNIPPET_URL_LENGTH) return null;
  return `stdout://${toolId}?snippet=${encoded}`;
}

/**
 * Downloads the snippet as a .stdout.json file.
 */
export function downloadSnippetFile(toolId: string, state: PerToolState): void {
  const payload = createSnippetPayload(toolId, state);
  const content = JSON.stringify(payload, null, 2);
  downloadAsFile(content, `snippet-${toolId}.stdout.json`, "application/json");
}
