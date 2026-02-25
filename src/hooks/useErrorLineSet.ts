import { useMemo } from "react";

import type { ParseError } from "@/utils/validationTypes";

/** Set of line numbers that have validation errors, for CodeEditor errorLines. */
export function useErrorLineSet(errors: ParseError[]): Set<number> {
  return useMemo(() => new Set(errors.map((e) => e.line)), [errors]);
}
