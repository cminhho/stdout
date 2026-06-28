import ToolPageLayout from "@/components/layout/ToolPageLayout";
import TwoPanelToolLayout, { type FormatResult } from "@/components/layout/TwoPanelToolLayout";
import { useTabInput } from "@/hooks/useTabInput";
import {
  JSON_REPAIR_FILE_ACCEPT,
  JSON_REPAIR_INPUT_PLACEHOLDER,
  JSON_REPAIR_MIME_TYPE,
  JSON_REPAIR_OUTPUT_FILENAME,
  JSON_REPAIR_OUTPUT_PLACEHOLDER,
  JSON_REPAIR_SAMPLE_CONFIG,
  JSON_REPAIR_SAMPLE_RELAXED,
  processJsonRepairInput,
  type JsonRepairResult,
} from "@/utils/jsonRepair";

const INPUT_SAMPLES = [
  { id: "relaxed", label: "Relaxed payload", value: JSON_REPAIR_SAMPLE_RELAXED },
  { id: "config", label: "JS-like config", value: JSON_REPAIR_SAMPLE_CONFIG },
];

function RepairSteps({ result }: { result: FormatResult | null }) {
  const repair = result as JsonRepairResult | null;
  if (!repair?.operations.length) return null;

  return (
    <section className="tool-section-card shrink-0" aria-label="Repair steps">
      <h2 className="home-section-label mb-2">Repair steps</h2>
      <div className="flex flex-wrap gap-2">
        {repair.operations.map((operation) => (
          <span
            key={operation}
            className="rounded-[var(--radius-button)] border border-border bg-muted/40 px-2 py-1 text-xs text-muted-foreground"
          >
            {operation}
          </span>
        ))}
      </div>
    </section>
  );
}

const JsonRepairPage = () => {
  const { input, setInput, toolId } = useTabInput();

  return (
    <ToolPageLayout>
      <TwoPanelToolLayout
        persistToolId={toolId}
        shareState={{ input }}
        shareInTitleBar
        topSectionFromResult={(result) => <RepairSteps result={result} />}
        inputPane={{
          inputToolbar: {
            onSample: (value) => setInput(value ?? JSON_REPAIR_SAMPLE_RELAXED),
            samples: INPUT_SAMPLES,
            setInput,
            fileAccept: JSON_REPAIR_FILE_ACCEPT,
            onFileText: setInput,
          },
          inputEditor: {
            value: input,
            onChange: setInput,
            language: "json",
            placeholder: JSON_REPAIR_INPUT_PLACEHOLDER,
          },
        }}
        outputPane={{
          outputToolbar: {
            format: (input, indent) => processJsonRepairInput(input, indent),
            outputFilename: JSON_REPAIR_OUTPUT_FILENAME,
            outputMimeType: JSON_REPAIR_MIME_TYPE,
          },
          outputEditor: {
            value: "",
            language: "json",
            placeholder: JSON_REPAIR_OUTPUT_PLACEHOLDER,
          },
        }}
      />
    </ToolPageLayout>
  );
};

export default JsonRepairPage;
