import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils/cn";

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const selectTriggerVariants = cva(
  "flex w-full items-center justify-between gap-2 rounded-md border ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 transition-colors duration-150 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border-outlineButton-border bg-outlineButton-bg text-outlineButton-foreground hover:bg-muted hover:text-foreground focus:bg-outlineButton-bg",
        secondary: "border-border bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:bg-secondary",
      },
      size: {
        default: "h-9 w-full min-w-0 px-2.5 py-2 text-sm [&_svg]:h-3.5 [&_svg]:w-3.5",
        sm: "h-8 w-auto min-w-[5.25rem] px-2 py-1.5 text-sm [&_svg]:h-3.5 [&_svg]:w-3.5",
        xs: "h-7 w-auto min-w-[4.75rem] px-2 py-1 text-xs [&_svg]:h-3 [&_svg]:w-3",
        lg: "h-10 w-full px-3 py-2 text-sm [&_svg]:h-3.5 [&_svg]:w-3.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface SelectTriggerProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>,
    VariantProps<typeof selectTriggerVariants> {}

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  SelectTriggerProps
>(({ className, size = "default", variant = "default", children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(selectTriggerVariants({ size, variant }), className)}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-0.5 text-muted-foreground", className)}
    {...props}
  >
    <ChevronUp className="h-3.5 w-3.5" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-0.5 text-muted-foreground", className)}
    {...props}
  >
    <ChevronDown className="h-3.5 w-3.5" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-80 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-[0_4px_16px_rgba(0,0,0,0.2)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className,
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
        "p-1.5",
        position === "popper" &&
          "min-h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]",
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label ref={ref} className={cn("py-1 pl-7 pr-2 text-xs font-medium uppercase tracking-wider text-muted-foreground", className)} {...props} />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-md py-1.5 pl-7 pr-2 text-sm text-popover-foreground outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-listFocus focus:text-foreground transition-colors duration-150",
      className,
    )}
    {...props}
  >
    <span className="absolute left-1.5 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-3.5 w-3.5" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator ref={ref} className={cn("-mx-1.5 my-1 h-px bg-border", className)} {...props} />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

/**
 * Option shape for select dropdowns (value + label).
 * Aligns with common patterns (Radix, MUI, Ant Design).
 */
export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
}

/** Build a single option; label defaults to value. */
export function option<T extends string>(value: T, label?: string): SelectOption<T> {
  return { value, label: label ?? value };
}

function normalizeOptions<T extends string>(raw: Array<SelectOption<T> | T>): SelectOption<T>[] {
  return raw.map((item) =>
    typeof item === "string" ? { value: item, label: item } : item
  );
}

export interface SelectWithOptionsProps<T extends string = string> {
  /** Current value (must match an option value). */
  value: T;
  /** Called when user picks an option. */
  onValueChange: (value: T) => void;
  /** Option list: full objects or plain strings (label = value). */
  options: ReadonlyArray<SelectOption<T> | T>;
  placeholder?: string;
  size?: "default" | "sm" | "xs" | "lg";
  variant?: "default" | "secondary";
  disabled?: boolean;
  /** Tooltip and fallback for aria-label. */
  title?: string;
  "aria-label"?: string;
  className?: string;
  triggerClassName?: string;
}

/**
 * Select dropdown from a list of options. Use for simple value picking;
 * for custom content use Select + SelectTrigger + SelectContent.
 *
 * @example
 * // Full options
 * <SelectWithOptions value={dialect} onValueChange={setDialect} options={DIALECT_OPTIONS} />
 * // String shorthand (label = value)
 * <SelectWithOptions value={unit} onValueChange={setUnit} options={["px", "rem", "em"]} />
 */
function SelectWithOptions<T extends string = string>({
  value,
  onValueChange,
  options,
  placeholder = "Select…",
  size = "default",
  variant = "default",
  disabled = false,
  title,
  "aria-label": ariaLabel,
  className,
  triggerClassName,
}: SelectWithOptionsProps<T>) {
  const items = normalizeOptions(Array.from(options));
  const a11yLabel = ariaLabel ?? title ?? placeholder;

  return (
    <Select value={value} onValueChange={(v) => onValueChange(v as T)}>
      <SelectTrigger
        size={size}
        variant={variant}
        disabled={disabled}
        className={triggerClassName}
        title={title}
        aria-label={a11yLabel}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={className}>
        {items.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
  SelectWithOptions,
};
