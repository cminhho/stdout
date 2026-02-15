import EscaperPage from "./EscaperPage";
import { useCurrentTool } from "@/hooks/useCurrentTool";

export default function XmlEscapePage() {
  const tool = useCurrentTool();
  return <EscaperPage type="xml" title={tool?.label ?? "XML Escape"} description={tool?.description ?? "Escape and unescape XML special characters"} />;
}
