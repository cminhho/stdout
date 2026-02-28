import * as React from "react";

import { cn } from "@/utils/cn";

type InputSize = "default" | "sm" | "xs";

export interface InputProps extends Omit<React.ComponentProps<"input">, "size"> {
  size?: InputSize;
}

const sizeClasses: Record<InputSize, string> = {
  default: "h-9 px-2.5 py-2 text-sm",
  sm: "h-8 px-2 py-1.5 text-sm",
  xs: "h-7 px-2.5 py-1.5 text-xs",
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, size = "default", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full rounded-md border border-input bg-inputBg text-foreground transition-colors outline-none file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          sizeClasses[size],
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
