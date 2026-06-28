/**
 * OpenAPI / Swagger inspector: parse JSON/YAML, validate required structure, format, extract endpoints.
 */

import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import type { IndentOption } from "@/components/common/IndentSelect";
import type { ParseError } from "@/utils/validationTypes";
import { singleErrorToParseErrors } from "@/utils/validationTypes";

export type OpenApiOutputFormat = "json" | "yaml";

export interface OpenApiEndpoint {
  method: string;
  path: string;
  summary: string;
  operationId: string;
  tags: string[];
  deprecated: boolean;
  parameterCount: number;
  hasRequestBody: boolean;
  responses: string[];
}

export interface OpenApiStats {
  title: string;
  version: string;
  specVersion: string;
  pathCount: number;
  endpointCount: number;
  schemaCount: number;
}

export interface OpenApiInspectionResult {
  output: string;
  errors: ParseError[];
  warnings: string[];
  endpoints: OpenApiEndpoint[];
  stats: OpenApiStats | null;
  parsedData: unknown;
  isValid: boolean | null;
}

export const OPENAPI_FILE_ACCEPT = ".json,.yaml,.yml,application/json,application/x-yaml,text/yaml";
export const OPENAPI_OUTPUT_FILENAME_JSON = "openapi.json";
export const OPENAPI_OUTPUT_FILENAME_YAML = "openapi.yaml";
export const OPENAPI_MIME_TYPE_JSON = "application/json";
export const OPENAPI_MIME_TYPE_YAML = "application/x-yaml";
export const OPENAPI_PLACEHOLDER_INPUT = "Paste OpenAPI/Swagger JSON or YAML...";
export const OPENAPI_PLACEHOLDER_OUTPUT = "Formatted spec will appear here...";
export const OPENAPI_SAMPLE = `openapi: 3.0.3
info:
  title: Payments API
  version: 1.0.0
servers:
  - url: https://api.example.com
paths:
  /payments:
    get:
      summary: List payments
      operationId: listPayments
      tags: [Payments]
      responses:
        "200":
          description: Payment list
    post:
      summary: Create payment
      operationId: createPayment
      tags: [Payments]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/PaymentRequest"
      responses:
        "201":
          description: Created
  /payments/{id}:
    get:
      summary: Get payment
      operationId: getPayment
      tags: [Payments]
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        "200":
          description: Payment detail
        "404":
          description: Not found
components:
  schemas:
    PaymentRequest:
      type: object
      required: [amount, currency]
      properties:
        amount:
          type: number
        currency:
          type: string`;

const HTTP_METHODS = ["get", "put", "post", "delete", "options", "head", "patch", "trace"] as const;
const HTTP_METHOD_SET = new Set<string>(HTTP_METHODS);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toError(message: string, snippet?: string): ParseError {
  return { line: 1, column: 1, message, snippet };
}

function indentToSpace(indent: IndentOption, outputFormat: OpenApiOutputFormat): string | number | undefined {
  if (indent === "minified") return outputFormat === "json" ? undefined : 2;
  if (indent === "tab") return outputFormat === "json" ? "\t" : 2;
  return indent;
}

function parseDocument(input: string): { value?: unknown; errors: ParseError[] } {
  const text = input.trim();
  if (!text) return { value: undefined, errors: [] };

  if (text.startsWith("{") || text.startsWith("[")) {
    try {
      return { value: JSON.parse(text), errors: [] };
    } catch (e) {
      return { errors: singleErrorToParseErrors((e as Error).message) };
    }
  }

  try {
    return { value: parseYaml(text, { strict: false }), errors: [] };
  } catch (e) {
    return { errors: singleErrorToParseErrors((e as Error).message) };
  }
}

function readString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  return typeof value === "string" ? value : "";
}

function readStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function responseCodes(value: unknown): string[] {
  return isRecord(value) ? Object.keys(value).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })) : [];
}

function countParameters(pathItem: Record<string, unknown>, operation: Record<string, unknown>): number {
  const pathParams = Array.isArray(pathItem.parameters) ? pathItem.parameters.length : 0;
  const operationParams = Array.isArray(operation.parameters) ? operation.parameters.length : 0;
  return pathParams + operationParams;
}

function hasSwaggerBodyParameter(pathItem: Record<string, unknown>, operation: Record<string, unknown>): boolean {
  const params = [
    ...(Array.isArray(pathItem.parameters) ? pathItem.parameters : []),
    ...(Array.isArray(operation.parameters) ? operation.parameters : []),
  ];
  return params.some((param) => isRecord(param) && (param.in === "body" || param.in === "formData"));
}

