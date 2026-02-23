import { useState, useMemo } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeftRight, Braces, CheckCircle2, ChevronRight, Code2, FileCode, Globe, Image, Lock,
  Search, Shuffle, TerminalSquare, Type, Coffee,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSettings } from "@/hooks/useSettings";
import { useToolEngine } from "@/hooks/useToolEngine";
import type { ToolGroup } from "@/tools/types";
import { getToolIcon } from "@/components/toolIcons";

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

const SIDEBAR_ASIDE_BASE = "shrink-0 flex flex-col border-r border-sidebar-border min-h-0";
const SIDEBAR_ASIDE_LAYOUT = "h-full min-h-0 sticky top-0 bg-sidebar";

function toSafeId(label: string): string {
  const slug = label.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
  return slug || "group";
}

type SidebarItem = { path: string; icon: string; label: string };

const SidebarNavItem = ({
  item,
  isActive,
  onClick,
}: { item: SidebarItem; isActive: boolean; onClick?: () => void }) => {
  const Icon = getToolIcon(item.icon);
  return (
    <NavLink
      to={item.path}
      onClick={onClick}
      className={`sidebar-link ${isActive ? "active" : ""}`}
    >
      <Icon className="h-4 w-4 shrink-0 opacity-90" />
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
  const contentId = `sidebar-group-${toSafeId(group.label)}`;

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
          <GroupIcon className="h-4 w-4 shrink-0 opacity-90" />
          <span className="sidebar-group-label truncate text-left">{group.label}</span>
        </span>
        <ChevronRight
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-150 ${isOpen ? "rotate-90" : ""}`}
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
  const { sidebarMode, isToolVisible } = useSettings();
  const { tools, groups } = useToolEngine();

  const visibleItems = useMemo(
    () => tools.filter((item) => isToolVisible(item.path)),
    [tools, isToolVisible]
  );

  const searchResults = useMemo(() => {
    if (!search) return null;
    return visibleItems.filter((item) => item.label.toLowerCase().includes(search.toLowerCase()));
  }, [search, visibleItems]);

  return (
    <aside
      className={`${SIDEBAR_ASIDE_BASE} ${SIDEBAR_ASIDE_LAYOUT}`}
      style={{ width: "var(--sidebar-width-expanded)", minWidth: "var(--sidebar-width-expanded)" }}
    >
      <div className="px-[var(--spacing-sidebar-x)] pt-[var(--spacing-sidebar-y)] pb-[var(--spacing-sidebar-gap)]" role="search" aria-label="Search tools">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden />
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

      <nav className="flex-1 min-h-0 sidebar-pad overflow-y-auto min-w-0 space-y-0.5" aria-label="Tools">
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

      <footer className="flex items-center justify-center sidebar-footer-pad border-t border-sidebar-border min-h-[var(--spacing-footer-min-h)] flex-shrink-0" aria-label="Sidebar footer">
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
      </footer>
    </aside>
  );
};

export default AppSidebar;
