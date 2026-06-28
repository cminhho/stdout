/**
 * Lightweight JSON Schema validator for pasted API payloads.
 *
 * Supported keywords cover the common contract-debugging path: type, required,
 * properties, items, enum/const, numeric/string bounds, additionalProperties,
 * patternProperties, allOf/anyOf/oneOf/not, and local JSON Pointer $ref.
 */

export type JsonSchemaType =
  | "string"
  | "number"
  | "integer"
  | "boolean"
  | "object"
  | "array"
  | "null";

export interface JsonParseFailure {
  ok: false;
  message: string;
  line: number;
  column: number;
  snippet: string;
}

export interface JsonParseSuccess {
  ok: true;
  value: unknown;
}

export type JsonParseResult = JsonParseSuccess | JsonParseFailure;

export interface JsonSchemaIssue {
  path: string;
  message: string;
  expected?: string;
  actual?: string;
  schemaPath?: string;
}

export interface JsonSchemaValidationResult {
  valid: boolean;
  errors: JsonSchemaIssue[];
  warnings: string[];
  checkedNodes: number;
}

export interface JsonSchemaSummary {
  title?: string;
  type: string;
  propertyCount: number;
  requiredCount: number;
}

interface ValidationContext {
  rootSchema: unknown;
  errors: JsonSchemaIssue[];
  warnings: string[];
  checkedNodes: number;
  maxErrors: number;
}

const DEFAULT_MAX_ERRORS = 200;
const SUPPORTED_FORMATS = new Set(["email", "uri", "url", "uuid", "date-time", "date", "time"]);

export const JSON_SCHEMA_VALIDATOR_SAMPLE_DATA = JSON.stringify(
  {
    id: "usr_123",
    email: "admin@example.com",
    website: "https://example.com/users/usr_123",
    age: 32,
    score: 4.75,
    active: true,
    status: "active",
    plan: "pro",
    nickname: null,
    createdAt: "2026-06-28T09:30:00Z",
    birthday: "1992-05-14",
    loginTime: "09:30:00Z",
    roles: ["admin", "editor"],
    tags: ["api", "internal"],
    profile: {
      firstName: "Minh",
      lastName: "Nguyen",
      displayName: "Minh Nguyen",
      address: {
        line1: "123 API Street",
        city: "Ho Chi Minh City",
        country: "VN",
        postalCode: "700000",
      },
      preferences: {
        theme: "dark",
        notifications: {
          email: true,
          sms: false,
        },
      },
      externalIds: {
        github: "cminhho",
        jira: "LEAN-42",
      },
    },
    quotas: {
      requestsPerMinute: 120,
      storageGb: 25.5,
    },
    tupleExample: ["primary", 100, true],
    audit: {
      createdBy: "system",
      reviewedBy: null,
    },
  },
  null,
  2
);

