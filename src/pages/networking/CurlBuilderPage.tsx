import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { ClearButton } from "@/components/ClearButton";
import CodeEditor from "@/components/CodeEditor";
import CopyButton from "@/components/CopyButton";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurrentTool } from "@/hooks/useCurrentTool";

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

    parts.push("curl");
    if (verbose) parts.push("-v");
    if (followRedirects) parts.push("-L");
    if (insecure) parts.push("-k");
    if (timeout) parts.push(`--connect-timeout ${timeout}`);

    if (method !== "GET") parts.push(`-X ${method}`);

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

    if (["POST", "PUT", "PATCH"].includes(method) && body.trim()) {
      parts.push(`-d '${body.replace(/'/g, "'\\''")}'`);
    }

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
    <TwoPanelToolLayout
      tool={tool}
      inputPane={{
        title: "Request",
        children: (
          <div className="flex flex-col gap-[var(--spacing-section-mb)] overflow-auto">
            <section className="flex gap-[var(--spacing-block-gap)] min-w-0" aria-label="Method and URL">
              <div className="w-32 shrink-0">
                <Label className="tool-field-label block">Method</Label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger variant="secondary"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"].map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-0">
                <Label className="tool-field-label block">URL</Label>
                <Input className="input-compact" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
              </div>
            </section>

            <section aria-label="Headers">
              <div className="flex items-center justify-between mb-[var(--spacing-block-gap)]">
                <Label className="text-[length:var(--text-caption)] font-medium text-muted-foreground">Headers</Label>
                <Button size="xs" variant="outline" onClick={addHeader} className="gap-1.5"><Plus className="size-3.5" />Add</Button>
              </div>
              <div className="space-y-[var(--home-space-xs)]">
                {headers.map((h, i) => (
                  <div key={i} className="flex gap-[var(--spacing-block-gap)] items-center">
                    <Input className="input-compact flex-1 min-w-0" placeholder="Key" value={h.key} onChange={(e) => updateHeader(i, "key", e.target.value)} />
                    <Input className="input-compact flex-1 min-w-0" placeholder="Value" value={h.value} onChange={(e) => updateHeader(i, "value", e.target.value)} />
                    <Button size="icon-sm" variant="ghost" onClick={() => removeHeader(i)} aria-label="Remove header"><Trash2 className="size-3.5" /></Button>
                  </div>
                ))}
              </div>
            </section>

            <section aria-label="Query parameters">
              <div className="flex items-center justify-between mb-[var(--spacing-block-gap)]">
                <Label className="text-[length:var(--text-caption)] font-medium text-muted-foreground">Query Params</Label>
                <Button size="xs" variant="outline" onClick={addParam} className="gap-1.5"><Plus className="size-3.5" />Add</Button>
              </div>
              <div className="space-y-[var(--home-space-xs)]">
                {queryParams.map((p, i) => (
                  <div key={i} className="flex gap-[var(--spacing-block-gap)] items-center">
                    <Input className="input-compact flex-1 min-w-0" placeholder="Key" value={p.key} onChange={(e) => updateParam(i, "key", e.target.value)} />
                    <Input className="input-compact flex-1 min-w-0" placeholder="Value" value={p.value} onChange={(e) => updateParam(i, "value", e.target.value)} />
                    <Button size="icon-sm" variant="ghost" onClick={() => removeParam(i)} aria-label="Remove query param"><Trash2 className="size-3.5" /></Button>
                  </div>
                ))}
              </div>
            </section>

            {["POST", "PUT", "PATCH"].includes(method) && (
              <section className="flex flex-col h-[200px] min-h-0" aria-label="Request body">
                <Label className="tool-field-label block shrink-0">Body</Label>
                <CodeEditor
                  value={body}
                  onChange={setBody}
                  language="json"
                  placeholder='{"key": "value"}'
                  fillHeight
                />
              </section>
            )}

            <section className="flex flex-wrap items-center gap-[var(--spacing-block-gap)]" aria-label="cURL options">
              <label className="tool-checkbox-label flex items-center gap-[var(--home-space-xs)] text-[length:var(--text-caption)]">
                <input type="checkbox" checked={followRedirects} onChange={(e) => setFollowRedirects(e.target.checked)} className="rounded" aria-label="Follow redirects (-L)" /> -L
              </label>
              <label className="tool-checkbox-label flex items-center gap-[var(--home-space-xs)] text-[length:var(--text-caption)]">
                <input type="checkbox" checked={verbose} onChange={(e) => setVerbose(e.target.checked)} className="rounded" aria-label="Verbose (-v)" /> -v
              </label>
              <label className="tool-checkbox-label flex items-center gap-[var(--home-space-xs)] text-[length:var(--text-caption)]">
                <input type="checkbox" checked={insecure} onChange={(e) => setInsecure(e.target.checked)} className="rounded" aria-label="Insecure (-k)" /> -k
              </label>
              <div className="flex items-center gap-[var(--home-space-sm)]">
                <Label variant="muted" className="text-[length:var(--text-caption)] shrink-0">Timeout</Label>
                <Input className="input-compact w-16" placeholder="sec" value={timeout} onChange={(e) => setTimeout_(e.target.value)} aria-label="Connect timeout (seconds)" />
              </div>
            </section>
          </div>
        ),
      }}
      outputPane={{
        title: "cURL",
        children: (
          <div className="flex flex-col flex-1 min-h-0 gap-[var(--spacing-section-mb)]">
            <section className="flex flex-col flex-1 min-h-0 min-h-[140px]" aria-label="Generated cURL">
              <div className="flex justify-between items-center mb-[var(--spacing-block-gap)] shrink-0">
                <span className="text-[length:var(--text-caption)] font-medium text-muted-foreground">Generated cURL</span>
                <CopyButton text={curlCommand} />
              </div>
              <div className="flex-1 min-h-0 overflow-hidden">
                <CodeEditor
                  value={curlCommand}
                  readOnly
                  language="curl"
                  placeholder="Configure request to generate cURL..."
                  fillHeight
                />
              </div>
            </section>
            <section className="flex flex-col flex-1 min-h-0 min-h-[120px]" aria-label="Import cURL">
              <div className="flex justify-between items-center mb-[var(--spacing-block-gap)] shrink-0">
                <span className="text-[length:var(--text-caption)] font-medium text-muted-foreground">Import cURL</span>
                <ClearButton onClick={() => setImportInput("")} />
              </div>
              <div className="flex-1 min-h-0 overflow-hidden">
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
            </section>
          </div>
        ),
      }}
    />
  );
};

export default CurlBuilderPage;
