/**
 * Core hash/crypto utilities — pure async functions.
 */

export type HashAlgorithm = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";

export const hashText = async (text: string, algo: HashAlgorithm): Promise<string> => {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest(algo, data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

export const hashAllAlgorithms = async (text: string): Promise<Record<HashAlgorithm, string>> => {
  const algos: HashAlgorithm[] = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];
  const results = await Promise.all(algos.map(async (a) => [a, await hashText(text, a)] as const));
  return Object.fromEntries(results) as Record<HashAlgorithm, string>;
};

export const hmacSign = async (text: string, secret: string, algo: HashAlgorithm): Promise<string> => {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: algo }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(text));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};
