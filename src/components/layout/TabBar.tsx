/**
 * VS Code–style tab strip, at the top of the content area (right of the sidebar). Tabs are tool
 * instances — the same tool can appear more than once (disambiguated by an ordinal). Click to switch,
 * X or middle-click to close, "+" to open a new instance of the active tool (data-processing tools only).
 * The active tab is `activeTabId` while on a tool route. Hidden entirely when no tabs are open.
 */
import type React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { X, Plus } from "lucide-react";
import { getToolById, getToolByPath, toolAllowsMultiInstance } from "@/tools";
import { getToolIcon } from "@/components/common/ToolIcons";
import { useTabs } from "@/contexts/TabsContext";
import { cn } from "@/utils/cn";

const noDrag = { WebkitAppRegion: "no-drag" } as React.CSSProperties;

export default function TabBar() {
  const { tabs, activeTabId, closeTab, activateTab, openNewInstance } = useTabs();
  const location = useLocation();
  const navigate = useNavigate();

  if (tabs.length === 0) return null;

  const routedTool = getToolByPath(location.pathname);
  const onToolRoute = routedTool !== undefined;

  // Per-tool ordinals so duplicate instances read "JSON Format", "JSON Format 2", …
  const totals = new Map<string, number>();
  tabs.forEach((t) => totals.set(t.toolId, (totals.get(t.toolId) ?? 0) + 1));
  const seen = new Map<string, number>();

  const select = (tabId: string, toolId: string) => {
    activateTab(tabId);
    const tool = getToolById(toolId);
    if (tool) navigate(tool.path); // no-op when already on this tool path (same-tool instance switch)
  };

  const close = (tabId: string) => {
    const idx = tabs.findIndex((t) => t.id === tabId);
    const wasActive = onToolRoute && tabId === activeTabId;
    closeTab(tabId);
    if (!wasActive) return;
    const remaining = tabs.filter((t) => t.id !== tabId);
    if (remaining.length === 0) {
      navigate("/");
      return;
    }
    const neighbor = remaining[Math.min(idx, remaining.length - 1)];
    const tool = getToolById(neighbor.toolId);
    if (tool) navigate(tool.path);
  };

  const canAddInstance = onToolRoute && toolAllowsMultiInstance(routedTool!.id);
  const addInstance = () => {
    openNewInstance(routedTool!.id);
    navigate(routedTool!.path);
  };

  return (
    <div className="tab-bar flex items-stretch shrink-0 overflow-x-auto" style={noDrag} role="tablist" aria-label="Open tools">
      {tabs.map((tab) => {
        const tool = getToolById(tab.toolId);
        if (!tool) return null;
        const Icon = getToolIcon(tool.icon);
        const active = onToolRoute && tab.id === activeTabId;
        const n = (seen.get(tab.toolId) ?? 0) + 1;
        seen.set(tab.toolId, n);
        const label = (totals.get(tab.toolId) ?? 1) > 1 ? `${tool.label} ${n}` : tool.label;
        return (
          <div
            key={tab.id}
            role="tab"
            aria-selected={active}
            tabIndex={0}
            title={label}
            className={cn("tab-bar__tab", active && "tab-bar__tab--active")}
            onClick={() => select(tab.id, tab.toolId)}
            onAuxClick={(e) => {
              if (e.button === 1) {
                e.preventDefault();
                close(tab.id);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                select(tab.id, tab.toolId);
              }
            }}
          >
            <Icon className="tab-bar__icon" aria-hidden />
            <span className="tab-bar__label">{label}</span>
            <button
              type="button"
              className="tab-bar__close"
              aria-label={`Close ${label}`}
              onClick={(e) => {
                e.stopPropagation();
                close(tab.id);
              }}
            >
              <X aria-hidden />
            </button>
          </div>
        );
      })}
      {canAddInstance && (
        <button
          type="button"
          className="tab-bar__add"
          aria-label={`New ${routedTool!.label} tab`}
          title={`New ${routedTool!.label} tab`}
          onClick={addInstance}
        >
          <Plus aria-hidden />
        </button>
      )}
    </div>
  );
}
