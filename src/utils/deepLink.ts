import { MAX_INPUT_LENGTH } from "@/contexts/workspaceStore";
import type { PerToolState } from "@/types/workspace";
import type { SnippetPayload } from "@/types/snippet";

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

function isValidPerToolValue(v: unknown): v is PerToolState {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  if (o.input !== undefined && typeof o.input !== "string") return false;
  if (o.scrollPosition !== undefined && typeof o.scrollPosition !== "number") return false;
  if (o.splitPercent !== undefined && typeof o.splitPercent !== "number") return false;
  return true;
}

function sanitizeSnippetState(raw: unknown): PerToolState | null {
  if (!isValidPerToolValue(raw)) return null;
  const out: PerToolState = {};
  if (typeof raw.input === "string") out.input = raw.input.slice(0, MAX_INPUT_LENGTH);
  if (typeof raw.scrollPosition === "number") out.scrollPosition = raw.scrollPosition;
  if (typeof raw.splitPercent === "number") out.splitPercent = raw.splitPercent;
  return out;
}

/** UTF-8-safe base64 decode for snippet param (browser). */
function base64DecodeUnicode(str: string): string {
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch {
    return "";
  }
}

/**
 * Parses and validates snippet from deep link params (e.g. ?snippet=base64...).
 * Returns sanitized SnippetPayload or null on parse/validation failure.
 */
export function getDeepLinkSnippet(params: Record<string, string>): SnippetPayload | null {
  const encoded = params.snippet?.trim();
  if (!encoded) return null;
  let json: string;
  try {
    json = base64DecodeUnicode(encoded);
  } catch {
    return null;
  }
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    return null;
  }
  if (typeof raw !== "object" || raw === null) return null;
  const o = raw as Record<string, unknown>;
  const toolId = typeof o.toolId === "string" ? o.toolId.trim() : "";
  if (!toolId) return null;
  const state = sanitizeSnippetState(o.state);
  if (state === null) return null;
  const id = typeof o.id === "string" ? o.id : crypto.randomUUID();
  const createdAt = typeof o.createdAt === "number" ? o.createdAt : Date.now();
  return { id, toolId, state, createdAt };
}
