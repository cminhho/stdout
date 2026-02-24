import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type PrefRowProps = {
  label: ReactNode;
  control: ReactNode;
  className?: string;
};

/** Single preference row: label left, control right (industry standard layout). */
export function PrefRow({ label, control, className }: PrefRowProps) {
  return (
    <div className={cn("pref-row", className)}>
      <span className="pref-label">{label}</span>
      <div className="pref-control">{control}</div>
    </div>
  );
}
