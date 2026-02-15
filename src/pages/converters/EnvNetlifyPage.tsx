import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";

const EnvNetlifyPage = () => {
  const tool = useCurrentTool();
  const [envInput, setEnvInput] = useState('# Database\nDB_HOST=localhost\nDB_PORT=5432\nDB_NAME=myapp\nDB_USER=admin\nDB_PASS=secret123\n\n# API Keys\nAPI_KEY=sk_live_abc123\nSECRET_KEY=whsec_xyz');
  const [format, setFormat] = useState<"netlify" | "docker" | "yaml">("netlify");

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
      <div className="tool-toolbar">
        {(["netlify", "docker", "yaml"] as const).map((f) => (
          <button key={f} onClick={() => setFormat(f)} className={`px-2.5 py-1 text-xs rounded border transition-colors ${format === f ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-secondary"}`}>
            {f === "netlify" ? "netlify.toml" : f === "docker" ? "Dockerfile" : "YAML"}
          </button>
        ))}
      </div>
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
