import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import ToolPane from "@/components/ToolPane";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CopyButton from "@/components/CopyButton";
import FileUploadButton from "@/components/FileUploadButton";
import { ClearButton } from "@/components/ClearButton";
import { SampleButton } from "@/components/SampleButton";

const SAMPLE_URL = "https://example.com:8080/api/users?page=1&limit=10&sort=name#section-2";

const UrlParserPage = () => {
  const [input, setInput] = useState(SAMPLE_URL);

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
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }, [input]);

  const rows =
    parsed && !parsed.error
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

  const pane = {
    title: "URL Parser",
    toolbar: (
      <>
        <SampleButton onClick={() => setInput(SAMPLE_URL)} />
        <ClearButton onClick={() => setInput("")} />
        <FileUploadButton accept=".txt,text/plain" onText={setInput} />
      </>
    ),
    children: (
      <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-auto">
        <div className="shrink-0">
          <Label className="text-xs text-muted-foreground mb-1 block">URL</Label>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="https://example.com/path?key=value#hash"
            className="font-mono text-sm"
          />
        </div>
        {parsed?.error && (
          <div className="text-sm text-destructive shrink-0">⚠ {parsed.error}</div>
        )}
        {rows.length > 0 && (
          <>
            <div className="border border-border rounded-md overflow-hidden shrink-0">
              <table className="w-full text-sm">
                <tbody>
                  {rows.map(([label, value]) => (
                    <tr key={label} className="border-b border-border last:border-0">
                      <td className="px-3 py-2 text-muted-foreground font-medium w-32">
                        {label}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs break-all">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {parsed.params.length > 0 && (
              <div className="shrink-0">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xs text-muted-foreground font-medium">
                    Query Parameters ({parsed.params.length})
                  </h3>
                  <CopyButton
                    text={JSON.stringify(
                      Object.fromEntries(parsed.params),
                      null,
                      2
                    )}
                  />
                </div>
                <div className="border border-border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="px-3 py-1.5 text-left text-xs text-muted-foreground">
                          Key
                        </th>
                        <th className="px-3 py-1.5 text-left text-xs text-muted-foreground">
                          Value
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsed.params.map(([k, v]: [string, string], i: number) => (
                        <tr
                          key={i}
                          className="border-b border-border last:border-0"
                        >
                          <td className="px-3 py-1.5 font-mono text-xs text-primary">
                            {k}
                          </td>
                          <td className="px-3 py-1.5 font-mono text-xs break-all">
                            {v}
                          </td>
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
    ),
  };

  return (
    <ToolLayout>
      <div className="tool-content-stack flex-1 min-h-0 flex flex-col">
        <ToolPane pane={pane} />
      </div>
    </ToolLayout>
  );
};

export default UrlParserPage;
