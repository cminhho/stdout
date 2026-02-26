import { useState, useCallback } from "react";
import TwoPanelToolLayout from "@/components/layout/TwoPanelToolLayout";
import { SaveButton } from "@/components/common/SaveButton";

const SVG_SAMPLE = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">\n  <circle cx="50" cy="50" r="40" fill="#22c55e" opacity="0.8"/>\n  <rect x="30" y="30" width="40" height="40" fill="#0ea5e9" rx="8" opacity="0.7"/>\n</svg>';
const SVG_PLACEHOLDER = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">...</svg>';
const SVG_FILE_ACCEPT = ".svg,image/svg+xml";

const SvgViewerPage = () => {
  const [svg, setSvg] = useState(SVG_SAMPLE);
  const [bgColor, setBgColor] = useState("#1a1a2e");

  const downloadPng = useCallback(() => {
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
  }, [svg]);

  return (
    <TwoPanelToolLayout
      inputPane={{
        inputToolbar: {
          onSample: () => setSvg(SVG_SAMPLE),
          setInput: setSvg,
          fileAccept: SVG_FILE_ACCEPT,
          onFileText: setSvg,
        },
        inputEditor: {
          value: svg,
          onChange: setSvg,
          language: "svg",
          placeholder: SVG_PLACEHOLDER,
        },
      }}
      outputPane={{
        title: "Preview",
        toolbar: (
          <>
            <label className="tool-caption flex items-center gap-1">
              BG
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-6 h-6 rounded border-0 cursor-pointer"
              />
            </label>
            <SaveButton label="Export PNG" onClick={downloadPng} className="h-7 text-xs" />
          </>
        ),
        children: (
          <div
            className="flex-1 min-h-0 flex items-center justify-center overflow-auto rounded-md border border-border"
            style={{ backgroundColor: bgColor }}
          >
            <div dangerouslySetInnerHTML={{ __html: svg }} className="max-w-full max-h-full [&>svg]:max-w-full [&>svg]:max-h-full" />
          </div>
        ),
      }}
    />
  );
};

export default SvgViewerPage;
