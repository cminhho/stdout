/**
 * Sample data for JSON formatter tool. Minified so the tool's format/beautify use case is clear.
 * All samples are valid JSON for real use cases (API, config, package, table).
 */

/** Generic nested object (mixed types, arrays, nested config). */
export const JSON_FORMATTER_SAMPLE = `{"name":"Sample","version":"1.0","active":true,"count":42,"tags":["json","formatter","tool"],"items":[{"id":1,"label":"One","score":0.95,"enabled":true},{"id":2,"label":"Two","score":0.8,"enabled":false},{"id":3,"label":"Three","score":1.0,"enabled":true}],"meta":{"author":"Dev","license":"MIT","config":{"debug":false,"maxRetries":3,"timeout":5000,"features":["format","validate","minify"]}},"nullable":null}`;

/** REST API response (paginated list). */
export const JSON_FORMATTER_SAMPLE_API = `{"data":[{"id":1,"name":"Item A","price":9.99},{"id":2,"name":"Item B","price":14.5}],"total":42,"page":1,"pageSize":10}`;

/** App config (env-style, feature flags). */
export const JSON_FORMATTER_SAMPLE_CONFIG = `{"apiUrl":"https://api.example.com","timeout":5000,"retries":3,"features":{"beta":true,"darkMode":true},"env":"production"}`;

/** package.json-like (name, version, scripts, dependencies). */
export const JSON_FORMATTER_SAMPLE_PACKAGE = `{"name":"my-app","version":"1.2.0","scripts":{"start":"node index.js","test":"jest"},"dependencies":{"react":"^18.0.0","lodash":"^4.17.21"},"devDependencies":{"eslint":"^8.0.0"}}`;

/** Array of records (e.g. users table). */
export const JSON_FORMATTER_SAMPLE_TABLE = `[{"id":1,"name":"Alice","email":"alice@example.com","role":"admin"},{"id":2,"name":"Bob","email":"bob@example.com","role":"user"},{"id":3,"name":"Carol","email":"carol@example.com","role":"user"}]`;
