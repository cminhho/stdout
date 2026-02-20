import { useState } from "react";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import { type EscaperType } from "@/utils/escaper";
import EscaperPage from "./EscaperPage";

const ESCAPER_OPTIONS: { value: EscaperType; label: string }[] = [
  { value: "json", label: "JSON" },
  { value: "xml", label: "XML" },
  { value: "csv", label: "CSV" },
  { value: "sql", label: "SQL" },
  { value: "java", label: "Java / .NET" },
  { value: "javascript", label: "JavaScript" },
];

const UnifiedEscaperPage = () => {
  const tool = useCurrentTool();
  const [type, setType] = useState<EscaperType>("json");

  const title = tool?.label ?? "String Escaper";
  const description =
    tool?.description ??
    "Escape or unescape text for JSON, XML, CSV, SQL, Java/.NET, and JavaScript string literals";

  return (
    <EscaperPage
      type={type}
      title={title}
      description={description}
      formatSelector={
        <select
          value={type}
          onChange={(e) => setType(e.target.value as EscaperType)}
          className="h-7 rounded border border-input bg-background pl-2 pr-6 text-xs min-w-0"
        >
          {ESCAPER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      }
    />
  );
};

export default UnifiedEscaperPage;
