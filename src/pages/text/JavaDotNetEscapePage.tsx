import EscaperPage from "./EscaperPage";
import { useCurrentTool } from "@/hooks/useCurrentTool";

export default function JavaDotNetEscapePage() {
  const tool = useCurrentTool();
  return <EscaperPage type="java" title={tool?.label ?? "Java / .NET Escape"} description={tool?.description ?? "Escape string literals for Java and .NET"} />;
}
