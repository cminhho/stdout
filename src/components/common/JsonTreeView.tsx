/**
 * JSON tree view – read-only collapsible tree for a parsed JSON value.
 *
 * Core component: colors (--code-*), font, line-height, and the line-number gutter match CodeEditor
 * so it reads as the same surface in either view mode. Each object/array node has a chevron to
 * expand/collapse; the whole tree can be driven to expand-all / collapse-all via the *Nonce props.
 *
 * Search: type to find matching keys/values — matches highlight, a count + Prev/Next jump between
 * them, and collapsed ancestors of matches are *temporarily* revealed (the user's manual collapse
 * state is preserved and restored when the query clears). Hover a node to copy its JSONPath or value.
 *
 * Line numbers are sequential over visible rows (1..N) and re-flow on collapse.
 */
import { memo, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, ChevronUp, ChevronDown, Copy, Braces, Search, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/utils/cn";

export interface JsonTreeViewProps {
  /** Parsed JSON value (object, array, or primitive). Pass a stable reference (memoize the parse). */
  data: unknown;
  /** Increment to expand every node. Leave undefined if not driving expansion externally. */
  expandAllNonce?: number;
  /** Increment to collapse every node below the root (root stays open). */
  collapseAllNonce?: number;
  /** Show the line-number gutter (default true), mirroring CodeEditor. */
  showLineNumbers?: boolean;
  /** Show the search bar (default true). */
  showSearch?: boolean;
  className?: string;
}

type Container = Record<string, unknown> | unknown[];

const isContainer = (v: unknown): v is Container => v !== null && typeof v === "object";

const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;

/** Build a valid JSONPath for a child, used as the React/collapse key AND the copyable path. */
function childPath(parent: string, key: string, isArray: boolean): string {
  if (isArray) return `${parent}[${key}]`;
  return IDENTIFIER.test(key) ? `${parent}.${key}` : `${parent}[${JSON.stringify(key)}]`;
}

/** Paths of all container nodes deeper than the root, used by collapse-all (root stays expanded). */
function collectContainerPaths(data: unknown, path = "$", out: string[] = [], isRoot = true): string[] {
  if (!isContainer(data)) return out;
  if (!isRoot) out.push(path);
  if (Array.isArray(data)) {
    data.forEach((item, i) => collectContainerPaths(item, childPath(path, String(i), true), out, false));
  } else {
    for (const key of Object.keys(data)) {
      collectContainerPaths((data as Record<string, unknown>)[key], childPath(path, key, false), out, false);
    }
  }
  return out;
}

/** Token color for a primitive value, mirroring CodeEditor's JSON token palette. */
function valueColor(v: unknown): string {
  if (typeof v === "string") return "hsl(var(--code-string))";
  if (typeof v === "number") return "hsl(var(--code-number))";
  if (typeof v === "boolean") return "hsl(var(--code-boolean))";
  if (v === null) return "hsl(var(--code-null))";
  return "hsl(var(--foreground))";
}

/** Render a primitive the way it appears in formatted JSON (strings quoted + escaped). */
function renderPrimitive(v: unknown): string {
  if (typeof v === "string") return JSON.stringify(v);
  if (v === null) return "null";
  return String(v);
}

/** Text copied by "Copy value": raw for strings, pretty JSON for containers, literal otherwise. */
function copyableValue(v: unknown): string {
  if (typeof v === "string") return v;
  if (isContainer(v)) return JSON.stringify(v, null, 2);
  return String(v);
}

const INDENT_PX = 14;

interface FlatRow {
  path: string;
  depth: number;
  kind: "object" | "array" | "primitive";
  keyLabel?: string;
  indexLabel?: string;
  value: unknown;
  isOpen: boolean;
  count: number;
}

/**
 * Pre-order walk producing one row per *visible* node. A container is open when it's not collapsed,
 * or when search forces it open (so matches inside a collapsed node still show).
 */
function flattenVisible(data: unknown, collapsed: Set<string>, forceOpen: Set<string>): FlatRow[] {
  const rows: FlatRow[] = [];

  const walk = (value: unknown, path: string, depth: number, keyLabel?: string, indexLabel?: string) => {
    if (!isContainer(value)) {
      rows.push({ path, depth, kind: "primitive", keyLabel, indexLabel, value, isOpen: false, count: 0 });
      return;
    }
    const isArray = Array.isArray(value);
    const entries: [string, unknown][] = isArray
      ? (value as unknown[]).map((v, i) => [String(i), v])
      : Object.entries(value as Record<string, unknown>);
    const isOpen = forceOpen.has(path) || !collapsed.has(path);

    rows.push({ path, depth, kind: isArray ? "array" : "object", keyLabel, indexLabel, value, isOpen, count: entries.length });

    if (isOpen) {
      for (const [k, v] of entries) {
        const cp = childPath(path, k, isArray);
        if (isArray) walk(v, cp, depth + 1, undefined, k);
        else walk(v, cp, depth + 1, k, undefined);
      }
    }
  };

  walk(data, "$", 0);
  return rows;
}

interface MatchResult {
  /** Matching paths in document (pre-order) order, for Prev/Next. */
  matchPaths: string[];
  /** Set of matching paths, for row highlight. */
  matchSet: Set<string>;
  /** Ancestor paths of matches, force-opened so matches are visible. */
  forceOpen: Set<string>;
}

const EMPTY_MATCHES: MatchResult = { matchPaths: [], matchSet: new Set(), forceOpen: new Set() };

/** Find nodes whose key or primitive value contains the query (case-insensitive); collect ancestors. */
function findMatches(data: unknown, rawQuery: string): MatchResult {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return EMPTY_MATCHES;
  const matchPaths: string[] = [];
  const matchSet = new Set<string>();
  const forceOpen = new Set<string>();

  const walk = (value: unknown, path: string, keyText: string | undefined, ancestors: string[]) => {
    let matched = keyText !== undefined && keyText.toLowerCase().includes(q);
    if (!matched && !isContainer(value)) {
      matched = renderPrimitive(value).toLowerCase().includes(q);
    }
    if (matched) {
      matchPaths.push(path);
      matchSet.add(path);
      for (const a of ancestors) forceOpen.add(a);
    }
    if (isContainer(value)) {
      const isArray = Array.isArray(value);
      const next = [...ancestors, path];
      if (isArray) {
        (value as unknown[]).forEach((v, i) => walk(v, childPath(path, String(i), true), undefined, next));
      } else {
        for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
          walk(v, childPath(path, k, false), k, next);
        }
      }
    }
  };

  walk(data, "$", undefined, []);
  return { matchPaths, matchSet, forceOpen };
}

