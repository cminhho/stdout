import { useState, useCallback } from "react";
import TwoPanelToolLayout from "@/components/layout/TwoPanelToolLayout";
import SaveSessionButton from "@/components/common/SaveSessionButton";
import SavedSessionsPopover from "@/components/common/SavedSessionsPopover";
import { SegmentGroup } from "@/components/common/SegmentGroup";
import type { IndentOption } from "@/components/common/IndentSelect";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import {
  processBase64ForLayout,
  type Base64Mode,
  BASE64_FILE_ACCEPT,
  BASE64_SAMPLE,
  BASE64_SAMPLE_DECODE,
  BASE64_PLACEHOLDER_INPUT,
  BASE64_PLACEHOLDER_OUTPUT,
  BASE64_OUTPUT_FILENAME,
  BASE64_MIME_TYPE,
} from "@/utils/encode";

const MODE_OPTIONS: { value: Base64Mode; label: string }[] = [
  { value: "encode", label: "Encode" },
  { value: "decode", label: "Decode" },
];

const Base64Page = () => {
  const tool = useCurrentTool();
  const { setToolState } = useWorkspace();
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Base64Mode>("encode");

  const setModeWithCleanup = useCallback((next: Base64Mode) => {
    setMode(next);
    setInput("");
  }, []);

  const handleLoadSession = useCallback(
    (state: { input?: string; scrollPosition?: number; splitPercent?: number }) => {
      if (state.input !== undefined) setInput(state.input);
      if (tool?.id) setToolState(tool.id, state);
    },
    [tool?.id, setToolState]
  );

  const format = useCallback(
    (inputValue: string, _indent: IndentOption) => processBase64ForLayout(inputValue, mode),
    [mode]
  );

  return (
    <TwoPanelToolLayout
      persistToolId={tool?.id}
      shareState={{ input }}
      inputPane={{
        inputToolbar: {
          onSample: () => setInput(mode === "encode" ? BASE64_SAMPLE : BASE64_SAMPLE_DECODE),
          setInput,
          fileAccept: BASE64_FILE_ACCEPT,
          onFileText: setInput,
        },
        inputToolbarExtra: tool?.id ? (
          <>
            <SegmentGroup<Base64Mode>
              value={mode}
              onValueChange={setModeWithCleanup}
              options={MODE_OPTIONS}
              ariaLabel="Mode"
            />
            <SaveSessionButton toolId={tool.id} currentState={{ input }} />
            <SavedSessionsPopover toolId={tool.id} onLoad={handleLoadSession} />
          </>
        ) : undefined,
        inputEditor: {
          value: input,
          onChange: setInput,
          language: "text",
          placeholder: BASE64_PLACEHOLDER_INPUT,
        },
      }}
      outputPane={{
        outputToolbar: {
          format,
          outputFilename: BASE64_OUTPUT_FILENAME,
          outputMimeType: BASE64_MIME_TYPE,
          defaultIndent: 2,
          indentSpaceOptions: [2, 4],
          indentIncludeTab: false,
        },
        outputEditor: {
          value: "",
          language: "text",
          placeholder: BASE64_PLACEHOLDER_OUTPUT,
        },
      }}
    />
  );
};

export default Base64Page;
