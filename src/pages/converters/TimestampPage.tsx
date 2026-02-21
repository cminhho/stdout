import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CopyButton from "@/components/CopyButton";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { formatDateRows, unixToDate, isoToDate, getCommonRefs, setCurrentTimeValues } from "@/utils/timestamp";

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

  const convertedFromUnix = useMemo(() => unixToDate(unix), [unix]);
  const convertedFromIso = useMemo(() => isoToDate(iso), [iso]);

  const setCurrentTime = useCallback(() => {
    const { now: n, unix: u, iso: i } = setCurrentTimeValues();
    setNow(n);
    setUnix(u);
    setIso(i);
  }, []);

  const commonRefs = useMemo(() => getCommonRefs(), []);

  return (
    <ToolLayout title={tool?.label ?? "Epoch Timestamp"} description={tool?.description ?? "Convert between Unix timestamps and dates"}>
      <div className="flex flex-col flex-1 min-h-0 w-full tool-content-stack">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 tool-content-grid flex-1 min-h-0">
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
                formatDateRows(convertedFromUnix).map((f) => (
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
                formatDateRows(convertedFromIso).map((f) => (
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
