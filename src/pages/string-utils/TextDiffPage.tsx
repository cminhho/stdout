import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import CopyButton from "@/components/CopyButton";

const TextDiffPage = () => {
  const tool = useCurrentTool();
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

  const hasDiffs = diff.some(d => d.type !== "same");

  return (
    <ToolLayout title={tool?.label ?? "Text Diff"} description={tool?.description ?? "Compare two texts and highlight differences"}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="tool-panel">
          <PanelHeader label="Original" text={textA} onClear={() => setTextA("")} />
          <CodeEditor value={textA} onChange={setTextA} language="text" placeholder="Original text..." />
        </div>
        <div className="tool-panel">
          <PanelHeader label="Modified" text={textB} onClear={() => setTextB("")} />
          <CodeEditor value={textB} onChange={setTextB} language="text" placeholder="Modified text..." />
        </div>
      </div>

      {diff.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Diff Result {hasDiffs ? `(${diff.filter(d => d.type !== "same").length} changes)` : "(identical)"}
            </span>
            {diffText && <CopyButton text={diffText} />}
          </div>
          <div className="code-block space-y-0 max-h-[60vh] overflow-y-auto">
            {diff.map((d) => (
              <div
                key={d.line}
                className={`font-mono text-xs px-2 py-0.5 ${
                  d.type === "same" ? "" :
                  d.type === "removed" ? "bg-destructive/10 text-destructive" :
                  d.type === "added" ? "bg-primary/10 text-primary" :
                  "bg-accent/10 text-accent-foreground"
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
    </ToolLayout>
  );
};

export default TextDiffPage;
