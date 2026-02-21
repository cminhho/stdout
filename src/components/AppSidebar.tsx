import { useState, useMemo } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Braces, Type, FileText, Lock, Shuffle, Hash, Terminal, GitCompare,
  Clock, ChevronDown, ChevronRight, KeyRound, Fingerprint, Link2, Code2, QrCode,
  Archive, ShieldCheck, Table2, FileJson, Binary, ArrowLeftRight, Search,
  CalendarClock, FileSpreadsheet, Regex, Diff, Boxes, Globe,
  CheckCircle2, Wand2, Calculator, Palette, AlignLeft, FileCode, Database,
  TerminalSquare, FileType, List, KeySquare,
  FileOutput, Image, Scaling, FileArchive, Eye, Paintbrush, Ruler,
  FileUp, Dices, TableProperties, Settings, LetterText, ScrollText,
  PanelLeftClose, PanelLeftOpen, Coffee,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSettings } from "@/hooks/useSettings";
import { useToolEngine } from "@/hooks/useToolEngine";
import type { ToolDefinition, ToolGroup } from "@/tools/types";

// Icon lookup map
const iconMap: Record<string, React.ElementType> = {
  Braces, Type, FileText, Lock, Shuffle, Hash, Terminal, GitCompare,
  Clock, KeyRound, Fingerprint, Link2, Code2, QrCode,
  Archive, ShieldCheck, Table2, FileJson, Binary, ArrowLeftRight, Search,
  CalendarClock, FileSpreadsheet, Regex, Diff, Boxes, Globe,
  CheckCircle2, Wand2, Calculator, Palette, AlignLeft, FileCode, Database,
  TerminalSquare, FileType, List, KeySquare,
  FileOutput, Image, Scaling, FileArchive, Eye, Paintbrush, Ruler,
  FileUp, Dices, TableProperties, Settings, LetterText, ScrollText,
};

// Group icon mapping (order in sidebar follows first occurrence in tool packs)
const groupIconMap: Record<string, React.ElementType> = {
  "Formatters": FileCode,
  "Minify & Beautify": Code2,
  "Validators": CheckCircle2,
  "Converters": ArrowLeftRight,
  "Encode & Crypto": Lock,
  "String & Utilities": Type,
  "Web Resources": Globe,
  "Generators": Shuffle,
  "Image & Media": Image,
  "Networking & Other": TerminalSquare,
};

const getIcon = (name: string) => iconMap[name] || Braces;

const isElectron = typeof window !== "undefined" && !!window.electronAPI;

/** Truncates long labels to one line when sidebar is expanded (no tooltip; tooltips only when collapsed). */
const SidebarItemLabel = ({ label }: { label: string }) => (
  <span className="min-w-0 truncate block">{label}</span>
);

