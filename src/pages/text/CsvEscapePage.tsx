import EscaperPage from "./EscaperPage";
import { useCurrentTool } from "@/hooks/useCurrentTool";

export default function CsvEscapePage() {
  const tool = useCurrentTool();
  return <EscaperPage type="csv" title={tool?.label ?? "CSV Escape"} description={tool?.description ?? "Escape CSV fields (RFC 4180)"} />;
}
