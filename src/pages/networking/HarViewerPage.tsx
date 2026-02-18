import { useState, useRef, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import { Button } from "@/components/ui/button";
import { Eraser, Upload } from "lucide-react";

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

  const clearHar = () => {
    setEntries([]);
    setSelected(null);
    setError("");
    setFilter("");
  };

  return (
    <ToolLayout title={tool?.label ?? "HAR Viewer"} description={tool?.description ?? "Inspect HAR (HTTP Archive) files"}>
      <input ref={fileRef} type="file" accept=".har,.json" onChange={handleFile} className="hidden" />
      <div className="space-y-3 flex flex-col flex-1 min-h-0">
        <PanelHeader
          label="HAR File"
          extra={
            <div className="flex items-center gap-2">
              <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => fileRef.current?.click()}>
                <Upload className="h-3 w-3 mr-1.5" />
                Load HAR
              </Button>
              {entries.length > 0 && (
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={clearHar}>
                  <Eraser className="h-3.5 w-3.5 mr-1.5" />
                  Clear
                </Button>
              )}
              {entries.length > 0 && (
                <>
                  <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter..." className="input-compact flex-1 min-w-0 max-w-[140px] font-mono h-7" />
                  <span className="text-xs text-muted-foreground shrink-0">{filtered.length}/{entries.length}</span>
                </>
              )}
            </div>
          }
        />

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
