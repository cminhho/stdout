import { useCallback, useState } from "react";
import ToolPageLayout from "@/components/layout/ToolPageLayout";
import Toolbar from "@/components/layout/Toolbar";
import TwoPanelToolLayout from "@/components/layout/TwoPanelToolLayout";
import CopyButton from "@/components/common/CopyButton";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import {
  processJwtDecodeForLayout,
  JWT_DECODE_FILE_ACCEPT,
  JWT_DECODE_SAMPLE,
  JWT_DECODE_PLACEHOLDER_INPUT,
  JWT_DECODE_PLACEHOLDER_OUTPUT,
  JWT_DECODE_OUTPUT_FILENAME,
  JWT_DECODE_MIME_TYPE,
} from "@/utils/jwtDecode";

const JwtDecodePage = () => {
  const tool = useCurrentTool();
  const { setToolState } = useWorkspace();
  const [input, setInput] = useState("");

  const handleLoadSession = useCallback(
    (state: { input?: string; scrollPosition?: number; splitPercent?: number }) => {
      if (state.input !== undefined) setInput(state.input);
      if (tool?.id) setToolState(tool.id, state);
    },
    [tool?.id, setToolState]
  );

  return (
    <ToolPageLayout
      toolbar={
        tool?.id ? (
          <Toolbar
            toolName={tool.label}
            toolId={tool.id}
            shareState={{ input }}
            onLoadSession={handleLoadSession}
          />
        ) : undefined
      }
    >
      <TwoPanelToolLayout
        persistToolId={tool?.id}
        shareState={{ input }}
        sessionShareInPageToolbar
        inputPane={{
          inputToolbar: {
            onSample: () => setInput(JWT_DECODE_SAMPLE),
            setInput,
            fileAccept: JWT_DECODE_FILE_ACCEPT,
            onFileText: setInput,
          },
          inputEditor: {
            value: input,
            onChange: setInput,
            language: "text",
            placeholder: JWT_DECODE_PLACEHOLDER_INPUT,
          },
        }}
        outputPane={{
          outputToolbar: {
            format: processJwtDecodeForLayout,
            outputFilename: JWT_DECODE_OUTPUT_FILENAME,
            outputMimeType: JWT_DECODE_MIME_TYPE,
            defaultIndent: 2,
            indentSpaceOptions: [2, 4],
            indentIncludeTab: false,
          },
          outputToolbarExtra:
            input.trim() ? (
              <CopyButton
                text={`Authorization: Bearer ${input.trim()}`}
                label="Copy as Auth header"
              />
            ) : null,
          outputEditor: {
            value: "",
            language: "json",
            placeholder: JWT_DECODE_PLACEHOLDER_OUTPUT,
          },
        }}
      />
    </ToolPageLayout>
  );
};

export default JwtDecodePage;
