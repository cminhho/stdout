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
      className={`sidebar-link ${isActive ? "active" : ""}`}
    >
      <Icon className="h-[14px] w-[14px] shrink-0 opacity-90" />
      <span className="min-w-0 truncate">{item.label}</span>
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
  const contentId = `sidebar-group-${group.label.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "group"}`;

  return (
    <section role="group" aria-label={group.label} className="space-y-0.5">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="sidebar-link w-full justify-between"
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <span className="flex items-center min-w-0 gap-1.5">
          <GroupIcon className="h-[14px] w-[14px] shrink-0 opacity-90" />
          <span className="truncate text-left">{group.label}</span>
        </span>
        <ChevronRight
          className={`h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-150 ${isOpen ? "rotate-90" : ""}`}
          aria-hidden
        />
      </button>
      {isOpen && (
        <ul
          id={contentId}
          role="list"
          className="ml-[var(--spacing-sidebar-x)] pl-[var(--spacing-sidebar-indent)] space-y-0.5 mt-1 list-none"
        >
          {filteredItems.map((item) => (
            <li key={item.path}>
              <SidebarNavItem item={item} isActive={pathname === item.path} />
            </li>
          ))}
        </ul>
      )}
    </section>
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
        {!isDesktop && (
          <div className="flex items-center justify-center sidebar-pad border-b border-sidebar-border">
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" onClick={toggleSidebar} className="btn-icon-chrome btn-icon-chrome-sm shrink-0">
                  <PanelLeftOpen className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Expand sidebar</TooltipContent>
            </Tooltip>
          </div>
        )}
        <nav className="flex-1 overflow-y-auto space-y-0.5 [padding:var(--spacing-sidebar-item-y)_0] sidebar-pad" aria-label="Tools">
          {visibleItems.map((item) => {
            const Icon = getIcon(item.icon);
            return (
              <Tooltip key={item.path}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={item.path}
                    className={`flex items-center justify-center py-[var(--spacing-sidebar-item-y)] transition-colors rounded-md mx-[var(--spacing-sidebar-gap)] ${
                      location.pathname === item.path
                        ? "text-foreground bg-sidebar-accent"
                        : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
                    }`}
                  >
                    <Icon className="h-[14px] w-[14px] opacity-90" />
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            );
          })}
        </nav>
        <footer className="sidebar-footer-pad border-t border-sidebar-border flex items-center justify-center min-h-9 flex-shrink-0" aria-label="Sidebar footer">
          <Tooltip>
            <TooltipTrigger asChild>
              <NavLink to="/settings" className="btn-icon-chrome shrink-0" aria-label="Settings">
                <Settings className="h-3.5 w-3.5" />
              </NavLink>
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
          </Tooltip>
        </footer>
      </aside>
    );
  }

  return (
    <aside className={`w-72 ${SIDEBAR_ASIDE_BASE} ${SIDEBAR_ASIDE_LAYOUT}`}>
      {!isDesktop && (
        <div className="flex items-center justify-end sidebar-pad border-b border-sidebar-border">
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" onClick={toggleSidebar} className="btn-icon-chrome btn-icon-chrome-sm shrink-0" title="Collapse sidebar">
                  <PanelLeftClose className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Collapse sidebar</TooltipContent>
            </Tooltip>
        </div>
      )}
      <div className="px-[var(--spacing-sidebar-x)] pt-[var(--spacing-sidebar-y)] pb-[var(--spacing-sidebar-gap)]" role="search" aria-label="Search tools">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" aria-hidden />
          <input
            type="search"
            role="searchbox"
            aria-label="Search tools"
            className="sidebar-search w-full"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") { setSearch(""); (e.target as HTMLInputElement).blur(); return; }
              if (e.key === "Enter" && searchResults?.length) { navigate(searchResults[0].path); setSearch(""); }
            }}
          />
        </div>
      </div>

      <nav className="flex-1 sidebar-pad overflow-y-auto min-w-0 space-y-0.5" aria-label="Tools">
        {search && searchResults !== null ? (
          searchResults.length > 0 ? (
            <div className="space-y-0.5">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium px-[var(--spacing-sidebar-x)] pb-1" aria-live="polite">
                {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
              </p>
              <ul role="list" className="space-y-0.5 list-none">
                {searchResults.map((item) => (
                  <li key={item.path}>
                    <SidebarNavItem item={item} isActive={location.pathname === item.path} onClick={() => setSearch("")} />
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4 px-[var(--spacing-sidebar-x)]">No tools found</p>
          )
        ) : sidebarMode === "flat" ? (
          <ul role="list" className="space-y-0.5 list-none">
            {visibleItems.map((item) => (
              <li key={item.path}>
                <SidebarNavItem item={item} isActive={location.pathname === item.path} />
              </li>
            ))}
          </ul>
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

      <footer className="flex items-center justify-between gap-1.5 sidebar-footer-pad border-t border-sidebar-border flex-shrink-0" aria-label="Sidebar footer">
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href="https://www.buymeacoffee.com/chungho"
              target="_blank"
              rel="noopener noreferrer"
              className="sidebar-donate-link"
              title="Support the project — Buy me a coffee"
              aria-label="Buy me a coffee"
            >
              <Coffee className="sidebar-donate-link-icon shrink-0" aria-hidden />
              <span className="truncate">Buy me a coffee</span>
            </a>
          </TooltipTrigger>
          <TooltipContent side="right">Support the project — Buy me a coffee</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <NavLink to="/settings" className="btn-icon-chrome shrink-0" aria-label="Settings">
              <Settings className="h-3.5 w-3.5" />
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right">Settings</TooltipContent>
        </Tooltip>
      </footer>
    </aside>
  );
};

export default AppSidebar;
