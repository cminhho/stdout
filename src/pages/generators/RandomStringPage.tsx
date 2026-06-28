import { useState, useEffect, useMemo, type ReactNode } from "react";
import { Check, ChevronDown, RefreshCw, Search } from "lucide-react";

import { ClearButton } from "@/components/common/ClearButton";
import CodeEditor from "@/components/common/CodeEditor";
import TwoPanelToolLayout from "@/components/layout/TwoPanelToolLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SelectWithOptions } from "@/components/ui/select";
import { cn } from "@/utils/cn";

const CHAR_SETS = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  hex: "0123456789abcdef",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
  safeSymbols: "-_.~",
  readable: "ABCDEFGHJKLMNPQRSTUVWXYZ23456789",
};

const ALPHANUMERIC =
  CHAR_SETS.lowercase + CHAR_SETS.uppercase + CHAR_SETS.digits;
const BASE64URL = ALPHANUMERIC + "-_";
const AMBIGUOUS_CHARS = new Set("0Oo1IiLl|");
const UINT32_RANGE = 0x100000000;

type SymbolProfile = "all" | "safe" | "none";

type PresetId =
  | "strong-password"
  | "long-password"
  | "api-token"
  | "session-secret"
  | "webhook-secret"
  | "oauth-state"
  | "hex-secret"
  | "pin-code"
  | "otp-code"
  | "recovery-code"
  | "license-key"
  | "invite-code"
  | "readable-code"
  | "alphanumeric"
  | "hex"
  | "base64url"
  | "custom";

interface PresetConfig {
  id: PresetId;
  label: string;
  length: number;
  upper: number;
  lower: number;
  digits: number;
  symbols: number;
  separator: string;
  groupSize: number;
  /** When set, ignore upper/lower/digits/symbols and use this charset for `length` chars. */
  charset?: keyof typeof CHAR_SETS | "alphanumeric" | "base64url";
  symbolProfile: SymbolProfile;
  excludeAmbiguous: boolean;
  defaultPrefix?: string;
  defaultSuffix?: string;
}

