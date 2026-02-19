import { useState, useRef, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { Upload, FileCode, Eraser } from "lucide-react";
import { jsBeautify } from "@/utils/beautifier";
import { jsMinify } from "@/utils/minify";

type IndentOption = "2" | "4" | "tab" | "minified";

const SAMPLE_JS = `function greet(name) {
  return "Hello, " + name + "!";
}

const users = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
];

users.forEach((u) => {
  console.log(greet(u.name));
});

export { greet, users };
`;

const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") resolve(result);
      else reject(new Error("Failed to read file"));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file, "UTF-8");
  });
};

const selectClass = "h-7 rounded border border-input bg-background pl-2 pr-6 text-xs min-w-0";

const JsFormatterPage = () => {
  const tool = useCurrentTool();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState("function foo(){const a=1;return a+1;}");
  const [output, setOutput] = useState("");
  const [indentOption, setIndentOption] = useState<IndentOption>("2");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!input.trim()) {
      setOutput("");
      return;
    }
    if (indentOption === "minified") {
      setLoading(true);
      setOutput("");
      let cancelled = false;
      jsMinify(input)
        .then((result) => {
          if (!cancelled) setOutput(result);
        })
        .catch((err) => {
          if (!cancelled) setOutput(`Error: ${err instanceof Error ? err.message : String(err)}`);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }
    setLoading(true);
    setOutput("");
    let cancelled = false;
    const indentNum = indentOption === "tab" ? 2 : Number(indentOption);
    const useTabs = indentOption === "tab";
    jsBeautify(input, indentNum, useTabs)
      .then((formatted) => {
        if (!cancelled) setOutput(formatted);
      })
      .catch((err) => {
        if (!cancelled) setOutput(`Error: ${err instanceof Error ? err.message : String(err)}`);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [input, indentOption]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await readFileAsText(file);
      setInput(text);
    } catch {
      setInput("");
    }
    e.target.value = "";
  };

  const inputExtra = (
    <div className="flex items-center gap-2 flex-wrap">
      <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setInput(SAMPLE_JS)}>
        <FileCode className="h-3.5 w-3.5 mr-1.5" />
        Sample
      </Button>
      <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setInput("")}>
        <Eraser className="h-3.5 w-3.5 mr-1.5" />
        Clear
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".js,.mjs,.cjs,text/javascript"
        className="hidden"
        onChange={handleFileUpload}
      />
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-7 text-xs"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-3.5 w-3.5 mr-1.5" />
        Upload
      </Button>
    </div>
  );

  const outputExtra = (
    <div className="flex items-center gap-2">
      <select
        value={indentOption}
        onChange={(e) => setIndentOption(e.target.value as IndentOption)}
        className={selectClass}
        title="Indentation"
      >
        <option value="2">2 spaces</option>
        <option value="4">4 spaces</option>
        <option value="tab">1 tab</option>
        <option value="minified">Minified</option>
      </select>
    </div>
  );

  return (
    <ToolLayout title={tool?.label ?? "JS Beautifier/Minifier"} description={tool?.description ?? "Beautify or minify JavaScript"}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader label="Input" extra={inputExtra} />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={input} onChange={setInput} language="javascript" placeholder="Paste JavaScript..." fillHeight />
          </div>
        </div>
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader label="Output" text={output} extra={outputExtra} />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor
              value={output}
              readOnly
              language="javascript"
              placeholder={loading ? "Processing…" : "Result..."}
              fillHeight
            />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default JsFormatterPage;
