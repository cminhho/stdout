import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getToolIcon } from "@/components/common/ToolIcons";
import { useToolEngine } from "@/hooks/useToolEngine";
import { useSettings } from "@/hooks/useSettings";
import { matchTool } from "@/tools/matchTool";
import { cn } from "@/utils/cn";

const SEARCH_PLACEHOLDER = "Search tools by name, description, or category…";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { tools, getToolByPath } = useToolEngine();
  const { isToolVisible } = useSettings();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const visibleTools = useMemo(
    () => tools.filter((t) => isToolVisible(t.path)),
    [tools, isToolVisible]
  );

  const filteredTools = useMemo(
    () => visibleTools.filter((t) => matchTool(query, t)),
    [visibleTools, query]
  );

  const selectAndClose = useCallback(
    (path: string) => {
      navigate(path);
      onOpenChange(false);
      setQuery("");
      setSelectedIndex(0);
    },
    [navigate, onOpenChange]
  );

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex((i) => (filteredTools.length ? Math.min(i, filteredTools.length - 1) : 0));
  }, [filteredTools.length, query]);

  useEffect(() => {
    if (!listRef.current || !open) return;
    const el = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex, open]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => (i < filteredTools.length - 1 ? i + 1 : 0));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => (i > 0 ? i - 1 : filteredTools.length - 1));
        return;
      }
      if (e.key === "Enter" && filteredTools[selectedIndex]) {
        e.preventDefault();
        selectAndClose(filteredTools[selectedIndex].path);
        return;
      }
    },
    [filteredTools, selectedIndex, selectAndClose]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-xl p-0 gap-0"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          inputRef.current?.focus();
        }}
      >
        <DialogTitle>Search tools</DialogTitle>
        <div className="border-b border-border p-2">
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={SEARCH_PLACEHOLDER}
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            aria-label="Search tools"
            autoComplete="off"
          />
        </div>
        <ul
          ref={listRef}
          role="listbox"
          aria-label="Tools"
          className="max-h-[min(60vh,400px)] overflow-y-auto p-1"
        >
          {filteredTools.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted-foreground">No tools found</li>
          ) : (
            filteredTools.map((tool, index) => {
              const Icon = getToolIcon(tool.icon);
              return (
                <li
                  key={tool.path}
                  data-index={index}
                  role="option"
                  aria-selected={index === selectedIndex}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 cursor-pointer text-left",
                    index === selectedIndex
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground hover:bg-muted/60"
                  )}
                  onClick={() => selectAndClose(tool.path)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <Icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{tool.label}</span>
                    <span className="block truncate text-xs text-muted-foreground">{tool.group}</span>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
