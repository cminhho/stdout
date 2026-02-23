import { useEffect, useMemo, useState } from "react";

const DEFAULT_ERROR_MSG = "Format failed";

export interface UseFormatOutputOptions {
  fallbackErrorMsg?: string;
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
  const { fallbackErrorMsg = DEFAULT_ERROR_MSG } = options;
  const [asyncResult, setAsyncResult] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const syncResult = useMemo(() => {
    if (!format) return null;
    const r = format(inputValue, indent);
    if (r != null && typeof (r as Promise<T>).then === "function") return null;
    return r as T;
  }, [inputValue, indent, format]);

  useEffect(() => {
    if (!format) {
      setAsyncResult(null);
      setLoading(false);
      setError(null);
      return;
    }
    const r = format(inputValue, indent);
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
  }, [inputValue, indent, format, fallbackErrorMsg]);

  const result = syncResult ?? asyncResult;
  return { result, loading, error };
}