export const JSON_SCHEMA_VALIDATOR_SAMPLE_SCHEMA = JSON.stringify(
  {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    title: "Account payload",
    type: "object",
    required: [
      "id",
      "email",
      "website",
      "age",
      "score",
      "active",
      "status",
      "plan",
      "nickname",
      "createdAt",
      "birthday",
      "loginTime",
      "roles",
      "tags",
      "profile",
      "quotas",
      "tupleExample",
      "audit",
    ],
    additionalProperties: false,
    properties: {
      id: { type: "string", pattern: "^usr_[a-z0-9]+$" },
      email: { type: "string", format: "email" },
      website: { type: "string", format: "uri" },
      age: { type: "integer", minimum: 0, maximum: 120 },
      score: { type: "number", minimum: 0, maximum: 5, multipleOf: 0.25 },
      active: { type: "boolean" },
      status: { const: "active" },
      plan: { enum: ["free", "pro", "enterprise"] },
      nickname: { type: ["string", "null"], maxLength: 40 },
      createdAt: { type: "string", format: "date-time" },
      birthday: { type: "string", format: "date" },
      loginTime: { type: "string", format: "time" },
      roles: {
        type: "array",
        minItems: 1,
        uniqueItems: true,
        items: { enum: ["admin", "editor", "viewer"] },
      },
      tags: {
        type: "array",
        minItems: 1,
        maxItems: 5,
        items: { type: "string", minLength: 2 },
      },
      profile: { $ref: "#/$defs/profile" },
      quotas: {
        type: "object",
        required: ["requestsPerMinute", "storageGb"],
        additionalProperties: false,
        properties: {
          requestsPerMinute: { type: "integer", minimum: 1, maximum: 1000 },
          storageGb: { type: "number", minimum: 0, multipleOf: 0.5 },
        },
      },
      tupleExample: {
        type: "array",
        items: [{ type: "string" }, { type: "integer" }, { type: "boolean" }],
        additionalItems: false,
      },
      audit: {
        type: "object",
        required: ["createdBy", "reviewedBy"],
        additionalProperties: false,
        properties: {
          createdBy: { type: "string" },
          reviewedBy: { type: ["string", "null"] },
        },
      },
    },
    $defs: {
      profile: {
        type: "object",
        required: ["firstName", "lastName", "address", "preferences", "externalIds"],
        additionalProperties: false,
        properties: {
          firstName: { type: "string", minLength: 1 },
          lastName: { type: "string", minLength: 1 },
          displayName: { type: "string" },
          address: {
            type: "object",
            required: ["line1", "city", "country"],
            additionalProperties: false,
            properties: {
              line1: { type: "string" },
              city: { type: "string" },
              country: { type: "string", minLength: 2, maxLength: 2 },
              postalCode: { type: "string" },
            },
          },
          preferences: {
            type: "object",
            required: ["theme", "notifications"],
            additionalProperties: false,
            properties: {
              theme: { enum: ["light", "dark", "system"] },
              notifications: {
                type: "object",
                required: ["email", "sms"],
                additionalProperties: false,
                properties: {
                  email: { type: "boolean" },
                  sms: { type: "boolean" },
                },
              },
            },
          },
          externalIds: {
            type: "object",
            minProperties: 1,
            patternProperties: {
              "^[a-z]+$": { type: "string" },
            },
            additionalProperties: false,
          },
        },
      },
    },
  },
  null,
  2
);

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function jsonType(value: unknown): JsonSchemaType {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (typeof value === "number" && Number.isInteger(value)) return "integer";
  if (typeof value === "number") return "number";
  return typeof value as JsonSchemaType;
}

function hasType(value: unknown, expected: JsonSchemaType): boolean {
  const actual = jsonType(value);
  if (expected === "number") return actual === "number" || actual === "integer";
  return actual === expected;
}

function typeLabel(types: JsonSchemaType[]): string {
  return types.length === 1 ? types[0] : types.join(" | ");
}

function childPath(parent: string, key: string, array: boolean): string {
  if (array) return `${parent}[${key}]`;
  return /^[A-Za-z_$][\w$]*$/.test(key)
    ? `${parent}.${key}`
    : `${parent}[${JSON.stringify(key)}]`;
}

function schemaChildPath(parent: string, key: string): string {
  return `${parent}/${key.replace(/~/g, "~0").replace(/\//g, "~1")}`;
}

function getPosition(input: string, position: number) {
  let line = 1;
  let column = 1;
  for (let i = 0; i < position && i < input.length; i++) {
    if (input[i] === "\n") {
      line++;
      column = 1;
    } else {
      column++;
    }
  }
  return { line, column };
}

function getSnippet(input: string, line: number): string {
  const text = input.split("\n")[line - 1] ?? "";
  return text.length > 120 ? `${text.slice(0, 120)}...` : text;
}

export function parseJsonDocument(input: string): JsonParseResult {
  try {
    return { ok: true, value: JSON.parse(input) };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const positionMatch = message.match(/position\s+(\d+)/i);
    if (positionMatch) {
      const { line, column } = getPosition(input, Number(positionMatch[1]));
      return { ok: false, message, line, column, snippet: getSnippet(input, line) };
    }

    const line = Number(message.match(/line\s+(\d+)/i)?.[1] ?? 1);
    const column = Number(message.match(/column\s+(\d+)/i)?.[1] ?? 1);
    return { ok: false, message, line, column, snippet: getSnippet(input, line) };
  }
}

function pushIssue(ctx: ValidationContext, issue: JsonSchemaIssue) {
  if (ctx.errors.length >= ctx.maxErrors) return;
  ctx.errors.push(issue);
}

function pushWarning(ctx: ValidationContext, message: string) {
  if (!ctx.warnings.includes(message)) ctx.warnings.push(message);
}

