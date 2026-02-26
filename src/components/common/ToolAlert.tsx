import { memo } from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/utils/cn";

export type ToolAlertVariant = "error" | "success";

const toolAlertVariants = cva("tool-alert", {
  variants: { variant: { error: "tool-alert--error", success: "tool-alert--success" } },
  defaultVariants: { variant: "error" },
});

export interface ToolAlertProps {
  variant: ToolAlertVariant;
  message: string;
  className?: string;
  /** Optional prefix (e.g. "⚠ " or "✓ "). When not set, error shows "⚠ ", success shows "✓ ". */
  prefix?: string;
}

const DEFAULT_PREFIX: Record<ToolAlertVariant, string> = {
  error: "⚠ ",
  success: "✓ ",
};

/**
 * Inline alert for validator/tool error or success. Uses design tokens (destructive / status-success).
 * Consistent padding and border from --spacing-panel-inner-*, --radius.
 */
export const ToolAlert = memo(function ToolAlert({ variant, message, className, prefix }: ToolAlertProps) {
  const p = prefix ?? DEFAULT_PREFIX[variant];
  return (
    <div
      role="alert"
      className={cn(toolAlertVariants({ variant }), className)}
    >
      {p}
      {message}
    </div>
  );
});

export default ToolAlert;
