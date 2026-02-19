import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import CodeEditor from "@/components/CodeEditor";
import PanelHeader from "@/components/PanelHeader";
import { Button } from "@/components/ui/button";
import FileUploadButton from "@/components/FileUploadButton";
import { ClearButton, SampleButton } from "@/components/ToolActionButtons";

const SAMPLE_INPUT = "banana\napple\ncherry\napple\nbanana";

const ListCollatorPage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "none">("asc");
  const [removeDuplicates, setRemoveDuplicates] = useState(true);
  const [trimLines, setTrimLines] = useState(true);
  const [removeEmpty, setRemoveEmpty] = useState(true);

  const process = () => {
    let lines = input.split("\n");
    if (trimLines) lines = lines.map((l) => l.trim());
    if (removeEmpty) lines = lines.filter((l) => l.length > 0);
    if (removeDuplicates) lines = [...new Set(lines)];
    if (sortOrder === "asc") lines.sort((a, b) => a.localeCompare(b));
    if (sortOrder === "desc") lines.sort((a, b) => b.localeCompare(a));
    setOutput(lines.join("\n"));
  };

  const count = output ? output.split("\n").filter(Boolean).length : 0;

  return (
    <ToolLayout title={tool?.label ?? "List Collator"} description={tool?.description ?? "Merge, sort, and deduplicate lists"}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader
            label="Input (one item per line)"
            extra={
              <div className="flex items-center gap-2">
                <SampleButton onClick={() => setInput(SAMPLE_INPUT)} />
                <ClearButton onClick={() => setInput("")} />
                <FileUploadButton accept=".txt,text/plain,.csv,text/csv" onText={setInput} />
              </div>
            }
          />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={input} onChange={setInput} language="text" placeholder="banana&#10;apple&#10;cherry&#10;apple&#10;banana" fillHeight />
          </div>
        </div>
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader
            label={count > 0 ? `Output (${count} items)` : "Output"}
            text={output}
            extra={
              <div className="flex items-center gap-2 flex-wrap">
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
                  <input type="checkbox" checked={removeDuplicates} onChange={(e) => setRemoveDuplicates(e.target.checked)} className="rounded border-input" /> Dedupe
                </label>
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
                  <input type="checkbox" checked={trimLines} onChange={(e) => setTrimLines(e.target.checked)} className="rounded border-input" /> Trim
                </label>
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
                  <input type="checkbox" checked={removeEmpty} onChange={(e) => setRemoveEmpty(e.target.checked)} className="rounded border-input" /> No empty
                </label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as "asc" | "desc" | "none")}
                  className="h-7 rounded border border-input bg-background pl-2 pr-6 text-xs min-w-0"
                >
                  <option value="asc">A→Z</option>
                  <option value="desc">Z→A</option>
                  <option value="none">No sort</option>
                </select>
                <Button size="sm" className="h-7 text-xs" onClick={process}>Process</Button>
              </div>
            }
          />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={output || ""} readOnly language="text" placeholder="Result..." fillHeight />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default ListCollatorPage;
