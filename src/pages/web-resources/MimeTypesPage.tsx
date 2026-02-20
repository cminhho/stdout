import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Common MIME types reference (subset of IANA list)
const MIME_LIST: { type: string; description?: string }[] = [
  { type: "text/plain", description: "Plain text" },
  { type: "text/html", description: "HTML" },
  { type: "text/css", description: "CSS" },
  { type: "text/javascript", description: "JavaScript" },
  { type: "application/javascript", description: "JavaScript" },
  { type: "application/json", description: "JSON" },
  { type: "application/xml", description: "XML" },
  { type: "text/xml", description: "XML" },
  { type: "image/jpeg", description: "JPEG image" },
  { type: "image/png", description: "PNG image" },
  { type: "image/gif", description: "GIF image" },
  { type: "image/webp", description: "WebP image" },
  { type: "image/svg+xml", description: "SVG image" },
  { type: "image/x-icon", description: "ICO icon" },
  { type: "image/bmp", description: "BMP image" },
  { type: "audio/mpeg", description: "MP3 audio" },
  { type: "audio/wav", description: "WAV audio" },
  { type: "audio/ogg", description: "OGG audio" },
  { type: "audio/webm", description: "WebM audio" },
  { type: "video/mp4", description: "MP4 video" },
  { type: "video/webm", description: "WebM video" },
  { type: "video/ogg", description: "OGG video" },
  { type: "application/pdf", description: "PDF document" },
  { type: "application/zip", description: "ZIP archive" },
  { type: "application/gzip", description: "Gzip" },
  { type: "application/x-tar", description: "TAR archive" },
  { type: "application/x-rar-compressed", description: "RAR archive" },
  { type: "application/octet-stream", description: "Binary / unknown" },
  { type: "application/x-www-form-urlencoded", description: "Form URL-encoded" },
  { type: "multipart/form-data", description: "Multipart form" },
  { type: "application/vnd.ms-excel", description: "Excel (legacy)" },
  { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", description: "Excel (.xlsx)" },
  { type: "application/vnd.ms-word", description: "Word (legacy)" },
  { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", description: "Word (.docx)" },
  { type: "text/csv", description: "CSV" },
  { type: "text/markdown", description: "Markdown" },
  { type: "font/woff", description: "WOFF font" },
  { type: "font/woff2", description: "WOFF2 font" },
  { type: "font/ttf", description: "TrueType font" },
  { type: "application/wasm", description: "WebAssembly" },
  { type: "application/graphql", description: "GraphQL" },
  { type: "application/ld+json", description: "JSON-LD" },
  { type: "text/event-stream", description: "Server-Sent Events" },
];

const MimeTypesPage = () => {
  const tool = useCurrentTool();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MIME_LIST;
    return MIME_LIST.filter(
      (m) =>
        m.type.toLowerCase().includes(q) ||
        (m.description && m.description.toLowerCase().includes(q)),
    );
  }, [query]);

  return (
    <ToolLayout
      title={tool?.label ?? "List of MIME Types"}
      description={tool?.description ?? "Reference table of common MIME types"}
    >
      <div className="space-y-4">
        <div className="max-w-md">
          <Label className="text-xs text-muted-foreground mb-1 block">Search</Label>
          <Input
            placeholder="Search by type or description..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9"
          />
        </div>
        <div className="border border-border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left font-medium px-3 py-2">MIME Type</th>
                <th className="text-left font-medium px-3 py-2">Description</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.type} className="border-b border-border last:border-0">
                  <td className="px-3 py-2 font-mono text-xs">{m.type}</td>
                  <td className="px-3 py-2 text-muted-foreground">{m.description ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground">No MIME types match your search.</p>
        )}
      </div>
    </ToolLayout>
  );
};

export default MimeTypesPage;
