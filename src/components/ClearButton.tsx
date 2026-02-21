import { Button } from "@/components/ui/button";
import { Eraser } from "lucide-react";

export interface ClearButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export function ClearButton({ onClick, disabled, className }: ClearButtonProps) {
  return (
    <Button type="button" size="sm" variant="toolbar" className={className} onClick={onClick} disabled={disabled}>
      <Eraser className="h-3.5 w-3.5 mr-1.5" />
      Clear
    </Button>
  );
}
