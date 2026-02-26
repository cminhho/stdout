/**
 * .env to Netlify/Docker/YAML converter. Single place for parsing and format logic.
 */

import type { IndentOption } from "@/components/common/IndentSelect";

export const ENV_NETLIFY_FILE_ACCEPT = ".env,.env.*,text/plain";
export const ENV_NETLIFY_SAMPLE = `# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myapp
DB_USER=admin
DB_PASS=secret123

# API Keys
API_KEY=sk_live_abc123
SECRET_KEY=whsec_xyz`;
export const ENV_NETLIFY_PLACEHOLDER_INPUT = "KEY=value";
export const ENV_NETLIFY_PLACEHOLDER_OUTPUT = "Output...";

export type EnvOutputFormat = "netlify" | "docker" | "yaml";

export function envOutputFilename(format: EnvOutputFormat): string {
  return format === "netlify" ? "netlify.toml" : format === "docker" ? "Dockerfile" : "env.yaml";
}

export const ENV_NETLIFY_MIME_TYPE = "text/plain";

export interface EnvNetlifyFormatResult {
  output: string;
}

export function parseEnv(input: string): [string, string][] {
  return input
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const idx = l.indexOf("=");
      if (idx === -1) return null;
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim().replace(/^["']|["']$/g, "")] as [string, string];
    })
    .filter(Boolean) as [string, string][];
}

export function toNetlify(pairs: [string, string][]): string {
  const lines = ["[build.environment]"];
  pairs.forEach(([k, v]) => lines.push(`  ${k} = "${v}"`));
  return lines.join("\n");
}

export function toDocker(pairs: [string, string][]): string {
  return pairs.map(([k, v]) => `ENV ${k}="${v}"`).join("\n");
}

export function toYaml(pairs: [string, string][], indent: number): string {
  const lines = ["env:"];
  const spaces = " ".repeat(indent);
  pairs.forEach(([k, v]) => lines.push(`${spaces}${k}: "${v}"`));
  return lines.join("\n");
}

export function formatEnvOutput(
  pairs: [string, string][],
  format: EnvOutputFormat,
  yamlIndent: number
): string {
  return format === "netlify" ? toNetlify(pairs) : format === "docker" ? toDocker(pairs) : toYaml(pairs, yamlIndent);
}

export function processEnvNetlifyForLayout(
  input: string,
  indent: IndentOption,
  outputFormat: EnvOutputFormat
): EnvNetlifyFormatResult {
  const pairs = parseEnv(input);
  const yamlSpaces = typeof indent === "number" ? indent : indent === "tab" ? 2 : 2;
  const output = formatEnvOutput(pairs, outputFormat, yamlSpaces);
  return { output };
}
