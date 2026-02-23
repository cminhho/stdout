import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import ToolAlert from "@/components/ToolAlert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CopyButton from "@/components/CopyButton";
import { ClearButton } from "@/components/ClearButton";
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
          <h2 className="tool-section-heading">Validate (Luhn)</h2>
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter card number (digits only or with spaces/dashes)"
              className="font-mono flex-1"
            />
            <ClearButton onClick={() => setInput("")} />
          </div>
          {input.trim() &&
            (isValid ? (
              <ToolAlert variant="success" message="Valid (Luhn check passed)" className="mt-2" />
            ) : (
              <ToolAlert variant="error" message="Invalid (Luhn check failed)" prefix="✗ " className="mt-2" />
            ))}
        </div>

        <div className="tool-card">
          <h2 className="tool-section-heading">Generate test numbers</h2>
          <p className="text-xs text-muted-foreground mb-3">For testing only. Do not use for real transactions.</p>
          <div className="flex flex-wrap gap-2">
            {CARD_BRANDS.map((brand) => (
              <Button key={brand} size="xs" variant="outline" onClick={() => handleGenerate(brand)}>
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
