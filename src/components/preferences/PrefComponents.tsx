import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type PrefSectionProps = {
  id?: string;
  heading?: string;
  headingId?: string;
  children: ReactNode;
  className?: string;
};

/** Section block with optional heading (industry: preferences/settings panel section). */
export function PrefSection({ id, heading, headingId, children, className }: PrefSectionProps) {
  return (
    <section
      id={id}
      className={cn("pref-section", className)}
      aria-labelledby={heading ? headingId : undefined}
    >
      {heading && (
        <h2 id={headingId} className="pref-section__heading">
          {heading}
        </h2>
      )}
      <div className="pref-section__content">{children}</div>
    </section>
  );
}

type PrefGroupProps = {
  children: ReactNode;
  className?: string;
};

/** Grouped block of rows with rounded background (macOS-style inset group). */
export function PrefGroup({ children, className }: PrefGroupProps) {
  return <div className={cn("pref-group", className)}>{children}</div>;
}

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

type PrefDescriptionProps = {
  children: ReactNode;
  className?: string;
};

/** Helper or caption text below a row or section (macOS-style secondary text). */
export function PrefDescription({ children, className }: PrefDescriptionProps) {
  return <p className={cn("pref-description", className)}>{children}</p>;
}
