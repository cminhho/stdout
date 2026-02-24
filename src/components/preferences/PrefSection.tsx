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
