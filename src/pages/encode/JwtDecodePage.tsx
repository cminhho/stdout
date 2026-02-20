import { useState } from "react";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
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
  const [input, setInput] = useState("");

  return (
    <TwoPanelToolLayout
      tool={tool}
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
        outputEditor: {
          value: "",
          language: "json",
          placeholder: JWT_DECODE_PLACEHOLDER_OUTPUT,
        },
      }}
    />
  );
};

export default JwtDecodePage;
