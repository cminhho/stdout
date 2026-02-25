import { useState, useMemo } from "react";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import CodeEditor from "@/components/CodeEditor";
import ToolAlert from "@/components/ToolAlert";
import ToolResultList from "@/components/ToolResultList";
import { Input } from "@/components/ui/input";
import { evaluateXPath } from "@/utils/validators";

const SAMPLE_XML = `<?xml version="1.0"?>
<books>
  <book id="1"><title>Alpha</title><year>2020</year></book>
  <book id="2"><title>Beta</title><year>2021</year></book>
</books>`;

const XpathTesterPage = () => {
  const [xml, setXml] = useState(SAMPLE_XML);
  const [xpath, setXpath] = useState("//book/title");

  const result = useMemo(() => evaluateXPath(xml, xpath), [xml, xpath]);
  const resultText = result.items.map((i) => `[${i.type}] ${i.value}`).join("\n\n") || "";

  const topSection = (
    <div className="space-y-3">
      <div>
        <label className="tool-field-label">XPath expression</label>
        <Input
          value={xpath}
          onChange={(e) => setXpath(e.target.value)}
          placeholder="e.g. //book/title or //item[@id='1']"
          className="font-mono"
        />
      </div>
      {result.error && <ToolAlert variant="error" message={result.error} prefix="✗ " />}
      {result.items.length > 0 && (
        <ToolResultList
          count={result.items.length}
          items={result.items}
          maxHeight="12rem"
          renderItem={(item) => (
            <>
              <span className="text-muted-foreground mr-2">[{item.type}]</span>
              <pre className="inline whitespace-pre-wrap break-all font-mono">{item.value}</pre>
            </>
          )}
        />
      )}
    </div>
  );

  return (
    <TwoPanelToolLayout
      topSection={topSection}
      inputPane={{
        title: "XML",
        inputToolbar: {
          onSample: () => setXml(SAMPLE_XML),
          setInput: setXml,
          fileAccept: ".xml,application/xml,text/xml",
          onFileText: setXml,
        },
        inputEditor: {
          value: xml,
          onChange: setXml,
          language: "xml",
          placeholder: "Paste XML...",
        },
      }}
      outputPane={{
        title: "Results",
        copyText: resultText || undefined,
        outputEditor: {
          value: resultText || "",
          language: "text",
          placeholder: "Run XPath to see results",
        },
      }}
    />
  );
};

export default XpathTesterPage;
