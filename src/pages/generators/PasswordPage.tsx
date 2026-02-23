import { useState, useCallback } from "react";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import CodeEditor from "@/components/CodeEditor";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClearButton } from "@/components/ClearButton";

const generatePassword = (length: number, opts: { upper: boolean; lower: boolean; digits: boolean; symbols: boolean }): string => {
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
  const tool = useCurrentTool();
  const [passwords, setPasswords] = useState<string[]>([]);
  const [count, setCount] = useState(5);
  const [length, setLength] = useState(16);
  const [opts, setOpts] = useState({ upper: true, lower: true, digits: true, symbols: true });

  const generate = useCallback(() => {
    const batch = Array.from({ length: count }, () => generatePassword(length, opts));
    setPasswords(batch);
  }, [count, length, opts]);

  const passwordText = passwords.join("\n");
  const strength = passwords.length === 1 && passwords[0] ? getStrength(passwords[0]) : null;

  const inputPaneContent = (
    <div className="flex flex-col gap-4 p-3">
      <div className="flex items-center gap-1.5">
        <Label className="text-xs text-muted-foreground shrink-0">Count</Label>
        <Input
          type="number"
          min={1}
          max={50}
          value={count}
          onChange={(e) => setCount(Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
          className="h-7 w-14 font-mono text-xs"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Length</Label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={4}
            max={64}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="flex-1 accent-primary min-w-0 max-w-32"
          />
          <span className="font-mono text-xs w-6 text-right shrink-0">{length}</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        {(["upper", "lower", "digits", "symbols"] as const).map((k) => (
          <label key={k} className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer whitespace-nowrap">
            <input type="checkbox" checked={opts[k]} onChange={(e) => setOpts((o) => ({ ...o, [k]: e.target.checked }))} className="accent-primary rounded border-input" />
            {k === "upper" ? "A-Z" : k === "lower" ? "a-z" : k === "digits" ? "0-9" : "!@#$"}
          </label>
        ))}
      </div>
      <div className="flex gap-2">
        <Button size="xs" onClick={generate}>
          Generate
        </Button>
        {passwordText && <ClearButton onClick={() => setPasswords([])} />}
      </div>
    </div>
  );

  const outputPaneContent = (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <CodeEditor value={passwordText} readOnly language="text" placeholder="Click Generate to create password(s)..." fillHeight showLineNumbers={false} />
      </div>
      {strength && (
        <div className="space-y-1 mt-2 shrink-0 pt-2 border-t border-border">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Strength</span>
            <span className="text-foreground">{strength.label}</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div className={`h-full rounded-full transition-all ${strength.color}`} style={{ width: `${strength.pct}%` }} />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <TwoPanelToolLayout
      tool={tool}
      title={tool?.label ?? "Password Generator"}
      description={tool?.description ?? "Generate secure passwords with custom rules"}
      defaultInputPercent={28}
      inputPane={{
        title: "Options",
        children: inputPaneContent,
      }}
      outputPane={{
        title: passwords.length ? `Password${passwords.length > 1 ? "s" : ""}` : "Password",
        copyText: passwordText || undefined,
        children: outputPaneContent,
      }}
    />
  );
};

export default PasswordPage;
