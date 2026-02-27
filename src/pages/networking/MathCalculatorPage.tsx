import { useState, useCallback } from "react";
import { HelpCircle } from "lucide-react";

import { ClearButton } from "@/components/common/ClearButton";
import CodeEditor from "@/components/common/CodeEditor";
import CopyButton from "@/components/common/CopyButton";
import { SampleButton } from "@/components/common/SampleButton";
import TwoPanelToolLayout from "@/components/layout/TwoPanelToolLayout";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const SAMPLE_EXPR = "sqrt(2) * pi + log10(100)";

const FUNCTION_HELP: { name: string; description: string; sample: string }[] = [
  { name: "sin, cos, tan", description: "Trigonometry (radians)", sample: "sin(pi/2)" },
  { name: "abs", description: "Absolute value", sample: "abs(-3)" },
  { name: "sqrt", description: "Square root", sample: "sqrt(2)" },
  { name: "log", description: "Natural log (base e)", sample: "log(e)" },
  { name: "log2, log10", description: "Log base 2, base 10", sample: "log10(100)" },
  { name: "ceil, floor, round", description: "Round up, down, nearest", sample: "floor(3.7)" },
  { name: "min, max", description: "Minimum / maximum of args", sample: "max(1, 2, 3)" },
];

const CONSTANT_HELP: { name: string; description: string }[] = [
  { name: "pi", description: "π ≈ 3.14159" },
  { name: "e", description: "Euler's number ≈ 2.71828" },
  { name: "tau", description: "2π ≈ 6.28318" },
];

// Safe math expression evaluator (no eval)
function evaluate(expr: string): number {
  const tokens = tokenize(expr);
  const result = parseExpression(tokens, { pos: 0 });
  if (tokens.length > 0) throw new Error("Unexpected token");
  return result;
}

function tokenize(expr: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < expr.length) {
    if (/\s/.test(expr[i])) { i++; continue; }
    if (/[\d.]/.test(expr[i])) {
      let num = "";
      while (i < expr.length && /[\d.eE]/.test(expr[i])) { num += expr[i++]; }
      tokens.push(num);
    } else if (/[+\-*/^%()]/.test(expr[i])) {
      tokens.push(expr[i++]);
    } else if (/[a-z]/i.test(expr[i])) {
      let fn = "";
      while (i < expr.length && /[a-z]/i.test(expr[i])) { fn += expr[i++]; }
      tokens.push(fn);
    } else {
      throw new Error(`Unexpected character: ${expr[i]}`);
    }
  }
  return tokens;
}

function parseExpression(tokens: string[], ctx: { pos: number }): number {
  let left = parseTerm(tokens, ctx);
  while (tokens.length > 0 && (tokens[0] === "+" || tokens[0] === "-")) {
    const op = tokens.shift()!;
    const right = parseTerm(tokens, ctx);
    left = op === "+" ? left + right : left - right;
  }
  return left;
}

function parseTerm(tokens: string[], ctx: { pos: number }): number {
  let left = parsePower(tokens, ctx);
  while (tokens.length > 0 && (tokens[0] === "*" || tokens[0] === "/" || tokens[0] === "%")) {
    const op = tokens.shift()!;
    const right = parsePower(tokens, ctx);
    if (op === "*") left *= right;
    else if (op === "/") left /= right;
    else left %= right;
  }
  return left;
}

function parsePower(tokens: string[], ctx: { pos: number }): number {
  let base = parseUnary(tokens, ctx);
  if (tokens.length > 0 && tokens[0] === "^") {
    tokens.shift();
    const exp = parsePower(tokens, ctx);
    base = Math.pow(base, exp);
  }
  return base;
}

function parseUnary(tokens: string[], ctx: { pos: number }): number {
  if (tokens[0] === "-") { tokens.shift(); return -parseAtom(tokens, ctx); }
  if (tokens[0] === "+") { tokens.shift(); }
  return parseAtom(tokens, ctx);
}

const builtins: Record<string, (...args: number[]) => number> = {
  sin: Math.sin, cos: Math.cos, tan: Math.tan, abs: Math.abs,
  sqrt: Math.sqrt, log: Math.log, log2: Math.log2, log10: Math.log10,
  ceil: Math.ceil, floor: Math.floor, round: Math.round,
  min: Math.min, max: Math.max,
};
const constants: Record<string, number> = { pi: Math.PI, e: Math.E, tau: Math.PI * 2 };