function extractEndpoints(paths: Record<string, unknown>, errors: ParseError[]): OpenApiEndpoint[] {
  const endpoints: OpenApiEndpoint[] = [];

  for (const [path, pathItemRaw] of Object.entries(paths)) {
    if (path.startsWith("x-")) continue;
    if (!path.startsWith("/")) {
      errors.push(toError(`Path "${path}" must start with "/"`, path));
      continue;
    }
    if (!isRecord(pathItemRaw)) {
      errors.push(toError(`Path item "${path}" must be an object`, path));
      continue;
    }

    for (const method of HTTP_METHODS) {
      const operationRaw = pathItemRaw[method];
      if (operationRaw === undefined) continue;
      if (!isRecord(operationRaw)) {
        errors.push(toError(`${method.toUpperCase()} ${path} operation must be an object`, path));
        continue;
      }

      const responses = responseCodes(operationRaw.responses);
      if (!isRecord(operationRaw.responses)) {
        errors.push(toError(`${method.toUpperCase()} ${path} must define responses`, path));
      }

      endpoints.push({
        method: method.toUpperCase(),
        path,
        summary: readString(operationRaw, "summary") || readString(operationRaw, "description"),
        operationId: readString(operationRaw, "operationId"),
        tags: readStringArray(operationRaw.tags),
        deprecated: operationRaw.deprecated === true,
        parameterCount: countParameters(pathItemRaw, operationRaw),
        hasRequestBody: operationRaw.requestBody !== undefined || hasSwaggerBodyParameter(pathItemRaw, operationRaw),
        responses,
      });
    }

    for (const key of Object.keys(pathItemRaw)) {
      if (
        key.startsWith("x-") ||
        key === "parameters" ||
        key === "summary" ||
        key === "description" ||
        key === "$ref" ||
        HTTP_METHOD_SET.has(key)
      ) {
        continue;
      }
      errors.push(toError(`Unsupported field "${key}" under path "${path}"`, path));
    }
  }

  return endpoints;
}

function schemaCount(spec: Record<string, unknown>, isSwagger2: boolean): number {
  if (isSwagger2) return isRecord(spec.definitions) ? Object.keys(spec.definitions).length : 0;
  const components = spec.components;
  if (!isRecord(components) || !isRecord(components.schemas)) return 0;
  return Object.keys(components.schemas).length;
}

type OpenApiValidationResult = Pick<OpenApiInspectionResult, "errors" | "warnings" | "endpoints" | "stats">;

function validateSpec(spec: unknown): OpenApiValidationResult {
  const errors: ParseError[] = [];
  const warnings: string[] = [];

  if (!isRecord(spec)) {
    return {
      errors: [toError("OpenAPI document must be an object")],
      warnings,
      endpoints: [],
      stats: null,
    };
  }

  const openapi = readString(spec, "openapi");
  const swagger = readString(spec, "swagger");
  const isOpenApi3 = /^3\.\d+(?:\.\d+)?(?:-.+)?$/.test(openapi);
  const isSwagger2 = swagger === "2.0";
  const specVersion = openapi || swagger;

  if (openapi && swagger) {
    errors.push(toError('Use either "openapi" or "swagger", not both'));
  } else if (openapi && !isOpenApi3) {
    errors.push(toError(`Unsupported OpenAPI version "${openapi}". Supported: 3.x`));
  } else if (swagger && !isSwagger2) {
    errors.push(toError(`Unsupported Swagger version "${swagger}". Supported: 2.0`));
  } else if (!openapi && !swagger) {
    errors.push(toError('Missing required "openapi" (3.x) or "swagger" (2.0) field'));
  }

  const info = spec.info;
  if (!isRecord(info)) {
    errors.push(toError('Missing required "info" object'));
  } else {
    if (!readString(info, "title")) errors.push(toError('Missing required "info.title"'));
    if (!readString(info, "version")) errors.push(toError('Missing required "info.version"'));
  }

  const paths = spec.paths;
  if (!isRecord(paths)) {
    errors.push(toError('Missing required "paths" object'));
  }

  if (isOpenApi3 && spec.host !== undefined) warnings.push('OpenAPI 3.x uses "servers" instead of Swagger 2.0 "host".');
  if (isSwagger2 && spec.servers !== undefined) warnings.push('Swagger 2.0 uses "host", "basePath", and "schemes" instead of OpenAPI 3.x "servers".');

  const endpoints = isRecord(paths) ? extractEndpoints(paths, errors) : [];
  if (isRecord(paths) && endpoints.length === 0) warnings.push("No HTTP operations found under paths.");

  const pathCount = isRecord(paths) ? Object.keys(paths).filter((path) => path.startsWith("/")).length : 0;
  const stats: OpenApiStats | null =
    isRecord(info) && specVersion
      ? {
          title: readString(info, "title"),
          version: readString(info, "version"),
          specVersion,
          pathCount,
          endpointCount: endpoints.length,
          schemaCount: schemaCount(spec, isSwagger2),
        }
      : null;

  return { errors, warnings, endpoints, stats };
}

function formatSpec(spec: unknown, indent: IndentOption, outputFormat: OpenApiOutputFormat): string {
  const space = indentToSpace(indent, outputFormat);
  if (outputFormat === "json") return JSON.stringify(spec, null, space);
  return stringifyYaml(spec, { indent: typeof space === "number" ? space : 2 });
}

export function inspectOpenApi(
  input: string,
  indent: IndentOption,
  outputFormat: OpenApiOutputFormat
): OpenApiInspectionResult {
  const empty: OpenApiInspectionResult = {
    output: "",
    errors: [],
    warnings: [],
    endpoints: [],
    stats: null,
    parsedData: undefined,
    isValid: null,
  };
  if (!input.trim()) return empty;

  const parsed = parseDocument(input);
  if (parsed.errors.length > 0) {
    return { ...empty, errors: parsed.errors, isValid: false };
  }

  const validated = validateSpec(parsed.value);
  return {
    ...validated,
    output: parsed.value === undefined ? "" : formatSpec(parsed.value, indent, outputFormat),
    parsedData: parsed.value,
    isValid: validated.errors.length === 0,
  };
}
