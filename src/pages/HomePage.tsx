import { Link } from "react-router-dom";
import { ChevronRight, Search, X } from "lucide-react";
import { useMemo, useState, useCallback } from "react";
import { useToolEngine } from "@/hooks/useToolEngine";
import { useSettings } from "@/hooks/useSettings";
import { useRecentTools } from "@/hooks/useRecentTools";
import type { ToolDefinition } from "@/tools/types";
import { getToolIcon } from "@/components/toolIcons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

const ToolCard = ({ tool, index }: { tool: ToolDefinition; index: number }) => {
  const Icon = getToolIcon(tool.icon);
  return (
    <li>
      <Link
        to={tool.path}
        className="home-tool-card group relative rounded-[var(--radius)] border border-border bg-card text-left transition-[background-color,border-color,box-shadow] duration-[var(--transition-duration)] ease-[var(--transition-ease)] hover:border-border hover:bg-[hsl(var(--muted)/0.4)] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        style={{ animationDelay: `${index * 20}ms` }}
      >
        <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden>
          <ChevronRight className="h-4 w-4" />
        </span>
        <Icon className="home-tool-card-icon h-7 w-7 shrink-0 text-foreground opacity-90" aria-hidden />
        <h3 className="home-tool-card-title font-semibold text-[var(--text-content)] text-foreground line-clamp-2 min-w-0">
          {tool.label}
        </h3>
        <p className="home-tool-card-desc text-[var(--text-nav)] text-muted-foreground leading-snug min-w-0">
          {tool.description}
        </p>
      </Link>
    </li>
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
    <div className="flex flex-1 flex-col min-h-0 overflow-auto" role="main">
      <div className="flex flex-1 flex-col min-h-0 w-full home-page-pad">
        <div className="home-content flex flex-col">
          {/* Hero + About: value prop and intro (glass on desktop) */}
          <header className="home-hero">
            <p className="home-hero-tagline">
              Your standard output for dev tools—format, convert, encode, generate. All run locally.
            </p>
            <section
              className="home-intro"
              aria-labelledby="home-about-heading"
            >
              <h2 id="home-about-heading" className="panel-header-label">
                About this toolkit
              </h2>
              <div className="space-y-2">
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

          {/* Recently visited (only when we have data) */}
          {recentTools.length > 0 && (
            <section className="home-recent-section" aria-labelledby="home-recent-heading">
              <h2 id="home-recent-heading" className="home-section-label home-tools-header-margin">
                Recently visited
              </h2>
              <ul className="home-recent-list flex flex-wrap gap-2 list-none p-0 m-0" role="list">
                {recentTools.map((t) => {
                  const Icon = getToolIcon(t.icon);
                  return (
                    <li key={t.id}>
                      <Link
                        to={t.path}
                        className="home-recent-item inline-flex items-center gap-2 rounded-[var(--radius)] border border-border bg-card px-3 py-2 text-left text-[var(--text-content)] transition-[background-color,border-color] duration-[var(--transition-duration)] hover:border-border hover:bg-[hsl(var(--muted)/0.4)] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        <Icon className="h-4 w-4 shrink-0 text-foreground opacity-90" aria-hidden />
                        <span className="min-w-0 truncate max-w-[8rem] font-medium text-foreground">
                          {t.label}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* Tools: search + grid (industry: filter on home) */}
          <section className="home-tools-section" aria-labelledby="home-tools-heading">
            <div className="home-tools-header sticky top-0 z-10 home-tools-header-margin bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 id="home-tools-heading" className="home-section-label">
                    All tools
                  </h2>
                  <p className="text-[var(--text-nav)] text-muted-foreground" aria-live="polite">
                    {filteredTools.length === visibleTools.length
                      ? `${visibleTools.length} of ${tools.length} visible`
                      : `${filteredTools.length} of ${visibleTools.length} match`}
                  </p>
                </div>
                <div className="home-tools-search-wrap relative flex items-center gap-2">
                  <Search className="absolute left-2.5 h-4 w-4 shrink-0 text-muted-foreground pointer-events-none" aria-hidden />
                  <Input
                    type="search"
                    size="sm"
                    placeholder={SEARCH_PLACEHOLDER}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="home-tools-search pl-8 pr-8"
                    aria-label="Search tools by name, description, or category"
                    autoComplete="off"
                  />
                  {hasSearch && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 h-7 w-7 p-0 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      onClick={clearSearch}
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {showNoTools ? (
              <div className="home-empty border border-border bg-card text-center" role="status">
                <p>
                  No tools visible. Enable tools in Settings to see them here.
                </p>
                <Link
                  to="/settings"
                  className="mt-4 inline-flex items-center gap-1.5 text-[var(--text-ui)] font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded px-2 py-1"
                >
                  Open Settings
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ) : showNoResults ? (
              <div className="home-empty home-no-results border border-border bg-card text-center" role="status">
                <p>
                  No tools match &ldquo;{searchQuery.trim()}&rdquo;. Clear search or enable more tools in Settings.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={clearSearch}
                >
                  Clear search
                </Button>
              </div>
            ) : (
              <ul className="grid grid-cols-1 tool-content-grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 list-none p-0 m-0" role="list">
                {filteredTools.map((t, i) => (
                  <ToolCard key={t.id} tool={t} index={i} />
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
