import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CopyButton from "@/components/CopyButton";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { formatDateRows, unixToDate, isoToDate, getCommonRefs, setCurrentTimeValues } from "@/utils/timestamp";

const DEFAULT_TITLE = "Epoch Timestamp";
const DEFAULT_DESCRIPTION = "Convert between Unix timestamps and dates";
const UNIX_PLACEHOLDER = "1700000000 or 1700000000000";
const ISO_PLACEHOLDER = "2024-01-01T00:00:00.000Z or Jan 1, 2024";
const EMPTY_UNIX_MSG = "Enter Unix seconds or milliseconds.";
const EMPTY_ISO_MSG = "Enter ISO or locale date string.";
const ROW_CLASS = "flex items-center justify-between gap-2 py-1 border-b border-border/50 last:border-0";
const REF_BUTTON_CLASS = "px-2 py-1 text-xs rounded bg-muted text-muted-foreground hover:text-foreground transition-colors";

function ConversionPanel({
  label,
  copyText,
  value,
  onValueChange,
  placeholder,
  rows,
  emptyMessage,
}: {
  label: string;
  copyText: string;
  value: string;
  onValueChange: (v: string) => void;
  placeholder: string;
  rows: { label: string; value: string }[] | null;
  emptyMessage: string;
}) {
  return (
    <div className="tool-panel flex flex-col flex-1 min-h-0">
      <PanelHeader label={label} text={copyText} />
      <div className="shrink-0">
        <input
          className="input-compact w-full font-mono"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder={placeholder}
        />
      </div>
      <div className="flex-1 min-h-0 overflow-auto mt-3 space-y-2">
        {rows ? (
          rows.map((f) => (
            <div key={f.label} className={ROW_CLASS}>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] text-muted-foreground">{f.label}</div>
                <div className="text-xs font-mono text-foreground truncate">{f.value}</div>
              </div>
              <CopyButton text={f.value} />
            </div>
          ))
        ) : (
          <p className="text-xs text-muted-foreground py-2">{emptyMessage}</p>
        )}
      </div>
    </div>
  );
}

const TimestampPage = () => {
  const tool = useCurrentTool();
  const [unix, setUnix] = useState("");
  const [iso, setIso] = useState("");
  const [now, setNow] = useState(Date.now());
  const [live, setLive] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

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
    <ToolLayout title={tool?.label ?? DEFAULT_TITLE} description={tool?.description ?? DEFAULT_DESCRIPTION}>
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
          <Button size="xs" variant="outline" onClick={setCurrentTime}>
            <RefreshCw className="h-3 w-3 mr-1" /> Use Now
          </Button>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Label className="text-xs text-muted-foreground shrink-0">Ref</Label>
            {commonRefs.map((ref) => (
              <button
                key={ref.label}
                onClick={() => setUnix(String(ref.ts))}
                className={REF_BUTTON_CLASS}
              >
                {ref.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 tool-content-grid flex-1 min-h-0">
          <ConversionPanel
            label="Timestamp → Date"
            copyText={unix}
            value={unix}
            onValueChange={setUnix}
            placeholder={UNIX_PLACEHOLDER}
            rows={convertedFromUnix ? formatDateRows(convertedFromUnix) : null}
            emptyMessage={EMPTY_UNIX_MSG}
          />
          <ConversionPanel
            label="Date → Timestamp"
            copyText={iso}
            value={iso}
            onValueChange={setIso}
            placeholder={ISO_PLACEHOLDER}
            rows={convertedFromIso ? formatDateRows(convertedFromIso) : null}
            emptyMessage={EMPTY_ISO_MSG}
          />
        </div>
      </div>
    </ToolLayout>
  );
};

export default TimestampPage;
