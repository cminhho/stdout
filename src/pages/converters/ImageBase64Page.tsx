import { useState, useRef } from "react";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { SegmentGroup } from "@/components/SegmentGroup";
import { ClearButton } from "@/components/ClearButton";
import { Upload } from "lucide-react";
import {
  base64ToDataUrl,
  formatFileSizeKb,
  IMAGE_BASE64_ACCEPT,
  IMAGE_BASE64_DOWNLOAD_FILENAME,
  IMAGE_BASE64_PLACEHOLDER_INPUT,
  IMAGE_BASE64_PLACEHOLDER_OUTPUT,
  IMAGE_BASE64_PREVIEW_PLACEHOLDER,
} from "@/utils/imageBase64";

const DEFAULT_TITLE = "Image ↔ Base64";
const DEFAULT_DESCRIPTION = "Convert images to/from Base64 strings";

const ImageBase64Page = () => {
  const tool = useCurrentTool();
  const [mode, setMode] = useState<"toBase64" | "toImage">("toBase64");
  const [base64, setBase64] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setFileSize(formatFileSizeKb(file.size));
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setBase64(result);
      setImageUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleBase64Input = (val: string) => {
    setBase64(val);
    setImageUrl(base64ToDataUrl(val));
  };

  const downloadImage = () => {
    if (!imageUrl) return;
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = IMAGE_BASE64_DOWNLOAD_FILENAME;
    a.click();
  };

  const modeOptions = [
    { value: "toBase64" as const, label: "Image → Base64" },
    { value: "toImage" as const, label: "Base64 → Image" },
  ];

  const inputPaneContent =
    mode === "toBase64" ? (
      <div
        className="flex-1 min-h-0 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-md p-8 cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => fileRef.current?.click()}
      >
        <input ref={fileRef} type="file" accept={IMAGE_BASE64_ACCEPT} onChange={handleFile} className="hidden" />
        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">Click to upload an image</p>
        {fileName && (
          <div className="mt-3 text-xs text-foreground">
            <span className="font-mono">{fileName}</span> · <span>{fileSize}</span>
          </div>
        )}
      </div>
    ) : (
      <div className="flex-1 min-h-0 flex flex-col">
        <CodeEditor value={base64} onChange={handleBase64Input} language="text" placeholder={IMAGE_BASE64_PLACEHOLDER_INPUT} fillHeight />
      </div>
    );

  const outputPaneContent =
    mode === "toBase64" ? (
      <div className="flex-1 min-h-0 flex flex-col">
        <CodeEditor value={base64 || ""} readOnly language="text" placeholder={IMAGE_BASE64_PLACEHOLDER_OUTPUT} fillHeight />
      </div>
    ) : (
      <div className="code-block flex items-center justify-center min-h-[280px]">
        {imageUrl ? (
          <img src={imageUrl} alt="Preview" className="max-w-full max-h-[60vh] object-contain rounded" />
        ) : (
          <span className="text-muted-foreground text-sm">{IMAGE_BASE64_PREVIEW_PLACEHOLDER}</span>
        )}
      </div>
    );

  return (
    <TwoPanelToolLayout
      tool={tool}
      title={tool?.label ?? DEFAULT_TITLE}
      description={tool?.description ?? DEFAULT_DESCRIPTION}
      inputPane={{
        title: "Input",
        toolbar: (
          <>
            <SegmentGroup<"toBase64" | "toImage">
              value={mode}
              onValueChange={(v) => setMode(v)}
              options={modeOptions}
              ariaLabel="Conversion direction"
            />
            {mode === "toImage" && base64 ? (
              <ClearButton onClick={() => handleBase64Input("")} />
            ) : null}
          </>
        ),
        children: inputPaneContent,
      }}
      outputPane={{
        title: "Output",
        copyText: mode === "toBase64" ? base64 : undefined,
        toolbar: mode === "toImage" && imageUrl ? <Button size="xs" variant="outline" onClick={downloadImage}>Download</Button> : undefined,
        children: outputPaneContent,
      }}
    />
  );
};

export default ImageBase64Page;
