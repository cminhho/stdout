import { useCallback } from "react";

/** Canonical indent option: spaces (2, 3, 4, 8), tab, or minified. */
export type IndentOption = 2 | 3 | 4 | 8 | "tab" | "minified";

const DEFAULT_SPACE_OPTIONS: number[] = [2, 4, 8];

function parseIndentValue(raw: string, allowedSpaces: number[]): IndentOption {
  if (raw === "tab" || raw === "minified") return raw;
  const n = Number(raw);
  if (allowedSpaces.includes(n)) return n as IndentOption;
  return (allowedSpaces[0] ?? 2) as IndentOption;
}

export interface IndentSelectProps {
  value: IndentOption;
  onChange: (value: IndentOption) => void;
  /** Space options to show (default: [2, 4, 8]). */
  spaceOptions?: number[];
  /** Show Tab option (default: true). */
  includeTab?: boolean;
  /** Show Minified option (default: true). */
  includeMinified?: boolean;
  className?: string;
  title?: string;
}

const defaultClassName = "h-7 rounded border border-input bg-background pl-2 pr-6 text-xs min-w-0";

/**
 * Generic indentation select: 2/4/8 spaces, Tab, Minified.
 * Reusable across formatter and converter pages for consistent UX.
 */
const IndentSelect = ({
  value,
  onChange,
  spaceOptions = DEFAULT_SPACE_OPTIONS,
  includeTab = true,
  includeMinified = true,
  className = defaultClassName,
  title = "Indentation",
}: IndentSelectProps) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange(parseIndentValue(e.target.value, spaceOptions));
    },
    [onChange, spaceOptions]
  );

  const valueStr = typeof value === "number" ? String(value) : value;

  return (
    <select value={valueStr} onChange={handleChange} className={className} title={title}>
      {spaceOptions.map((n) => (
        <option key={n} value={n}>
          {n} spaces
        </option>
      ))}
      {includeTab && (
        <option value="tab">Tab</option>
      )}
      {includeMinified && (
        <option value="minified">Minified</option>
      )}
    </select>
  );
};

export default IndentSelect;
