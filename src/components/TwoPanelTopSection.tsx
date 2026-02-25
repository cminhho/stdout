import { memo, type ReactNode } from "react";
import ValidationErrorList from "@/components/ValidationErrorList";
import { cn } from "@/utils/cn";
import type { ParseError } from "@/utils/validationTypes";

export interface TwoPanelTopSectionProps {
  /** When set, show an alert with the message */
  formatError?: Error | null;
  /** Validation/parse errors to list; shown when showValidationErrors and length > 0 */
  validationErrors?: ParseError[];
  showValidationErrors?: boolean;
  /** Optional full-width content (e.g. JSONPath input, filters) */
  topSection?: ReactNode;
  className?: string;
}

/**
 * Optional top block for two-panel tools: format error alert + ValidationErrorList + custom topSection.
 * Renders nothing when all props are empty/hidden.
 */
const TwoPanelTopSection = memo(function TwoPanelTopSection({
  formatError,
  validationErrors = [],
  showValidationErrors = true,
  topSection,
  className,
}: TwoPanelTopSectionProps) {
  const showList = showValidationErrors && (validationErrors?.length ?? 0) > 0;
  const hasContent = formatError || showList || topSection;
  if (!hasContent) return null;

  return (
    <div className={cn("tool-layout-top-section", className)}>
      {formatError ? (
        <div className="tool-layout-format-error" role="alert">
          Format failed: {formatError.message}
        </div>
      ) : null}
      {showList ? (
        <section aria-label="Validation errors">
          <ValidationErrorList errors={validationErrors} />
        </section>
      ) : null}
      {topSection ? (
        <div className="flex flex-col gap-[var(--spacing-block-gap)]">{topSection}</div>
      ) : null}
    </div>
  );
});

export default TwoPanelTopSection;
