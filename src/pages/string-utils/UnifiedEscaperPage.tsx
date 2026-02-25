import { useState } from "react";
import { SelectWithOptions } from "@/components/ui/select";
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
  const [type, setType] = useState<EscaperType>("json");

  return (
    <EscaperPage
      type={type}
      formatSelector={
        <SelectWithOptions
          size="xs"
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
