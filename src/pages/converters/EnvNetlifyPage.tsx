import { useState, useRef, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { ToolOptions, OptionField } from "@/components/ToolOptions";

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

const EnvNetlifyPage = () => {
  const tool = useCurrentTool();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [optionsOpen, setOptionsOpen] = useState(true);
  const [fileEncoding, setFileEncoding] = useState<FileEncoding>("utf-8");
  const [envInput, setEnvInput] = useState('# Database\nDB_HOST=localhost\nDB_PORT=5432\nDB_NAME=myapp\nDB_USER=admin\nDB_PASS=secret123\n\n# API Keys\nAPI_KEY=sk_live_abc123\nSECRET_KEY=whsec_xyz');
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
      <ToolOptions open={optionsOpen} onOpenChange={setOptionsOpen}>
        <input ref={fileInputRef} type="file" accept=".env,.env.*,text/plain" className="hidden" onChange={handleFileUpload} />
        <div className="flex flex-col gap-y-2.5 w-full">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <OptionField label="Upload your .env file">
              <Button type="button" size="sm" variant="outline" className="h-7 px-2.5 text-xs" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-3 w-3 mr-1.5" />
                Upload file
              </Button>
            </OptionField>
            <OptionField label="File encoding">
              <select value={fileEncoding} onChange={(e) => setFileEncoding(e.target.value as FileEncoding)} className={selectClass}>
                <option value="utf-8">UTF-8</option>
                <option value="utf-16le">UTF-16 LE</option>
                <option value="utf-16be">UTF-16 BE</option>
              </select>
            </OptionField>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <OptionField label="Output format">
              {(["netlify", "docker", "yaml"] as const).map((f) => (
                <Button key={f} size="sm" variant={format === f ? "default" : "outline"} onClick={() => setFormat(f)} className="h-7 text-xs">
                  {f === "netlify" ? "netlify.toml" : f === "docker" ? "Dockerfile" : "YAML"}
                </Button>
              ))}
            </OptionField>
          </div>
        </div>
      </ToolOptions>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="tool-panel">
          <PanelHeader label=".env Input" text={envInput} onClear={() => setEnvInput("")} />
          <CodeEditor value={envInput} onChange={setEnvInput} language="env" placeholder="KEY=value" />
        </div>
        <div className="tool-panel">
          <PanelHeader label="Output" text={output} />
          <CodeEditor value={output} readOnly language={outputLang} placeholder="Output..." />
        </div>
      </div>
    </ToolLayout>
  );
};

export default EnvNetlifyPage;
