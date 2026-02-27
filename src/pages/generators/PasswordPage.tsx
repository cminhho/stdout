import { useState, useEffect, type ReactNode } from "react";
import { RefreshCw } from "lucide-react";

import { ClearButton } from "@/components/common/ClearButton";
import CodeEditor from "@/components/common/CodeEditor";
import TwoPanelToolLayout from "@/components/layout/TwoPanelToolLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectWithOptions } from "@/components/ui/select";

type PresetId = "strong" | "long" | "pin" | "custom";

interface PresetConfig {
  id: PresetId;
  label: string;
  length: number;
  upper: boolean;
  lower: boolean;
  digits: boolean;
  symbols: boolean;
}

const PRESETS: PresetConfig[] = [
  { id: "strong", label: "Strong (16)", length: 16, upper: true, lower: true, digits: true, symbols: true },
  { id: "long", label: "Long (32)", length: 32, upper: true, lower: true, digits: true, symbols: true },
  { id: "pin", label: "PIN (6 digits)", length: 6, upper: false, lower: false, digits: true, symbols: false },
  { id: "custom", label: "Custom", length: 16, upper: true, lower: true, digits: true, symbols: true },
];

const generatePassword = (
  length: number,
  opts: { upper: boolean; lower: boolean; digits: boolean; symbols: boolean }
): string => {
  let chars = "";
  if (opts.upper) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (opts.lower) chars += "abcdefghijklmnopqrstuvwxyz";
  if (opts.digits) chars += "0123456789";
  if (opts.symbols) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";
  if (!chars) chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr, (v) => chars[v % chars.length]).join("");
};

const getStrength = (pw: string) => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { label: "Weak", color: "bg-destructive", pct: 20 };
  if (score <= 2) return { label: "Fair", color: "bg-orange-500", pct: 40 };
  if (score <= 3) return { label: "Good", color: "bg-yellow-500", pct: 60 };
  if (score <= 4) return { label: "Strong", color: "bg-primary", pct: 80 };
  return { label: "Very Strong", color: "bg-primary", pct: 100 };
};

const PasswordPage = () => {
  const [presetId, setPresetId] = useState<PresetId>("strong");
  const [passwords, setPasswords] = useState<string[]>([]);
  const [count, setCount] = useState(5);
  const [length, setLength] = useState(16);
  const [opts, setOpts] = useState({ upper: true, lower: true, digits: true, symbols: true });
  const [regenerateKey, setRegenerateKey] = useState(0);

  const handlePresetChange = (id: PresetId) => {
    setPresetId(id);
    const config = PRESETS.find((p) => p.id === id);
    if (config) {
      setLength(config.length);
      setOpts({ upper: config.upper, lower: config.lower, digits: config.digits, symbols: config.symbols });
    }
  };

  useEffect(() => {
    if (count <= 0) {
      setPasswords([]);
      return;
    }
    const batch = Array.from({ length: count }, () => generatePassword(length, opts));
    setPasswords(batch);
  }, [presetId, count, length, opts.upper, opts.lower, opts.digits, opts.symbols, regenerateKey]);

  const passwordText = passwords.join("\n");
  const strength = passwords.length === 1 && passwords[0] ? getStrength(passwords[0]) : null;

  const field = (label: string, child: ReactNode) => (
    <div className="flex flex-col min-w-0">
      <Label className="tool-field-label block">{label}</Label>
      {child}
    </div>
  );

  const inputPaneContent = (
    <div className="flex flex-col gap-[var(--spacing-section-mb)] overflow-auto">
      <section className="flex flex-col gap-[var(--spacing-block-gap)]" aria-label="Preset">
        {field(
          "Preset",
          <SelectWithOptions<PresetId>
            value={presetId}
            onValueChange={handlePresetChange}
            options={PRESETS.map((p) => ({ value: p.id, label: p.label }))}
            variant="secondary"
            triggerClassName="w-full min-w-0"
            aria-label="Preset"
          />
        )}
      </section>

      <section className="flex flex-col gap-[var(--spacing-block-gap)]" aria-label="Length">
        {field(
          "Length",
          <Input
            type="number"
            min={4}
            max={64}
            value={length}
            onChange={(e) =>
              setLength(Math.max(4, Math.min(64, Number(e.target.value) || 4)))
            }
            className="input-compact"
            aria-label="Password length"
          />
        )}
      </section>

      <section className="flex flex-col gap-[var(--spacing-block-gap)]" aria-label="Character types">
        <Label className="tool-field-label block">Include</Label>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {(["upper", "lower", "digits", "symbols"] as const).map((k) => (
            <label
              key={k}
              className="flex items-center gap-[var(--home-space-xs)] text-[length:var(--text-caption)] text-muted-foreground cursor-pointer whitespace-nowrap"
            >
              <Checkbox
                checked={opts[k]}
                onCheckedChange={(checked) =>
                  setOpts((o) => ({ ...o, [k]: Boolean(checked) }))
                }
                aria-label={k === "upper" ? "Uppercase" : k === "lower" ? "Lowercase" : k === "digits" ? "Digits" : "Symbols"}
              />
              {k === "upper" ? "A–Z" : k === "lower" ? "a–z" : k === "digits" ? "0–9" : "!@#$"}
            </label>
          ))}
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
          passwords.length > 0
            ? `${passwords.length} password${passwords.length > 1 ? "s" : ""}`
            : "Output",
        copyText: passwordText || undefined,
        toolbar: (
          <div className="toolbar-actions-row">
            <Button
              type="button"
              size="xs"
              variant="default"
              onClick={() => setRegenerateKey((k) => k + 1)}
              title="Regenerate with current options"
              aria-label="Regenerate"
            >
              <RefreshCw className="h-3 w-3" aria-hidden />
              Generate
            </Button>
            <div className="flex items-center gap-[var(--home-space-xs)]">
              <Label className="text-[length:var(--text-caption)] font-medium text-muted-foreground shrink-0">
                Count
              </Label>
              <Input
                type="number"
                min={1}
                max={50}
                value={count}
                onChange={(e) =>
                  setCount(Math.max(1, Math.min(50, Number(e.target.value) || 1)))
                }
                className="input-compact w-14"
                aria-label="Number of passwords"
              />
            </div>
            <ClearButton onClick={() => setPasswords([])} />
          </div>
        ),
        children: (
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <CodeEditor
                value={passwordText}
                readOnly
                language="randomstring"
                placeholder="Passwords update automatically..."
                fillHeight
                showLineNumbers={false}
              />
            </div>
            {strength && (
              <div
                className="shrink-0 pt-2 mt-2 border-t border-border space-y-1"
                aria-live="polite"
              >
                <div className="flex justify-between text-[length:var(--text-caption)]">
                  <span className="text-muted-foreground">Strength</span>
                  <span className="text-foreground font-medium">{strength.label}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${strength.color}`}
                    style={{ width: `${strength.pct}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ),
      }}
    />
  );
};

export default PasswordPage;
