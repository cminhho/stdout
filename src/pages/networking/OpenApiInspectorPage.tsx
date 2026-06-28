import { useCallback, useMemo, useState } from "react";
import { ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import CodeEditor from "@/components/common/CodeEditor";
import IndentSelect, { type IndentOption } from "@/components/common/IndentSelect";
import JsonTreeView from "@/components/common/JsonTreeView";
import { SaveButton } from "@/components/common/SaveButton";
import { SegmentGroup } from "@/components/common/SegmentGroup";
import ToolAlert from "@/components/common/ToolAlert";
import TwoPanelToolLayout from "@/components/layout/TwoPanelToolLayout";
import { Button } from "@/components/ui/button";
import { SelectWithOptions } from "@/components/ui/select";
import { useTabInput } from "@/hooks/useTabInput";
import {
  inspectOpenApi,
  type OpenApiEndpoint,
  type OpenApiOutputFormat,
  OPENAPI_FILE_ACCEPT,
  OPENAPI_MIME_TYPE_JSON,
  OPENAPI_MIME_TYPE_YAML,
  OPENAPI_OUTPUT_FILENAME_JSON,
  OPENAPI_OUTPUT_FILENAME_YAML,
  OPENAPI_PLACEHOLDER_INPUT,
  OPENAPI_PLACEHOLDER_OUTPUT,
  OPENAPI_SAMPLE,
} from "@/utils/openapiInspector";

type OpenApiViewMode = "formatted" | "endpoints";
type JsonOutputViewMode = "text" | "tree";

const VIEW_OPTIONS: { value: OpenApiViewMode; label: string }[] = [
  { value: "formatted", label: "Formatted" },
  { value: "endpoints", label: "Endpoints" },
];

const JSON_OUTPUT_VIEW_OPTIONS: { value: JsonOutputViewMode; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "tree", label: "Tree" },
];

const FORMAT_OPTIONS: { value: OpenApiOutputFormat; label: string }[] = [
  { value: "json", label: "JSON" },
  { value: "yaml", label: "YAML" },
];

function endpointSummary(endpoint: OpenApiEndpoint): string {
  const responses = endpoint.responses.length ? endpoint.responses.join(", ") : "no responses";
  const details = [
    endpoint.operationId && `operationId=${endpoint.operationId}`,
    endpoint.tags.length && `tags=${endpoint.tags.join("|")}`,
    endpoint.parameterCount > 0 && `params=${endpoint.parameterCount}`,
    endpoint.hasRequestBody && "requestBody",
    endpoint.deprecated && "deprecated",
    `responses=${responses}`,
  ].filter(Boolean);
  return `${endpoint.method} ${endpoint.path}${endpoint.summary ? ` - ${endpoint.summary}` : ""}${details.length ? ` (${details.join("; ")})` : ""}`;
}

