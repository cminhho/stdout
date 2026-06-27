/**
 * VS Code–style tab strip at the top of the content area. Click to switch, X/middle-click to close,
 * drag to reorder, "+" to open a new instance of the active tool. Active tab = the one matching the URL.
 */
import type React from "react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { X, Plus } from "lucide-react";
import { getToolById, getToolByPath, toolAllowsMultiInstance } from "@/tools";
import { getToolIcon } from "@/components/common/ToolIcons";
import { useTabs } from "@/contexts/TabsContext";
import { useTabNavigation } from "@/hooks/useTabNavigation";
import { tabDisplayLabels } from "@/utils/tabLabels";
import { cn } from "@/utils/cn";

const noDrag = { WebkitAppRegion: "no-drag" } as React.CSSProperties;

export default function TabBar() {
  const { tabs, activeTabId, reorderTab, openNewInstance } = useTabs();
  const { selectTab, closeTabWithNav } = useTabNavigation();
  const location = useLocation();
  const navigate = useNavigate();
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  if (tabs.length === 0) return null;

  const routedTool = getToolByPath(location.pathname);
  const labels = tabDisplayLabels(tabs);

  const canAddInstance = routedTool !== undefined && toolAllowsMultiInstance(routedTool.id);
  const addInstance = () => {
    if (routedTool) {
      openNewInstance(routedTool.id);
      navigate(routedTool.path);
    }
  };

  const onDrop = (targetId: string) => {
    if (dragId && dragId !== targetId) reorderTab(dragId, targetId);
    setDragId(null);
    setOverId(null);
  };

  return (
    <div className="tab-bar flex items-stretch shrink-0 overflow-x-auto" style={noDrag} role="tablist" aria-label="Open tools">
      {tabs.map((tab) => {
        const tool = getToolById(tab.toolId);
        if (!tool) return null;
        const Icon = getToolIcon(tool.icon);
        const active = routedTool !== undefined && tab.id === activeTabId;
        const label = labels.get(tab.id) ?? tool.label;
        return (
          <div
            key={tab.id}
            role="tab"
            aria-selected={active}
            tabIndex={0}
            title={label}
            draggable
            onDragStart={(e) => {
              setDragId(tab.id);
              e.dataTransfer.effectAllowed = "move";
              try {
                e.dataTransfer.setData("text/plain", tab.id);
              } catch {
                /* some browsers restrict setData */
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              if (overId !== tab.id) setOverId(tab.id);
            }}
            onDrop={(e) => {
              e.preventDefault();
              onDrop(tab.id);
            }}
            onDragEnd={() => {
              setDragId(null);
              setOverId(null);
            }}
            className={cn(
              "tab-bar__tab",
              active && "tab-bar__tab--active",
              dragId && dragId !== tab.id && overId === tab.id && "tab-bar__tab--dragover",
              dragId === tab.id && "tab-bar__tab--dragging"
            )}
            onClick={() => selectTab(tab.id)}
            onAuxClick={(e) => {
              if (e.button === 1) {
                e.preventDefault();
                closeTabWithNav(tab.id);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                selectTab(tab.id);
              }
            }}
          >
            <Icon className="tab-bar__icon" aria-hidden />
            <span className="tab-bar__label">{label}</span>
            <button
              type="button"
              className="tab-bar__close"
              draggable={false}
              aria-label={`Close ${label}`}
              onClick={(e) => {
                e.stopPropagation();
                closeTabWithNav(tab.id);
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
          draggable={false}
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
