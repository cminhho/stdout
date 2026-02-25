import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/utils/cn";

/** Use for tool input with complex/multiple options: icon-only trigger opens popover (see .cursor/rules/options-button-complex-input.mdc). */

export interface OptionsButtonProps {
  /** Accessible name for the trigger (e.g. "CSV to XML options"). */
  ariaLabel: string;
  /** Icon node; defaults to SlidersHorizontal. */
  icon?: React.ReactNode;
  /** Popover content. */
  children: React.ReactNode;
  /** Class for the popover content panel. */
  contentClassName?: string;
  /** Popover align: "start" | "center" | "end". Default "end". */
  align?: "start" | "center" | "end";
  /** Trigger button variant; default "outline" to match toolbar. */
  variant?: React.ComponentProps<typeof Button>["variant"];
  className?: string;
}

export function OptionsButton({
  ariaLabel,
  icon,
  children,
  contentClassName,
  align = "end",
  variant = "outline",
  className,
}: OptionsButtonProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" size="xs" variant={variant} className={className} aria-label={ariaLabel}>
          {icon ?? <SlidersHorizontal className="h-3.5 w-3.5" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent align={align} className={cn("w-56 p-3", contentClassName)}>
        {children}
      </PopoverContent>
    </Popover>
  );
}

export default OptionsButton;
