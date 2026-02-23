import { useState } from "react";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import { SelectWithOptions } from "@/components/ui/select";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import CodeEditor from "@/components/CodeEditor";
import IndentSelect, { type IndentOption } from "@/components/IndentSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClearButton } from "@/components/ClearButton";
import { SaveButton } from "@/components/SaveButton";

const LOG_FORMATS = [
  {
    name: "Apache Common",
    id: "apache",
    template: (i: number) => {
      const ip = `${rn(1, 255)}.${rn(0, 255)}.${rn(0, 255)}.${rn(0, 255)}`;
      const methods = ["GET", "POST", "PUT", "DELETE"];
      const paths = ["/api/users", "/index.html", "/assets/logo.png", "/api/orders", "/health", "/login", "/api/products", "/dashboard"];
      const codes = [200, 200, 200, 201, 301, 304, 400, 401, 403, 404, 500];
      const d = new Date(Date.now() - rn(0, 86400000 * 30));
      const dateStr = d.toISOString().replace("T", " ").slice(0, 19);
      return `${ip} - user${rn(1, 500)} [${dateStr}] "${pick(methods)} ${pick(paths)} HTTP/1.1" ${pick(codes)} ${rn(200, 50000)}`;
    },
  },
  {
    name: "Nginx",
    id: "nginx",
    template: (i: number) => {
      const ip = `${rn(1, 255)}.${rn(0, 255)}.${rn(0, 255)}.${rn(0, 255)}`;
      const paths = ["/api/v1/users", "/static/app.js", "/images/hero.webp", "/api/v1/auth/login", "/health"];
      const codes = [200, 200, 301, 404, 500, 502, 503];
      const d = new Date(Date.now() - rn(0, 86400000 * 7));
      return `${ip} - - [${d.toISOString().replace("T", " ").slice(0, 19)}] "GET ${pick(paths)} HTTP/2.0" ${pick(codes)} ${rn(100, 80000)} "${pick(["https://example.com", "-", "https://google.com"])}" "Mozilla/5.0 (${pick(["Windows NT 10.0", "Macintosh", "Linux x86_64"])})"`;
    },
  },
  {
    name: "Syslog (RFC 5424)",
    id: "syslog",
    template: (i: number) => {
      const facilities = ["kern", "user", "daemon", "auth", "syslog", "cron"];
      const severities = ["emerg", "alert", "crit", "err", "warning", "notice", "info", "debug"];
      const apps = ["sshd", "nginx", "postgres", "node", "systemd", "crond"];
      const msgs = ["Connection accepted", "Connection refused", "Service started", "Authentication failure", "File not found", "Process terminated", "Disk usage warning", "Cache cleared"];
      const d = new Date(Date.now() - rn(0, 86400000 * 3));
      return `<${rn(0, 191)}>${rn(0, 2)} ${d.toISOString()} server${rn(1, 20)}.local ${pick(apps)} ${rn(1000, 65000)} - - ${pick(msgs)} [${pick(facilities)}.${pick(severities)}]`;
    },
  },
  {
    name: "JSON (Structured)",
    id: "json",
    template: (i: number) => {
      const levels = ["info", "info", "info", "warn", "error", "debug"];
      const msgs = ["Request processed", "User authenticated", "Cache miss", "Rate limit exceeded", "Database query slow", "Connection pool exhausted", "Config reloaded"];
      const d = new Date(Date.now() - rn(0, 86400000));
      return {
        timestamp: d.toISOString(),
        level: pick(levels),
        message: pick(msgs),
        service: pick(["api", "auth", "worker", "gateway"]),
        request_id: crypto.randomUUID().slice(0, 8),
        duration_ms: rn(1, 5000),
        ...(Math.random() > 0.7 ? { error: pick(["timeout", "ECONNREFUSED", "ENOMEM"]) } : {}),
      };
    },
  },
  {
    name: "Docker / Container",
    id: "docker",
    template: (i: number) => {
      const containers = ["web-1", "api-2", "worker-3", "redis-1", "postgres-1"];
      const levels = ["INFO", "INFO", "WARN", "ERROR", "DEBUG"];
      const msgs = ["Container started", "Health check passed", "OOM warning", "Connection pool full", "Image pulled", "Volume mounted", "Network attached"];
      const d = new Date(Date.now() - rn(0, 86400000));
      return `${d.toISOString()} ${pick(containers)} | ${pick(levels).padEnd(5)} | ${pick(msgs)} (pid=${rn(1, 32000)})`;
    },
  },
];

function rn(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const LogGeneratorPage = () => {
  const tool = useCurrentTool();
  const [format, setFormat] = useState("apache");
  const [count, setCount] = useState(50);
  const [output, setOutput] = useState("");
  const [indent, setIndent] = useState<IndentOption>(2);

  const generate = () => {
    const fmt = LOG_FORMATS.find((f) => f.id === format)!;
    const lines = Array.from({ length: count }, (_, i) => {
      const out = fmt.template(i);
      if (format === "json") {
        const space = typeof indent === "number" ? indent : 0;
        return JSON.stringify(out as object, null, space);
      }
      return out as string;
    });
    setOutput(lines.join("\n"));
  };

  const download = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logs-${format}-${Date.now()}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const lineCount = output ? output.split("\n").length : 0;

  const inputPaneContent = (
    <div className="flex flex-col gap-4 p-3">
      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground">Format</label>
        <SelectWithOptions
          size="xs"
          variant="secondary"
          value={format}
          onValueChange={setFormat}
          options={LOG_FORMATS.map((f) => ({ value: f.id, label: f.name }))}
          title="Log format"
          aria-label="Log format"
        />
      </div>
      {format === "json" && (
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">JSON indent</label>
          <IndentSelect value={indent} onChange={setIndent} />
        </div>
      )}
      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground">Lines</label>
        <Input
          type="number"
          min={1}
          max={10000}
          value={count}
          onChange={(e) => setCount(Math.max(1, Math.min(10000, Number(e.target.value) || 1)))}
          className="h-8 w-full font-mono text-xs"
        />
      </div>
      <Button size="xs" onClick={generate}>
        Generate
      </Button>
    </div>
  );

  return (
    <TwoPanelToolLayout
      tool={tool}
      title={tool?.label ?? "Log Generator"}
      description={tool?.description ?? "Generate synthetic log data for testing"}
      defaultInputPercent={25}
      inputPane={{
        title: "Options",
        children: inputPaneContent,
      }}
      outputPane={{
        title: lineCount ? `Output (${lineCount} lines)` : "Output",
        copyText: output || undefined,
        toolbar: (
          <div className="flex items-center gap-2 flex-wrap">
            {output && <SaveButton label="Save .log" onClick={download} className="h-7 text-xs" />}
            {output && <ClearButton onClick={() => setOutput("")} />}
          </div>
        ),
        outputEditor: {
          value: output,
          language: "text",
          placeholder: "Click Generate to create log data...",
        },
      }}
    />
  );
};

export default LogGeneratorPage;
