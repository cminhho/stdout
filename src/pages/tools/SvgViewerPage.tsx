import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import CodeEditor from "@/components/CodeEditor";
import PanelHeader from "@/components/PanelHeader";

const SvgViewerPage = () => {
  const tool = useCurrentTool();
  const [svg, setSvg] = useState('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">\n  <circle cx="50" cy="50" r="40" fill="#22c55e" opacity="0.8"/>\n  <rect x="30" y="30" width="40" height="40" fill="#0ea5e9" rx="8" opacity="0.7"/>\n</svg>');
  const [bgColor, setBgColor] = useState("#1a1a2e");

  const downloadPng = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 800;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 800, 800);
      URL.revokeObjectURL(url);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = "svg-export.png";
      a.click();
    };
    img.src = url;
  };

  return (
    <ToolLayout title={tool?.label ?? "SVG Viewer"} description={tool?.description ?? "View, edit, and export SVG graphics"}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="tool-panel flex-1 min-h-0">
          <PanelHeader label="SVG Code" text={svg} onClear={() => setSvg("")} />
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <CodeEditor
              value={svg}
              onChange={setSvg}
              language="svg"
              placeholder='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">...</svg>'
              fillHeight
            />
          </div>
        </div>
        <div className="tool-panel flex-1 min-h-0">
          <div className="flex-shrink-0 flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Preview</span>
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground">BG:</label>
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-6 h-6 rounded border-0 cursor-pointer" />
              <button onClick={downloadPng} className="text-xs px-2 py-1 rounded border border-border text-muted-foreground hover:text-foreground transition-colors">Export PNG</button>
            </div>
          </div>
          <div className="flex-1 min-h-0 flex items-center justify-center overflow-auto rounded-md border border-border" style={{ backgroundColor: bgColor }}>
            <div dangerouslySetInnerHTML={{ __html: svg }} className="max-w-full max-h-full [&>svg]:max-w-full [&>svg]:max-h-full" />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default SvgViewerPage;
