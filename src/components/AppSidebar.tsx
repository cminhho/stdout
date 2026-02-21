import { useState, useMemo } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Braces, Type, FileText, Lock, Shuffle, Hash, Terminal, GitCompare,
  Clock, ChevronRight, KeyRound, Fingerprint, Link2, Code2, QrCode,
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
import type { ToolGroup } from "@/tools/types";

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

const isDesktop = typeof window !== "undefined" && !!window.electronAPI;

const SIDEBAR_ASIDE_BASE = "shrink-0 flex flex-col border-r border-sidebar-border";
const SIDEBAR_ASIDE_LAYOUT = isDesktop ? "h-full min-h-0 sidebar-glass" : "h-screen sticky top-0 bg-sidebar";
const SIDEBAR_ICON_BTN = "flex items-center justify-center w-8 h-8 shrink-0 rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors";

type SidebarItem = { path: string; icon: string; label: string };

const SidebarNavItem = ({
  item,
  isActive,
  onClick,
}: { item: SidebarItem; isActive: boolean; onClick?: () => void }) => {
  const Icon = getIcon(item.icon);
  return (
    <NavLink
      to={item.path}
      onClick={onClick}
      className={`sidebar-link min-w-0 ${isActive ? "active" : ""}`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="min-w-0 truncate block">{item.label}</span>
    </NavLink>
  );
};

const SidebarGroupSection = ({
  group,
  searchQuery,
  isToolVisible,
  pathname,
}: {
  group: ToolGroup;
  searchQuery: string;
  isToolVisible: (path: string) => boolean;
  pathname: string;
}) => {
  const [open, setOpen] = useState(true);
  const GroupIcon = groupIconMap[group.label] || Braces;
  const q = searchQuery.toLowerCase();
  const filteredItems = group.tools.filter(
    (item) => isToolVisible(item.path) && (!q || item.label.toLowerCase().includes(q))
  );
  if (filteredItems.length === 0) return null;
  const isOpen = !!searchQuery || open;

  return (
    <div>
      <button type="button" onClick={() => setOpen(!open)} className="sidebar-link w-full justify-between">
        <span className="flex items-center gap-2 min-w-0">
          <GroupIcon className="h-4 w-4 shrink-0" />
          <span className="truncate">{group.label}</span>
        </span>
        <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`} />
      </button>
      {isOpen && (
        <div className="ml-[var(--spacing-sidebar-x)] pl-[var(--spacing-sidebar-indent)] border-l border-border space-y-[var(--spacing-sidebar-gap)] mt-[var(--spacing-sidebar-gap)]">
          {filteredItems.map((item) => (
            <SidebarNavItem key={item.path} item={item} isActive={pathname === item.path} />
          ))}
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

  if (sidebarCollapsed) {
    return (
      <aside className={`w-12 ${SIDEBAR_ASIDE_BASE} ${SIDEBAR_ASIDE_LAYOUT}`}>
        <div className="flex items-center justify-center sidebar-pad border-b border-sidebar-border">
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={toggleSidebar} className="text-muted-foreground hover:text-foreground transition-colors">
                <PanelLeftOpen className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Expand sidebar</TooltipContent>
          </Tooltip>
        </div>
        <nav className="flex-1 overflow-y-auto space-y-[var(--spacing-sidebar-gap)] [padding:var(--spacing-sidebar-y)_0]">
          {visibleItems.map((item) => {
            const Icon = getIcon(item.icon);
            return (
              <Tooltip key={item.path}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={item.path}
                    className={`flex items-center justify-center py-[var(--spacing-sidebar-y)] transition-colors rounded-md mx-[var(--spacing-sidebar-gap)] ${
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
        <div className="sidebar-footer-pad border-t border-sidebar-border flex justify-center">
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
    <aside className={`w-80 ${SIDEBAR_ASIDE_BASE} ${SIDEBAR_ASIDE_LAYOUT}`}>
      <div className="flex items-center justify-between sidebar-pad">
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

      <div className="sidebar-pad">
        <div className="relative">
          <Search className="absolute left-[var(--spacing-sidebar-x)] top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            className="w-full rounded-md border py-2 pr-[var(--spacing-sidebar-x)] text-sm bg-background border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            style={{ paddingLeft: "calc(var(--spacing-sidebar-x) + 1rem)" }}
            placeholder="Search tools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") { setSearch(""); (e.target as HTMLInputElement).blur(); return; }
              if (e.key === "Enter" && searchResults?.length) { navigate(searchResults[0].path); setSearch(""); }
            }}
          />
        </div>
      </div>

      <nav className="flex-1 sidebar-pad overflow-y-auto min-w-0 space-y-[var(--spacing-sidebar-gap)]">
        {search && searchResults !== null ? (
          searchResults.length > 0 ? (
            <div className="space-y-[var(--spacing-sidebar-gap)]">
              <div className="text-xs text-muted-foreground uppercase tracking-wider px-[var(--spacing-sidebar-gap)] pb-[var(--spacing-sidebar-gap)]">
                {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
              </div>
              {searchResults.map((item) => (
                <SidebarNavItem key={item.path} item={item} isActive={location.pathname === item.path} onClick={() => setSearch("")} />
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground text-center py-[var(--spacing-content-y)]">No tools found</div>
          )
        ) : sidebarMode === "flat" ? (
          <div className="space-y-[var(--spacing-sidebar-gap)]">
            {visibleItems.map((item) => (
              <SidebarNavItem key={item.path} item={item} isActive={location.pathname === item.path} />
            ))}
          </div>
        ) : (
          groups.map((group) => (
            <SidebarGroupSection
              key={group.label}
              group={group}
              searchQuery={search}
              isToolVisible={isToolVisible}
              pathname={location.pathname}
            />
          ))
        )}
      </nav>

      <div className="flex items-center justify-between gap-2 sidebar-footer-pad border-t border-sidebar-border">
        {isDesktop ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href="https://www.buymeacoffee.com/chungho"
                target="_blank"
                rel="noopener noreferrer"
                className={SIDEBAR_ICON_BTN}
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
            className="inline-flex items-center gap-2 rounded-md border border-sidebar-border bg-sidebar-accent text-sm font-medium text-sidebar-accent-foreground opacity-90 hover:opacity-100 hover:brightness-110 transition-colors min-w-0 px-[var(--spacing-sidebar-x)] py-[var(--spacing-sidebar-y)]"
            title="Buy me a coffee"
          >
            <Coffee className="h-4 w-4 shrink-0" />
            <span className="truncate">Buy me a coffee</span>
          </a>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <NavLink to="/settings" className={SIDEBAR_ICON_BTN} aria-label="Settings">
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
