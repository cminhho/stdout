import { useState, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import CopyButton from "@/components/CopyButton";
import { hashText, type HashAlgorithm } from "@/core-utils/crypto";

const ALGOS: HashAlgorithm[] = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];

const HashGenerator = () => {
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="tool-panel">
          <PanelHeader label="Input" text={input} onClear={() => setInput("")} />
          <CodeEditor value={input} onChange={setInput} language="text" placeholder="Enter text to hash..." />
        </div>
        <div className="tool-panel">
          <PanelHeader label="Hashes" text={allHashes} />
          {Object.keys(results).length > 0 ? (
            <div className="space-y-3 flex-1">
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
            <CodeEditor value="" readOnly language="text" placeholder="Hashes will appear here..." />
          )}
        </div>
      </div>
    </ToolLayout>
  );
};

export default HashGenerator;
