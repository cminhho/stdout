import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { Download, Eraser } from "lucide-react";

const LOG_FORMATS = [
  {
    name: "Apache Common",
    id: "apache",
    template: (i: number) => {
      const ip = `${rn(1,255)}.${rn(0,255)}.${rn(0,255)}.${rn(0,255)}`;
      const methods = ["GET", "POST", "PUT", "DELETE"];
      const paths = ["/api/users", "/index.html", "/assets/logo.png", "/api/orders", "/health", "/login", "/api/products", "/dashboard"];
      const codes = [200, 200, 200, 201, 301, 304, 400, 401, 403, 404, 500];
      const d = new Date(Date.now() - rn(0, 86400000 * 30));
      const dateStr = d.toISOString().replace("T", " ").slice(0, 19);
      return `${ip} - user${rn(1,500)} [${dateStr}] "${pick(methods)} ${pick(paths)} HTTP/1.1" ${pick(codes)} ${rn(200, 50000)}`;
    },
  },
  {
    name: "Nginx",
    id: "nginx",
    template: (i: number) => {
      const ip = `${rn(1,255)}.${rn(0,255)}.${rn(0,255)}.${rn(0,255)}`;
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
      return JSON.stringify({
        timestamp: d.toISOString(),
        level: pick(levels),
        message: pick(msgs),
        service: pick(["api", "auth", "worker", "gateway"]),
        request_id: crypto.randomUUID().slice(0, 8),
        duration_ms: rn(1, 5000),
        ...(Math.random() > 0.7 ? { error: pick(["timeout", "ECONNREFUSED", "ENOMEM"]) } : {}),
      });
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

function rn(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

const LogGeneratorPage = () => {
  const tool = useCurrentTool();
  const [format, setFormat] = useState("apache");
  const [count, setCount] = useState(50);
  const [output, setOutput] = useState("");

  const generate = () => {
    const fmt = LOG_FORMATS.find((f) => f.id === format)!;
    const lines = Array.from({ length: count }, (_, i) => fmt.template(i));
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

  return (
    <ToolLayout title={tool?.label ?? "Log Generator"} description={tool?.description ?? "Generate synthetic log data for testing"}>
      <div className="flex flex-col flex-1 min-h-0 w-full gap-4">
        <div className="tool-toolbar flex flex-wrap items-center gap-3 shrink-0">
          <select value={format} onChange={(e) => setFormat(e.target.value)} className="tool-select">
            {LOG_FORMATS.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-muted-foreground">Lines:</label>
            <input
              type="number"
              min={1}
              max={10000}
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(10000, Number(e.target.value))))}
              className="w-20 rounded-md border px-2 py-1.5 text-xs font-mono bg-background border-border text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <Button size="sm" onClick={generate}>Generate</Button>
          {output && (
            <>
              <Button size="sm" variant="outline" onClick={download}>
                <Download className="h-3 w-3 mr-1" />Save .log
              </Button>
            </>
          )}
        </div>
        <div className="tool-panel flex flex-col flex-1 min-h-0">
          <PanelHeader
            label={`Output (${output ? output.split("\n").length : 0} lines)`}
            text={output}
            extra={
              output ? (
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setOutput("")}>
                  <Eraser className="h-3.5 w-3.5 mr-1.5" />
                  Clear
                </Button>
              ) : undefined
            }
          />
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <CodeEditor value={output} readOnly language="text" placeholder="Click Generate to create log data..." fillHeight />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default LogGeneratorPage;
