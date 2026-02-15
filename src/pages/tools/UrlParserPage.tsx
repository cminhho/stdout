import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import CodeEditor from "@/components/CodeEditor";
import CopyButton from "@/components/CopyButton";

const UrlParserPage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState("https://example.com:8080/api/users?page=1&limit=10&sort=name#section-2");

  const parsed = useMemo(() => {
    if (!input.trim()) return null;
    try {
      const url = new URL(input);
      const params = Array.from(url.searchParams.entries());
      return {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port || "(default)",
        pathname: url.pathname,
        search: url.search,
        hash: url.hash,
        origin: url.origin,
        params,
        error: null,
      };
    } catch (e: any) {
      return { error: e.message } as any;
    }
  }, [input]);

  const rows = parsed && !parsed.error
    ? [
        ["Protocol", parsed.protocol],
        ["Hostname", parsed.hostname],
        ["Port", parsed.port],
        ["Pathname", parsed.pathname],
        ["Search", parsed.search || "(none)"],
        ["Hash", parsed.hash || "(none)"],
        ["Origin", parsed.origin],
      ]
    : [];

  return (
    <ToolLayout title={tool?.label ?? "URL Parser"} description={tool?.description ?? "Parse and inspect URL / query string"}>
      <div className="tool-card space-y-4">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">URL</label>
          <div className="h-10 min-h-0">
            <CodeEditor value={input} onChange={setInput} language="plaintext" placeholder="https://example.com/path?key=value#hash" showLineNumbers={false} fillHeight />
          </div>
        </div>

        {parsed?.error && <div className="text-sm text-destructive">⚠ {parsed.error}</div>}

        {rows.length > 0 && (
          <>
            <div className="border border-border rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {rows.map(([label, value]) => (
                    <tr key={label} className="border-b border-border last:border-0">
                      <td className="px-3 py-2 text-muted-foreground font-medium w-32">{label}</td>
                      <td className="px-3 py-2 font-mono text-xs">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {parsed.params.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xs text-muted-foreground">Query Parameters ({parsed.params.length})</h3>
                  <CopyButton text={JSON.stringify(Object.fromEntries(parsed.params), null, 2)} />
                </div>
                <div className="border border-border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border bg-muted/30"><th className="px-3 py-1.5 text-left text-xs text-muted-foreground">Key</th><th className="px-3 py-1.5 text-left text-xs text-muted-foreground">Value</th></tr></thead>
                    <tbody>
                      {parsed.params.map(([k, v]: [string, string], i: number) => (
                        <tr key={i} className="border-b border-border last:border-0">
                          <td className="px-3 py-1.5 font-mono text-xs text-primary">{k}</td>
                          <td className="px-3 py-1.5 font-mono text-xs">{v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ToolLayout>
  );
};

export default UrlParserPage;
