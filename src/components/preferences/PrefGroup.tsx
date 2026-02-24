import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type PrefGroupProps = {
  children: ReactNode;
  className?: string;
};

/** Grouped block of rows with rounded background (macOS-style inset group). */
export function PrefGroup({ children, className }: PrefGroupProps) {
  return <div className={cn("pref-group", className)}>{children}</div>;
}
