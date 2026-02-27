import { useState, useMemo, useCallback } from "react";
import TwoPanelToolLayout from "@/components/layout/TwoPanelToolLayout";
import { Input } from "@/components/ui/input";

interface HarEntry {
  startedDateTime: string;
  request: { method: string; url: string; headers: { name: string; value: string }[] };
  response: { status: number; statusText: string; content: { size: number; mimeType: string }; headers: { name: string; value: string }[] };
  time: number;
}

const SAMPLE_HAR = JSON.stringify(
  {
    log: {
      entries: [
        {
          startedDateTime: "2024-01-01T00:00:00.000Z",
          request: { method: "GET", url: "https://example.com/", headers: [] },
          response: { status: 200, statusText: "OK", content: { size: 1024, mimeType: "text/html" }, headers: [] },
          time: 100,
        },
      ],
    },
  },
  null,
  2
);

const HarViewerPage = () => {
  const [harText, setHarText] = useState("");
  const [selected, setSelected] = useState<HarEntry | null>(null);
  const [filter, setFilter] = useState("");

  const { entries, error } = useMemo(() => {
    if (!harText.trim()) return { entries: [] as HarEntry[], error: "" };
    try {
      const har = JSON.parse(harText);
      return { entries: har.log?.entries ?? [], error: "" };
    } catch (err) {
      return { entries: [], error: (err as Error).message };
    }
  }, [harText]);

  const filtered = useMemo(() => {
    if (!filter) return entries;
    const q = filter.toLowerCase();
    return entries.filter((e) => e.request.url.toLowerCase().includes(q) || e.request.method.toLowerCase().includes(q));
  }, [entries, filter]);

  const statusColor = (s: number) => {
    if (s < 300) return "text-green-400";
    if (s < 400) return "text-yellow-400";
    return "text-red-400";
  };

  const clearHar = useCallback(() => {
    setHarText("");
    setSelected(null);
    setFilter("");
  }, []);

  return (
    <TwoPanelToolLayout
      inputPane={{
        inputToolbar: {
          onSample: () => setHarText(SAMPLE_HAR),
          setInput: setHarText,
          fileAccept: ".har,.json",
          onFileText: setHarText,
        },
        onClear: clearHar,
        inputEditor: {
          value: harText,
          onChange: setHarText,
          language: "json",
          placeholder: '{"log":{"entries":[]}}',
        },
      }}
      outputPane={{
        title: "Entries",
        toolbar:
          entries.length > 0 ? (
            <>
              <Input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter..."
                className="input-compact flex-1 min-w-0 max-w-[140px] font-mono"
              />
              <span className="tool-caption shrink-0">{filtered.length}/{entries.length}</span>
            </>
          ) : undefined,
        children: (
          <>
            {error && <div className="code-block text-destructive text-xs mb-2">⚠ {error}</div>}
            {entries.length === 0 && !error && (
              <div className="flex-1 min-h-0 flex items-center justify-center rounded-md border border-border bg-muted/20 text-sm text-muted-foreground">
                Paste HAR JSON or upload a .har file to inspect
              </div>
            )}
            {filtered.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 tool-content-grid flex-1 min-h-0">
                <div className="code-block max-h-full overflow-y-auto space-y-0.5 p-2">
                  {filtered.map((entry, i) => {
                    try {
                      const url = new URL(entry.request.url);
                      return (
                        <div
                          key={i}
                          onClick={() => setSelected(entry)}
                          className={`flex items-center gap-2 text-xs font-mono px-2 py-1 rounded cursor-pointer transition-colors ${selected === entry ? "bg-primary/15 text-primary" : "hover:bg-muted"}`}
                        >
                          <span className={`w-10 shrink-0 font-medium ${statusColor(entry.response.status)}`}>{entry.response.status}</span>
                          <span className="w-12 shrink-0 text-muted-foreground">{entry.request.method}</span>
                          <span className="truncate">{url.pathname}{url.search}</span>
                          <span className="ml-auto text-muted-foreground shrink-0">{entry.time.toFixed(0)}ms</span>
                        </div>
                      );
                    } catch {
                      return (
                        <div
                          key={i}
                          onClick={() => setSelected(entry)}
                          className={`flex items-center gap-2 text-xs font-mono px-2 py-1 rounded cursor-pointer transition-colors truncate ${selected === entry ? "bg-primary/15 text-primary" : "hover:bg-muted"}`}
                        >
                          <span className={statusColor(entry.response.status)}>{entry.response.status}</span>
                          <span className="text-muted-foreground">{entry.request.method}</span>
                          <span className="truncate">{entry.request.url}</span>
                        </div>
                      );
                    }
                  })}
                </div>
                {selected ? (
                  <div className="code-block max-h-full overflow-y-auto p-3 space-y-3 text-xs">
                    <div>
                      <span className="text-muted-foreground">URL: </span>
                      <span className="text-foreground break-all">{selected.request.url}</span>
                    </div>
                    <div className="flex gap-4 flex-wrap">
                      <div><span className="text-muted-foreground">Method: </span>{selected.request.method}</div>
                      <div><span className="text-muted-foreground">Status: </span><span className={statusColor(selected.response.status)}>{selected.response.status} {selected.response.statusText}</span></div>
                      <div><span className="text-muted-foreground">Time: </span>{selected.time.toFixed(0)}ms</div>
                      <div><span className="text-muted-foreground">Size: </span>{(selected.response.content.size / 1024).toFixed(1)}KB</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Request Headers:</div>
                      {selected.request.headers.slice(0, 20).map((h, i) => (
                        <div key={i}><span className="text-primary">{h.name}:</span> {h.value}</div>
                      ))}
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Response Headers:</div>
                      {selected.response.headers.slice(0, 20).map((h, i) => (
                        <div key={i}><span className="text-primary">{h.name}:</span> {h.value}</div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center text-sm text-muted-foreground border border-border rounded-md bg-muted/20">
                    Select an entry
                  </div>
                )}
              </div>
            )}
          </>
        ),
      }}
    />
  );
};

export default HarViewerPage;
