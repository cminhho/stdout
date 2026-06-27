import { useEffect, useMemo, useState } from "react";

export interface UseFormatOutputOptions {
  fallbackErrorMsg?: string;
  /** Debounce (ms) before (re)running format after input changes. Default 180. */
  debounceMs?: number;
}

/** Returns a debounced copy of `value`, so expensive work runs after typing settles. */
function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    if (delayMs <= 0) {
      setDebounced(value);
      return;
    }
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

/**
 * Runs a format function (sync or async) when input or indent change.
 * Returns result, loading, and error for use in two-panel formatter layouts.
 */
export function useFormatOutput<T>(
  inputValue: string,
  indent: unknown,
  format: ((input: string, indent: unknown) => T | Promise<T>) | null | undefined,
  options: UseFormatOutputOptions = {}
): { result: T | null; loading: boolean; error: Error | null } {
  const { fallbackErrorMsg = "Format failed", debounceMs = 180 } = options;
  const [asyncResult, setAsyncResult] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Debounce the input so large payloads aren't re-parsed on every keystroke.
  const debouncedInput = useDebouncedValue(inputValue, debounceMs);

  const syncResult = useMemo(() => {
    if (!format) return null;
    const r = format(debouncedInput, indent);
    if (r != null && typeof (r as Promise<T>).then === "function") return null;
    return r as T;
  }, [debouncedInput, indent, format]);

  useEffect(() => {
    if (!format) {
      setAsyncResult(null);
      setLoading(false);
      setError(null);
      return;
    }
    const r = format(debouncedInput, indent);
    if (r == null) return;
    if (typeof (r as Promise<T>).then === "function") {
      setLoading(true);
      setError(null);
      let cancelled = false;
      (r as Promise<T>)
        .then(
          (res) => {
            if (!cancelled) {
              setAsyncResult(res);
              setLoading(false);
              setError(null);
            }
          },
          (err: unknown) => {
            if (!cancelled) {
              setLoading(false);
              setError(err instanceof Error ? err : new Error(fallbackErrorMsg));
            }
          }
        );
      return () => {
        cancelled = true;
      };
    }
    setAsyncResult(null);
    setLoading(false);
    setError(null);
  }, [debouncedInput, indent, format, fallbackErrorMsg]);

  const result = syncResult ?? asyncResult;
  return { result, loading, error };
}
