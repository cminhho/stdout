import { useState, useRef, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { SelectWithOptions } from "@/components/ui/select";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FileUploadButton from "@/components/FileUploadButton";
import { ClearButton } from "@/components/ClearButton";
import { SaveButton } from "@/components/SaveButton";
import { Upload } from "lucide-react";

const ImageResizerPage = () => {
  const tool = useCurrentTool();
  const [imageSrc, setImageSrc] = useState("");
  const [origW, setOrigW] = useState(0);
  const [origH, setOrigH] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [keepRatio, setKeepRatio] = useState(true);
  const [quality, setQuality] = useState(90);
  const [format, setFormat] = useState<"png" | "jpeg" | "webp">("png");
  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const loadImageFromFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        setOrigW(img.width);
        setOrigH(img.height);
        setWidth(img.width);
        setHeight(img.height);
        setImageSrc(reader.result as string);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadImageFromFile(file);
  };

  const handleWidthChange = (w: number) => {
    setWidth(w);
    if (keepRatio && origW) setHeight(Math.round((w / origW) * origH));
  };

  const handleHeightChange = (h: number) => {
    setHeight(h);
    if (keepRatio && origH) setWidth(Math.round((h / origH) * origW));
  };

  const resize = () => {
    if (!imageSrc || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
    };
    img.src = imageSrc;
  };

  const download = useCallback(() => {
    if (!canvasRef.current) return;
    const mime = format === "png" ? "image/png" : format === "jpeg" ? "image/jpeg" : "image/webp";
    const dataUrl = canvasRef.current.toDataURL(mime, quality / 100);
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `resized.${format}`;
    a.click();
  }, [format, quality]);

  const clearImage = useCallback(() => {
    setImageSrc("");
    setOrigW(0);
    setOrigH(0);
    setWidth(0);
    setHeight(0);
  }, []);

  return (
    <ToolLayout title={tool?.label ?? "Image Resizer"} description={tool?.description ?? "Resize images with format conversion"}>
      <div className="grid grid-cols-1 lg:grid-cols-2 tool-content-grid flex-1 min-h-0">
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader
            label="Upload Image"
            extra={
              <div className="flex items-center gap-2">
                <FileUploadButton accept="image/*" onSelect={loadImageFromFile} />
                {imageSrc && <ClearButton onClick={clearImage} />}
              </div>
            }
          />
          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-md p-6 cursor-pointer hover:border-primary/50 transition-colors min-h-[200px]" onClick={() => fileRef.current?.click()}>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Click to upload</p>
            {origW > 0 && <p className="text-xs text-foreground mt-2 font-mono">{origW} × {origH}px</p>}
          </div>
          {imageSrc && (
            <div className="space-y-3 mt-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">Width</label>
                  <Input type="number" value={width} onChange={(e) => handleWidthChange(Number(e.target.value))} className="h-8 font-mono text-xs" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Height</label>
                  <Input type="number" value={height} onChange={(e) => handleHeightChange(Number(e.target.value))} className="h-8 font-mono text-xs" />
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                  <input type="checkbox" checked={keepRatio} onChange={(e) => setKeepRatio(e.target.checked)} className="accent-primary" />
                  Keep ratio
                </label>
                <SelectWithOptions
                  size="sm"
                  variant="secondary"
                  value={format}
                  onValueChange={(v) => setFormat(v as "png" | "jpeg" | "webp")}
                  options={[
                    { value: "png", label: "PNG" },
                    { value: "jpeg", label: "JPEG" },
                    { value: "webp", label: "WebP" },
                  ]}
                  title="Output format"
                  aria-label="Output format"
                />
                {format !== "png" && (
                  <div className="flex items-center gap-1">
                    <label className="text-xs text-muted-foreground">Quality:</label>
                    <input type="range" min={10} max={100} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-20 accent-primary" />
                    <span className="text-xs font-mono w-8">{quality}%</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={resize}>Resize</Button>
                <SaveButton label="Download" onClick={download} className="h-7 text-xs" />
              </div>
            </div>
          )}
        </div>
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader label="Preview" />
          <div className="code-block flex flex-1 min-h-0 items-center justify-center overflow-auto">
            <canvas ref={canvasRef} className="max-w-full max-h-[60vh] object-contain" />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default ImageResizerPage;
