import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Input } from "@/components/ui/input";
import { evaluateXPath } from "@/core-utils/validators";

const defaultXml = `<?xml version="1.0"?>
<books>
  <book id="1"><title>Alpha</title><year>2020</year></book>
  <book id="2"><title>Beta</title><year>2021</year></book>
</books>`;

const XpathTesterPage = () => {
  const tool = useCurrentTool();
  const [xml, setXml] = useState(defaultXml);
  const [xpath, setXpath] = useState("//book/title");

  const result = useMemo(() => evaluateXPath(xml, xpath), [xml, xpath]);

  return (
    <ToolLayout title={tool?.label ?? "XPath Tester"} description={tool?.description ?? "Run XPath expressions against XML"}>
      <div className="space-y-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">XPath expression</label>
          <Input
            value={xpath}
            onChange={(e) => setXpath(e.target.value)}
            placeholder="e.g. //book/title or //item[@id='1']"
            className="font-mono"
          />
        </div>
        {result.error && (
          <div className="text-sm text-destructive">✗ {result.error}</div>
        )}
        {result.items.length > 0 && (
          <div className="rounded-md border border-border overflow-hidden">
            <div className="px-2 py-1.5 bg-muted/50 text-xs font-medium text-muted-foreground">
              {result.items.length} result(s)
            </div>
            <ul className="divide-y divide-border max-h-48 overflow-y-auto">
              {result.items.map((item, i) => (
                <li key={i} className="p-2 text-xs">
                  <span className="text-muted-foreground mr-2">[{item.type}]</span>
                  <pre className="inline whitespace-pre-wrap break-all font-mono">{item.value}</pre>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="tool-panel">
            <PanelHeader label="XML" text={xml} onClear={() => setXml("")} />
            <CodeEditor value={xml} onChange={setXml} language="xml" placeholder="Paste XML..." />
          </div>
          <div className="tool-panel">
            <PanelHeader label="Results preview" text={result.items.map((i) => i.value).join("\n")} />
            <CodeEditor
              value={result.items.map((i) => `[${i.type}] ${i.value}`).join("\n\n") || "Run XPath to see results"}
              readOnly
              language="text"
            />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default XpathTesterPage;
