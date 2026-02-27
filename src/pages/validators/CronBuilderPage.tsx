import { useState, useMemo } from "react";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolPane from "@/components/layout/ToolPane";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import CopyButton from "@/components/common/CopyButton";
import { ClearButton } from "@/components/common/ClearButton";
import { SampleButton } from "@/components/common/SampleButton";
import { cn } from "@/utils/cn";

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

function describeCron(parts: string[]): string {
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
    descs.push(`on ${days[Number(weekday)] ?? weekday}`);
  }
  return descs.join(" ");
}

const DEFAULT_EXPRESSION = "* * * * *";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomSample(): Record<string, string> {
  return {
    minute: String(randomInt(0, 59)),
    hour: String(randomInt(0, 23)),
    day: String(randomInt(1, 28)),
    month: String(randomInt(1, 12)),
    weekday: String(randomInt(0, 6)),
  };
}

const CronBuilderPage = () => {
  const [fields, setFields] = useState<Record<string, string>>(() =>
    Object.fromEntries(FIELDS.map((f) => [f, "*"]))
  );

  const expression = useMemo(
    () => FIELDS.map((f) => fields[f] || "*").join(" "),
    [fields]
  );

  const description = useMemo(
    () => describeCron(FIELDS.map((f) => fields[f] || "*")),
    [fields]
  );

  const isDefault = expression === DEFAULT_EXPRESSION;

  const applyPreset = (value: string) => {
    const parts = value.split(" ");
    setFields(Object.fromEntries(FIELDS.map((f, i) => [f, parts[i] ?? "*"])));
  };

  const applyExample = (expr: string) => setFields(parseExampleToFields(expr));

  const clearExpression = () =>
    setFields(Object.fromEntries(FIELDS.map((f) => [f, "*"])));

  const pane = {
    title: "Cron Builder",
    copyText: expression,
    toolbar: (
      <div className="flex items-center gap-1.5">
        <SampleButton onClick={() => setFields(generateRandomSample())} />
        {!isDefault ? <ClearButton onClick={clearExpression} /> : null}
      </div>
    ),
    children: (
      <div className="flex flex-col gap-[var(--home-content-gap)] flex-1 min-h-0 overflow-hidden">
        <section className="tool-section-card shrink-0 space-y-3" aria-label="Builder">
          <h2 className="home-section-label mb-0">
            Builder
          </h2>
          <p className="tool-caption">
            Set each cron field (minute, hour, day, month, weekday). Use presets or pick an example below.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-[var(--home-space-sm)]">
            {FIELDS.map((field) => (
              <div key={field} className="space-y-1.5">
                <Label htmlFor={`cron-${field}`} variant="muted" className="text-xs">
                  {LABELS[field]}
                </Label>
                <Input
                  id={`cron-${field}`}
                  value={fields[field]}
                  onChange={(e) => setFields((f) => ({ ...f, [field]: e.target.value }))}
                  className="h-9 font-mono text-xs text-center rounded-[var(--radius-button)] transition-colors duration-150"
                  aria-label={LABELS[field]}
                />
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="tool-caption shrink-0">Preset</span>
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Cron presets">
              {PRESETS.map((preset) => (
                <Button
                  key={preset.value}
                  type="button"
                  size="xs"
                  variant={expression === preset.value ? "default" : "outline"}
                  onClick={() => applyPreset(preset.value)}
                  className="min-h-touch sm:min-h-0 font-mono cursor-pointer transition-colors duration-150"
                  aria-label={`Apply preset: ${preset.label}`}
                  aria-pressed={expression === preset.value}
                >
                  {preset.value}
                </Button>
              ))}
            </div>
          </div>
        </section>

        <section className="tool-section-card shrink-0 space-y-3" aria-label="Result">
          <h2 className="home-section-label mb-0">
            Expression
          </h2>
          <div className="flex items-center gap-2 rounded-[var(--home-radius-card)] border border-border bg-background/80 dark:bg-input/50 px-3 py-2.5 min-h-touch">
            <code className="flex-1 text-sm font-mono text-foreground min-w-0 truncate">
              {expression}
            </code>
            <CopyButton text={expression} className="shrink-0" />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </section>

        <section
          className="tool-section-card tool-section-card--fill flex-1 min-h-0 flex flex-col overflow-hidden"
          aria-label="Examples"
        >
          <div className="shrink-0 px-[var(--spacing-panel-inner-x)] pt-3 pb-2">
            <h2 className="home-section-label mb-0">
              Examples
            </h2>
            <p className="tool-caption mt-1">
              Click a row to apply that expression.
            </p>
          </div>
          <div className="flex-1 min-h-0 overflow-auto border-t border-border">
            <div className="tool-reference-table-wrap">
              <table className="tool-reference-table border-collapse" aria-label="Cron expression examples">
                <thead className="sticky top-0 z-10 border-b border-border bg-muted/60 backdrop-blur-[var(--glass-blur-subtle)]">
                  <tr>
                    <th className="text-left py-2.5 px-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                      Cron expression
                    </th>
                    <th className="text-left py-2.5 px-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                      Schedule
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {CRON_EXAMPLES.map(({ expression: expr, schedule }) => (
                    <tr
                      key={expr}
                      role="button"
                      tabIndex={0}
                      onClick={() => applyExample(expr)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          applyExample(expr);
                        }
                      }}
                      className={cn(
                        "border-b border-border/50 transition-colors duration-150 min-h-touch cursor-pointer",
                        expression === expr
                          ? "bg-primary/10 ring-inset ring-1 ring-primary/30"
                          : "hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                      )}
                      aria-label={`Apply: ${expr} — ${schedule}`}
                      aria-pressed={expression === expr}
                    >
                      <td className="py-2.5 px-3 font-mono text-foreground text-[length:var(--text-ui)]">{expr}</td>
                      <td className="py-2.5 px-3 text-muted-foreground text-[length:var(--text-ui)]">{schedule}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    ),
  };

  return (
    <ToolLayout>
      <div className="flex flex-col flex-1 min-h-0 w-full tool-content-stack max-w-3xl mx-auto">
        <ToolPane pane={pane} />
      </div>
    </ToolLayout>
  );
};

export default CronBuilderPage;