const OpenApiInspectorPage = () => {
  const { input, setInput, toolId } = useTabInput();
  const [indent, setIndent] = useState<IndentOption>(2);
  const [outputFormat, setOutputFormat] = useState<OpenApiOutputFormat>("json");
  const [viewMode, setViewMode] = useState<OpenApiViewMode>("formatted");
  const [jsonOutputViewMode, setJsonOutputViewMode] = useState<JsonOutputViewMode>("tree");
  const [expandAllNonce, setExpandAllNonce] = useState<number | undefined>(undefined);
  const [collapseAllNonce, setCollapseAllNonce] = useState<number | undefined>(undefined);

  const result = useMemo(
    () => inspectOpenApi(input, indent, outputFormat),
    [input, indent, outputFormat]
  );

  const endpointText = useMemo(
    () => result.endpoints.map(endpointSummary).join("\n"),
    [result.endpoints]
  );

  const outputFilename =
    outputFormat === "json" ? OPENAPI_OUTPUT_FILENAME_JSON : OPENAPI_OUTPUT_FILENAME_YAML;
  const outputMimeType =
    outputFormat === "json" ? OPENAPI_MIME_TYPE_JSON : OPENAPI_MIME_TYPE_YAML;
  const trimmedInput = input.trim();
  const inputLanguage = trimmedInput.startsWith("{") || trimmedInput.startsWith("[") ? "json" : "yaml";
  const outputLanguage = outputFormat;
  const stats = result.stats;
  const parsedOutputTree = useMemo<{ ok: boolean; value: unknown }>(() => {
    if (outputFormat !== "json") return { ok: false, value: undefined };
    const text = result.output.trim();
    if (!text) return { ok: false, value: undefined };
    try {
      return { ok: true, value: JSON.parse(text) };
    } catch {
      return { ok: false, value: undefined };
    }
  }, [outputFormat, result.output]);
  const jsonTreeAvailable = viewMode === "formatted" && outputFormat === "json" && parsedOutputTree.ok;
  const resolvedJsonOutputViewMode: JsonOutputViewMode =
    jsonTreeAvailable ? jsonOutputViewMode : "text";
  const onExpandAll = useCallback(() => setExpandAllNonce((n) => (n ?? 0) + 1), []);
  const onCollapseAll = useCallback(() => setCollapseAllNonce((n) => (n ?? 0) + 1), []);

  const topSection =
    trimmedInput && result.isValid === true ? (
      <div className="tool-top-form">
        <ToolAlert
          variant="success"
          message={`${stats?.title || "OpenAPI document"} is valid (${stats?.endpointCount ?? 0} endpoints, ${stats?.schemaCount ?? 0} schemas)`}
          className="w-full"
        />
      </div>
    ) : undefined;

  const outputToolbar = (
    <>
      <SegmentGroup<OpenApiViewMode>
        value={viewMode}
        onValueChange={setViewMode}
        options={VIEW_OPTIONS}
        ariaLabel="OpenAPI output view"
      />
      {viewMode === "formatted" ? (
        <>
          {jsonTreeAvailable ? (
            <>
              <SegmentGroup<JsonOutputViewMode>
                value={resolvedJsonOutputViewMode}
                onValueChange={setJsonOutputViewMode}
                options={JSON_OUTPUT_VIEW_OPTIONS}
                ariaLabel="Formatted JSON view mode"
              />
              {resolvedJsonOutputViewMode === "tree" ? (
                <>
                  <Button
                    type="button"
                    size="xs"
                    variant="ghost"
                    onClick={onExpandAll}
                    title="Expand all nodes"
                    aria-label="Expand all nodes"
                  >
                    <ChevronsUpDown />
                    Expand all
                  </Button>
                  <Button
                    type="button"
                    size="xs"
                    variant="ghost"
                    onClick={onCollapseAll}
                    title="Collapse all nodes"
                    aria-label="Collapse all nodes"
                  >
                    <ChevronsDownUp />
                    Collapse all
                  </Button>
                </>
              ) : null}
            </>
          ) : null}
          <SelectWithOptions<OpenApiOutputFormat>
            size="xs"
            variant="secondary"
            value={outputFormat}
            onValueChange={setOutputFormat}
            options={FORMAT_OPTIONS}
            title="Output format"
            aria-label="Output format"
          />
          <IndentSelect
            value={indent}
            onChange={setIndent}
            includeTab={outputFormat === "json"}
            includeMinified={outputFormat === "json"}
            spaceOptions={[2, 4, 8]}
          />
          {result.output ? (
            <SaveButton
              content={result.output}
              filename={outputFilename}
              mimeType={outputMimeType}
              label="Download"
              title="Download formatted spec"
            />
          ) : null}
        </>
      ) : null}
    </>
  );

  const endpointTable =
    result.endpoints.length > 0 ? (
      <div className="flex-1 min-h-0 overflow-auto">
        <div className="tool-reference-table-wrap">
          <table className="tool-reference-table border-collapse" aria-label="OpenAPI endpoints">
            <thead className="sticky top-0 z-10 border-b border-border bg-muted/60 backdrop-blur-[var(--glass-blur-subtle)]">
              <tr>
                <th className="text-left py-2.5 px-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Method</th>
                <th className="text-left py-2.5 px-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Path</th>
                <th className="text-left py-2.5 px-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Operation</th>
                <th className="text-left py-2.5 px-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Responses</th>
              </tr>
            </thead>
            <tbody>
              {result.endpoints.map((endpoint) => (
                <tr key={`${endpoint.method}-${endpoint.path}-${endpoint.operationId}`} className="border-b border-border/50">
                  <td className="py-2.5 px-3">
                    <code className="text-xs font-mono text-primary">{endpoint.method}</code>
                  </td>
                  <td className="py-2.5 px-3 min-w-[12rem]">
                    <code className="text-[length:var(--text-ui)] font-mono text-foreground break-all">{endpoint.path}</code>
                  </td>
                  <td className="py-2.5 px-3 min-w-[14rem]">
                    <div className="flex flex-col gap-1">
                      <span className="text-[length:var(--text-ui)] text-foreground">
                        {endpoint.summary || endpoint.operationId || "Untitled operation"}
                      </span>
                      <span className="tool-caption">
                        {[
                          endpoint.operationId,
                          endpoint.tags.length ? endpoint.tags.join(", ") : "",
                          endpoint.parameterCount ? `${endpoint.parameterCount} params` : "",
                          endpoint.hasRequestBody ? "request body" : "",
                          endpoint.deprecated ? "deprecated" : "",
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="tool-caption font-mono">
                      {endpoint.responses.length ? endpoint.responses.join(", ") : "none"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ) : (
      <div className="flex-1 min-h-0 flex items-center justify-center rounded-md border border-border bg-muted/20 text-sm text-muted-foreground">
        {input.trim() ? "No endpoints found." : "Paste an OpenAPI or Swagger document to extract endpoints."}
      </div>
    );

  const warnings =
    result.warnings.length > 0 ? (
      <div className="code-block text-xs text-muted-foreground space-y-1 shrink-0">
        {result.warnings.map((warning) => (
          <div key={warning}>Warning: {warning}</div>
        ))}
      </div>
    ) : null;

  return (
    <TwoPanelToolLayout
      persistToolId={toolId}
      shareState={{ input }}
      shareInTitleBar
      topSection={topSection}
      validationErrors={result.errors}
      inputPane={{
        title: "OpenAPI / Swagger",
        inputToolbar: {
          onSample: () => setInput(OPENAPI_SAMPLE),
          setInput,
          fileAccept: OPENAPI_FILE_ACCEPT,
          onFileText: setInput,
        },
        inputEditor: {
          value: input,
          onChange: setInput,
          language: inputLanguage,
          placeholder: OPENAPI_PLACEHOLDER_INPUT,
        },
      }}
      outputPane={{
        title:
          viewMode === "endpoints"
            ? `${result.endpoints.length} endpoint${result.endpoints.length === 1 ? "" : "s"}`
            : "Formatted Spec",
        copyText: viewMode === "endpoints" ? endpointText || undefined : result.output || undefined,
        toolbar: outputToolbar,
        children: (
          <div className="flex flex-col flex-1 min-h-0 gap-2">
            {warnings}
            {viewMode === "formatted" ? (
              resolvedJsonOutputViewMode === "tree" ? (
                <div className="flex-1 min-h-0 flex flex-col">
                  <CodeEditor
                    value=""
                    readOnly
                    language="json"
                    fillHeight
                    customContentNoPad
                    customContent={
                      <JsonTreeView
                        data={parsedOutputTree.value}
                        expandAllNonce={expandAllNonce}
                        collapseAllNonce={collapseAllNonce}
                      />
                    }
                  />
                </div>
              ) : (
                <div className="flex-1 min-h-0 flex flex-col">
                  <CodeEditor
                    value={result.output}
                    readOnly
                    language={outputLanguage}
                    placeholder={OPENAPI_PLACEHOLDER_OUTPUT}
                    fillHeight
                  />
                </div>
              )
            ) : (
              endpointTable
            )}
          </div>
        ),
      }}
    />
  );
};

export default OpenApiInspectorPage;
