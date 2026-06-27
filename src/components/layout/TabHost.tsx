/**
 * Keep-alive host for open tool tabs. Every open tab (a tool instance) is mounted simultaneously;
 * only the active tab is visible (others are `hidden` → state/scroll/cursor preserved, instant switch).
 * The visible tab is `activeTabId`, but only while on a tool route — on Home/Settings nothing shows,
 * so those routes render normally. Per-tab Suspense + ErrorBoundary so one tab can't blank the others.
 */
import { Suspense } from "react";
import { useLocation } from "react-router-dom";
import { getToolById, getToolByPath } from "@/tools";
import { ToolErrorBoundary } from "@/components/tools/ToolErrorBoundary";
import { TabToolProvider } from "@/contexts/TabToolContext";
import { useTabs } from "@/contexts/TabsContext";
import { cn } from "@/utils/cn";

const SUSPENSE_FALLBACK = (
  <div
    className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground min-h-0"
    aria-live="polite"
    aria-busy="true"
  >
    <span
      className="inline-block h-5 w-5 rounded-full border-[1.5px] border-current border-t-transparent animate-spin"
      aria-hidden
    />
    <span className="text-[13px] font-normal tracking-[0.01em] text-muted-foreground/90">Loading…</span>
  </div>
);

export default function TabHost() {
  const { tabs, activeTabId } = useTabs();
  const location = useLocation();
  // Only show a tab when on a tool route; Home/Settings/Open render via RouteSurface instead.
  const onToolRoute = getToolByPath(location.pathname) !== undefined;

  return (
    <>
      {tabs.map((tab) => {
        const tool = getToolById(tab.toolId);
        if (!tool) return null;
        const isActive = onToolRoute && tab.id === activeTabId;
        const Component = tool.component;
        return (
          <div
            key={tab.id}
            className={cn("flex-1 min-h-0 min-w-0 flex flex-col", !isActive && "hidden")}
            aria-hidden={!isActive}
          >
            <TabToolProvider tabId={tab.id} toolId={tab.toolId} isActive={isActive}>
              <ToolErrorBoundary toolId={tool.id} toolLabel={tool.label}>
                <Suspense fallback={SUSPENSE_FALLBACK}>
                  <Component />
                </Suspense>
              </ToolErrorBoundary>
            </TabToolProvider>
          </div>
        );
      })}
    </>
  );
}
