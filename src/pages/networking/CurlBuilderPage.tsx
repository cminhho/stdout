import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import CodeEditor from "@/components/CodeEditor";
import PanelHeader from "@/components/PanelHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eraser, Plus, Trash2 } from "lucide-react";

interface Header {
  key: string;
  value: string;
}

const CurlBuilderPage = () => {
  const tool = useCurrentTool();
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("https://api.example.com/users");
  const [headers, setHeaders] = useState<Header[]>([
    { key: "Content-Type", value: "application/json" },
    { key: "Authorization", value: "Bearer token" },
  ]);
  const [body, setBody] = useState('{\n  "name": "John"\n}');
  const [queryParams, setQueryParams] = useState<Header[]>([]);
  const [followRedirects, setFollowRedirects] = useState(false);
  const [verbose, setVerbose] = useState(false);
  const [insecure, setInsecure] = useState(false);
  const [timeout, setTimeout_] = useState("");
  const [importInput, setImportInput] = useState("");

  const addHeader = () => setHeaders([...headers, { key: "", value: "" }]);
  const removeHeader = (i: number) => setHeaders(headers.filter((_, idx) => idx !== i));
  const updateHeader = (i: number, field: "key" | "value", val: string) =>
    setHeaders(headers.map((h, idx) => (idx === i ? { ...h, [field]: val } : h)));

  const addParam = () => setQueryParams([...queryParams, { key: "", value: "" }]);
  const removeParam = (i: number) => setQueryParams(queryParams.filter((_, idx) => idx !== i));
  const updateParam = (i: number, field: "key" | "value", val: string) =>
    setQueryParams(queryParams.map((p, idx) => (idx === i ? { ...p, [field]: val } : p)));

  const buildCurl = (): string => {
    const parts: string[] = [];

    // 1. curl + behavioral flags (verbose, redirect, insecure, timeout)
    parts.push("curl");
    if (verbose) parts.push("-v");
    if (followRedirects) parts.push("-L");
    if (insecure) parts.push("-k");
    if (timeout) parts.push(`--connect-timeout ${timeout}`);

    // 2. Method (omit -X for GET per convention)
    if (method !== "GET") parts.push(`-X ${method}`);

    // 3. Headers: Content-Type first, then Authorization, then rest alphabetically
    const validHeaders = headers.filter((h) => h.key.trim());
    const headerOrder = (a: Header, b: Header) => {
      const key = (k: string) => k.toLowerCase();
      const order: Record<string, number> = { "content-type": 0, authorization: 1 };
      const ai = order[key(a.key)] ?? 2;
      const bi = order[key(b.key)] ?? 2;
      if (ai !== bi) return ai - bi;
      return a.key.localeCompare(b.key, undefined, { sensitivity: "base" });
    };
    validHeaders.sort(headerOrder).forEach((h) => {
      parts.push(`-H '${h.key}: ${h.value}'`);
    });

    // 4. Body (for POST/PUT/PATCH)
    if (["POST", "PUT", "PATCH"].includes(method) && body.trim()) {
      parts.push(`-d '${body.replace(/'/g, "'\\''")}'`);
    }

    // 5. URL last (industry standard: options then URL)
    let fullUrl = url.trim();
    const validParams = queryParams.filter((p) => p.key.trim());
    if (validParams.length > 0) {
      const qs = validParams.map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`).join("&");
      fullUrl += (fullUrl.includes("?") ? "&" : "?") + qs;
    }
    parts.push(`'${fullUrl}'`);

    return parts.join(" \\\n  ");
  };

  const curlCommand = buildCurl();

  const parseCurl = (cmd: string) => {
    try {
      const cleaned = cmd.replace(/\\\n\s*/g, " ").trim();
      const methodMatch = cleaned.match(/-X\s+(\w+)/);
      if (methodMatch) setMethod(methodMatch[1]);
      else setMethod("GET");

      const headerMatches = [...cleaned.matchAll(/-H\s+'([^']+)'/g)];
      const parsedHeaders = headerMatches.map((m) => {
        const [key, ...rest] = m[1].split(":");
        return { key: key.trim(), value: rest.join(":").trim() };
      });
      if (parsedHeaders.length > 0) setHeaders(parsedHeaders);

      const dataMatch = cleaned.match(/-d\s+'([^']+)'/);
      if (dataMatch) setBody(dataMatch[1]);

      const urlMatch = cleaned.match(/'(https?:\/\/[^']+)'/);
      if (urlMatch) {
        const u = new URL(urlMatch[1]);
        setUrl(u.origin + u.pathname);
        const params: Header[] = [];
        u.searchParams.forEach((v, k) => params.push({ key: k, value: v }));
        setQueryParams(params);
      }
    } catch {
      // ignore parse errors
    }
  };

  return (
    <ToolLayout title={tool?.label ?? "cURL Builder"} description={tool?.description ?? "Build cURL commands visually"}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="flex flex-col min-h-0 overflow-auto space-y-4">
          <div className="flex gap-3">
            <div className="w-32">
              <Label className="text-xs text-muted-foreground mb-1 block">Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"].map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-0">
              <Label className="text-xs text-muted-foreground mb-1 block">URL</Label>
              <Input className="input-compact" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label className="text-xs text-muted-foreground">Headers</Label>
              <Button size="xs" variant="outline" onClick={addHeader}><Plus className="mr-1" />Add</Button>
            </div>
            <div className="space-y-1">
              {headers.map((h, i) => (
                <div key={i} className="flex gap-1.5 items-center">
                  <Input className="input-compact flex-1 min-w-0" placeholder="Key" value={h.key} onChange={(e) => updateHeader(i, "key", e.target.value)} />
                  <Input className="input-compact flex-1 min-w-0" placeholder="Value" value={h.value} onChange={(e) => updateHeader(i, "value", e.target.value)} />
                  <Button size="icon-sm" variant="ghost" onClick={() => removeHeader(i)}><Trash2 /></Button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label className="text-xs text-muted-foreground">Query Params</Label>
              <Button size="xs" variant="outline" onClick={addParam}><Plus className="mr-1" />Add</Button>
            </div>
            <div className="space-y-1">
              {queryParams.map((p, i) => (
                <div key={i} className="flex gap-1.5 items-center">
                  <Input className="input-compact flex-1 min-w-0" placeholder="Key" value={p.key} onChange={(e) => updateParam(i, "key", e.target.value)} />
                  <Input className="input-compact flex-1 min-w-0" placeholder="Value" value={p.value} onChange={(e) => updateParam(i, "value", e.target.value)} />
                  <Button size="icon-sm" variant="ghost" onClick={() => removeParam(i)}><Trash2 /></Button>
                </div>
              ))}
            </div>
          </div>

          {["POST", "PUT", "PATCH"].includes(method) && (
            <div className="flex flex-col h-[200px] min-h-0">
              <Label className="text-xs text-muted-foreground mb-1 block shrink-0">Body</Label>
              <CodeEditor
                value={body}
                onChange={setBody}
                language="json"
                placeholder='{"key": "value"}'
                fillHeight
              />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={followRedirects} onChange={(e) => setFollowRedirects(e.target.checked)} className="rounded" /> -L
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={verbose} onChange={(e) => setVerbose(e.target.checked)} className="rounded" /> -v
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={insecure} onChange={(e) => setInsecure(e.target.checked)} className="rounded" /> -k
            </label>
            <div className="flex items-center gap-1.5">
              <Label className="text-muted-foreground shrink-0">Timeout</Label>
              <Input className="input-compact w-16" placeholder="sec" value={timeout} onChange={(e) => setTimeout_(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="flex flex-col flex-1 min-h-0 gap-4">
          <div className="tool-panel flex flex-col flex-1 min-h-0">
            <PanelHeader label="Generated cURL" text={curlCommand} />
            <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <CodeEditor value={curlCommand} readOnly language="curl" placeholder="Configure request to generate cURL..." fillHeight />
            </div>
          </div>

          <div className="tool-panel flex flex-col flex-1 min-h-0">
            <PanelHeader
              label="Import cURL"
              extra={
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setImportInput("")}>
                  <Eraser className="h-3.5 w-3.5 mr-1.5" />
                  Clear
                </Button>
              }
            />
            <div className="flex flex-col flex-1 min-h-0 overflow-hidden" style={{ minHeight: 120 }}>
              <CodeEditor
                value={importInput}
                onChange={(v) => {
                  setImportInput(v);
                  parseCurl(v);
                }}
                language="curl"
                placeholder="Paste a cURL command here to parse it..."
                fillHeight
              />
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default CurlBuilderPage;
