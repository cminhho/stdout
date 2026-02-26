import { useState } from "react";
import { RefreshCw } from "lucide-react";

import ToolLayout from "@/components/layout/ToolLayout";
import ToolPane from "@/components/layout/ToolPane";
import ToolAlert from "@/components/common/ToolAlert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CopyButton from "@/components/common/CopyButton";
import { ClearButton } from "@/components/common/ClearButton";
import { SampleButton } from "@/components/common/SampleButton";
import { luhnCheck, generateCardNumber, CARD_BRANDS } from "@/utils/creditcard";

const SAMPLE_CARD = "4532015112830366";

const CreditCardPage = () => {
  const [input, setInput] = useState("");
  const [generated, setGenerated] = useState<{ brand: string; numbers: string[] } | null>(null);

  const isValid = input.trim() ? luhnCheck(input.trim()) : null;

  const handleSample = () => setInput(SAMPLE_CARD);

  const handleGenerate = (brand: string) => {
    const count = 5;
    const numbers = Array.from({ length: count }, () =>
      generateCardNumber(brand as "Visa" | "Mastercard" | "Amex" | "Discover")
    );
    setGenerated({ brand, numbers });
  };

  const pane = {
    title: "Credit Card Validator",
    copyText: generated ? generated.numbers.join("\n") : undefined,
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
                <ToolAlert variant="error" message="Invalid (Luhn check failed)" />
              )))}
        </section>

        <section
          className="space-y-3 rounded-xl border border-border/60 bg-muted/25 px-4 py-3 shadow-sm"
          aria-label="Generate test numbers"
        >
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Generate test numbers
          </h2>
          <p className="tool-caption leading-relaxed">
            For testing only. Do not use for real transactions.
          </p>
          <div className="flex flex-wrap gap-2">
            {CARD_BRANDS.map((brand) => (
              <Button
                key={brand}
                size="xs"
                variant="outline"
                onClick={() => handleGenerate(brand)}
                className="gap-1.5 min-h-touch"
                aria-label={`Generate ${brand} test numbers`}
              >
                <RefreshCw className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {brand}
              </Button>
            ))}
          </div>
          {generated && (
            <div className="rounded-lg border border-border bg-background/80 overflow-hidden shadow-sm">
              <div className="px-3 py-2 border-b border-border/60">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {generated.brand}
                </span>
              </div>
              <ul
                className="divide-y divide-border/60"
                aria-label={`${generated.brand} test numbers`}
              >
                {generated.numbers.map((number, i) => (
                  <li
                    key={`${number}-${i}`}
                    className="flex items-center gap-2 px-3 py-2 min-h-touch"
                  >
                    <code className="text-sm font-mono flex-1 min-w-0 truncate">
                      {number}
                    </code>
                    <CopyButton text={number} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    ),
  };

  return (
    <ToolLayout>
      <div className="flex flex-col flex-1 min-h-0 w-full tool-content-stack max-w-3xl mx-auto">
        <ToolPane pane={pane} />
      </div>
    </ToolLayout>
  );
};

export default CreditCardPage;
