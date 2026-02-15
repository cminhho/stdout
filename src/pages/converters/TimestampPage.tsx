import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CopyButton from "@/components/CopyButton";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const formatDate = (d: Date) => [
  { label: "ISO 8601", value: d.toISOString() },
  { label: "UTC", value: d.toUTCString() },
  { label: "Local", value: d.toLocaleString() },
  { label: "Unix (s)", value: String(Math.floor(d.getTime() / 1000)) },
  { label: "Unix (ms)", value: String(d.getTime()) },
  { label: "Date", value: d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) },
  { label: "Time", value: d.toLocaleTimeString("en-US", { hour12: true, hour: "2-digit", minute: "2-digit", second: "2-digit" }) },
  { label: "Relative", value: getRelative(d) },
];

function getRelative(d: Date) {
  const diff = Date.now() - d.getTime();
  const abs = Math.abs(diff);
  const suffix = diff > 0 ? "ago" : "from now";
  if (abs < 60000) return `${Math.floor(abs / 1000)}s ${suffix}`;
  if (abs < 3600000) return `${Math.floor(abs / 60000)}m ${suffix}`;
  if (abs < 86400000) return `${Math.floor(abs / 3600000)}h ${suffix}`;
  return `${Math.floor(abs / 86400000)}d ${suffix}`;
}

const TimestampPage = () => {
  const tool = useCurrentTool();
  const [unix, setUnix] = useState("");
  const [iso, setIso] = useState("");
  const [now, setNow] = useState(Date.now());
  const [live, setLive] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (live) {
      intervalRef.current = setInterval(() => setNow(Date.now()), 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [live]);

  const convertedFromUnix = useMemo(() => {
    if (!unix.trim()) return null;
    const ts = Number(unix);
    if (isNaN(ts)) return null;
    const ms = unix.length <= 10 ? ts * 1000 : ts;
    const d = new Date(ms);
    if (isNaN(d.getTime())) return null;
    return d;
  }, [unix]);

  const convertedFromIso = useMemo(() => {
    if (!iso.trim()) return null;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    return d;
  }, [iso]);

  const setCurrentTime = useCallback(() => {
    const n = Date.now();
    setNow(n);
    setUnix(String(Math.floor(n / 1000)));
    setIso(new Date(n).toISOString());
  }, []);

  const commonRefs = useMemo(() => [
    { label: "Y2K", ts: 946684800 },
    { label: "Unix Epoch", ts: 0 },
    { label: "1h ago", ts: Math.floor(Date.now() / 1000) - 3600 },
    { label: "24h ago", ts: Math.floor(Date.now() / 1000) - 86400 },
  ], []);

  return (
    <ToolLayout title={tool?.label ?? "Epoch Timestamp"} description={tool?.description ?? "Convert between Unix timestamps and dates"}>
      <div className="flex flex-col flex-1 min-h-0 w-full gap-4">
        <div className="tool-toolbar flex flex-wrap items-center gap-3 shrink-0">
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
            <input type="checkbox" checked={live} onChange={(e) => setLive(e.target.checked)} className="accent-primary rounded" />
            Live
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Now</span>
            <span className="text-xs font-mono text-foreground">{Math.floor(now / 1000)}</span>
            <span className="text-xs text-muted-foreground">s</span>
          </div>
          <Button size="sm" variant="outline" onClick={setCurrentTime}>
            <RefreshCw className="h-3 w-3 mr-1" /> Use Now
          </Button>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Label className="text-xs text-muted-foreground shrink-0">Ref</Label>
            {commonRefs.map((ref) => (
              <button
                key={ref.label}
                onClick={() => setUnix(String(ref.ts))}
                className="px-2 py-1 text-xs rounded bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                {ref.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
          <div className="tool-panel flex flex-col flex-1 min-h-0">
            <PanelHeader label="Timestamp → Date" text={unix} />
            <div className="shrink-0">
              <input
                className="input-compact w-full font-mono"
                value={unix}
                onChange={(e) => setUnix(e.target.value)}
                placeholder="1700000000 or 1700000000000"
              />
            </div>
            <div className="flex-1 min-h-0 overflow-auto mt-3 space-y-2">
              {convertedFromUnix ? (
                formatDate(convertedFromUnix).map((f) => (
                  <div key={f.label} className="flex items-center justify-between gap-2 py-1 border-b border-border/50 last:border-0">
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] text-muted-foreground">{f.label}</div>
                      <div className="text-xs font-mono text-foreground truncate">{f.value}</div>
                    </div>
                    <CopyButton text={f.value} />
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground py-2">Enter Unix seconds or milliseconds.</p>
              )}
            </div>
          </div>

          <div className="tool-panel flex flex-col flex-1 min-h-0">
            <PanelHeader label="Date → Timestamp" text={iso} />
            <div className="shrink-0">
              <input
                className="input-compact w-full font-mono"
                value={iso}
                onChange={(e) => setIso(e.target.value)}
                placeholder="2024-01-01T00:00:00.000Z or Jan 1, 2024"
              />
            </div>
            <div className="flex-1 min-h-0 overflow-auto mt-3 space-y-2">
              {convertedFromIso ? (
                formatDate(convertedFromIso).map((f) => (
                  <div key={f.label} className="flex items-center justify-between gap-2 py-1 border-b border-border/50 last:border-0">
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] text-muted-foreground">{f.label}</div>
                      <div className="text-xs font-mono text-foreground truncate">{f.value}</div>
                    </div>
                    <CopyButton text={f.value} />
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground py-2">Enter ISO or locale date string.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default TimestampPage;
