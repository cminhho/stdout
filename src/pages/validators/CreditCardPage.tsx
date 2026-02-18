import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CopyButton from "@/components/CopyButton";
import { Eraser } from "lucide-react";
import { luhnCheck, generateCardNumber, CARD_BRANDS } from "@/utils/creditcard";

const CreditCardPage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState("");
  const [generated, setGenerated] = useState<{ brand: string; number: string } | null>(null);

  const isValid = input.trim() ? luhnCheck(input.trim()) : null;

  const handleGenerate = (brand: string) => {
    const num = generateCardNumber(brand as "Visa" | "Mastercard" | "Amex" | "Discover");
    setGenerated({ brand, number: num });
  };

  return (
    <ToolLayout title={tool?.label ?? "Credit Card Generator & Validator"} description={tool?.description ?? "Luhn check and generate test card numbers"}>
      <div className="space-y-6">
        <div className="tool-card">
          <h2 className="text-sm font-medium mb-2">Validate (Luhn)</h2>
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter card number (digits only or with spaces/dashes)"
              className="font-mono flex-1"
            />
            <Button type="button" size="sm" variant="outline" onClick={() => setInput("")} title="Clear">
              <Eraser className="h-4 w-4" />
            </Button>
          </div>
          {input.trim() && (
            <p className={`mt-2 text-sm ${isValid ? "text-green-600" : "text-destructive"}`}>
              {isValid ? "✓ Valid (Luhn check passed)" : "✗ Invalid (Luhn check failed)"}
            </p>
          )}
        </div>

        <div className="tool-card">
          <h2 className="text-sm font-medium mb-2">Generate test numbers</h2>
          <p className="text-xs text-muted-foreground mb-3">For testing only. Do not use for real transactions.</p>
          <div className="flex flex-wrap gap-2">
            {CARD_BRANDS.map((brand) => (
              <Button key={brand} size="sm" variant="outline" onClick={() => handleGenerate(brand)}>
                {brand}
              </Button>
            ))}
          </div>
          {generated && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{generated.brand}:</span>
              <code className="text-sm font-mono">{generated.number}</code>
              <CopyButton text={generated.number} />
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
};

export default CreditCardPage;
