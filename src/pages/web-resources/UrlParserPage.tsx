import { useState, useMemo } from "react";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolPane from "@/components/layout/ToolPane";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CopyButton from "@/components/common/CopyButton";
import FileUploadButton from "@/components/common/FileUploadButton";
import { ClearButton } from "@/components/common/ClearButton";
import { SampleButton } from "@/components/common/SampleButton";

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
      <div className="toolbar-actions-row">
        <SampleButton onClick={() => setInput(SAMPLE_URL)} />
        <ClearButton onClick={() => setInput("")} />
        <FileUploadButton accept=".txt,text/plain" onText={setInput} />
      </div>
    ),
    children: (
      <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-auto">
        <div className="shrink-0">
          <Label className="tool-field-label">URL</Label>
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
            <div className="tool-reference-table-wrap shrink-0">
              <table className="tool-reference-table">
                <tbody>
                  {rows.map(([label, value]) => (
                    <tr key={label}>
                      <td className="w-32">{label}</td>
                      <td className="font-mono break-all">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {parsed.params.length > 0 && (
              <div className="shrink-0">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="tool-caption font-medium">
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
                <div className="tool-reference-table-wrap">
                  <table className="tool-reference-table">
                    <thead>
                      <tr>
                        <th>Key</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsed.params.map(([k, v]: [string, string], i: number) => (
                        <tr key={i}>
                          <td className="font-mono text-primary">{k}</td>
                          <td className="font-mono break-all">{v}</td>
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
