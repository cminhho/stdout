import { useState, useRef, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { Upload, FileCode, Eraser } from "lucide-react";

type FileEncoding = "utf-8" | "utf-16le" | "utf-16be";

const readFileAsText = (file: File, encoding: FileEncoding): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        resolve(result);
        return;
      }
      if (result instanceof ArrayBuffer) {
        const enc = encoding === "utf-16le" ? "utf-16le" : encoding === "utf-16be" ? "utf-16be" : "utf-8";
        resolve(new TextDecoder(enc).decode(result));
        return;
      }
      reject(new Error("Failed to read file"));
    };
    reader.onerror = () => reject(reader.error);
    if (encoding === "utf-8") {
      reader.readAsText(file, "UTF-8");
    } else {
      reader.readAsArrayBuffer(file);
    }
  });
};

const selectClass = "h-7 rounded border border-input bg-background pl-2 pr-6 text-xs min-w-0";

const SAMPLE_ENV = "# Database\nDB_HOST=localhost\nDB_PORT=5432\nDB_NAME=myapp\nDB_USER=admin\nDB_PASS=secret123\n\n# API Keys\nAPI_KEY=sk_live_abc123\nSECRET_KEY=whsec_xyz";

const EnvNetlifyPage = () => {
  const tool = useCurrentTool();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileEncoding, setFileEncoding] = useState<FileEncoding>("utf-8");
  const [envInput, setEnvInput] = useState(SAMPLE_ENV);
  const [format, setFormat] = useState<"netlify" | "docker" | "yaml">("netlify");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setEnvInput(await readFileAsText(file, fileEncoding));
    } catch {
      setEnvInput("");
    }
    e.target.value = "";
  };

  const parseEnv = (input: string): [string, string][] => {
    return input.split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("#"))
      .map((l) => {
        const idx = l.indexOf("=");
        if (idx === -1) return null;
        return [l.slice(0, idx).trim(), l.slice(idx + 1).trim().replace(/^["']|["']$/g, "")] as [string, string];
      })
      .filter(Boolean) as [string, string][];
  };

  const toNetlify = (pairs: [string, string][]): string => {
    const lines = ["[build.environment]"];
    pairs.forEach(([k, v]) => lines.push(`  ${k} = "${v}"`));
    return lines.join("\n");
  };

  const toDocker = (pairs: [string, string][]): string => {
    return pairs.map(([k, v]) => `ENV ${k}="${v}"`).join("\n");
  };

  const toYaml = (pairs: [string, string][]): string => {
    const lines = ["env:"];
    pairs.forEach(([k, v]) => lines.push(`  ${k}: "${v}"`));
    return lines.join("\n");
  };

  const output = useMemo(() => {
    const pairs = parseEnv(envInput);
    return format === "netlify" ? toNetlify(pairs) : format === "docker" ? toDocker(pairs) : toYaml(pairs);
  }, [envInput, format]);

  const outputLang = format === "yaml" ? "yaml" as const : "env" as const;

  return (
    <ToolLayout title={tool?.label ?? ".env Converter"} description={tool?.description ?? "Convert .env files to Netlify, Docker, YAML formats"}>
      <div className="tool-toolbar flex flex-wrap items-center gap-3 shrink-0 mb-3">
        <span className="text-xs text-muted-foreground">Output format</span>
        {(["netlify", "docker", "yaml"] as const).map((f) => (
          <Button key={f} size="sm" variant={format === f ? "default" : "outline"} onClick={() => setFormat(f)} className="h-7 text-xs">
            {f === "netlify" ? "netlify.toml" : f === "docker" ? "Dockerfile" : "YAML"}
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader
            label=".env Input"
            extra={
              <div className="flex items-center gap-2 flex-wrap">
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setEnvInput(SAMPLE_ENV)}>
                  <FileCode className="h-3.5 w-3.5 mr-1.5" />
                  Sample
                </Button>
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setEnvInput("")}>
                  <Eraser className="h-3.5 w-3.5 mr-1.5" />
                  Clear
                </Button>
                <input ref={fileInputRef} type="file" accept=".env,.env.*,text/plain" className="hidden" onChange={handleFileUpload} />
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                  Upload
                </Button>
                <select value={fileEncoding} onChange={(e) => setFileEncoding(e.target.value as FileEncoding)} className={selectClass}>
                  <option value="utf-8">UTF-8</option>
                  <option value="utf-16le">UTF-16 LE</option>
                  <option value="utf-16be">UTF-16 BE</option>
                </select>
              </div>
            }
          />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={envInput} onChange={setEnvInput} language="env" placeholder="KEY=value" fillHeight />
          </div>
        </div>
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader label="Output" text={output} />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={output} readOnly language={outputLang} placeholder="Output..." fillHeight />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default EnvNetlifyPage;
