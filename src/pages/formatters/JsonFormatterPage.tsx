import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import CodeEditor from "@/components/CodeEditor";
import ResizableTwoPanel from "@/components/ResizableTwoPanel";
import { SampleButton, ClearButton, SaveButton } from "@/components/ToolActionButtons";
import FileUploadButton from "@/components/FileUploadButton";
import IndentSelect, { type IndentOption } from "@/components/IndentSelect";
import { processJsonInput } from "@/utils/jsonFormat";
import { cn } from "@/utils/cn";

const selectClass = "h-7 rounded border border-input bg-background pl-2 pr-6 text-xs min-w-0";

const SAMPLE_JSON = `{
  "name": "Sample",
  "version": "1.0",
  "items": [
    { "id": 1, "label": "One" },
    { "id": 2, "label": "Two" }
  ],
  "active": true
}`;

const STAT_LABELS: (keyof NonNullable<ReturnType<typeof processJsonInput>["stats"]>)[] = [
  "keys",
  "depth",
  "objects",
  "arrays",
  "size",
];

const JsonFormatterPage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState("");
  const [indent, setIndent] = useState<IndentOption>(4);

  const { output, errors, stats, isValid } = useMemo(
    () => processJsonInput(input, indent),
    [input, indent]
  );

  const errorLineSet = useMemo(() => new Set(errors.map((e) => e.line)), [errors]);

  const inputExtra = (
    <div className="flex items-center gap-2 flex-wrap">
      <SampleButton onClick={() => setInput(SAMPLE_JSON)} />
      <ClearButton onClick={() => setInput("")} />
      <FileUploadButton accept=".json,application/json" onText={setInput} />
    </div>
  );

  const outputExtra = (
    <div className="flex items-center gap-2 flex-wrap">
      <IndentSelect value={indent} onChange={setIndent} className={selectClass} />
      {output ? (
        <SaveButton content={output} filename="output.json" mimeType="application/json" />
      ) : null}
    </div>
  );

  return (
    <ToolLayout
      title={tool?.label}
      description={tool?.description}
    >
      {input.trim() && (
        <div className="flex flex-wrap items-center gap-2 text-xs mb-3">
          {isValid !== null && (
            <span
              className={cn(
                "px-2 py-0.5 rounded font-medium",
                isValid ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"
              )}
            >
              {isValid ? "✓ Valid JSON" : `✗ ${errors.length} error${errors.length > 1 ? "s" : ""}`}
            </span>
          )}
          {stats &&
            STAT_LABELS.map((key) => (
              <span key={key} className="px-2 py-0.5 rounded bg-muted text-muted-foreground">
                {key.charAt(0).toUpperCase() + key.slice(1)}:{" "}
                <span className="font-mono font-medium text-foreground">{stats[key]}</span>
              </span>
            ))}
        </div>
      )}

      {errors.length > 0 && (
        <div className="space-y-1.5 max-h-[120px] overflow-y-auto mb-3">
          {errors.map((err, i) => (
            <div key={i} className="rounded-md border border-destructive/30 bg-destructive/5 p-2 text-xs space-y-1">
              <div className="flex gap-2">
                <span className="font-mono text-destructive font-medium shrink-0">
                  Line {err.line}, Col {err.column}
                </span>
                <span className="text-foreground">{err.message}</span>
              </div>
              {err.snippet && (
                <pre className="font-mono text-muted-foreground text-[10px] bg-muted/50 rounded px-2 py-1 overflow-x-auto">
                  {err.snippet}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}

      <ResizableTwoPanel
        left={{
          label: "Input",
          extra: inputExtra,
          children: (
            <CodeEditor
              value={input}
              onChange={setInput}
              language="json"
              placeholder="Paste JSON here..."
              errorLines={errorLineSet}
              fillHeight
            />
          ),
        }}
        right={{
          label: "Result",
          text: output,
          extra: outputExtra,
          children: (
            <CodeEditor
              key={`result-${indent}`}
              value={output}
              readOnly
              language="json"
              placeholder="Result will appear here..."
              fillHeight
            />
          ),
        }}
        defaultLeftPct={50}
      />
    </ToolLayout>
  );
};

export default JsonFormatterPage;