const PRESETS: PresetConfig[] = [
  {
    id: "strong-password",
    label: "Password (16 mixed)",
    length: 16,
    upper: 4,
    lower: 4,
    digits: 4,
    symbols: 4,
    separator: "",
    groupSize: 0,
    symbolProfile: "all",
    excludeAmbiguous: false,
  },
  {
    id: "long-password",
    label: "Password (32 mixed)",
    length: 32,
    upper: 8,
    lower: 8,
    digits: 8,
    symbols: 8,
    separator: "",
    groupSize: 0,
    symbolProfile: "all",
    excludeAmbiguous: false,
  },
  {
    id: "api-token",
    label: "API token (43 chars)",
    length: 43,
    upper: 0,
    lower: 0,
    digits: 0,
    symbols: 0,
    separator: "",
    groupSize: 0,
    charset: "base64url",
    symbolProfile: "none",
    excludeAmbiguous: false,
  },
  {
    id: "session-secret",
    label: "Session/JWT secret",
    length: 86,
    upper: 0,
    lower: 0,
    digits: 0,
    symbols: 0,
    separator: "",
    groupSize: 0,
    charset: "base64url",
    symbolProfile: "none",
    excludeAmbiguous: false,
  },
  {
    id: "webhook-secret",
    label: "Webhook signing secret",
    length: 43,
    upper: 0,
    lower: 0,
    digits: 0,
    symbols: 0,
    separator: "",
    groupSize: 0,
    charset: "base64url",
    symbolProfile: "none",
    excludeAmbiguous: false,
    defaultPrefix: "whsec_",
  },
  {
    id: "oauth-state",
    label: "OAuth state / nonce",
    length: 22,
    upper: 0,
    lower: 0,
    digits: 0,
    symbols: 0,
    separator: "",
    groupSize: 0,
    charset: "base64url",
    symbolProfile: "none",
    excludeAmbiguous: false,
  },
  {
    id: "hex-secret",
    label: "Hex secret (64 chars)",
    length: 64,
    upper: 0,
    lower: 0,
    digits: 0,
    symbols: 0,
    separator: "",
    groupSize: 0,
    charset: "hex",
    symbolProfile: "none",
    excludeAmbiguous: false,
  },
  {
    id: "pin-code",
    label: "PIN (4 digits)",
    length: 4,
    upper: 0,
    lower: 0,
    digits: 4,
    symbols: 0,
    separator: "",
    groupSize: 0,
    symbolProfile: "none",
    excludeAmbiguous: false,
  },
  {
    id: "otp-code",
    label: "OTP (6 digits)",
    length: 6,
    upper: 0,
    lower: 0,
    digits: 0,
    symbols: 0,
    separator: "",
    groupSize: 0,
    charset: "digits",
    symbolProfile: "none",
    excludeAmbiguous: false,
  },
  {
    id: "recovery-code",
    label: "Recovery code",
    length: 12,
    upper: 0,
    lower: 0,
    digits: 0,
    symbols: 0,
    separator: "-",
    groupSize: 4,
    charset: "readable",
    symbolProfile: "none",
    excludeAmbiguous: true,
  },
  {
    id: "license-key",
    label: "License key",
    length: 20,
    upper: 0,
    lower: 0,
    digits: 0,
    symbols: 0,
    separator: "-",
    groupSize: 5,
    charset: "readable",
    symbolProfile: "none",
    excludeAmbiguous: true,
  },
  {
    id: "invite-code",
    label: "Invite code",
    length: 10,
    upper: 0,
    lower: 0,
    digits: 0,
    symbols: 0,
    separator: "",
    groupSize: 0,
    charset: "readable",
    symbolProfile: "none",
    excludeAmbiguous: true,
  },
  {
    id: "readable-code",
    label: "Readable code",
    length: 24,
    upper: 0,
    lower: 0,
    digits: 0,
    symbols: 0,
    separator: "-",
    groupSize: 4,
    charset: "readable",
    symbolProfile: "none",
    excludeAmbiguous: true,
  },
  {
    id: "alphanumeric",
    label: "Alphanumeric (48 chars)",
    length: 48,
    upper: 0,
    lower: 0,
    digits: 0,
    symbols: 0,
    separator: "",
    groupSize: 0,
    charset: "alphanumeric",
    symbolProfile: "none",
    excludeAmbiguous: false,
  },
  {
    id: "hex",
    label: "Hex (32 chars)",
    length: 32,
    upper: 0,
    lower: 0,
    digits: 0,
    symbols: 0,
    separator: "",
    groupSize: 0,
    charset: "hex",
    symbolProfile: "none",
    excludeAmbiguous: false,
  },
  {
    id: "base64url",
    label: "Base64url (32 chars)",
    length: 32,
    upper: 0,
    lower: 0,
    digits: 0,
    symbols: 0,
    separator: "",
    groupSize: 0,
    charset: "base64url",
    symbolProfile: "none",
    excludeAmbiguous: false,
  },
  {
    id: "custom",
    label: "Custom",
    length: 32,
    upper: 0,
    lower: 0,
    digits: 0,
    symbols: 0,
    separator: "",
    groupSize: 0,
    symbolProfile: "all",
    excludeAmbiguous: false,
  },
];

const SYMBOL_PROFILE_OPTIONS: { value: SymbolProfile; label: string }[] = [
  { value: "all", label: "All symbols" },
  { value: "safe", label: "Safe (-_.~)" },
  { value: "none", label: "No symbols" },
];

interface PresetPickerProps {
  value: PresetId;
  onValueChange: (value: PresetId) => void;
}

