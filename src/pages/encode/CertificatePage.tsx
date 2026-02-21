import { useState } from "react";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import { ClearButton } from "@/components/ClearButton";
import { SampleButton } from "@/components/SampleButton";
import FileUploadButton from "@/components/FileUploadButton";
import {
  processCertificateForLayout,
  CERTIFICATE_FILE_ACCEPT,
  CERTIFICATE_SAMPLE,
  CERTIFICATE_PLACEHOLDER_INPUT,
  CERTIFICATE_PLACEHOLDER_OUTPUT,
  CERTIFICATE_OUTPUT_FILENAME,
  CERTIFICATE_MIME_TYPE,
} from "@/utils/certificate";

const CertificatePage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState("");

  return (
    <TwoPanelToolLayout
      tool={tool}
      inputPane={{
        inputToolbar: {
          onSample: () => setInput(CERTIFICATE_SAMPLE),
          setInput,
          fileAccept: CERTIFICATE_FILE_ACCEPT,
          onFileText: setInput,
        },
        inputEditor: {
          value: input,
          onChange: setInput,
          language: "plaintext",
          placeholder: CERTIFICATE_PLACEHOLDER_INPUT,
        },
      }}
      outputPane={{
        outputToolbar: {
          format: processCertificateForLayout,
          outputFilename: CERTIFICATE_OUTPUT_FILENAME,
          outputMimeType: CERTIFICATE_MIME_TYPE,
          defaultIndent: 2,
          indentSpaceOptions: [2, 4],
          indentIncludeTab: false,
        },
        outputEditor: {
          value: "",
          language: "json",
          placeholder: CERTIFICATE_PLACEHOLDER_OUTPUT,
        },
      }}
    />
  );
};

export default CertificatePage;
