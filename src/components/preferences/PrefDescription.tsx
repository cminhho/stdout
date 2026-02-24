import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type PrefDescriptionProps = {
  children: ReactNode;
  className?: string;
};

/** Helper or caption text below a row or section (macOS-style secondary text). */
export function PrefDescription({ children, className }: PrefDescriptionProps) {
  return <p className={cn("pref-description", className)}>{children}</p>;
}
