import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useToolEngine } from "@/hooks/useToolEngine";
import { getDeepLinkInput } from "@/utils/deepLink";

/**
 * Handles /open?tool=id&input=... (and optionally token=...).
 * Applies workspace state and redirects to the tool path (replace).
 */
export default function OpenRoutePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setToolState } = useWorkspace();
  const { getToolById } = useToolEngine();

  useEffect(() => {
    const toolId = searchParams.get("tool")?.trim();
    if (!toolId) {
      navigate("/", { replace: true });
      return;
    }
    const tool = getToolById(toolId);
    if (!tool) {
      navigate("/", { replace: true });
      return;
    }
    const input = getDeepLinkInput({
      input: searchParams.get("input") ?? "",
      token: searchParams.get("token") ?? "",
    });
    if (input) setToolState(toolId, { input });
    navigate(tool.path, { replace: true });
  }, [searchParams, navigate, setToolState, getToolById]);

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground min-h-0"
      aria-live="polite"
    >
      <span
        className="inline-block h-5 w-5 rounded-full border-[1.5px] border-current border-t-transparent animate-spin"
        aria-hidden
      />
      <span className="text-[13px] font-normal tracking-[0.01em] text-muted-foreground/90">
        Opening…
      </span>
    </div>
  );
}
