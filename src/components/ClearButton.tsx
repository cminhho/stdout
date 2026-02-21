import { Button } from "@/components/ui/button";
import { Eraser } from "lucide-react";

export interface ClearButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
}

export function ClearButton({ onClick, disabled, className, variant = "outline" }: ClearButtonProps) {
  return (
    <Button type="button" size="xs" variant={variant} className={className} onClick={onClick} disabled={disabled}>
      <Eraser className="h-3.5 w-3.5" />
      Clear
    </Button>
  );
}
