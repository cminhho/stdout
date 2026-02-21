import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClearButton } from "@/components/ClearButton";
import { SampleButton } from "@/components/SampleButton";

const FIELDS = ["minute", "hour", "day", "month", "weekday"] as const;
const LABELS: Record<(typeof FIELDS)[number], string> = {
  minute: "Min (0-59)",
  hour: "Hour (0-23)",
  day: "Day (1-31)",
  month: "Month (1-12)",
  weekday: "WD (0-6)",
};

const PRESETS = [
  { label: "Every minute", value: "* * * * *" },
  { label: "Every hour", value: "0 * * * *" },
  { label: "Every 5 min", value: "*/5 * * * *" },
  { label: "Daily midnight", value: "0 0 * * *" },
  { label: "Mon 9am", value: "0 9 * * 1" },
  { label: "1st of month", value: "0 0 1 * *" },
];

/** Standard 5-field cron examples (minute hour day month weekday). See e.g. FreeFormatter Cron Generator. */
const CRON_EXAMPLES: { expression: string; schedule: string }[] = [
  { expression: "* * * * *", schedule: "Every minute" },
  { expression: "0 * * * *", schedule: "Every hour" },
  { expression: "0 0 * * *", schedule: "Every day at 12:00 AM" },
  { expression: "0 0 * * FRI", schedule: "At 12:00 AM, only on Friday" },
  { expression: "0 0 1 * *", schedule: "At 12:00 AM, on day 1 of the month" },
  { expression: "*/5 * * * *", schedule: "Every 5 minutes" },
  { expression: "0 9 * * 1-5", schedule: "Every weekday at 9:00 AM" },
  { expression: "0 0 * * 0", schedule: "Every Sunday at 12:00 AM" },
];

const WEEKDAY_NAMES: Record<string, string> = {
  SUN: "0", MON: "1", TUE: "2", WED: "3", THU: "4", FRI: "5", SAT: "6",
};
function parseExampleToFields(expr: string): Record<string, string> {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return Object.fromEntries(FIELDS.map((f) => [f, "*"]));
  const [minute, hour, day, month, weekday] = parts;
  const w = WEEKDAY_NAMES[weekday?.toUpperCase()] ?? weekday;
  return { minute, hour, day, month, weekday: w };
}

const describeCron = (parts: string[]): string => {
  const [min, hour, day, month, weekday] = parts;
  const descs: string[] = [];
  if (min === "*" && hour === "*") descs.push("Every minute");
  else if (min !== "*" && hour === "*") descs.push(`At minute ${min} of every hour`);
  else if (min !== "*" && hour !== "*") descs.push(`At ${hour}:${min.padStart(2, "0")}`);
  else descs.push(`Every minute of hour ${hour}`);

  if (day !== "*") descs.push(`on day ${day}`);
  if (month !== "*") descs.push(`of month ${month}`);
  if (weekday !== "*") {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const d = Number(weekday);
    descs.push(`on ${days[d] ?? weekday}`);
  }
  return descs.join(" ");
};

const CronBuilderPage = () => {
  const tool = useCurrentTool();
  const [fields, setFields] = useState<Record<string, string>>({
    minute: "*",
    hour: "*",
    day: "*",
    month: "*",
    weekday: "*",
  });

  const expression = useMemo(
    () => FIELDS.map((f) => fields[f] || "*").join(" "),
    [fields]
  );

  const description = useMemo(
    () => describeCron(FIELDS.map((f) => fields[f] || "*")),
    [fields]
  );

  const applyPreset = (value: string) => {
    const parts = value.split(" ");
    setFields(Object.fromEntries(FIELDS.map((f, i) => [f, parts[i]])));
  };

  const applyExample = (expr: string) => setFields(parseExampleToFields(expr));

  const sampleExpression = "* * * * *";
  const clearExpression = () => setFields(Object.fromEntries(FIELDS.map((f) => [f, "*"])));

  return (
    <ToolLayout title={tool?.label ?? "Cron Parser"} description={tool?.description ?? "Build and parse cron expressions (Quartz-style)"}>
      <div className="flex flex-col flex-1 min-h-0 w-full tool-content-stack">
        <div className="tool-toolbar flex flex-wrap items-center gap-3 shrink-0">
          {FIELDS.map((field) => (
            <div key={field} className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground shrink-0 w-20">{LABELS[field]}</Label>
              <Input
                className="input-compact w-16 font-mono text-center"
                value={fields[field]}
                onChange={(e) => setFields((f) => ({ ...f, [field]: e.target.value }))}
              />
            </div>
          ))}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Label className="text-xs text-muted-foreground shrink-0">Preset</Label>
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => applyPreset(preset.value)}
                className="px-2 py-1 text-xs rounded bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title={preset.label}
              >
                {preset.value}
              </button>
            ))}
          </div>
        </div>

        <div className="tool-panel flex flex-col flex-1 min-h-0">
          <PanelHeader
            label="Expression"
            text={expression}
            extra={
              <div className="flex items-center gap-2">
                <SampleButton onClick={() => applyPreset(sampleExpression)} />
                <ClearButton onClick={clearExpression} />
              </div>
            }
          />
          <div className="h-[52px] shrink-0">
            <CodeEditor
              value={expression}
              readOnly
              language="text"
              showLineNumbers={false}
              fillHeight
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2 shrink-0">{description}</p>
        </div>

        <div className="tool-panel flex flex-col shrink-0">
          <PanelHeader label="Examples" />
          <p className="text-xs text-muted-foreground mb-2">Here are some examples for you.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-1.5 pr-3 font-medium text-muted-foreground">Cron expression</th>
                  <th className="text-left py-1.5 font-medium text-muted-foreground">Schedule</th>
                </tr>
              </thead>
              <tbody>
                {CRON_EXAMPLES.map(({ expression: expr, schedule }) => (
                  <tr
                    key={expr}
                    className="border-b border-border/50 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => applyExample(expr)}
                  >
                    <td className="py-1.5 pr-3 font-mono text-foreground">{expr}</td>
                    <td className="py-1.5 text-muted-foreground">{schedule}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default CronBuilderPage;
