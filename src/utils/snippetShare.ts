import { MAX_INPUT_LENGTH } from "@/contexts/workspaceStore";
import { downloadAsFile } from "@/utils/download";
import type { PerToolState } from "@/types/workspace";
import type { SnippetPayload } from "@/types/snippet";

/** Max total share-URL length; beyond this, the link is not offered (use Download snippet instead). */
export const MAX_SHARE_URL_LENGTH = 2048;

/** Production web app where the /open route lives; used when sharing from the desktop app (no web origin). */
const PRODUCTION_WEB_URL = "https://stdout-tools.web.app";

/**
 * Base URL (origin + base path, trailing slash) of the web app hosting the /open route.
 * In a browser, derives from the current origin so links point to wherever the app is served
 * (local, preview, prod). In Electron (file://app://), falls back to the production web URL.
 */
function webBaseUrl(): string {
  if (typeof window !== "undefined" && /^https?:$/.test(window.location.protocol)) {
    const base = import.meta.env.BASE_URL || "/";
    return window.location.origin + (base.endsWith("/") ? base : `${base}/`);
  }
  return `${PRODUCTION_WEB_URL}/`;
}

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
 * URL-safe snippet param for embedding in a share URL. Percent-encodes the base64 so chars
 * like '+' survive the round-trip (URLSearchParams/new URL decode '+' to a space otherwise);
 * readers (OpenRoutePage, parseDeepLinkUrl) decode it back to plain base64.
 */
function encodeSnippetParam(toolId: string, state: PerToolState): string {
  const payload = createSnippetPayload(toolId, state);
  return encodeURIComponent(base64EncodeUnicode(JSON.stringify(payload)));
}

/**
 * Web share link (https://…/open?snippet=…) that opens the online tool in any browser.
 * Returns null if the full URL would exceed MAX_SHARE_URL_LENGTH (use Download snippet instead).
 */
export function getWebShareUrl(toolId: string, state: PerToolState): string | null {
  const url = `${webBaseUrl()}open?snippet=${encodeSnippetParam(toolId, state)}`;
  return url.length > MAX_SHARE_URL_LENGTH ? null : url;
}

/**
 * App deep-link (stdout://toolId?snippet=…) that opens the installed desktop app.
 * Returns null if the full URL would exceed MAX_SHARE_URL_LENGTH (use Download snippet instead).
 */
export function getAppShareUrl(toolId: string, state: PerToolState): string | null {
  const url = `stdout://${toolId}?snippet=${encodeSnippetParam(toolId, state)}`;
  return url.length > MAX_SHARE_URL_LENGTH ? null : url;
}

/**
 * Downloads the snippet as a .stdout.json file.
 */
export function downloadSnippetFile(toolId: string, state: PerToolState): void {
  const payload = createSnippetPayload(toolId, state);
  const content = JSON.stringify(payload, null, 2);
  downloadAsFile(content, `snippet-${toolId}.stdout.json`, "application/json");
}
