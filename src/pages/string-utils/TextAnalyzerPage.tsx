import { useRef, useState, useMemo, useCallback } from "react";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SAMPLE_TEXT = `This is a special emoji 👨‍👩‍👧‍👦.
It is actually made of four different emojis: 👨👩👧👦.
If you split the "abc👨‍👩‍👧‍👦" string on 👨‍👩‍👧‍👦 in most programming languages (like
"abc👨‍👩‍👧‍👦".split('👨‍👩‍👧‍👦') in JavaScript), you get two parts: "abc👨👩👧👦" and
"👨‍👩‍👧‍👦".
Awesome, right?`;

function getLineColumn(text: string, index: number): { line: number; column: number } {
  if (index <= 0) return { line: 1, column: 1 };
  const before = text.slice(0, index);
  const lines = before.split("\n");
  const line = lines.length;
  const column = (lines[lines.length - 1]?.length ?? 0) + 1;
  return { line, column };
}

const TextAnalyzerPage = () => {
  const tool = useCurrentTool();
  const [text, setText] = useState("");
  const [cursor, setCursor] = useState({ start: 0, end: 0 });
  const [wordFilter, setWordFilter] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const updateCursor = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    setCursor({ start: ta.selectionStart, end: ta.selectionEnd });
  }, []);

  const stats = useMemo(() => {
    const characters = text.length;
    const bytes = new TextEncoder().encode(text).length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text ? text.split("\n").length : 0;
    return { characters, bytes, words, lines };
  }, [text]);

  const { line: currentLine, column } = useMemo(
    () => getLineColumn(text, cursor.start),
    [text, cursor.start]
  );

  const selectedChar = useMemo(() => {
    if (cursor.end - cursor.start !== 1) return null;
    const c = text[cursor.start];
    return c ?? null;
  }, [text, cursor.start, cursor.end]);

  const characterInfo = useMemo(() => {
    if (!selectedChar) return { ascii: "-", unicode: "-" };
    const code = selectedChar.codePointAt(0) ?? 0;
    const ascii = code < 128 ? String(code) : "-";
    const unicode = code > 0 ? `U+${code.toString(16).toUpperCase().padStart(4, "0")}` : "-";
    return { ascii, unicode };
  }, [selectedChar]);

  const wordDistribution = useMemo(() => {
    const tokens = text.match(/\b\w+\b/g) ?? [];
    const countByWord: Record<string, number> = {};
    for (const raw of tokens) {
      const key = caseSensitive ? raw : raw.toLowerCase();
      countByWord[key] = (countByWord[key] ?? 0) + 1;
    }
    let entries = Object.entries(countByWord);
    if (wordFilter.trim()) {
      const f = wordFilter.trim();
      const match = caseSensitive ? (w: string) => w.includes(f) : (w: string) => w.toLowerCase().includes(f.toLowerCase());
      entries = entries.filter(([w]) => match(w));
    }
    entries.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    return entries;
  }, [text, caseSensitive, wordFilter]);

  const pasteFromClipboard = useCallback(async () => {
    try {
      const s = await navigator.clipboard.readText();
      setText(s);
    } catch {
      /* ignore */
    }
  }, []);

  const inputPaneBody = (
    <div className="flex-1 min-h-0 flex flex-col p-2">
      <textarea
        ref={textareaRef}
        className="w-full flex-1 min-h-0 rounded-lg border border-border bg-muted/20 px-3 py-2.5 text-sm font-mono leading-relaxed placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:border-transparent resize-none shadow-inner"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onSelect={updateCursor}
        onKeyUp={updateCursor}
        onClick={updateCursor}
        placeholder="Paste or type text to inspect..."
        spellCheck={false}
        aria-label="Input text"
      />
    </div>
  );

  return (
    <TwoPanelToolLayout
      tool={tool}
      inputPane={{
        inputToolbar: {
          onSample: () => setText(SAMPLE_TEXT),
          setInput: setText,
          fileAccept: ".txt,text/plain",
          onFileText: setText,
        },
        inputToolbarExtra: (
          <Button type="button" size="xs" variant="outline" onClick={pasteFromClipboard}>
            Clipboard
          </Button>
        ),
        children: inputPaneBody,
      }}
      outputPane={{
        title: "Analysis",
        children: (
          <div className="flex-1 min-h-0 overflow-auto p-3 space-y-3">
            {/* Count */}
            <section className="rounded-xl border border-border/60 bg-muted/25 px-4 py-3 shadow-sm">
              <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                Count
              </h3>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {[
                  ["Characters", stats.characters],
                  ["Bytes", stats.bytes],
                  ["Words", stats.words],
                  ["Lines", stats.lines],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-baseline gap-3">
                    <dt className="text-muted-foreground truncate">{label}</dt>
                    <dd className="font-mono text-sm tabular-nums text-foreground shrink-0">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {/* Character (at cursor) */}
            <section className="rounded-xl border border-border/60 bg-muted/25 px-4 py-3 shadow-sm">
              <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                Character
              </h3>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div className="flex justify-between items-baseline gap-3">
                  <dt className="text-muted-foreground">ASCII</dt>
                  <dd className="font-mono text-foreground">{characterInfo.ascii}</dd>
                </div>
                <div className="flex justify-between items-baseline gap-3">
                  <dt className="text-muted-foreground">Unicode</dt>
                  <dd className="font-mono text-foreground">{characterInfo.unicode}</dd>
                </div>
              </dl>
            </section>

            {/* Selection / Cursor */}
            <section className="rounded-xl border border-border/60 bg-muted/25 px-4 py-3 shadow-sm">
              <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                Selection
              </h3>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div className="flex justify-between items-baseline gap-3">
                  <dt className="text-muted-foreground">Location</dt>
                  <dd className="font-mono tabular-nums text-foreground">{cursor.start}</dd>
                </div>
                <div className="flex justify-between items-baseline gap-3">
                  <dt className="text-muted-foreground">Current line</dt>
                  <dd className="font-mono tabular-nums text-foreground">{currentLine}</dd>
                </div>
                <div className="flex justify-between items-baseline gap-3">
                  <dt className="text-muted-foreground">Column</dt>
                  <dd className="font-mono tabular-nums text-foreground">{column}</dd>
                </div>
              </dl>
            </section>

            {/* Word distribution */}
            <section className="rounded-xl border border-border/60 bg-muted/25 overflow-hidden shadow-sm flex flex-col min-h-0">
              <div className="px-4 pt-3 pb-2 flex flex-wrap items-center gap-2 border-b border-border/40">
                <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                  Word distribution
                </h3>
                <Input
                  className="h-7 w-28 font-mono text-xs min-w-0 rounded-md border-border/80 bg-background/60"
                  placeholder="Filter"
                  value={wordFilter}
                  onChange={(e) => setWordFilter(e.target.value)}
                  aria-label="Filter words"
                />
                <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={caseSensitive}
                    onChange={(e) => setCaseSensitive(e.target.checked)}
                    className="rounded border-border h-3.5 w-3.5"
                  />
                  Case sensitive
                </label>
              </div>
              <ul className="flex-1 min-h-0 overflow-y-auto py-1 text-sm font-mono max-h-[38vh]">
                {wordDistribution.map(([word, count], i) => (
                  <li
                    key={word}
                    className="flex justify-between items-center gap-3 px-4 py-1.5 hover:bg-muted/30"
                  >
                    <span className="truncate text-foreground">{word}</span>
                    <span className="tabular-nums text-muted-foreground shrink-0">{count}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        ),
      }}
    />
  );
};

export default TextAnalyzerPage;
