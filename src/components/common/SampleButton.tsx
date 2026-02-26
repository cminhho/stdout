/** Sample button – loads sample data into the tool (e.g. example JSON). */
import { memo } from "react";
import { Button } from "@/components/ui/button";
import { FileCode } from "lucide-react";

export interface SampleButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
}

export const SampleButton = memo(function SampleButton({
  onClick,
  disabled,
  className,
  variant = "outline",
}: SampleButtonProps) {
  return (
    <Button type="button" size="xs" variant={variant} className={className} onClick={onClick} disabled={disabled}>
      <FileCode className="h-3.5 w-3.5" />
      Sample
    </Button>
  );
});
