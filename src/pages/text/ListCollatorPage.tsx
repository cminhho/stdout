import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import CopyButton from "@/components/CopyButton";
import CodeEditor from "@/components/CodeEditor";
import PanelHeader from "@/components/PanelHeader";
import { Button } from "@/components/ui/button";

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
        <div className="tool-panel flex flex-col min-h-0 space-y-3">
          <PanelHeader label="Input (one item per line)" text={input} onClear={() => setInput("")} />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={input} onChange={setInput} language="text" placeholder="banana&#10;apple&#10;cherry&#10;apple&#10;banana" fillHeight />
          </div>
          <div className="flex flex-wrap gap-3 items-center shrink-0">
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <input type="checkbox" checked={removeDuplicates} onChange={(e) => setRemoveDuplicates(e.target.checked)} className="rounded" /> Deduplicate
            </label>
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <input type="checkbox" checked={trimLines} onChange={(e) => setTrimLines(e.target.checked)} className="rounded" /> Trim
            </label>
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <input type="checkbox" checked={removeEmpty} onChange={(e) => setRemoveEmpty(e.target.checked)} className="rounded" /> Remove empty
            </label>
          </div>
          <div className="flex gap-2 items-center">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "asc" | "desc" | "none")}
              className="tool-select"
            >
              <option value="asc">Sort A→Z</option>
              <option value="desc">Sort Z→A</option>
              <option value="none">No sort</option>
            </select>
            <Button size="sm" onClick={process}>Process</Button>
          </div>
        </div>
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader label={count > 0 ? `Output (${count} items)` : "Output"} text={output} />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={output || ""} readOnly language="text" placeholder="Result..." fillHeight />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default ListCollatorPage;
