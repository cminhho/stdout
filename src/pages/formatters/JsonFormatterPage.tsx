import { useState } from "react";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import {
  JSON_FILE_ACCEPT,
  JSON_FORMATTER_SAMPLE,
  JSON_INPUT_PLACEHOLDER,
  JSON_LANGUAGE,
  JSON_MIME_TYPE,
  JSON_OUTPUT_FILENAME,
  JSON_OUTPUT_PLACEHOLDER,
  processJsonInput,
} from "@/utils/jsonFormat";
import type { JsonProcessResult } from "@/utils/jsonFormat";

function hasStats(r: unknown): r is JsonProcessResult & { stats: NonNullable<JsonProcessResult["stats"]> } {
  return Boolean(r && typeof r === "object" && "stats" in r && (r as JsonProcessResult).stats != null);
}

const JsonFormatterPage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState("");

  return (
    <TwoPanelToolLayout
      tool={tool}
      topSectionFromResult={(result) => {
        if (!hasStats(result)) return null;
        const { keys, depth, arrays, objects, size } = result.stats;
        return (
          <p className="text-[length:var(--text-caption)] text-muted-foreground" aria-live="polite">
            Keys: {keys} · Depth: {depth} · Arrays: {arrays} · Objects: {objects} · Size: {size}
          </p>
        );
      }}
      inputPane={{
        inputToolbar: {
          onSample: () => setInput(JSON_FORMATTER_SAMPLE),
          setInput,
          fileAccept: JSON_FILE_ACCEPT,
          onFileText: setInput,
        },
        inputEditor: {
          value: input,
          onChange: setInput,
          language: JSON_LANGUAGE,
          placeholder: JSON_INPUT_PLACEHOLDER,
        },
      }}
      outputPane={{
        outputToolbar: {
          format: (input, indent) => processJsonInput(input, indent),
          outputFilename: JSON_OUTPUT_FILENAME,
          outputMimeType: JSON_MIME_TYPE,
        },
        outputEditor: {
          value: "",
          language: JSON_LANGUAGE,
          placeholder: JSON_OUTPUT_PLACEHOLDER,
        },
      }}
    />
  );
};

export default JsonFormatterPage;
