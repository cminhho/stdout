import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import ToolPane from "@/components/ToolPane";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import ToolAlert from "@/components/ToolAlert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CopyButton from "@/components/CopyButton";
import { ClearButton } from "@/components/ClearButton";
import { SampleButton } from "@/components/SampleButton";
import { luhnCheck, generateCardNumber, CARD_BRANDS } from "@/utils/creditcard";

const SAMPLE_CARD = "4532015112830366";

const CreditCardPage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState("");
  const [generated, setGenerated] = useState<{ brand: string; number: string } | null>(null);

  const isValid = input.trim() ? luhnCheck(input.trim()) : null;

  const handleSample = () => setInput(SAMPLE_CARD);

  const handleGenerate = (brand: string) => {
    const num = generateCardNumber(brand as "Visa" | "Mastercard" | "Amex" | "Discover");
    setGenerated({ brand, number: num });
  };

  const pane = {
    title: tool?.label ?? "Credit Card Validator",
    copyText: generated?.number,
    toolbar: (
      <>
        <SampleButton onClick={handleSample} />
        <ClearButton onClick={() => setInput("")} />
      </>
    ),
    children: (
      <div className="flex flex-col gap-6 flex-1 min-h-0 overflow-auto">
        <section className="space-y-2" aria-label="Validate">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Validate (Luhn)
          </h2>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Card number (digits only or with spaces/dashes)"
            className="font-mono h-8"
            aria-label="Card number"
          />
          {input.trim() &&
            (isValid !== null &&
              (isValid ? (
                <ToolAlert variant="success" message="Valid (Luhn check passed)" />
              ) : (
                <ToolAlert variant="error" message="Invalid (Luhn check failed)" prefix="✗ " />
              )))}
        </section>

        <section className="space-y-2" aria-label="Generate test numbers">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Generate test numbers
          </h2>
          <p className="text-xs text-muted-foreground">
            For testing only. Do not use for real transactions.
          </p>
          <div className="flex flex-wrap gap-2">
            {CARD_BRANDS.map((brand) => (
              <Button
                key={brand}
                size="xs"
                variant="outline"
                onClick={() => handleGenerate(brand)}
              >
                {brand}
              </Button>
            ))}
          </div>
          {generated && (
            <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2">
              <span className="text-xs text-muted-foreground shrink-0">{generated.brand}:</span>
              <code className="text-sm font-mono flex-1 min-w-0 truncate">{generated.number}</code>
              <CopyButton text={generated.number} />
            </div>
          )}
        </section>
      </div>
    ),
  };

  return (
    <ToolLayout
      title={tool?.label ?? "Credit Card Validator"}
      description={tool?.description ?? "Luhn check and generate test card numbers"}
    >
      <div className="flex flex-col flex-1 min-h-0 w-full tool-content-stack">
        <ToolPane pane={pane} />
      </div>
    </ToolLayout>
  );
};

export default CreditCardPage;
