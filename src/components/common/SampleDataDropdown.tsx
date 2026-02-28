/** Sample data dropdown – loads one of several sample presets (e.g. valid/invalid JSON, regex patterns). */
import { memo, useState } from "react";
import { FileCode } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/utils/cn";

export interface SampleDataItem {
  id: string;
  label: string;
  value: string;
}

export interface SampleDataDropdownProps {
  items: SampleDataItem[];
  onSelect: (value: string) => void;
  triggerLabel?: string;
  className?: string;
}

const SampleDataDropdown = memo(function SampleDataDropdown({
  items,
  onSelect,
  triggerLabel = "Sample",
  className,
}: SampleDataDropdownProps) {
  const [value, setValue] = useState("");

  const handleValueChange = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (item) {
      onSelect(item.value);
      setValue("");
    }
  };

  return (
    <Select value={value || undefined} onValueChange={handleValueChange}>
      <SelectTrigger
        size="xs"
        variant="default"
        className={cn("w-auto min-w-0", className)}
        aria-label="Load sample data"
        title="Load sample data"
      >
        <FileCode className="h-3.5 w-3.5 shrink-0" />
        <SelectValue placeholder={triggerLabel} />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.id} value={item.id}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
});

export default SampleDataDropdown;
