/**
 * App version and "check for updates" (VS Code/Linear/Notion style).
 * Current version is injected at build time (__APP_VERSION__). Latest is fetched from GitHub releases.
 */

const GITHUB_REPO = "cminhho/stdout";
const GITHUB_API_LATEST = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;

export function getCurrentVersion(): string {
  return typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "1.0.0";
}

/** Parse "1.0.0" or "v1.0.0" into [major, minor, patch]. */
function parseVersion(s: string): [number, number, number] {
  const v = s.replace(/^v/, "").trim();
  const parts = v.split(".").map((n) => parseInt(n, 10) || 0);
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
}

/**
 * Compare two version strings. Returns &lt; 0 if a &lt; b, 0 if equal, &gt; 0 if a &gt; b.
 */
export function compareVersions(a: string, b: string): number {
  const [ma, mi, pa] = parseVersion(a);
  const [mb, mj, pb] = parseVersion(b);
  if (ma !== mb) return ma - mb;
  if (mi !== mj) return mi - mj;
  return pa - pb;
}

export interface LatestRelease {
  version: string;
  url: string;
  tagName: string;
  body: string | null;
}

/**
 * Fetch latest release from GitHub. Returns null on error or if no releases.
 */
export async function fetchLatestRelease(): Promise<LatestRelease | null> {
  try {
    const res = await fetch(GITHUB_API_LATEST, {
      headers: { Accept: "application/vnd.github.v3+json" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      tag_name?: string;
      html_url?: string;
      body?: string | null;
    };
    const tagName = data.tag_name?.trim();
    const url = data.html_url ?? `https://github.com/${GITHUB_REPO}/releases`;
    if (!tagName) return null;
    const version = tagName.replace(/^v/, "");
    return { version, url, tagName, body: data.body ?? null };
  } catch {
    return null;
  }
}

/**
 * Returns true if there is a newer version than current.
 */
export function isNewerVersion(latest: string, current: string): boolean {
  return compareVersions(latest, current) > 0;
}