function parseTypeKeyword(value: unknown, ctx: ValidationContext, schemaPath: string): JsonSchemaType[] | null {
  const rawTypes = Array.isArray(value) ? value : typeof value === "string" ? [value] : null;
  if (!rawTypes) return null;

  const types: JsonSchemaType[] = [];
  for (const raw of rawTypes) {
    if (
      raw === "string" ||
      raw === "number" ||
      raw === "integer" ||
      raw === "boolean" ||
      raw === "object" ||
      raw === "array" ||
      raw === "null"
    ) {
      types.push(raw);
    } else {
      pushWarning(ctx, `Unsupported type value at ${schemaPath}: ${String(raw)}`);
    }
  }
  return types.length ? types : null;
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, index) => deepEqual(item, b[index]));
  }
  if (isRecord(a) && isRecord(b)) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every((key) => Object.prototype.hasOwnProperty.call(b, key) && deepEqual(a[key], b[key]));
  }
  return false;
}

function displayValue(value: unknown): string {
  if (typeof value === "string") return JSON.stringify(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function resolveJsonPointer(root: unknown, pointer: string): unknown {
  if (pointer === "#") return root;
  if (!pointer.startsWith("#/")) return undefined;
  const parts = pointer
    .slice(2)
    .split("/")
    .map((part) => part.replace(/~1/g, "/").replace(/~0/g, "~"));

  let current = root;
  for (const part of parts) {
    if (Array.isArray(current)) {
      const index = Number(part);
      current = Number.isInteger(index) ? current[index] : undefined;
    } else if (isRecord(current)) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return current;
}

function validateFormat(value: string, format: string): boolean {
  if (!SUPPORTED_FORMATS.has(format)) return true;
  if (format === "email") return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  if (format === "uuid") return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  if (format === "uri" || format === "url") {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }
  if (format === "date-time") return !Number.isNaN(Date.parse(value));
  if (format === "date") return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
  if (format === "time") return /^\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/.test(value);
  return true;
}

function validateSubschema(value: unknown, schema: unknown, ctx: ValidationContext, path: string, schemaPath: string): JsonSchemaIssue[] {
  const subCtx: ValidationContext = {
    rootSchema: ctx.rootSchema,
    errors: [],
    warnings: ctx.warnings,
    checkedNodes: 0,
    maxErrors: ctx.maxErrors,
  };
  validateNode(value, schema, path, schemaPath, subCtx, new Set());
  ctx.checkedNodes += subCtx.checkedNodes;
  return subCtx.errors;
}

function validateCombinators(
  value: unknown,
  schema: Record<string, unknown>,
  path: string,
  schemaPath: string,
  ctx: ValidationContext
) {
  if (Array.isArray(schema.allOf)) {
    schema.allOf.forEach((subschema, index) => {
      validateNode(value, subschema, path, `${schemaPath}/allOf/${index}`, ctx, new Set());
    });
  }

  if (Array.isArray(schema.anyOf)) {
    const matches = schema.anyOf.filter(
      (subschema, index) => validateSubschema(value, subschema, ctx, path, `${schemaPath}/anyOf/${index}`).length === 0
    );
    if (matches.length === 0) {
      pushIssue(ctx, {
        path,
        schemaPath: `${schemaPath}/anyOf`,
        message: "Value does not match any allowed schema",
      });
    }
  }

  if (Array.isArray(schema.oneOf)) {
    const matches = schema.oneOf.filter(
      (subschema, index) => validateSubschema(value, subschema, ctx, path, `${schemaPath}/oneOf/${index}`).length === 0
    );
    if (matches.length !== 1) {
      pushIssue(ctx, {
        path,
        schemaPath: `${schemaPath}/oneOf`,
        message: `Value must match exactly one schema, matched ${matches.length}`,
      });
    }
  }

  if (schema.not !== undefined) {
    const errors = validateSubschema(value, schema.not, ctx, path, `${schemaPath}/not`);
    if (errors.length === 0) {
      pushIssue(ctx, {
        path,
        schemaPath: `${schemaPath}/not`,
        message: "Value matches a schema that is explicitly disallowed",
      });
    }
  }
}

function validateObject(
  value: Record<string, unknown>,
  schema: Record<string, unknown>,
  path: string,
  schemaPath: string,
  ctx: ValidationContext
) {
  const keys = Object.keys(value);

  if (typeof schema.minProperties === "number" && keys.length < schema.minProperties) {
    pushIssue(ctx, { path, schemaPath: `${schemaPath}/minProperties`, message: `Object has fewer than ${schema.minProperties} properties` });
  }
  if (typeof schema.maxProperties === "number" && keys.length > schema.maxProperties) {
    pushIssue(ctx, { path, schemaPath: `${schemaPath}/maxProperties`, message: `Object has more than ${schema.maxProperties} properties` });
  }

  if (Array.isArray(schema.required)) {
    for (const key of schema.required) {
      if (typeof key === "string" && !Object.prototype.hasOwnProperty.call(value, key)) {
        pushIssue(ctx, {
          path: childPath(path, key, false),
          schemaPath: `${schemaPath}/required`,
          message: `Required property "${key}" is missing`,
        });
      }
    }
  }

  const evaluated = new Set<string>();
  const properties = isRecord(schema.properties) ? schema.properties : {};
  for (const [key, subschema] of Object.entries(properties)) {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      evaluated.add(key);
      validateNode(value[key], subschema, childPath(path, key, false), schemaChildPath(`${schemaPath}/properties`, key), ctx, new Set());
    }
  }

  const patternProperties = isRecord(schema.patternProperties) ? schema.patternProperties : {};
  for (const [pattern, subschema] of Object.entries(patternProperties)) {
    let regex: RegExp;
    try {
      regex = new RegExp(pattern);
    } catch {
      pushWarning(ctx, `Invalid patternProperties regex at ${schemaPath}: ${pattern}`);
      continue;
    }

    for (const key of keys) {
      if (regex.test(key)) {
        evaluated.add(key);
        validateNode(value[key], subschema, childPath(path, key, false), schemaChildPath(`${schemaPath}/patternProperties`, pattern), ctx, new Set());
      }
    }
  }

  const additional = schema.additionalProperties;
  if (additional !== undefined) {
    for (const key of keys) {
      if (evaluated.has(key)) continue;
      if (additional === false) {
        pushIssue(ctx, {
          path: childPath(path, key, false),
          schemaPath: `${schemaPath}/additionalProperties`,
          message: `Additional property "${key}" is not allowed`,
        });
      } else if (isRecord(additional) || typeof additional === "boolean") {
        validateNode(value[key], additional, childPath(path, key, false), `${schemaPath}/additionalProperties`, ctx, new Set());
      }
    }
  }
}

function validateArray(
  value: unknown[],
  schema: Record<string, unknown>,
  path: string,
  schemaPath: string,
  ctx: ValidationContext
) {
  if (typeof schema.minItems === "number" && value.length < schema.minItems) {
    pushIssue(ctx, { path, schemaPath: `${schemaPath}/minItems`, message: `Array has fewer than ${schema.minItems} items` });
  }
  if (typeof schema.maxItems === "number" && value.length > schema.maxItems) {
    pushIssue(ctx, { path, schemaPath: `${schemaPath}/maxItems`, message: `Array has more than ${schema.maxItems} items` });
  }
  if (schema.uniqueItems === true) {
    const seen = new Set<string>();
    for (let i = 0; i < value.length; i++) {
      const key = JSON.stringify(value[i]);
      if (seen.has(key)) {
        pushIssue(ctx, { path: childPath(path, String(i), true), schemaPath: `${schemaPath}/uniqueItems`, message: "Array item is not unique" });
        break;
      }
      seen.add(key);
    }
  }

  if (Array.isArray(schema.items)) {
    schema.items.forEach((subschema, index) => {
      if (index < value.length) {
        validateNode(value[index], subschema, childPath(path, String(index), true), `${schemaPath}/items/${index}`, ctx, new Set());
      }
    });
    if (schema.additionalItems === false && value.length > schema.items.length) {
      for (let i = schema.items.length; i < value.length; i++) {
        pushIssue(ctx, {
          path: childPath(path, String(i), true),
          schemaPath: `${schemaPath}/additionalItems`,
          message: "Additional tuple item is not allowed",
        });
      }
    }
  } else if (schema.items !== undefined) {
    value.forEach((item, index) => {
      validateNode(item, schema.items, childPath(path, String(index), true), `${schemaPath}/items`, ctx, new Set());
    });
  }
}

function validateString(
  value: string,
  schema: Record<string, unknown>,
  path: string,
  schemaPath: string,
  ctx: ValidationContext
) {
  const length = Array.from(value).length;
  if (typeof schema.minLength === "number" && length < schema.minLength) {
    pushIssue(ctx, { path, schemaPath: `${schemaPath}/minLength`, message: `String is shorter than ${schema.minLength} characters` });
  }
  if (typeof schema.maxLength === "number" && length > schema.maxLength) {
    pushIssue(ctx, { path, schemaPath: `${schemaPath}/maxLength`, message: `String is longer than ${schema.maxLength} characters` });
  }
  if (typeof schema.pattern === "string") {
    try {
      if (!new RegExp(schema.pattern).test(value)) {
        pushIssue(ctx, {
          path,
          schemaPath: `${schemaPath}/pattern`,
          message: `String does not match pattern ${schema.pattern}`,
          actual: displayValue(value),
        });
      }
    } catch {
      pushWarning(ctx, `Invalid pattern regex at ${schemaPath}: ${schema.pattern}`);
    }
  }
  if (typeof schema.format === "string" && !validateFormat(value, schema.format)) {
    pushIssue(ctx, {
      path,
      schemaPath: `${schemaPath}/format`,
      message: `String does not match ${schema.format} format`,
      expected: schema.format,
      actual: displayValue(value),
    });
  }
}

function validateNumber(
  value: number,
  schema: Record<string, unknown>,
  path: string,
  schemaPath: string,
  ctx: ValidationContext
) {
  if (typeof schema.minimum === "number" && value < schema.minimum) {
    pushIssue(ctx, { path, schemaPath: `${schemaPath}/minimum`, message: `Number is less than ${schema.minimum}`, actual: String(value) });
  }
  if (typeof schema.maximum === "number" && value > schema.maximum) {
    pushIssue(ctx, { path, schemaPath: `${schemaPath}/maximum`, message: `Number is greater than ${schema.maximum}`, actual: String(value) });
  }
  if (typeof schema.exclusiveMinimum === "number" && value <= schema.exclusiveMinimum) {
    pushIssue(ctx, { path, schemaPath: `${schemaPath}/exclusiveMinimum`, message: `Number must be greater than ${schema.exclusiveMinimum}`, actual: String(value) });
  }
  if (typeof schema.exclusiveMaximum === "number" && value >= schema.exclusiveMaximum) {
    pushIssue(ctx, { path, schemaPath: `${schemaPath}/exclusiveMaximum`, message: `Number must be less than ${schema.exclusiveMaximum}`, actual: String(value) });
  }
  if (schema.exclusiveMinimum === true && typeof schema.minimum === "number" && value <= schema.minimum) {
    pushIssue(ctx, { path, schemaPath: `${schemaPath}/exclusiveMinimum`, message: `Number must be greater than ${schema.minimum}`, actual: String(value) });
  }
  if (schema.exclusiveMaximum === true && typeof schema.maximum === "number" && value >= schema.maximum) {
    pushIssue(ctx, { path, schemaPath: `${schemaPath}/exclusiveMaximum`, message: `Number must be less than ${schema.maximum}`, actual: String(value) });
  }
  if (typeof schema.multipleOf === "number" && schema.multipleOf !== 0) {
    const quotient = value / schema.multipleOf;
    if (Math.abs(quotient - Math.round(quotient)) > Number.EPSILON * 100) {
      pushIssue(ctx, { path, schemaPath: `${schemaPath}/multipleOf`, message: `Number is not a multiple of ${schema.multipleOf}`, actual: String(value) });
    }
  }
}

function validateNode(
  value: unknown,
  schema: unknown,
  path: string,
  schemaPath: string,
  ctx: ValidationContext,
  refStack: Set<string>
) {
  if (ctx.errors.length >= ctx.maxErrors) return;
  ctx.checkedNodes++;

  if (typeof schema === "boolean") {
    if (!schema) {
      pushIssue(ctx, { path, schemaPath, message: "Value is not allowed by false schema" });
    }
    return;
  }

  if (!isRecord(schema)) {
    pushIssue(ctx, { path, schemaPath, message: "Schema node must be an object or boolean" });
    return;
  }

  if (typeof schema.$ref === "string") {
    if (refStack.has(schema.$ref)) {
      pushWarning(ctx, `Skipped circular $ref ${schema.$ref}`);
      return;
    }
    const resolved = resolveJsonPointer(ctx.rootSchema, schema.$ref);
    if (resolved === undefined) {
      pushIssue(ctx, { path, schemaPath: `${schemaPath}/$ref`, message: `Could not resolve local $ref ${schema.$ref}` });
    } else {
      const nextStack = new Set(refStack);
      nextStack.add(schema.$ref);
      validateNode(value, resolved, path, schema.$ref, ctx, nextStack);
      if (Object.keys(schema).length === 1) return;
    }
  }

  if (schema.const !== undefined && !deepEqual(value, schema.const)) {
    pushIssue(ctx, {
      path,
      schemaPath: `${schemaPath}/const`,
      message: "Value does not match const",
      expected: displayValue(schema.const),
      actual: displayValue(value),
    });
  }

  if (Array.isArray(schema.enum) && !schema.enum.some((candidate) => deepEqual(candidate, value))) {
    pushIssue(ctx, {
      path,
      schemaPath: `${schemaPath}/enum`,
      message: "Value is not in enum",
      expected: schema.enum.map(displayValue).join(", "),
      actual: displayValue(value),
    });
  }

  if (value === null && schema.nullable === true) return;

  const expectedTypes = parseTypeKeyword(schema.type, ctx, `${schemaPath}/type`);
  if (expectedTypes && !expectedTypes.some((type) => hasType(value, type))) {
    pushIssue(ctx, {
      path,
      schemaPath: `${schemaPath}/type`,
      message: `Expected ${typeLabel(expectedTypes)}, got ${jsonType(value)}`,
      expected: typeLabel(expectedTypes),
      actual: jsonType(value),
    });
    return;
  }

  validateCombinators(value, schema, path, schemaPath, ctx);

  if (isRecord(value)) validateObject(value, schema, path, schemaPath, ctx);
  if (Array.isArray(value)) validateArray(value, schema, path, schemaPath, ctx);
  if (typeof value === "string") validateString(value, schema, path, schemaPath, ctx);
  if (typeof value === "number") validateNumber(value, schema, path, schemaPath, ctx);
}

export function validateJsonAgainstSchema(
  data: unknown,
  schema: unknown,
  options: { maxErrors?: number } = {}
): JsonSchemaValidationResult {
  const ctx: ValidationContext = {
    rootSchema: schema,
    errors: [],
    warnings: [],
    checkedNodes: 0,
    maxErrors: options.maxErrors ?? DEFAULT_MAX_ERRORS,
  };

  validateNode(data, schema, "$", "#", ctx, new Set());

  if (ctx.errors.length >= ctx.maxErrors) {
    pushWarning(ctx, `Stopped after ${ctx.maxErrors} validation errors`);
  }

  return {
    valid: ctx.errors.length === 0,
    errors: ctx.errors,
    warnings: ctx.warnings,
    checkedNodes: ctx.checkedNodes,
  };
}

export function summarizeJsonSchema(schema: unknown): JsonSchemaSummary {
  if (!isRecord(schema)) return { type: "unknown", propertyCount: 0, requiredCount: 0 };
  const type = Array.isArray(schema.type)
    ? schema.type.map(String).join(" | ")
    : typeof schema.type === "string"
      ? schema.type
      : "unspecified";
  return {
    title: typeof schema.title === "string" ? schema.title : undefined,
    type,
    propertyCount: isRecord(schema.properties) ? Object.keys(schema.properties).length : 0,
    requiredCount: Array.isArray(schema.required) ? schema.required.filter((key) => typeof key === "string").length : 0,
  };
}

export function formatJsonSchemaIssues(errors: JsonSchemaIssue[]): string {
  return errors
    .map((error) => {
      const details = [
        error.expected ? `expected=${error.expected}` : "",
        error.actual ? `actual=${error.actual}` : "",
        error.schemaPath ? `schema=${error.schemaPath}` : "",
      ]
        .filter(Boolean)
        .join(" ");
      return `${error.path}: ${error.message}${details ? ` (${details})` : ""}`;
    })
    .join("\n");
}
