import { useState, useMemo } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Braces, Type, FileText, Lock, Shuffle, Hash, Terminal, GitCompare,
  Clock, ChevronDown, KeyRound, Fingerprint, Link2, Code2, QrCode,
  Archive, ShieldCheck, Table2, FileJson, Binary, ArrowLeftRight, Search,
  CalendarClock, FileSpreadsheet, Regex, Diff, Boxes, Globe,
  CheckCircle2, Wand2, Calculator, Palette, AlignLeft, FileCode, Database,
  TerminalSquare, FileType, List, KeySquare,
  FileOutput, Image, Scaling, FileArchive, Eye, Paintbrush, Ruler,
  FileUp, Dices, TableProperties, Settings, LetterText, ScrollText,
  PanelLeftClose, PanelLeftOpen,
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
        <span className="flex items-center gap-3 min-w-0">
          <GroupIcon className="h-4 w-4 shrink-0" />
          <span className="truncate">{group.label}</span>
        </span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-0" : "-rotate-90"}`} />
      </button>
      {isOpen && (
        <div className="ml-4 pl-3 border-l border-border space-y-0.5 mt-0.5">
          {filteredItems.map((item) => {
            const Icon = getIcon(item.icon);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`sidebar-link text-xs py-1.5 flex items-center gap-2 min-w-0 ${location.pathname === item.path ? "active" : ""}`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
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
      <aside className="w-12 shrink-0 h-screen sticky top-0 flex flex-col border-r bg-sidebar border-sidebar-border">
        <div className="flex items-center justify-center py-4 border-b border-sidebar-border">
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
        <div className="py-3 border-t border-sidebar-border flex justify-center">
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
    <aside className="w-60 shrink-0 h-screen sticky top-0 flex flex-col border-r bg-sidebar border-sidebar-border">
      <div className="flex items-center justify-between px-4 py-4 border-b border-sidebar-border">
        <NavLink to="/" className="flex items-center gap-2 text-inherit no-underline hover:opacity-90 transition-opacity">
          <Terminal className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm text-sidebar-accent-foreground tracking-tight">Stdout</span>
        </NavLink>
        <div className="flex items-center gap-2">
          <button onClick={toggleSidebar} className="text-muted-foreground hover:text-foreground transition-colors" title="Collapse sidebar">
            <PanelLeftClose className="h-4 w-4" />
          </button>
          <NavLink to="/settings" className="text-muted-foreground hover:text-foreground transition-colors">
            <Settings className="h-4 w-4" />
          </NavLink>
        </div>
      </div>

      <div className="px-3 py-2 border-b border-sidebar-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            className="w-full rounded-md border px-3 py-1.5 pl-8 text-xs bg-background border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
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

      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {search && searchResults ? (
          searchResults.length > 0 ? (
            <div className="space-y-0.5">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider px-3 pb-1">
                {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
              </div>
              {searchResults.map((item) => {
                const Icon = getIcon(item.icon);
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setSearch("")}
                    className={`sidebar-link text-xs flex items-center gap-2 min-w-0 ${location.pathname === item.path ? "active" : ""}`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <SidebarItemLabel label={item.label} />
                  </NavLink>
                );
              })}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground text-center py-6">No tools found</div>
          )
        ) : sidebarMode === "flat" ? (
          <div className="space-y-0.5">
            {visibleItems.map((item) => {
              const Icon = getIcon(item.icon);
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`sidebar-link text-xs flex items-center gap-2 min-w-0 ${location.pathname === item.path ? "active" : ""}`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
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

      <div className="px-4 py-3 border-t border-sidebar-border flex justify-center">
        <a
          href="https://www.buymeacoffee.com/chungho"
          target="_blank"
          rel="noopener noreferrer"
          className="opacity-90 hover:opacity-100 transition-opacity"
        >
          <img
            src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
            alt="Buy me a coffee"
            className="h-8 w-auto"
          />
        </a>
      </div>
    </aside>
  );
};

export default AppSidebar;
