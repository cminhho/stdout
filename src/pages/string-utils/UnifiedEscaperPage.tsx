import { useState } from "react";
import { SelectWithOptions } from "@/components/ui/select";
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
        <SelectWithOptions
          size="sm"
          variant="secondary"
          value={type}
          onValueChange={setType}
          options={ESCAPER_OPTIONS}
          title="Escape format"
          aria-label="Escape format"
        />
      }
    />
  );
};

export default UnifiedEscaperPage;
