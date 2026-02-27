import { useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Search, X } from "lucide-react";

import { getToolIcon } from "@/components/common/ToolIcons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToolEngine } from "@/hooks/useToolEngine";
import { useSettings } from "@/hooks/useSettings";
import { useRecentTools } from "@/hooks/useRecentTools";
import type { ToolDefinition } from "@/tools/types";

const SEARCH_PLACEHOLDER = "Search tools by name, description, or category…";

function matchTool(query: string, tool: ToolDefinition): boolean {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  return (
    tool.label.toLowerCase().includes(q) ||
    tool.description.toLowerCase().includes(q) ||
    tool.group.toLowerCase().includes(q)
  );
}

/** Shared card link: same style for All tools and Recently visited. */
const ToolCardLink = ({
  tool,
  index,
  showDescription = true,
}: {
  tool: ToolDefinition;
  index: number;
  showDescription?: boolean;
}) => {
  const Icon = getToolIcon(tool.icon);
  return (
    <Link
      to={tool.path}
      className="home-tool-card group relative rounded-[var(--radius)] border border-border bg-card text-left cursor-pointer transition-[background-color,border-color,box-shadow] duration-[var(--transition-duration)] ease-[var(--transition-ease)] hover:border-border hover:bg-[hsl(var(--muted)/0.4)] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:bg-[hsl(var(--muted)/0.5)] min-h-touch"
      style={{ animationDelay: `${index * 20}ms` }}
    >
      <span className="home-tool-card-arrow absolute flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 sm:h-6 sm:w-6" aria-hidden>
        <ChevronRight className="h-4 w-4" />
      </span>
      <Icon className="home-tool-card-icon h-7 w-7 shrink-0 text-foreground opacity-90" aria-hidden />
      <div className="home-tool-card-text min-w-0 flex-1 flex flex-col">
        <h3 className="home-tool-card-title font-semibold text-[var(--text-content)] text-foreground line-clamp-2 min-w-0">
          {tool.label}
        </h3>
        {showDescription && (
          <p className="home-tool-card-desc text-[var(--text-nav)] text-muted-foreground leading-snug min-w-0">
            {tool.description}
          </p>
        )}
      </div>
    </Link>
  );
};

const HomePage = () => {
  const { tools } = useToolEngine();
  const { isToolVisible } = useSettings();
  const recentTools = useRecentTools();
  const [searchQuery, setSearchQuery] = useState("");

  const visibleTools = useMemo(
    () => tools.filter((t) => isToolVisible(t.path)),
    [tools, isToolVisible]
  );

  const filteredTools = useMemo(
    () => visibleTools.filter((t) => matchTool(searchQuery, t)),
    [visibleTools, searchQuery]
  );

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const hasSearch = searchQuery.trim().length > 0;
  const showNoResults = hasSearch && filteredTools.length === 0;
  const showNoTools = visibleTools.length === 0;

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-auto home-main" role="main">
      <div className="flex flex-1 flex-col min-h-0 w-full home-page-pad">
        <div className="home-content flex flex-col">
          {/* Hero + About: macOS-style large title + inset group (glass on desktop) */}
          <header className="home-hero" aria-label="Welcome">
            <p className="home-hero-tagline">
              Your standard output for dev tools—format, convert, encode, generate. All run locally.
            </p>
            <section
              className="home-intro"
              aria-labelledby="home-about-heading"
            >
              <h2 id="home-about-heading" className="home-intro-heading">
                About this toolkit
              </h2>
              <div className="home-intro-text">
                <p>
                  Developer toolkit hub for everyday dev tasks. No backend, no data sent to any server.
                </p>
                <p>
                  Bug or idea?{" "}
                  <a
                    href="https://github.com/cminhho/stdout/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
                  >
                    Open an issue
                  </a>{" "}
                  with steps to reproduce or feedback.
                </p>
              </div>
            </section>
          </header>

          {/* Recently visited: same grid + list layout as All tools */}
          {recentTools.length > 0 && (
            <section className="home-recent-section" aria-labelledby="home-recent-heading">
              <div className="home-recent-header">
                <h2 id="home-recent-heading" className="home-section-label">
                  Recently visited
                </h2>
                <span className="home-recent-count" aria-hidden="true">
                  {recentTools.length}
                </span>
              </div>
              <ul className="grid grid-cols-1 tool-content-grid home-tools-grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 list-none p-0 m-0" role="list">
                {recentTools.map((t, i) => (
                  <li key={t.id}>
                    <ToolCardLink tool={t} index={i} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Tools: one bar = label + search + count (wraps on small screens) */}
          <section className="home-tools-section" aria-labelledby="home-tools-heading">
            <div className="home-tools-header sticky top-0 z-10 home-tools-header-margin">
              <div className="home-tools-header-inner">
                <h2 id="home-tools-heading" className="home-section-label">
                  All tools
                </h2>
                <div className="home-tools-search-wrap relative flex items-center">
                  <Search className="absolute left-3 h-4 w-4 shrink-0 text-muted-foreground pointer-events-none sm:left-2.5" aria-hidden />
                  <Input
                    type="search"
                    size="sm"
                    placeholder={SEARCH_PLACEHOLDER}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="home-tools-search pl-10 pr-11 min-h-touch sm:pl-8 sm:pr-8"
                    aria-label="Search tools by name, description, or category"
                    autoComplete="off"
                  />
                  {hasSearch && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="home-tools-clear absolute right-1 min-h-[44px] min-w-[44px] h-auto py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 sm:min-h-0 sm:min-w-0 sm:h-7 sm:w-7 sm:p-0"
                      onClick={clearSearch}
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4 shrink-0" />
                    </Button>
                  )}
                </div>
                <p className="home-tools-count text-[var(--text-nav)] text-muted-foreground shrink-0" aria-live="polite">
                  {filteredTools.length === visibleTools.length
                    ? `${visibleTools.length} of ${tools.length} visible`
                    : `${filteredTools.length} of ${visibleTools.length} match`}
                </p>
              </div>
            </div>

            {showNoTools ? (
              <div className="home-empty border border-border bg-card text-center" role="status">
                <p>
                  No tools visible. Enable tools in Settings to see them here.
                </p>
                <div className="home-empty-actions">
                  <Link
                    to="/settings"
                    className="home-empty-link text-[var(--text-ui)] font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded px-2 py-1"
                  >
                    Open Settings
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ) : showNoResults ? (
              <div className="home-empty home-no-results border border-border bg-card text-center" role="status">
                <p>
                  No tools match &ldquo;{searchQuery.trim()}&rdquo;. Clear search or enable more tools in Settings.
                </p>
                <div className="home-empty-actions">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearSearch}
                  >
                    Clear search
                  </Button>
                </div>
              </div>
            ) : (
              <ul className="grid grid-cols-1 tool-content-grid home-tools-grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 list-none p-0 m-0" role="list">
                {filteredTools.map((t, i) => (
                  <li key={t.id}>
                    <ToolCardLink tool={t} index={i} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Home footer: spacing + macOS-style muted footer */}
          <footer className="home-footer" aria-label="Home page footer">
            <p className="home-footer-text">
              All tools run locally. No data sent to any server.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
