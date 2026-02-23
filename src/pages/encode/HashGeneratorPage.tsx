import { useState, useEffect } from "react";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import CodeEditor from "@/components/CodeEditor";
import CopyButton from "@/components/CopyButton";
import { hashText, type HashAlgorithm } from "@/utils/crypto";

const ALGOS: HashAlgorithm[] = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];
const SAMPLE_INPUT = "Hello, world!";
const HASH_FILE_ACCEPT = ".txt,text/plain";

const HashGeneratorPage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState("");
  const [results, setResults] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!input) {
      setResults({});
      return;
    }
    let cancelled = false;
    Promise.all(ALGOS.map(async (a) => [a, await hashText(input, a)] as const)).then((entries) => {
      if (!cancelled) setResults(Object.fromEntries(entries));
    });
    return () => {
      cancelled = true;
    };
  }, [input]);

  const allHashes = ALGOS.map((a) => `${a}: ${results[a] || ""}`).join("\n");
  const hasResults = Object.keys(results).length > 0;

  return (
    <TwoPanelToolLayout
      tool={tool}
      title={tool?.label ?? "Message Digester"}
      description={tool?.description ?? "MD5, SHA-1, SHA-256 hashes"}
      inputPane={{
        title: "Input",
        inputToolbar: {
          onSample: () => setInput(SAMPLE_INPUT),
          setInput,
          fileAccept: HASH_FILE_ACCEPT,
          onFileText: setInput,
        },
        inputEditor: {
          value: input,
          onChange: setInput,
          language: "text",
          placeholder: "Enter text to hash...",
        },
      }}
      outputPane={{
        title: "Hashes",
        copyText: hasResults ? allHashes : undefined,
        children: hasResults ? (
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
          <CodeEditor value="" readOnly language="text" placeholder="Hashes will appear here..." fillHeight />
        ),
      }}
    />
  );
};

export default HashGeneratorPage;