const SidebarGroupSection = ({
  group,
  searchQuery,
  isToolVisible,
}: {
  group: ToolGroup;
  searchQuery: string;
  isToolVisible: (path: string) => boolean;
}) => {
  const location = useLocation();
  const [open, setOpen] = useState(true);
  const GroupIcon = groupIconMap[group.label] || Braces;

  const filteredItems = group.tools
    .filter((item) => isToolVisible(item.path))
    .filter((item) => !searchQuery || item.label.toLowerCase().includes(searchQuery.toLowerCase()));

  if (filteredItems.length === 0) return null;
  const isOpen = searchQuery ? true : open;

  return (
    <div>
      <button onClick={() => setOpen(!open)} className="sidebar-link w-full justify-between">
        <span className="flex items-center gap-2 min-w-0">
          <GroupIcon className="h-4 w-4 shrink-0" />
          <span className="truncate">{group.label}</span>
        </span>
        <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? "rotate-90" : "rotate-0"}`} />
      </button>
      {isOpen && (
        <div className="ml-3 pl-2 border-l border-border space-y-1 mt-1">
          {filteredItems.map((item) => {
            const Icon = getIcon(item.icon);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`sidebar-link flex items-center gap-2 min-w-0 ${location.pathname === item.path ? "active" : ""}`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <SidebarItemLabel label={item.label} />
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
};

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { sidebarMode, sidebarCollapsed, toggleSidebar, isToolVisible } = useSettings();
  const { tools, groups } = useToolEngine();

  const visibleItems = useMemo(
    () => tools.filter((item) => isToolVisible(item.path)),
    [tools, isToolVisible]
  );

  const searchResults = useMemo(() => {
    if (!search) return null;
    return visibleItems.filter((item) => item.label.toLowerCase().includes(search.toLowerCase()));
  }, [search, visibleItems]);

  // Collapsed sidebar (Radix tooltips on hover)
  if (sidebarCollapsed) {
    return (
      <aside
        className={`w-12 shrink-0 flex flex-col border-r border-sidebar-border ${isElectron ? "h-full min-h-0 sidebar-glass" : "h-screen sticky top-0 bg-sidebar"}`}
      >
        <div className="flex items-center justify-center py-2.5 border-b border-sidebar-border">
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={toggleSidebar} className="text-muted-foreground hover:text-foreground transition-colors">
                <PanelLeftOpen className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Expand sidebar</TooltipContent>
          </Tooltip>
        </div>
        <nav className="flex-1 py-2 overflow-y-auto space-y-1">
          {visibleItems.map((item) => {
            const Icon = getIcon(item.icon);
            return (
              <Tooltip key={item.path}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={item.path}
                    className={`flex items-center justify-center py-2 transition-colors rounded-md mx-1 ${
                      location.pathname === item.path
                        ? "text-primary bg-primary/12"
                        : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            );
          })}
        </nav>
        <div className="py-2 border-t border-sidebar-border flex justify-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <NavLink to="/settings" className="text-muted-foreground hover:text-foreground transition-colors">
                <Settings className="h-4 w-4" />
              </NavLink>
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
          </Tooltip>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={`w-80 shrink-0 flex flex-col border-r border-sidebar-border ${isElectron ? "h-full min-h-0 sidebar-glass" : "h-screen sticky top-0 bg-sidebar"}`}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <NavLink
          to="/"
          className="text-sm font-semibold text-foreground no-underline hover:opacity-80 truncate min-w-0"
          aria-label="Home"
        >
          stdout
        </NavLink>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={toggleSidebar} className="text-muted-foreground hover:text-foreground transition-colors p-1" title="Collapse sidebar">
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="px-4 py-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            className="w-full rounded-md border px-3 py-2 pl-9 text-sm bg-background border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder="Search tools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchResults && searchResults.length > 0) {
                navigate(searchResults[0].path);
                setSearch("");
              }
              if (e.key === "Escape") {
                setSearch("");
                (e.target as HTMLInputElement).blur();
              }
            }}
          />
        </div>
      </div>

      <nav className="flex-1 px-4 py-3 space-y-1 overflow-y-auto min-w-0">
        {search && searchResults ? (
          searchResults.length > 0 ? (
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground uppercase tracking-wider px-1 pb-1.5">
                {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
              </div>
              {searchResults.map((item) => {
                const Icon = getIcon(item.icon);
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setSearch("")}
                    className={`sidebar-link flex items-center gap-2 min-w-0 ${location.pathname === item.path ? "active" : ""}`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <SidebarItemLabel label={item.label} />
                  </NavLink>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground text-center py-6">No tools found</div>
          )
        ) : sidebarMode === "flat" ? (
          <div className="space-y-1">
            {visibleItems.map((item) => {
              const Icon = getIcon(item.icon);
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`sidebar-link flex items-center gap-2 min-w-0 ${location.pathname === item.path ? "active" : ""}`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <SidebarItemLabel label={item.label} />
                </NavLink>
              );
            })}
          </div>
        ) : (
          groups.map((group) => (
            <SidebarGroupSection
              key={group.label}
              group={group}
              searchQuery={search}
              isToolVisible={isToolVisible}
            />
          ))
        )}
      </nav>

      <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-sidebar-border">
        {isElectron ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href="https://www.buymeacoffee.com/chungho"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-8 h-8 shrink-0 rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
                title="Buy me a coffee"
                aria-label="Buy me a coffee"
              >
                <Coffee className="h-4 w-4" />
              </a>
            </TooltipTrigger>
            <TooltipContent side="right">Buy me a coffee</TooltipContent>
          </Tooltip>
        ) : (
          <a
            href="https://www.buymeacoffee.com/chungho"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-sidebar-border bg-sidebar-accent px-3 py-2 text-sm font-medium text-sidebar-accent-foreground opacity-90 hover:opacity-100 hover:brightness-110 transition-colors min-w-0"
            title="Buy me a coffee"
          >
            <Coffee className="h-4 w-4 shrink-0" />
            <span className="truncate">Buy me a coffee</span>
          </a>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <NavLink to="/settings" className="flex items-center justify-center w-8 h-8 shrink-0 rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors" aria-label="Settings">
              <Settings className="h-4 w-4" />
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right">Settings</TooltipContent>
        </Tooltip>
      </div>
    </aside>
  );
};

export default AppSidebar;
