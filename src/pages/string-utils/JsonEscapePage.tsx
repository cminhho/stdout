import EscaperPage from "./EscaperPage";
import { useCurrentTool } from "@/hooks/useCurrentTool";

export default function JsonEscapePage() {
  const tool = useCurrentTool();
  return <EscaperPage type="json" title={tool?.label ?? "JSON Escape"} description={tool?.description ?? "Escape JSON string content"} />;
}
