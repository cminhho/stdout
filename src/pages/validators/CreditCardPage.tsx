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
      <div className="toolbar-actions-row">
        <SampleButton onClick={handleSample} />
        <ClearButton onClick={() => setInput("")} />
      </div>
    ),
    children: (
      <div className="flex flex-col gap-[var(--home-content-gap)] flex-1 min-h-0 overflow-auto">
        <section className="tool-section-card shrink-0 space-y-3" aria-label="Validate">
          <h2 className="home-section-label mb-0">
            Validate (Luhn)
          </h2>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Card number (digits only or with spaces/dashes)"
            className="font-mono h-9 rounded-[var(--radius-button)] transition-colors duration-150"
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
          className="tool-section-card shrink-0 space-y-3"
          aria-label="Generate test numbers"
        >
          <h2 className="home-section-label mb-0">
            Generate test numbers
          </h2>
          <p className="tool-caption leading-relaxed">
            For testing only. Do not use for real transactions.
          </p>
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Card brand generators">
            {CARD_BRANDS.map((brand) => (
              <Button
                key={brand}
                size="xs"
                variant="outline"
                onClick={() => handleGenerate(brand)}
                className="gap-1.5 min-h-touch sm:min-h-0 cursor-pointer transition-colors duration-150"
                aria-label={`Generate ${brand} test numbers`}
              >
                <RefreshCw className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {brand}
              </Button>
            ))}
          </div>
          {generated && (
            <div className="rounded-[var(--home-radius-card)] border border-border bg-background/80 dark:bg-input/50 overflow-hidden transition-colors duration-150">
              <div className="px-3 py-2.5 border-b border-border min-h-touch flex items-center">
                <span className="home-section-label mb-0">
                  {generated.brand}
                </span>
              </div>
              <ul
                className="divide-y divide-border"
                aria-label={`${generated.brand} test numbers`}
              >
                {generated.numbers.map((number, i) => (
                  <li
                    key={`${number}-${i}`}
                    className="flex items-center gap-2 px-3 py-2.5 min-h-touch"
                  >
                    <code className="text-[length:var(--text-ui)] font-mono flex-1 min-w-0 truncate text-foreground">
                      {number}
                    </code>
                    <CopyButton text={number} className="shrink-0" />
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
