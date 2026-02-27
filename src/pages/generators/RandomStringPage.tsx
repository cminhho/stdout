import { useState, useEffect, type ReactNode } from "react";
import { RefreshCw } from "lucide-react";

import { ClearButton } from "@/components/common/ClearButton";
import CodeEditor from "@/components/common/CodeEditor";
import TwoPanelToolLayout from "@/components/layout/TwoPanelToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectWithOptions } from "@/components/ui/select";

const CHAR_SETS = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  hex: "0123456789abcdef",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

const ALPHANUMERIC =
  CHAR_SETS.lowercase + CHAR_SETS.uppercase + CHAR_SETS.digits;
const BASE64URL = ALPHANUMERIC + "-_";

type PresetId =
  | "strong-password"
  | "long-password"
  | "pin-code"
  | "license-key"
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
}

const PRESETS: PresetConfig[] = [
  {
    id: "strong-password",
    label: "Strong password",
    length: 16,
    upper: 4,
    lower: 4,
    digits: 4,
    symbols: 4,
    separator: "",
    groupSize: 0,
  },
  {
    id: "long-password",
    label: "Long password",
    length: 32,
    upper: 8,
    lower: 8,
    digits: 8,
    symbols: 8,
    separator: "",
    groupSize: 0,
  },
  {
    id: "pin-code",
    label: "PIN code",
    length: 6,
    upper: 0,
    lower: 0,
    digits: 6,
    symbols: 0,
    separator: "",
    groupSize: 0,
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
    charset: "alphanumeric",
  },
  {
    id: "alphanumeric",
    label: "Alphanumeric",
    length: 48,
    upper: 0,
    lower: 0,
    digits: 0,
    symbols: 0,
    separator: "",
    groupSize: 0,
    charset: "alphanumeric",
  },
  {
    id: "hex",
    label: "Hex",
    length: 32,
    upper: 0,
    lower: 0,
    digits: 0,
    symbols: 0,
    separator: "",
    groupSize: 0,
    charset: "hex",
  },
  {
    id: "base64url",
    label: "Base64url",
    length: 32,
    upper: 0,
    lower: 0,
    digits: 0,
    symbols: 0,
    separator: "",
    groupSize: 0,
    charset: "base64url",
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
  },
];

function pickRandom(chars: string, n: number): string {
  const arr = new Uint32Array(n);
  crypto.getRandomValues(arr);
  return Array.from(arr, (v) => chars[v % chars.length]).join("");
}

function shuffle(str: string): string {
  const a = str.split("");
  for (let i = a.length - 1; i > 0; i--) {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    const j = arr[0] % (i + 1);
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
    }
  };

  useEffect(() => {
    const preset = PRESETS.find((p) => p.id === presetId);
    const useCharset = preset?.charset != null && preset.id !== "custom";
    const useCustomChars = presetId === "custom" && customChars.length > 0;
    const total =
      presetId === "custom" && !customChars.trim()
        ? 0
        : useCharset || useCustomChars
          ? length
          : upper + lower + digits + symbols;

    if (total <= 0 || count <= 0) {
      setStrings([]);
      return;
    }

    const next: string[] = [];
    for (let i = 0; i < count; i++) {
      let raw: string;
      if (useCharset) {
        const charset =
          preset!.charset === "alphanumeric"
            ? ALPHANUMERIC
            : preset!.charset === "base64url"
              ? BASE64URL
              : CHAR_SETS[preset!.charset as keyof typeof CHAR_SETS];
        raw = pickRandom(charset, length);
      } else if (useCustomChars) {
        raw = pickRandom(customChars, length);
      } else {
        const u = pickRandom(CHAR_SETS.uppercase, upper);
        const l = pickRandom(CHAR_SETS.lowercase, lower);
        const d = pickRandom(CHAR_SETS.digits, digits);
        const s = pickRandom(CHAR_SETS.symbols, symbols);
        raw = shuffle(u + l + d + s);
      }
      const withSep = applySeparator(raw, separator, groupSize);
      next.push(prefix + withSep + suffix);
    }
    setStrings(next);
  }, [
    presetId,
    length,
    count,
    upper,
    lower,
    digits,
    symbols,
    separator,
    groupSize,
    customChars,
    prefix,
    suffix,
    regenerateKey,
  ]);

  const outputText = strings.join("\n");

  const presetConfig = PRESETS.find((p) => p.id === presetId);
  const useCountsMode =
    presetConfig?.charset == null || presetId === "custom";

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
          <SelectWithOptions<PresetId>
            value={presetId}
            onValueChange={handlePresetChange}
            options={PRESETS.map((p) => ({ value: p.id, label: p.label }))}
            variant="secondary"
            triggerClassName="w-full min-w-0 cursor-pointer transition-colors duration-150"
            aria-label="Preset"
          />
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
                value={symbols}
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
          <div className="toolbar-actions-row">
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
          </div>
        ),
        children: (
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
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