/** Render text with the matched substring wrapped in <mark>. */
function Highlighted({ text, q }: { text: string; q: string }) {
  if (!q) return <>{text}</>;
  const lower = text.toLowerCase();
  const ql = q.toLowerCase();
  const out: React.ReactNode[] = [];
  let i = 0;
  let idx = lower.indexOf(ql);
  if (idx === -1) return <>{text}</>;
  let n = 0;
  while (idx !== -1) {
    if (idx > i) out.push(text.slice(i, idx));
    out.push(
      <mark className="json-tree__mark" key={n++}>
        {text.slice(idx, idx + ql.length)}
      </mark>
    );
    i = idx + ql.length;
    idx = lower.indexOf(ql, i);
  }
  if (i < text.length) out.push(text.slice(i));
  return <>{out}</>;
}

const JsonTreeView = memo(function JsonTreeView({
  data,
  expandAllNonce,
  collapseAllNonce,
  showLineNumbers = true,
  showSearch = true,
  className,
}: JsonTreeViewProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const [query, setQuery] = useState("");
  const [current, setCurrent] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentRowRef = useRef<HTMLDivElement>(null);

  const deferredQuery = useDeferredValue(query);
  const hq = deferredQuery.trim().toLowerCase();

  const onToggle = useCallback((path: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  // New data → reset to the fully-expanded default.
  useEffect(() => {
    setCollapsed(new Set());
  }, [data]);

  useEffect(() => {
    if (expandAllNonce !== undefined) setCollapsed(new Set());
  }, [expandAllNonce]);

  useEffect(() => {
    if (collapseAllNonce !== undefined) setCollapsed(new Set(collectContainerPaths(data)));
  }, [collapseAllNonce, data]);

  const { matchPaths, matchSet, forceOpen } = useMemo(
    () => findMatches(data, deferredQuery),
    [data, deferredQuery]
  );

  // Reset the active match when the query or data changes.
  useEffect(() => {
    setCurrent(0);
  }, [deferredQuery, data]);

  const safeCurrent = matchPaths.length ? Math.min(current, matchPaths.length - 1) : 0;
  const currentPath = matchPaths[safeCurrent];

  // Scroll the active match into view.
  useEffect(() => {
    if (currentPath) currentRowRef.current?.scrollIntoView({ block: "nearest" });
  }, [currentPath]);

  const gotoMatch = useCallback(
    (delta: number) => {
      setCurrent((c) => {
        const len = matchPaths.length;
        if (!len) return 0;
        return (((c + delta) % len) + len) % len;
      });
    },
    [matchPaths.length]
  );

  const rows = useMemo(() => flattenVisible(data, collapsed, forceOpen), [data, collapsed, forceOpen]);

  // Match CodeEditor's gutter width formula for visual parity.
  const gutterWidth = Math.max(String(rows.length).length * 10 + 16, 36);

  const copyPath = useCallback((path: string) => {
    void navigator.clipboard.writeText(path);
    toast.success("Copied path");
  }, []);
  const copyValue = useCallback((value: unknown) => {
    void navigator.clipboard.writeText(copyableValue(value));
    toast.success("Copied value");
  }, []);

  const hasQuery = query.trim().length > 0;

  return (
    <div className={cn("json-tree-root flex flex-col h-full min-h-0", className)}>
      {showSearch && (
        <div className="json-tree-search">
          <Search className="json-tree-search__icon" aria-hidden />
          <input
            className="json-tree-search__input"
            type="text"
            placeholder="Search keys & values…"
            value={query}
            spellCheck={false}
            aria-label="Search JSON"
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                gotoMatch(e.shiftKey ? -1 : 1);
              } else if (e.key === "Escape") {
                e.preventDefault();
                setQuery("");
              }
            }}
          />
          {hasQuery && (
            <>
              <span className="json-tree-search__count">
                {matchPaths.length ? `${safeCurrent + 1}/${matchPaths.length}` : "0/0"}
              </span>
              <button
                type="button"
                className="json-tree-search__nav"
                disabled={!matchPaths.length}
                aria-label="Previous match"
                title="Previous match"
                onClick={() => gotoMatch(-1)}
              >
                <ChevronUp aria-hidden />
              </button>
              <button
                type="button"
                className="json-tree-search__nav"
                disabled={!matchPaths.length}
                aria-label="Next match"
                title="Next match"
                onClick={() => gotoMatch(1)}
              >
                <ChevronDown aria-hidden />
              </button>
              <button
                type="button"
                className="json-tree-search__nav"
                aria-label="Clear search"
                title="Clear search"
                onClick={() => setQuery("")}
              >
                <X aria-hidden />
              </button>
            </>
          )}
        </div>
      )}

      <div className="json-tree-scroll flex-1 min-h-0 overflow-auto" ref={scrollRef}>
        <div className="json-tree font-mono" role="tree" aria-label="JSON tree view">
          {showLineNumbers && (
            <div className="json-tree__linenos" style={{ width: gutterWidth }} aria-hidden>
              {rows.map((row, i) => (
                <div key={row.path} className="json-tree__num">
                  {i + 1}
                </div>
              ))}
            </div>
          )}
          <div className="json-tree__content">
            {rows.map((row) => {
              const container = row.kind !== "primitive";
              const hasChildren = container && row.count > 0;
              const summary = row.kind === "array" ? `[${row.count}]` : `{${row.count}}`;
              const isCurrent = row.path === currentPath;
              return (
                <div
                  key={row.path}
                  ref={isCurrent ? currentRowRef : undefined}
                  role="treeitem"
                  aria-expanded={container ? row.isOpen : undefined}
                  className={cn(
                    "json-tree__row",
                    container && "json-tree__row--container",
                    matchSet.has(row.path) && "json-tree__row--match",
                    isCurrent && "json-tree__row--current"
                  )}
                  style={{ paddingLeft: row.depth * INDENT_PX }}
                >
                  {hasChildren ? (
                    <button
                      type="button"
                      className="json-tree__chevron json-tree__caret"
                      aria-label={row.isOpen ? "Collapse" : "Expand"}
                      onClick={() => onToggle(row.path)}
                    >
                      <ChevronRight
                        className={cn("json-tree__chevron-icon", row.isOpen && "json-tree__chevron-icon--open")}
                      />
                    </button>
                  ) : (
                    <span className="json-tree__caret" aria-hidden />
                  )}

                  {row.indexLabel !== undefined ? (
                    <span className="json-tree__index">{row.indexLabel}:&nbsp;</span>
                  ) : row.keyLabel !== undefined ? (
                    <>
                      <span style={{ color: "hsl(var(--code-key))" }}>
                        "<Highlighted text={row.keyLabel} q={hq} />"
                      </span>
                      <span style={{ color: "hsl(var(--code-punctuation))" }}>:&nbsp;</span>
                    </>
                  ) : null}

                  {container ? (
                    <span className="json-tree__summary">{summary}</span>
                  ) : (
                    <span style={{ color: valueColor(row.value) }}>
                      <Highlighted text={renderPrimitive(row.value)} q={hq} />
                    </span>
                  )}

                  <span className="json-tree__actions">
                    <button
                      type="button"
                      className="json-tree__action"
                      title="Copy path"
                      aria-label="Copy path"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyPath(row.path);
                      }}
                    >
                      <Copy aria-hidden />
                    </button>
                    <button
                      type="button"
                      className="json-tree__action"
                      title="Copy value"
                      aria-label="Copy value"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyValue(row.value);
                      }}
                    >
                      <Braces aria-hidden />
                    </button>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
});

export default JsonTreeView;
