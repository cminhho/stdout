import { useState } from "react";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import { SelectWithOptions } from "@/components/ui/select";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import { Button } from "@/components/ui/button";

const SAMPLE_INPUT = "banana\napple\ncherry\napple\nbanana";
const PLACEHOLDER = "banana\napple\ncherry\napple\nbanana";

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
    <TwoPanelToolLayout
      tool={tool}
      inputPane={{
        inputToolbar: {
          onSample: () => setInput(SAMPLE_INPUT),
          setInput,
          fileAccept: ".txt,text/plain,.csv,text/csv",
          onFileText: setInput,
        },
        inputEditor: {
          value: input,
          onChange: setInput,
          language: "text",
          placeholder: PLACEHOLDER,
        },
      }}
      outputPane={{
        title: count > 0 ? `Output (${count} items)` : "Output",
        copyText: output || undefined,
        toolbar: (
          <>
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
              <input type="checkbox" checked={removeDuplicates} onChange={(e) => setRemoveDuplicates(e.target.checked)} className="rounded border-input" /> Dedupe
            </label>
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
              <input type="checkbox" checked={trimLines} onChange={(e) => setTrimLines(e.target.checked)} className="rounded border-input" /> Trim
            </label>
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
              <input type="checkbox" checked={removeEmpty} onChange={(e) => setRemoveEmpty(e.target.checked)} className="rounded border-input" /> No empty
            </label>
            <SelectWithOptions
              size="sm"
              variant="secondary"
              value={sortOrder}
              onValueChange={(v) => setSortOrder(v as "asc" | "desc" | "none")}
              options={[
                { value: "asc", label: "A→Z" },
                { value: "desc", label: "Z→A" },
                { value: "none", label: "No sort" },
              ]}
              title="Sort order"
              aria-label="Sort order"
            />
            <Button size="sm" onClick={process}>Process</Button>
          </>
        ),
        outputEditor: {
          value: output,
          language: "text",
          placeholder: "Result...",
        },
      }}
    />
  );
};

export default ListCollatorPage;
