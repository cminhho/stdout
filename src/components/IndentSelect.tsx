import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/** Canonical indent option: spaces (2, 4, 8), tab, or minified. */
export type IndentOption = 2 | 4 | 8 | "tab" | "minified";

/** Default indent when not defined (4 spaces). */
export const DEFAULT_INDENT: IndentOption = 4;

const DEFAULT_SPACE_OPTIONS: number[] = [2, 4, 8];

function parseIndentValue(raw: string, allowedSpaces: number[]): IndentOption {
  if (raw === "tab" || raw === "minified") return raw;
  const n = Number(raw);
  if (allowedSpaces.includes(n)) return n as IndentOption;
  return (allowedSpaces.includes(DEFAULT_INDENT as number) ? DEFAULT_INDENT : allowedSpaces[0] ?? DEFAULT_INDENT) as IndentOption;
}

export interface IndentSelectProps {
  value: IndentOption;
  onChange: (value: IndentOption) => void;
  /** Initial/default value when parent uses uncontrolled or for initial state (default: 4 spaces). */
  defaultValue?: IndentOption;
  /** Space options to show (default: [2, 4, 8]). */
  spaceOptions?: number[];
  /** Show Tab option (default: true). */
  includeTab?: boolean;
  /** Show Minified option (default: true). */
  includeMinified?: boolean;
  title?: string;
}

/**
 * Indentation select: 2/4/8 spaces, Tab, Minified.
 * Uses SelectTrigger size="sm" for toolbar use alongside Sample, Clear, Save.
 */
const IndentSelect = ({
  value,
  onChange,
  defaultValue = DEFAULT_INDENT,
  spaceOptions = DEFAULT_SPACE_OPTIONS,
  includeTab = true,
  includeMinified = true,
  title = "Indentation",
}: IndentSelectProps) => {
  const valueStr = typeof value === "number" ? String(value) : value;

  return (
    <Select
      value={valueStr}
      onValueChange={(v) => onChange(parseIndentValue(v, spaceOptions))}
    >
      <SelectTrigger
        size="sm"
        variant="secondary"
        title={title}
        aria-label={title}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {spaceOptions.map((n) => (
          <SelectItem key={n} value={String(n)}>
            {n} spaces
          </SelectItem>
        ))}
        {includeTab ? (
          <SelectItem value="tab">Tab</SelectItem>
        ) : null}
        {includeMinified ? (
          <SelectItem value="minified">Minified</SelectItem>
        ) : null}
      </SelectContent>
    </Select>
  );
};

export default IndentSelect;
