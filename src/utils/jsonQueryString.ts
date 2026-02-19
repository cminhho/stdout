/**
 * JSON ↔ Query String converter. Single place for conversion logic and constants.
 */

export const JSON_QUERY_STRING_FILE_ACCEPT = ".json,application/json,text/plain";
export const JSON_QUERY_STRING_SAMPLE_JSON = '{\n  "page": 1,\n  "limit": 20,\n  "filter": "active",\n  "sort": "name"\n}';
export const JSON_QUERY_STRING_SAMPLE_QS = "page=1&limit=20&filter=active&sort=name";
export const JSON_QUERY_STRING_PLACEHOLDER_OUTPUT = "Result will appear here...";

function flatten(obj: unknown, prefix = ""): [string, string][] {
  const pairs: [string, string][] = [];
  if (typeof obj !== "object" || obj === null) {
    pairs.push([prefix, String(obj)]);
    return pairs;
  }
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => pairs.push(...flatten(v, `${prefix}[${i}]`)));
    return pairs;
  }
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const key = prefix ? `${prefix}[${k}]` : k;
    pairs.push(...flatten(v, key));
  }
  return pairs;
}

export function jsonToQueryString(obj: unknown): string {
  const pairs = flatten(obj);
  return pairs.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&");
}

export function queryStringToJson(qs: string): Record<string, string> {
  const params = new URLSearchParams(qs.trim());
  const obj: Record<string, string> = {};
  params.forEach((v, k) => {
    obj[k] = v;
  });
  return obj;
}
