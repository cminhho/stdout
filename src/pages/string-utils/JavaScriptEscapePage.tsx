import EscaperPage from "./EscaperPage";
import { useCurrentTool } from "@/hooks/useCurrentTool";

export default function JavaScriptEscapePage() {
  const tool = useCurrentTool();
  return <EscaperPage type="javascript" title={tool?.label ?? "JavaScript Escape"} description={tool?.description ?? "Escape JavaScript string literals"} />;
}
