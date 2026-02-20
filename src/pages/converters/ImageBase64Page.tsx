import { useState, useRef } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import CopyButton from "@/components/CopyButton";
import { Button } from "@/components/ui/button";
import { Upload, Eraser } from "lucide-react";
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

  return (
    <ToolLayout title={tool?.label ?? "Image ↔ Base64"} description={tool?.description ?? "Convert images to/from Base64 strings"}>
      <div className="flex gap-2 mb-3">
        <Button size="sm" variant={mode === "toBase64" ? "default" : "outline"} onClick={() => setMode("toBase64")}>Image → Base64</Button>
        <Button size="sm" variant={mode === "toImage" ? "default" : "outline"} onClick={() => setMode("toImage")}>Base64 → Image</Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-1 min-h-0">
        <div className="tool-panel flex flex-col min-h-0">
          {mode === "toBase64" ? (
            <>
              <div className="flex items-center min-h-[28px]">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider select-none">Image Input</span>
              </div>
              <div className="flex-1 min-h-0 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-md p-8 cursor-pointer hover:border-primary/50 transition-colors" onClick={() => fileRef.current?.click()}>
                <input ref={fileRef} type="file" accept={IMAGE_BASE64_ACCEPT} onChange={handleFile} className="hidden" />
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Click to upload an image</p>
                {fileName && (
                  <div className="mt-3 text-xs text-foreground">
                    <span className="font-mono">{fileName}</span> · <span>{fileSize}</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <PanelHeader
                label="Base64 Input"
                extra={
                  <div className="flex items-center gap-2">
                    <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleBase64Input("")}>
                      <Eraser className="h-3.5 w-3.5 mr-1.5" />
                      Clear
                    </Button>
                  </div>
                }
              />
              <div className="flex-1 min-h-0 flex flex-col">
                <CodeEditor value={base64} onChange={handleBase64Input} language="text" placeholder={IMAGE_BASE64_PLACEHOLDER_INPUT} fillHeight />
              </div>
            </>
          )}
        </div>
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader
            label={mode === "toBase64" ? "Base64 Output" : "Image Preview"}
            text={mode === "toBase64" ? base64 : ""}
            extra={mode === "toImage" && imageUrl ? <Button size="sm" variant="outline" onClick={downloadImage}>Download</Button> : undefined}
          />
          {mode === "toBase64" ? (
            <div className="flex-1 min-h-0 flex flex-col">
              <CodeEditor value={base64 || ""} readOnly language="text" placeholder={IMAGE_BASE64_PLACEHOLDER_OUTPUT} fillHeight />
            </div>
          ) : (
            <div className="code-block flex items-center justify-center min-h-[280px]">
              {imageUrl ? <img src={imageUrl} alt="Preview" className="max-w-full max-h-[60vh] object-contain rounded" /> : <span className="text-muted-foreground text-sm">{IMAGE_BASE64_PREVIEW_PLACEHOLDER}</span>}
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
};

export default ImageBase64Page;
