import { useCallback, useMemo } from "react";
import CodeEditor from "@/components/common/CodeEditor";
import { ClearButton } from "@/components/common/ClearButton";
import FileUploadButton from "@/components/common/FileUploadButton";
import { SampleButton } from "@/components/common/SampleButton";
import ToolAlert from "@/components/common/ToolAlert";
import ToolResultCard from "@/components/common/ToolResultCard";
import ToolLayout from "@/components/layout/ToolLayout";
import type { PaneProps } from "@/components/layout/ToolPane";
import ResizableTwoPanel from "@/components/layout/ResizableTwoPanel";
import { Button } from "@/components/ui/button";
import { useTabInput } from "@/hooks/useTabInput";
import {
  formatJsonSchemaIssues,
  JSON_SCHEMA_VALIDATOR_SAMPLE_DATA,
  JSON_SCHEMA_VALIDATOR_SAMPLE_SCHEMA,
  parseJsonDocument,
  summarizeJsonSchema,
  validateJsonAgainstSchema,
  type JsonParseFailure,
  type JsonSchemaIssue,
} from "@/utils/jsonSchemaValidator";

interface PersistedState {
  data: string;
  schema: string;
}

type ValidationView =
  | { kind: "empty" }
  | { kind: "parse-error"; target: "JSON data" | "JSON schema"; error: JsonParseFailure }
  | {
      kind: "validated";
      valid: boolean;
      errors: JsonSchemaIssue[];
      warnings: string[];
      checkedNodes: number;
      schemaTitle?: string;
      schemaType: string;
      propertyCount: number;
      requiredCount: number;
    };

const EMPTY_STATE: PersistedState = { data: "", schema: "" };
const SAMPLE_STATE: PersistedState = {
  data: JSON_SCHEMA_VALIDATOR_SAMPLE_DATA,
  schema: JSON_SCHEMA_VALIDATOR_SAMPLE_SCHEMA,
};
const STATE_MARKER = "json-schema-validator";

function encodeState(state: PersistedState): string {
  return JSON.stringify({ tool: STATE_MARKER, ...state });
}

function decodeState(raw: string): PersistedState {
  if (!raw.trim()) return EMPTY_STATE;
  try {
    const parsed = JSON.parse(raw) as Partial<PersistedState> & { tool?: unknown };
    if (parsed.tool === STATE_MARKER) {
      return {
        data: typeof parsed.data === "string" ? parsed.data : "",
        schema: typeof parsed.schema === "string" ? parsed.schema : "",
      };
    }
  } catch {
    // A legacy/deep-link input value is treated as JSON data.
  }
  return { data: raw, schema: "" };
}

function buildEditorPane({
  title,
  value,
  onChange,
  onSample,
  onClear,
  onFileText,
  placeholder,
  errorLine,
}: {
  title: string;
  value: string;
  onChange: (value: string) => void;
  onSample: () => void;
  onClear: () => void;
  onFileText: (value: string) => void;
  placeholder: string;
  errorLine?: number;
}): PaneProps {
  return {
    title,
    toolbar: (
      <>
        <SampleButton onClick={onSample} />
        <ClearButton onClick={onClear} />
        <FileUploadButton accept=".json,application/json" onText={onFileText} />
      </>
    ),
    children: (
      <CodeEditor
        value={value}
        onChange={onChange}
        language="json"
        placeholder={placeholder}
        errorLines={errorLine ? new Set([errorLine]) : undefined}
        fillHeight
      />
    ),
  };
}

function getValidationView(data: string, schema: string): ValidationView {
  if (!data.trim() && !schema.trim()) return { kind: "empty" };
  if (!data.trim() || !schema.trim()) {
    return {
      kind: "parse-error",
      target: !data.trim() ? "JSON data" : "JSON schema",
      error: {
        ok: false,
        message: "Both JSON data and JSON schema are required",
        line: 1,
        column: 1,
        snippet: "",
      },
    };
  }

  const dataParse = parseJsonDocument(data);
  if (dataParse.ok === false) return { kind: "parse-error", target: "JSON data", error: dataParse };

  const schemaParse = parseJsonDocument(schema);
  if (schemaParse.ok === false) return { kind: "parse-error", target: "JSON schema", error: schemaParse };

  const validation = validateJsonAgainstSchema(dataParse.value, schemaParse.value);
  const summary = summarizeJsonSchema(schemaParse.value);
  return {
    kind: "validated",
    valid: validation.valid,
    errors: validation.errors,
    warnings: validation.warnings,
    checkedNodes: validation.checkedNodes,
    schemaTitle: summary.title,
    schemaType: summary.type,
    propertyCount: summary.propertyCount,
    requiredCount: summary.requiredCount,
  };
}

function ParseErrorResult({ view }: { view: Extract<ValidationView, { kind: "parse-error" }> }) {
  return (
    <ToolResultCard summary={`${view.target} error`}>
      <ToolAlert
        variant="error"
        message={`${view.error.message} at line ${view.error.line}, column ${view.error.column}`}
      />
      {view.error.snippet ? (
        <pre className="mt-3 overflow-auto rounded-[var(--home-radius-card)] border border-border bg-muted/40 p-3 text-xs font-mono">
          {view.error.snippet}
        </pre>
      ) : null}
    </ToolResultCard>
  );
}

