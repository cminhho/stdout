import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import CodeEditor from "@/components/CodeEditor";
import PanelHeader from "@/components/PanelHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClearButton } from "@/components/ClearButton";

const WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
  "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
  "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint",
  "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia",
  "deserunt", "mollit", "anim", "id", "est", "laborum", "viverra", "maecenas",
  "accumsan", "lacus", "vel", "facilisis", "volutpat", "vitae", "sapien",
  "pellentesque", "habitant", "morbi", "tristique", "senectus", "netus",
  "malesuada", "fames", "turpis", "egestas", "pharetra",
];

const randomWord = () => WORDS[Math.floor(Math.random() * WORDS.length)];

const generateSentence = (minWords = 6, maxWords = 14): string => {
  const count = minWords + Math.floor(Math.random() * (maxWords - minWords + 1));
  const words = Array.from({ length: count }, randomWord);
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return words.join(" ") + ".";
};

const generateParagraph = (sentences = 5): string =>
  Array.from({ length: sentences }, () => generateSentence()).join(" ");

const LoremIpsumPage = () => {
  const tool = useCurrentTool();
  const [count, setCount] = useState(3);
  const [unit, setUnit] = useState<"paragraphs" | "sentences" | "words">("paragraphs");
  const [output, setOutput] = useState("");

  const generate = useCallback(() => {
    if (unit === "paragraphs") {
      setOutput(Array.from({ length: count }, () => generateParagraph()).join("\n\n"));
    } else if (unit === "sentences") {
      setOutput(Array.from({ length: count }, () => generateSentence()).join(" "));
    } else {
      setOutput(Array.from({ length: count }, randomWord).join(" ") + ".");
    }
  }, [count, unit]);

  const wordCount = output ? output.split(/\s+/).filter(Boolean).length : 0;

  return (
    <ToolLayout title={tool?.label ?? "Lorem Ipsum"} description={tool?.description ?? "Generate placeholder text"}>
      <div className="flex flex-col flex-1 min-h-0 w-full tool-content-stack">
        <div className="tool-panel flex flex-col flex-1 min-h-0">
          <PanelHeader
            label={output ? `${wordCount} words` : "Output"}
            text={output}
            extra={
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Label className="text-xs text-muted-foreground shrink-0">Count</Label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={count}
                    onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
                    className="h-7 w-14 font-mono text-xs"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <Label className="text-xs text-muted-foreground shrink-0">Unit</Label>
                  <Select value={unit} onValueChange={(v) => setUnit(v as typeof unit)}>
                    <SelectTrigger variant="secondary" size="xs" className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paragraphs">Paragraphs</SelectItem>
                      <SelectItem value="sentences">Sentences</SelectItem>
                      <SelectItem value="words">Words</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button size="xs" className="h-7 text-xs" onClick={generate}>Generate</Button>
                {output ? <ClearButton onClick={() => setOutput("")} /> : null}
              </div>
            }
          />
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <CodeEditor
              value={output}
              readOnly
              language="text"
              placeholder="Click Generate to create placeholder text..."
              fillHeight
              showLineNumbers={false}
            />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default LoremIpsumPage;
