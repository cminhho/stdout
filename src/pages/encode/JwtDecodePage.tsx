import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { FileCode, Eraser } from "lucide-react";
import IndentSelect, { type IndentOption } from "@/components/IndentSelect";

const selectClass = "h-7 rounded border border-input bg-background pl-2 pr-6 text-xs min-w-0";

const decodeBase64 = (s: string) => decodeURIComponent(escape(atob(s)));

const decodeJwt = (token: string) => {
  const parts = token.trim().split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT format (expected 3 parts)");
  const fix = (s: string) => s.replace(/-/g, "+").replace(/_/g, "/");
  const header = JSON.parse(decodeBase64(fix(parts[0])));
  const payload = JSON.parse(decodeBase64(fix(parts[1])));
  return { header, payload };
};

const SAMPLE_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

const JwtDecodePage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState("");
  const [indent, setIndent] = useState<IndentOption>(2);

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: "" };
    try {
      const result = decodeJwt(input);
      const space = indent === "minified" ? undefined : indent === "tab" ? "\t" : (indent as number);
      return { output: JSON.stringify(result, null, space), error: "" };
    } catch (e) {
      return { output: "", error: (e as Error).message };
    }
  }, [input, indent]);

  return (
    <ToolLayout title={tool?.label ?? "JWT Debugger"} description={tool?.description ?? "Decode and inspect JWT tokens"}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader
            label="JWT Token"
            extra={
              <div className="flex items-center gap-2">
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setInput(SAMPLE_JWT)}>
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
            <CodeEditor value={input} onChange={setInput} language="text" placeholder="eyJhbGciOiJIUzI1NiIs..." fillHeight />
          </div>
        </div>
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader label="Decoded" text={output} extra={<IndentSelect value={indent} onChange={setIndent} className={selectClass} />} />
          {error ? (
            <div className="code-block text-destructive flex-1 min-h-0 overflow-auto">{error}</div>
          ) : (
            <div className="flex-1 min-h-0 flex flex-col">
              <CodeEditor value={output} readOnly language="json" placeholder="Paste a JWT token to auto-decode..." fillHeight />
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
};

export default JwtDecodePage;
