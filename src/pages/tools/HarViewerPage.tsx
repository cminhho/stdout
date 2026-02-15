import { useState, useRef, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface HarEntry {
  startedDateTime: string;
  request: { method: string; url: string; headers: { name: string; value: string }[] };
  response: { status: number; statusText: string; content: { size: number; mimeType: string }; headers: { name: string; value: string }[] };
  time: number;
}

const HarViewerPage = () => {
  const tool = useCurrentTool();
  const [entries, setEntries] = useState<HarEntry[]>([]);
  const [selected, setSelected] = useState<HarEntry | null>(null);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const har = JSON.parse(reader.result as string);
        setEntries(har.log?.entries || []);
        setError("");
      } catch (err) {
        setError((err as Error).message);
      }
    };
    reader.readAsText(file);
  };

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

  return (
    <ToolLayout title={tool?.label ?? "HAR Viewer"} description={tool?.description ?? "Inspect HAR (HTTP Archive) files"}>
      <div className="space-y-3">
        <div className="flex gap-2 items-center">
          <Button size="xs" onClick={() => fileRef.current?.click()}>
            <Upload className="mr-1" /> Load HAR
          </Button>
          <input ref={fileRef} type="file" accept=".har,.json" onChange={handleFile} className="hidden" />
          {entries.length > 0 && (
            <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter requests..." className="input-compact flex-1 min-w-0 max-w-xs font-mono" />
          )}
          {entries.length > 0 && <span className="text-xs text-muted-foreground">{filtered.length}/{entries.length} requests</span>}
        </div>

        {error && <div className="code-block text-destructive text-xs">⚠ {error}</div>}

        {filtered.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="code-block max-h-[65vh] overflow-y-auto space-y-0.5 p-2">
              {filtered.map((entry, i) => {
                const url = new URL(entry.request.url);
                return (
                  <div key={i} onClick={() => setSelected(entry)} className={`flex items-center gap-2 text-xs font-mono px-2 py-1 rounded cursor-pointer transition-colors ${selected === entry ? "bg-primary/15 text-primary" : "hover:bg-muted"}`}>
                    <span className={`w-10 shrink-0 font-medium ${statusColor(entry.response.status)}`}>{entry.response.status}</span>
                    <span className="w-12 shrink-0 text-muted-foreground">{entry.request.method}</span>
                    <span className="truncate">{url.pathname}{url.search}</span>
                    <span className="ml-auto text-muted-foreground shrink-0">{entry.time.toFixed(0)}ms</span>
                  </div>
                );
              })}
            </div>

            {selected && (
              <div className="code-block max-h-[65vh] overflow-y-auto p-3 space-y-3 text-xs">
                <div>
                  <span className="text-muted-foreground">URL: </span>
                  <span className="text-foreground break-all">{selected.request.url}</span>
                </div>
                <div className="flex gap-4">
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
            )}
          </div>
        )}

        {entries.length === 0 && !error && (
          <div className="tool-card text-center py-12 text-sm text-muted-foreground">
            Upload a .har file to inspect HTTP requests
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default HarViewerPage;
