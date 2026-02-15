import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";

const decodeBase64 = (s: string) => decodeURIComponent(escape(atob(s)));

const decodeJwt = (token: string) => {
  const parts = token.trim().split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT format (expected 3 parts)");
  const fix = (s: string) => s.replace(/-/g, "+").replace(/_/g, "/");
  const header = JSON.parse(decodeBase64(fix(parts[0])));
  const payload = JSON.parse(decodeBase64(fix(parts[1])));
  return { header, payload };
};

const JwtDecodePage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: "" };
    try {
      const result = decodeJwt(input);
      return { output: JSON.stringify(result, null, 2), error: "" };
    } catch (e) {
      return { output: "", error: (e as Error).message };
    }
  }, [input]);

  return (
    <ToolLayout title={tool?.label ?? "JWT Debugger"} description={tool?.description ?? "Decode and inspect JWT tokens"}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="tool-panel">
          <PanelHeader label="JWT Token" text={input} onClear={() => setInput("")} />
          <CodeEditor value={input} onChange={setInput} language="text" placeholder="eyJhbGciOiJIUzI1NiIs..." />
        </div>
        <div className="tool-panel">
          <PanelHeader label="Decoded" text={output} />
          {error ? (
            <CodeEditor value={error} readOnly language="text" placeholder="" />
          ) : (
            <CodeEditor value={output} readOnly language="json" placeholder="Paste a JWT token to auto-decode..." />
          )}
        </div>
      </div>
    </ToolLayout>
  );
};

export default JwtDecodePage;
