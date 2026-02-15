import { useState, useRef } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import { Button } from "@/components/ui/button";
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

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
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

  const download = () => {
    if (!canvasRef.current) return;
    const mime = format === "png" ? "image/png" : format === "jpeg" ? "image/jpeg" : "image/webp";
    const url = canvasRef.current.toDataURL(mime, quality / 100);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resized.${format}`;
    a.click();
  };

  return (
    <ToolLayout title={tool?.label ?? "Image Resizer"} description={tool?.description ?? "Resize images with format conversion"}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="tool-panel">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Upload Image</label>
          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-md p-6 cursor-pointer hover:border-primary/50 transition-colors" onClick={() => fileRef.current?.click()}>
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
                  <input type="number" value={width} onChange={(e) => handleWidthChange(Number(e.target.value))} className="w-full rounded-md border px-2 py-1.5 text-xs font-mono bg-background border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Height</label>
                  <input type="number" value={height} onChange={(e) => handleHeightChange(Number(e.target.value))} className="w-full rounded-md border px-2 py-1.5 text-xs font-mono bg-background border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                  <input type="checkbox" checked={keepRatio} onChange={(e) => setKeepRatio(e.target.checked)} className="accent-primary" />
                  Keep ratio
                </label>
                <select value={format} onChange={(e) => setFormat(e.target.value as any)} className="rounded-md border px-2 py-1 text-xs bg-background border-border text-foreground">
                  <option value="png">PNG</option>
                  <option value="jpeg">JPEG</option>
                  <option value="webp">WebP</option>
                </select>
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
                <Button size="sm" variant="outline" onClick={download}>Download</Button>
              </div>
            </div>
          )}
        </div>
        <div className="tool-panel">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Preview</label>
          <div className="code-block flex items-center justify-center min-h-[280px] overflow-auto">
            <canvas ref={canvasRef} className="max-w-full max-h-[60vh] object-contain" />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default ImageResizerPage;