function parseAtom(tokens: string[], ctx: { pos: number }): number {
  const token = tokens[0];
  if (!token) throw new Error("Unexpected end");

  if (token in constants) { tokens.shift(); return constants[token]; }

  if (token in builtins) {
    const fnName = token;
    tokens.shift(); // remove fn name
    const open = tokens.shift(); // remove (
    if (open !== "(") throw new Error(`Expected ( after ${fnName}`);
    const args: number[] = [parseExpression(tokens, ctx)];
    while (tokens.length > 0 && tokens[0] === ",") { tokens.shift(); args.push(parseExpression(tokens, ctx)); }
    const close = tokens.shift();
    if (close !== ")") throw new Error("Expected )");
    return builtins[fnName](...args);
  }

  if (token === "(") {
    tokens.shift();
    const val = parseExpression(tokens, ctx);
    if (tokens[0] !== ")") throw new Error("Expected )");
    tokens.shift();
    return val;
  }

  if (/^[\d.]/.test(token)) {
    tokens.shift();
    return parseFloat(token);
  }

  throw new Error(`Unknown: ${token}`);
}

const MathCalculatorPage = () => {
  const [expr, setExpr] = useState("");
  const [history, setHistory] = useState<{ expr: string; result: string }[]>([]);

  const calc = useCallback(() => {
    if (!expr.trim()) return;
    try {
      const result = evaluate(expr);
      setHistory((h) => [{ expr, result: String(result) }, ...h].slice(0, 50));
    } catch (e: unknown) {
      setHistory((h) => [{ expr, result: `Error: ${e instanceof Error ? e.message : String(e)}` }, ...h].slice(0, 50));
    }
  }, [expr]);

  return (
    <TwoPanelToolLayout
      inputPane={{
        title: "Expression",
        toolbar: (
          <div className="toolbar-actions-row">
            <SampleButton onClick={() => setExpr(SAMPLE_EXPR)} />
            <ClearButton onClick={() => setExpr("")} />
            <Button size="xs" onClick={calc} className="shrink-0">
              =
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  className="shrink-0"
                  aria-label="Functions & constants help"
                >
                  <HelpCircle className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[380px] max-h-[70vh] overflow-y-auto p-3" align="start">
                <div className="space-y-3 text-xs">
                  <div>
                    <h4 className="font-medium text-foreground mb-1.5">Functions</h4>
                    <ul className="space-y-1.5">
                      {FUNCTION_HELP.map((f) => (
                        <li key={f.name} className="flex flex-col gap-0.5">
                          <code className="text-primary font-mono">{f.name}</code>
                          <span className="text-muted-foreground">{f.description}</span>
                          <code className="text-[10px] font-mono text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded w-fit">{f.sample}</code>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1.5">Constants</h4>
                    <ul className="space-y-1">
                      {CONSTANT_HELP.map((c) => (
                        <li key={c.name} className="flex items-baseline gap-2">
                          <code className="text-primary font-mono">{c.name}</code>
                          <span className="text-muted-foreground">{c.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1.5">Operators</h4>
                    <p className="text-muted-foreground">
                      <code className="text-primary">+ - * /</code> arithmetic · <code className="text-primary">%</code> modulo · <code className="text-primary">^</code> power
                    </p>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        ),
        children: (
          <div className="flex flex-col gap-3 flex-1 min-h-0">
            <div className="flex gap-2 items-stretch flex-1 min-h-0">
              <div className="flex-1 min-w-0 min-h-[52px]">
                <CodeEditor
                  value={expr}
                  onChange={setExpr}
                  language="plaintext"
                  placeholder="e.g. sqrt(2) * pi + log(100)"
                  fillHeight
                  showLineNumbers={false}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      calc();
                    }
                  }}
                />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground shrink-0">
              Functions: <code className="text-primary">sin cos tan abs sqrt log log2 log10 ceil floor round min max</code> · Constants: <code className="text-primary">pi e tau</code> · Operators: <code className="text-primary">+ - * / % ^</code>
            </p>
          </div>
        ),
      }}
      outputPane={{
        title: "History",
        toolbar: history.length > 0 ? (
          <div className="toolbar-actions-row">
            <ClearButton onClick={() => setHistory([])} />
          </div>
        ) : undefined,
        children: (
          <div className="flex flex-col flex-1 min-h-0 overflow-auto">
            {history.length === 0 ? (
              <p className="tool-caption">Enter an expression and press = or Enter.</p>
            ) : (
              <div className="space-y-1">
                {history.map((h, i) => (
                  <div key={i} className="flex justify-between items-center text-xs font-mono py-1 border-b border-border last:border-0">
                    <span className="text-muted-foreground truncate mr-4">{h.expr}</span>
                    <div className="flex items-center gap-2">
                      <span className={h.result.startsWith("Error") ? "text-destructive" : "text-primary"}>{h.result}</span>
                      {!h.result.startsWith("Error") && <CopyButton text={h.result} />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ),
      }}
    />
  );
};

export default MathCalculatorPage;
