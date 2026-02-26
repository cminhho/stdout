import { useState, useMemo } from "react";
import TwoPanelToolLayout from "@/components/layout/TwoPanelToolLayout";
import CodeEditor from "@/components/common/CodeEditor";
import CopyButton from "@/components/common/CopyButton";
import FileUploadButton from "@/components/common/FileUploadButton";
import { ClearButton } from "@/components/common/ClearButton";
import { SampleButton } from "@/components/common/SampleButton";

const SAMPLE_A = "line one\nline two\nline three";
const SAMPLE_B = "line one\nline two modified\nline three\nline four";

const TextDiffPage = () => {
  const [textA, setTextA] = useState("");
  const [textB, setTextB] = useState("");

  const diff = useMemo(() => {
    if (!textA.trim() && !textB.trim()) return [];
    const linesA = textA.split("\n");
    const linesB = textB.split("\n");
    const maxLen = Math.max(linesA.length, linesB.length);
    const result: { line: number; type: "same" | "removed" | "added" | "changed"; a?: string; b?: string }[] = [];
    for (let i = 0; i < maxLen; i++) {
      const la = linesA[i];
      const lb = linesB[i];
      if (la === undefined) result.push({ line: i + 1, type: "added", b: lb });
      else if (lb === undefined) result.push({ line: i + 1, type: "removed", a: la });
      else if (la === lb) result.push({ line: i + 1, type: "same", a: la });
      else result.push({ line: i + 1, type: "changed", a: la, b: lb });
    }
    return result;
  }, [textA, textB]);

  const diffText = diff
    .filter((d) => d.type !== "same")
    .map((d) => {
      if (d.type === "removed") return `- ${d.a}`;
      if (d.type === "added") return `+ ${d.b}`;
      return `- ${d.a}\n+ ${d.b}`;
    })
    .join("\n");

  const hasDiffs = diff.some((d) => d.type !== "same");

  return (
    <TwoPanelToolLayout
      inputPane={{
        title: "Original",
        inputToolbar: {
          onSample: () => setTextA(SAMPLE_A),
          setInput: setTextA,
          fileAccept: ".txt,text/plain",
          onFileText: setTextA,
        },
        inputEditor: {
          value: textA,
          onChange: setTextA,
          language: "text",
          placeholder: "Original text...",
        },
      }}
      outputPane={{
        title: "Modified",
        toolbar: (
          <>
            <SampleButton onClick={() => setTextB(SAMPLE_B)} />
            <ClearButton onClick={() => setTextB("")} />
            <FileUploadButton accept=".txt,text/plain" onText={setTextB} />
          </>
        ),
        children: (
          <div className="flex flex-col flex-1 min-h-0 gap-4">
            <div className="flex-1 min-h-0 overflow-hidden">
              <CodeEditor
                value={textB}
                onChange={setTextB}
                language="text"
                placeholder="Modified text..."
                fillHeight
              />
            </div>
            {diff.length > 0 && (
              <div className="flex flex-col flex-shrink-0 min-h-0 overflow-auto">
                <div className="flex items-center justify-between mb-2 shrink-0">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Diff Result{" "}
                    {hasDiffs ? `(${diff.filter((d) => d.type !== "same").length} changes)` : "(identical)"}
                  </span>
                  {diffText && <CopyButton text={diffText} />}
                </div>
                <div className="code-block space-y-0 max-h-[40vh] overflow-y-auto">
                  {diff.map((d) => (
                    <div
                      key={d.line}
                      className={`font-mono text-xs px-2 py-0.5 ${
                        d.type === "same"
                          ? ""
                          : d.type === "removed"
                            ? "bg-destructive/10 text-destructive"
                            : d.type === "added"
                              ? "bg-primary/10 text-primary"
                              : "bg-accent/10 text-accent-foreground"
                      }`}
                    >
                      <span className="text-muted-foreground w-8 inline-block">{d.line}</span>
                      {d.type === "same" && <span>  {d.a}</span>}
                      {d.type === "removed" && <span>- {d.a}</span>}
                      {d.type === "added" && <span>+ {d.b}</span>}
                      {d.type === "changed" && (
                        <>
                          <span className="block">- {d.a}</span>
                          <span className="block">+ {d.b}</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ),
      }}
    />
  );
};

export default TextDiffPage;
