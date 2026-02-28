import { useState, useRef } from "react";
import { Upload } from "lucide-react";

import { ClearButton } from "@/components/common/ClearButton";
import CodeEditor from "@/components/common/CodeEditor";
import { SegmentGroup } from "@/components/common/SegmentGroup";
import TwoPanelToolLayout from "@/components/layout/TwoPanelToolLayout";
import { Button } from "@/components/ui/button";
import {
  base64ToDataUrl,
  formatFileSizeKb,
  IMAGE_BASE64_ACCEPT,
  IMAGE_BASE64_DOWNLOAD_FILENAME,
  IMAGE_BASE64_PLACEHOLDER_INPUT,
  IMAGE_BASE64_PLACEHOLDER_OUTPUT,
  IMAGE_BASE64_PREVIEW_PLACEHOLDER,
} from "@/utils/imageBase64";

const ImageBase64Page = () => {
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
      <section className="tool-section-card flex-1 min-h-0 flex flex-col overflow-hidden" aria-label="Upload image">
        <div
          role="button"
          tabIndex={0}
          className="flex-1 min-h-0 min-h-[12rem] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-[var(--home-radius-card)] p-8 cursor-pointer hover:border-primary/50 transition-colors duration-150"
          onClick={() => fileRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileRef.current?.click();
            }
          }}
          aria-label="Upload image (click or press Enter)"
        >
          <input ref={fileRef} type="file" accept={IMAGE_BASE64_ACCEPT} onChange={handleFile} className="hidden" aria-label="Upload image file" />
          <Upload className="h-8 w-8 text-muted-foreground mb-2 shrink-0" aria-hidden />
          <p className="text-[length:var(--text-ui)] text-muted-foreground">Click to upload an image</p>
          {fileName && (
            <div className="mt-3 text-[length:var(--text-ui)] text-foreground">
              <span className="font-mono">{fileName}</span> · <span>{fileSize}</span>
            </div>
          )}
        </div>
      </section>
    ) : (
      <section className="tool-section-card tool-section-card--fill flex-1 min-h-0 flex flex-col overflow-hidden" aria-label="Base64 input">
        <CodeEditor value={base64} onChange={handleBase64Input} language="text" placeholder={IMAGE_BASE64_PLACEHOLDER_INPUT} fillHeight />
      </section>
    );

  const outputPaneContent =
    mode === "toBase64" ? (
      <section className="tool-section-card tool-section-card--fill flex-1 min-h-0 flex flex-col overflow-hidden" aria-label="Base64 output">
        <CodeEditor value={base64 || ""} readOnly language="text" placeholder={IMAGE_BASE64_PLACEHOLDER_OUTPUT} fillHeight />
      </section>
    ) : (
      <section className="tool-section-card flex-1 min-h-0 flex flex-col overflow-hidden items-center justify-center min-h-[280px] bg-muted/20 dark:bg-muted/10 rounded-[var(--home-radius-card)] border border-border" aria-label="Image preview">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Decoded image preview"
            className="max-w-full max-h-[60vh] object-contain rounded-[var(--home-radius-card)] transition-opacity duration-150"
          />
        ) : (
          <span className="text-muted-foreground text-[length:var(--text-ui)]">{IMAGE_BASE64_PREVIEW_PLACEHOLDER}</span>
        )}
      </section>
    );

  return (
    <TwoPanelToolLayout
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
        toolbar:
          mode === "toImage" && imageUrl ? (
            <>
              <Button
                size="xs"
                variant="outline"
                onClick={downloadImage}
                className="cursor-pointer transition-colors duration-150"
                aria-label="Download decoded image"
              >
                Download
              </Button>
            </>
          ) : undefined,
        children: outputPaneContent,
      }}
    />
  );
};

export default ImageBase64Page;