function PresetPicker({ value, onValueChange }: PresetPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selected = PRESETS.find((preset) => preset.id === value);
  const query = search.trim().toLowerCase();
  const filteredPresets = useMemo(
    () =>
      query
        ? PRESETS.filter((preset) =>
            `${preset.label} ${preset.id}`.toLowerCase().includes(query)
          )
        : PRESETS,
    [query]
  );

  const selectPreset = (id: PresetId) => {
    onValueChange(id);
    setOpen(false);
    setSearch("");
  };

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) setSearch("");
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="secondary"
          className="h-9 w-full min-w-0 justify-between px-2.5 py-2 text-sm"
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className="truncate">{selected?.label ?? "Select preset"}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] min-w-72 p-2">
        <div className="relative mb-2">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search presets..."
            className="input-compact h-8 pl-7"
            aria-label="Search preset options"
            autoFocus
          />
        </div>
        <div
          role="listbox"
          aria-label="Preset options"
          className="max-h-64 overflow-y-scroll pr-1 [scrollbar-gutter:stable]"
        >
          {filteredPresets.length > 0 ? (
            filteredPresets.map((preset) => {
              const isSelected = preset.id === value;
              return (
                <button
                  key={preset.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => selectPreset(preset.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none transition-colors duration-150",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "text-popover-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Check className={cn("h-3.5 w-3.5 shrink-0", !isSelected && "opacity-0")} aria-hidden />
                  <span className="min-w-0 truncate">{preset.label}</span>
                </button>
              );
            })
          ) : (
            <div className="px-2 py-3 text-sm text-muted-foreground">No presets found</div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function uniqueChars(chars: string): string {
  return Array.from(new Set(Array.from(chars))).join("");
}

function removeAmbiguous(chars: string): string {
  return Array.from(chars).filter((char) => !AMBIGUOUS_CHARS.has(char)).join("");
}

function normalizeCharset(chars: string, excludeAmbiguous: boolean): string {
  return uniqueChars(excludeAmbiguous ? removeAmbiguous(chars) : chars);
}

function presetCharset(charset: PresetConfig["charset"], excludeAmbiguous: boolean): string {
  const chars =
    charset === "alphanumeric"
      ? ALPHANUMERIC
      : charset === "base64url"
        ? BASE64URL
        : charset
          ? CHAR_SETS[charset]
          : "";
  return normalizeCharset(chars, excludeAmbiguous);
}

function symbolCharset(profile: SymbolProfile, excludeAmbiguous: boolean): string {
  if (profile === "none") return "";
  return normalizeCharset(profile === "safe" ? CHAR_SETS.safeSymbols : CHAR_SETS.symbols, excludeAmbiguous);
}

function randomInt(maxExclusive: number): number {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0 || maxExclusive > UINT32_RANGE) {
    throw new Error("Invalid random range");
  }

  const limit = Math.floor(UINT32_RANGE / maxExclusive) * maxExclusive;
  const arr = new Uint32Array(1);
  do {
    crypto.getRandomValues(arr);
  } while (arr[0] >= limit);
  return arr[0] % maxExclusive;
}

function pickRandom(chars: string, n: number): string {
  if (!chars || n <= 0) return "";
  return Array.from({ length: n }, () => chars[randomInt(chars.length)]).join("");
}

function shuffle(str: string): string {
  const a = str.split("");
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.join("");
}

function applySeparator(s: string, sep: string, groupSize: number): string {
  if (!sep || groupSize <= 0) return s;
  const parts: string[] = [];
  for (let i = 0; i < s.length; i += groupSize) {
    parts.push(s.slice(i, i + groupSize));
  }
  return parts.join(sep);
}

function log2Factorial(n: number): number {
  let total = 0;
  for (let i = 2; i <= n; i++) total += Math.log2(i);
  return total;
}

function formatBits(bits: number): string {
  if (!Number.isFinite(bits) || bits <= 0) return "0 bits";
  return `${bits >= 100 ? bits.toFixed(0) : bits.toFixed(1)} bits`;
}

function formatSearchSpace(bits: number): string {
  if (!Number.isFinite(bits) || bits <= 0) return "0";
  if (bits <= 52) return Math.round(2 ** bits).toLocaleString();
  return `10^${(bits * Math.LOG10E * Math.LN2).toFixed(1)}`;
}

function formatCollisionRisk(bits: number, count: number): string {
  if (count < 2 || bits <= 0) return "N/A";
  const log2Risk = Math.log2(count * (count - 1)) - 1 - bits;
  if (log2Risk < -40) return "Negligible";
  if (log2Risk >= 0) return "High";
  return `${(2 ** log2Risk * 100).toPrecision(2)}%`;
}

function entropyLabel(bits: number): string {
  if (bits >= 128) return "Very strong";
  if (bits >= 96) return "Strong";
  if (bits >= 64) return "Moderate";
  if (bits >= 32) return "Low";
  return "Weak";
}

const RandomStringPage = () => {
  const [presetId, setPresetId] = useState<PresetId>("strong-password");
  const [length, setLength] = useState(16);
  const [count, setCount] = useState(10);
  const [upper, setUpper] = useState(4);
  const [lower, setLower] = useState(4);
  const [digits, setDigits] = useState(4);
  const [symbols, setSymbols] = useState(4);
  const [separator, setSeparator] = useState("");
  const [groupSize, setGroupSize] = useState(0);
  const [customChars, setCustomChars] = useState("");
  const [symbolProfile, setSymbolProfile] = useState<SymbolProfile>("all");
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const [strings, setStrings] = useState<string[]>([]);
  const [regenerateKey, setRegenerateKey] = useState(0);

  const handlePresetChange = (id: PresetId) => {
    setPresetId(id);
    const config = PRESETS.find((p) => p.id === id);
    if (config) {
      setLength(config.length);
      setUpper(config.upper);
      setLower(config.lower);
      setDigits(config.digits);
      setSymbols(config.symbols);
      setSeparator(config.separator);
      setGroupSize(config.groupSize);
      setSymbolProfile(config.symbolProfile);
      setExcludeAmbiguous(config.excludeAmbiguous);
      setPrefix(config.defaultPrefix ?? "");
      setSuffix(config.defaultSuffix ?? "");
    }
  };

  const presetConfig = PRESETS.find((p) => p.id === presetId);
  const useCountsMode =
    presetConfig?.charset == null || presetId === "custom";
  const symbolChars = symbolCharset(symbolProfile, excludeAmbiguous);
  const effectiveSymbols = symbolProfile === "none" ? 0 : symbols;
  const countModeCharsets = useMemo(
    () => ({
      uppercase: normalizeCharset(CHAR_SETS.uppercase, excludeAmbiguous),
      lowercase: normalizeCharset(CHAR_SETS.lowercase, excludeAmbiguous),
      digits: normalizeCharset(CHAR_SETS.digits, excludeAmbiguous),
      symbols: symbolChars,
    }),
    [excludeAmbiguous, symbolChars]
  );
  const customCharset = useMemo(
    () => normalizeCharset(customChars, excludeAmbiguous),
    [customChars, excludeAmbiguous]
  );
  const activeCharset = useMemo(
    () => (presetConfig?.charset ? presetCharset(presetConfig.charset, excludeAmbiguous) : customCharset),
    [customCharset, excludeAmbiguous, presetConfig]
  );

  useEffect(() => {
    const preset = presetConfig;
    const useCharset = preset?.charset != null && preset.id !== "custom";
    const useCustomChars = presetId === "custom" && customCharset.length > 0;
    const total =
      presetId === "custom" && !customCharset.trim()
        ? 0
        : useCharset || useCustomChars
          ? length
          : upper + lower + digits + effectiveSymbols;

    if (total <= 0 || count <= 0) {
      setStrings([]);
      return;
    }

    const next: string[] = [];
    for (let i = 0; i < count; i++) {
      let raw: string;
      if (useCharset) {
        raw = pickRandom(activeCharset, length);
      } else if (useCustomChars) {
        raw = pickRandom(customCharset, length);
      } else {
        const u = pickRandom(countModeCharsets.uppercase, upper);
        const l = pickRandom(countModeCharsets.lowercase, lower);
        const d = pickRandom(countModeCharsets.digits, digits);
        const s = pickRandom(countModeCharsets.symbols, effectiveSymbols);
        raw = shuffle(u + l + d + s);
      }
      const withSep = applySeparator(raw, separator, groupSize);
      next.push(prefix + withSep + suffix);
    }
    setStrings(next);
  }, [
    presetId,
    presetConfig,
    length,
    count,
    upper,
    lower,
    digits,
    effectiveSymbols,
    separator,
    groupSize,
    customCharset,
    activeCharset,
    countModeCharsets,
    prefix,
    suffix,
    regenerateKey,
  ]);

  const outputText = strings.join("\n");

  const entropy = useMemo(() => {
    let bits = 0;
    let charsetSize = 0;
    if (presetConfig?.charset || presetId === "custom") {
      charsetSize = activeCharset.length;
      bits = length * Math.log2(Math.max(1, charsetSize));
    } else {
      const counts = [
        { count: upper, size: countModeCharsets.uppercase.length },
        { count: lower, size: countModeCharsets.lowercase.length },
        { count: digits, size: countModeCharsets.digits.length },
        { count: effectiveSymbols, size: countModeCharsets.symbols.length },
      ];
      const total = counts.reduce((sum, item) => sum + item.count, 0);
      charsetSize = counts.reduce((sum, item) => sum + (item.count > 0 ? item.size : 0), 0);
      bits =
        counts.reduce((sum, item) => sum + (item.count > 0 ? item.count * Math.log2(Math.max(1, item.size)) : 0), 0) +
        log2Factorial(total) -
        counts.reduce((sum, item) => sum + log2Factorial(item.count), 0);
    }

    return {
      bits,
      charsetSize,
      label: entropyLabel(bits),
      searchSpace: formatSearchSpace(bits),
      collisionRisk: formatCollisionRisk(bits, count),
    };
  }, [
    activeCharset.length,
    count,
    countModeCharsets,
    digits,
    effectiveSymbols,
    length,
    lower,
    presetConfig?.charset,
    presetId,
    upper,
  ]);

  const field = (label: string, child: ReactNode, id?: string) => (
    <div className="flex flex-col min-w-0">
      <Label className="tool-field-label block" htmlFor={id}>
        {label}
      </Label>
      {child}
    </div>
  );

  const inputPaneContent = (
    <div className="flex flex-col gap-[var(--home-content-gap)] overflow-auto">
      <section className="tool-section-card shrink-0" aria-label="Preset">
        <h2 className="home-section-label mb-0">Preset</h2>
        <div className="mt-2">
          <PresetPicker value={presetId} onValueChange={handlePresetChange} />
        </div>
      </section>

      {useCountsMode && presetId !== "custom" && (
        <section className="tool-section-card shrink-0" aria-label="Character counts">
          <h2 className="home-section-label mb-0">Character counts</h2>
          <div className="mt-2 flex flex-col gap-[var(--spacing-block-gap)]">
            {field(
              "Uppercase",
              <Input
                id="random-upper"
                type="number"
                min={0}
                max={64}
                value={upper}
                onChange={(e) =>
                  setUpper(Math.max(0, Math.min(64, Number(e.target.value) || 0)))
                }
                className="input-compact"
              />,
              "random-upper"
            )}
            {field(
              "Lowercase",
              <Input
                id="random-lower"
                type="number"
                min={0}
                max={64}
                value={lower}
                onChange={(e) =>
                  setLower(Math.max(0, Math.min(64, Number(e.target.value) || 0)))
                }
                className="input-compact"
              />,
              "random-lower"
            )}
            {field(
              "Digits",
              <Input
                id="random-digits"
                type="number"
                min={0}
                max={64}
                value={digits}
                onChange={(e) =>
                  setDigits(Math.max(0, Math.min(64, Number(e.target.value) || 0)))
                }
                className="input-compact"
              />,
              "random-digits"
            )}
            {field(
              "Symbols",
              <Input
                id="random-symbols"
                type="number"
                min={0}
                max={64}
                value={effectiveSymbols}
                disabled={symbolProfile === "none"}
                onChange={(e) =>
                  setSymbols(Math.max(0, Math.min(64, Number(e.target.value) || 0)))
                }
                className="input-compact"
              />,
              "random-symbols"
            )}
          </div>
        </section>
      )}

      {(presetConfig?.charset != null || presetId === "custom") && (
        <section className="tool-section-card shrink-0" aria-label="Length">
          <h2 className="home-section-label mb-0">Length</h2>
          <div className="mt-2">
            {field(
              "Length",
              <Input
                id="random-length"
                type="number"
                min={1}
                max={512}
                value={length}
                onChange={(e) =>
                  setLength(Math.max(1, Math.min(512, Number(e.target.value) || 1)))
                }
                className="input-compact"
              />,
              "random-length"
            )}
          </div>
        </section>
      )}

      {(presetId === "license-key" || separator) && (
        <section className="tool-section-card shrink-0" aria-label="Separator and grouping">
          <h2 className="home-section-label mb-0">Separator & grouping</h2>
          <div className="mt-2 flex flex-col gap-[var(--spacing-block-gap)]">
            {field(
              "Separator",
              <SelectWithOptions
                value={separator || "(None)"}
                onValueChange={(v) => setSeparator(v === "(None)" ? "" : v)}
                options={[
                  { value: "(None)", label: "(None)" },
                  { value: "-", label: "Dash (-)" },
                  { value: " ", label: "Space" },
                  { value: "_", label: "Underscore (_)" },
                ]}
                variant="secondary"
                triggerClassName="w-full min-w-0 cursor-pointer transition-colors duration-150"
              />
            )}
            {field(
              "Group size",
              <Input
                id="random-group-size"
                type="number"
                min={0}
                max={32}
                value={groupSize}
                onChange={(e) =>
                  setGroupSize(
                    Math.max(0, Math.min(32, Number(e.target.value) || 0))
                  )
                }
                className="input-compact"
              />,
              "random-group-size"
            )}
          </div>
        </section>
      )}

      <section className="tool-section-card shrink-0" aria-label="Custom charset and options">
        <h2 className="home-section-label mb-0">Options</h2>
        <div className="mt-2 flex flex-col gap-[var(--spacing-block-gap)]">
          {useCountsMode && presetId !== "custom" &&
            field(
              "Symbol set",
              <SelectWithOptions<SymbolProfile>
                value={symbolProfile}
                onValueChange={setSymbolProfile}
                options={SYMBOL_PROFILE_OPTIONS}
                variant="secondary"
                triggerClassName="w-full min-w-0 cursor-pointer transition-colors duration-150"
                aria-label="Symbol set"
              />
            )}
          <label className="flex items-center gap-[var(--home-space-xs)] text-[length:var(--text-caption)] text-muted-foreground cursor-pointer">
            <Checkbox
              checked={excludeAmbiguous}
              onCheckedChange={(checked) => setExcludeAmbiguous(checked === true)}
              aria-label="Exclude ambiguous characters"
            />
            <span>Exclude ambiguous characters</span>
          </label>
          {presetId === "custom" &&
            field(
              "Custom charset",
              <Input
                id="random-custom-chars"
                value={customChars}
                onChange={(e) => setCustomChars(e.target.value)}
                placeholder="e.g. abc123"
                className="input-compact"
              />,
              "random-custom-chars"
            )}
          {field(
            "Prefix",
            <Input
              id="random-prefix"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              className="input-compact"
              placeholder="Optional"
            />,
            "random-prefix"
          )}
          {field(
            "Suffix",
            <Input
              id="random-suffix"
              value={suffix}
              onChange={(e) => setSuffix(e.target.value)}
              className="input-compact"
              placeholder="Optional"
            />,
            "random-suffix"
          )}
        </div>
      </section>
    </div>
  );

  return (
    <TwoPanelToolLayout
      defaultInputPercent={28}
      inputPane={{
        title: "Options",
        children: inputPaneContent,
      }}
      outputPane={{
        title:
          strings.length > 0
            ? `${strings.length} string${strings.length > 1 ? "s" : ""}`
            : "Output",
        copyText: outputText || undefined,
        toolbar: (
          <>
            <Button
              type="button"
              size="xs"
              variant="default"
              onClick={() => setRegenerateKey((k) => k + 1)}
              title="Generate with current options"
              aria-label="Generate"
              className="cursor-pointer transition-colors duration-150"
            >
              <RefreshCw className="h-3 w-3" aria-hidden />
              Generate
            </Button>
            <div className="flex items-center gap-[var(--home-space-xs)]">
              <Label
                htmlFor="random-count"
                className="tool-caption shrink-0"
              >
                Count
              </Label>
              <Input
                id="random-count"
                type="number"
                min={1}
                max={100}
                value={count}
                onChange={(e) =>
                  setCount(Math.max(1, Math.min(100, Number(e.target.value) || 1)))
                }
                className="input-compact w-14"
                aria-label="Number of strings"
              />
            </div>
            <ClearButton
              onClick={() => setStrings([])}
              className="cursor-pointer transition-colors duration-150"
            />
          </>
        ),
        children: (
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <div className="shrink-0 border-b border-border bg-muted/20 px-3 py-2">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-4">
                <div>
                  <span className="text-muted-foreground">Entropy</span>
                  <div className="font-mono text-foreground">{formatBits(entropy.bits)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Strength</span>
                  <div className="font-mono text-foreground">{entropy.label}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Charset</span>
                  <div className="font-mono text-foreground">{entropy.charsetSize}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Collision</span>
                  <div className="font-mono text-foreground">{entropy.collisionRisk}</div>
                </div>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Search space: <span className="font-mono text-foreground">{entropy.searchSpace}</span>
              </div>
            </div>
            <CodeEditor
              value={outputText}
              readOnly
              language="randomstring"
              placeholder="Results update automatically..."
              fillHeight
              showLineNumbers={false}
            />
          </div>
        ),
      }}
    />
  );
};

export default RandomStringPage;
