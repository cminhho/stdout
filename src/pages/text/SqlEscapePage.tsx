import EscaperPage from "./EscaperPage";
import { useCurrentTool } from "@/hooks/useCurrentTool";

export default function SqlEscapePage() {
  const tool = useCurrentTool();
  return <EscaperPage type="sql" title={tool?.label ?? "SQL Escape"} description={tool?.description ?? "Escape SQL string literals"} />;
}
