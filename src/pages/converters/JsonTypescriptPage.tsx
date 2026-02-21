import { useState, useCallback } from "react";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import { SelectWithOptions } from "@/components/ui/select";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import { ClearButton, SampleButton } from "@/components/ToolActionButtons";
import FileUploadButton from "@/components/FileUploadButton";
import type { IndentOption } from "@/components/IndentSelect";
import {
  processJsonToTypesForLayout,
  type JsonTypescriptLang,
  JSON_TYPESCRIPT_FILE_ACCEPT,
  JSON_TYPESCRIPT_SAMPLE,
  JSON_TYPESCRIPT_LANGS,
  JSON_TYPESCRIPT_PLACEHOLDER_INPUT,
  JSON_TYPESCRIPT_PLACEHOLDER_OUTPUT,
  JSON_TYPESCRIPT_OUTPUT_FILENAME,
  JSON_TYPESCRIPT_MIME_TYPE,
} from "@/utils/jsonTypescript";

const JsonTypescriptPage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState("");
  const [lang, setLang] = useState<JsonTypescriptLang>("typescript");

  const format = useCallback(
    (inputValue: string, indent: IndentOption) => processJsonToTypesForLayout(inputValue, indent, lang),
    [lang]
  );

  const currentLang = JSON_TYPESCRIPT_LANGS.find((l) => l.value === lang)!;

  return (
    <TwoPanelToolLayout
      tool={tool}
      inputPane={{
        onClear: () => setInput(""),
        toolbar: (
          <>
            <SelectWithOptions
              size="sm"
              value={lang}
              onValueChange={setLang}
              options={JSON_TYPESCRIPT_LANGS.map((l) => ({ value: l.value, label: l.label }))}
              title="Output language"
              aria-label="Output language"
            />
            <SampleButton onClick={() => setInput(JSON_TYPESCRIPT_SAMPLE)} />
            <ClearButton onClick={() => setInput("")} />
            <FileUploadButton accept={JSON_TYPESCRIPT_FILE_ACCEPT} onText={setInput} />
          </>
        ),
        inputEditor: {
          value: input,
          onChange: setInput,
          language: "json",
          placeholder: JSON_TYPESCRIPT_PLACEHOLDER_INPUT,
        },
      }}
      outputPane={{
        outputToolbar: {
          format,
          outputFilename: JSON_TYPESCRIPT_OUTPUT_FILENAME,
          outputMimeType: JSON_TYPESCRIPT_MIME_TYPE,
          defaultIndent: 2,
          indentSpaceOptions: [2, 4],
          indentIncludeTab: false,
        },
        outputEditor: {
          value: "",
          language: currentLang.editorLang,
          placeholder: JSON_TYPESCRIPT_PLACEHOLDER_OUTPUT,
        },
      }}
    />
  );
};

export default JsonTypescriptPage;
