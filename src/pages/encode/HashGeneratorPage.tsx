import { useState, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import CopyButton from "@/components/CopyButton";
import { FileCode, Eraser } from "lucide-react";
import { hashText, type HashAlgorithm } from "@/utils/crypto";

const ALGOS: HashAlgorithm[] = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];
const SAMPLE_INPUT = "Hello, world!";

const HashGeneratorPage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState("");
  const [results, setResults] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!input) { setResults({}); return; }
    let cancelled = false;
    Promise.all(ALGOS.map(async (a) => [a, await hashText(input, a)] as const)).then((entries) => {
      if (!cancelled) setResults(Object.fromEntries(entries));
    });
    return () => { cancelled = true; };
  }, [input]);

  const allHashes = ALGOS.map((a) => `${a}: ${results[a] || ""}`).join("\n");

  return (
    <ToolLayout title={tool?.label ?? "Message Digester"} description={tool?.description ?? "MD5, SHA-1, SHA-256 hashes"}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader
            label="Input"
            extra={
              <div className="flex items-center gap-2">
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setInput(SAMPLE_INPUT)}>
                  <FileCode className="h-3.5 w-3.5 mr-1.5" />
                  Sample
                </Button>
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setInput("")}>
                  <Eraser className="h-3.5 w-3.5 mr-1.5" />
                  Clear
                </Button>
              </div>
            }
          />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={input} onChange={setInput} language="text" placeholder="Enter text to hash..." fillHeight />
          </div>
        </div>
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader label="Hashes" text={allHashes} />
          {Object.keys(results).length > 0 ? (
            <div className="space-y-3 flex-1 min-h-0 overflow-auto">
              {ALGOS.map((algo) => (
                <div key={algo} className="tool-card space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{algo}</label>
                    <CopyButton text={results[algo] ?? ""} />
                  </div>
                  <pre className="code-block text-xs break-all">{results[algo]}</pre>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 min-h-0 flex flex-col">
              <CodeEditor value="" readOnly language="text" placeholder="Hashes will appear here..." fillHeight />
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
};

export default HashGeneratorPage;
