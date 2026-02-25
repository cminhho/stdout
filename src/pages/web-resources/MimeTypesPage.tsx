import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import ToolPane from "@/components/ToolPane";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClearButton } from "@/components/ClearButton";

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

  const pane = {
    title: "MIME Types",
    toolbar: query ? <ClearButton onClick={() => setQuery("")} /> : undefined,
    children: (
      <div className="flex flex-col gap-2 flex-1 min-h-0">
        <section className="flex flex-col gap-2 max-w-md shrink-0" aria-label="Search">
          <Label className="text-sm text-muted-foreground mb-2 block">Search</Label>
          <Input
            placeholder="Search by type or description..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 rounded-lg px-3 py-2 font-mono text-sm border bg-background text-foreground placeholder:text-muted-foreground transition-colors"
            aria-label="Search MIME types"
          />
        </section>
        <p className="tool-caption shrink-0" aria-live="polite">
          {filtered.length} of {MIME_LIST.length} types
        </p>
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground shrink-0">No MIME types match your search.</p>
        ) : (
          <div
            className="tool-reference-table-wrap flex-1 min-h-0 overflow-auto"
            role="region"
            aria-label="MIME types table"
          >
            <table className="tool-reference-table">
              <thead className="sticky top-0 z-10">
                <tr>
                  <th>MIME Type</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.type}>
                    <td className="font-mono">{m.type}</td>
                    <td className="text-muted-foreground">{m.description ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    ),
  };

  return (
    <ToolLayout>
      <div className="flex flex-col gap-2 flex-1 min-h-0">
        <ToolPane pane={pane} />
      </div>
    </ToolLayout>
  );
};

export default MimeTypesPage;