function ValidationResult({ view }: { view: Extract<ValidationView, { kind: "validated" }> }) {
  const copyText = view.errors.length ? formatJsonSchemaIssues(view.errors) : undefined;
  const summary = view.valid
    ? `Valid against ${view.schemaTitle ?? "schema"}`
    : `${view.errors.length} schema ${view.errors.length === 1 ? "issue" : "issues"}`;

  return (
    <ToolResultCard summary={summary} copyText={copyText}>
      {view.valid ? (
        <ToolAlert
          variant="success"
          message={`Checked ${view.checkedNodes} nodes; schema type ${view.schemaType}, ${view.propertyCount} properties, ${view.requiredCount} required`}
        />
      ) : (
        <div className="max-h-[42vh] overflow-auto rounded-[var(--home-radius-card)] border border-border">
          <table className="tool-reference-table border-collapse" aria-label="JSON schema validation issues">
            <thead className="sticky top-0 z-10 border-b border-border bg-muted/60 backdrop-blur-[var(--glass-blur-subtle)]">
              <tr>
                <th className="text-left">Path</th>
                <th className="text-left">Issue</th>
                <th className="text-left">Schema</th>
              </tr>
            </thead>
            <tbody>
              {view.errors.map((error, index) => (
                <tr key={`${error.path}-${error.schemaPath ?? index}-${index}`} className="border-b border-border/60">
                  <td className="font-mono text-xs align-top">{error.path}</td>
                  <td className="align-top">
                    <div>{error.message}</div>
                    {error.expected || error.actual ? (
                      <div className="mt-1 text-xs text-muted-foreground font-mono">
                        {error.expected ? `expected: ${error.expected}` : ""}
                        {error.expected && error.actual ? " | " : ""}
                        {error.actual ? `actual: ${error.actual}` : ""}
                      </div>
                    ) : null}
                  </td>
                  <td className="font-mono text-xs align-top text-muted-foreground">{error.schemaPath ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view.warnings.length ? (
        <div className="mt-3 text-xs text-muted-foreground">
          {view.warnings.map((warning) => (
            <div key={warning}>{warning}</div>
          ))}
        </div>
      ) : null}
    </ToolResultCard>
  );
}

const JsonSchemaValidatorPage = () => {
  const { input: encodedState, setInput: setEncodedState } = useTabInput(encodeState(EMPTY_STATE));
  const state = useMemo(() => decodeState(encodedState), [encodedState]);
  const validationView = useMemo(() => getValidationView(state.data, state.schema), [state.data, state.schema]);

  const updateState = useCallback(
    (patch: Partial<PersistedState>) => {
      setEncodedState(encodeState({ ...state, ...patch }));
    },
    [setEncodedState, state]
  );

  const loadSample = useCallback(() => setEncodedState(encodeState(SAMPLE_STATE)), [setEncodedState]);
  const clearAll = useCallback(() => setEncodedState(encodeState(EMPTY_STATE)), [setEncodedState]);

  const dataErrorLine =
    validationView.kind === "parse-error" && validationView.target === "JSON data" ? validationView.error.line : undefined;
  const schemaErrorLine =
    validationView.kind === "parse-error" && validationView.target === "JSON schema" ? validationView.error.line : undefined;

  const dataPane = useMemo(
    () =>
      buildEditorPane({
        title: "JSON Data",
        value: state.data,
        onChange: (value) => updateState({ data: value }),
        onSample: () => updateState({ data: JSON_SCHEMA_VALIDATOR_SAMPLE_DATA }),
        onClear: () => updateState({ data: "" }),
        onFileText: (value) => updateState({ data: value }),
        placeholder: '{ "id": "usr_123" }',
        errorLine: dataErrorLine,
      }),
    [dataErrorLine, state.data, updateState]
  );

  const schemaPane = useMemo(
    () =>
      buildEditorPane({
        title: "JSON Schema",
        value: state.schema,
        onChange: (value) => updateState({ schema: value }),
        onSample: () => updateState({ schema: JSON_SCHEMA_VALIDATOR_SAMPLE_SCHEMA }),
        onClear: () => updateState({ schema: "" }),
        onFileText: (value) => updateState({ schema: value }),
        placeholder: '{ "type": "object", "properties": {} }',
        errorLine: schemaErrorLine,
      }),
    [schemaErrorLine, state.schema, updateState]
  );

  return (
    <ToolLayout>
      <div className="flex flex-col flex-1 min-h-0 w-full gap-[var(--home-content-gap)]">
        <section className="tool-section-card shrink-0" aria-label="Actions">
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" size="xs" variant="outline" onClick={loadSample}>
              Load matching sample
            </Button>
            <Button type="button" size="xs" variant="ghost" onClick={clearAll}>
              Clear all
            </Button>
          </div>
        </section>

        <ResizableTwoPanel input={dataPane} output={schemaPane} className="flex-1 min-h-0" />

        {validationView.kind !== "empty" ? (
          <section className="tool-section-card shrink-0" aria-label="Validation result">
            <h2 className="home-section-label mb-2">Result</h2>
            {validationView.kind === "parse-error" ? (
              <ParseErrorResult view={validationView} />
            ) : (
              <ValidationResult view={validationView} />
            )}
          </section>
        ) : null}
      </div>
    </ToolLayout>
  );
};

export default JsonSchemaValidatorPage;
