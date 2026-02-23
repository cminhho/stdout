/**
 * Luhn check, brand detection, formatting, and test card number generation.
 * Industry practice: validate with Luhn, detect brand from IIN/BIN, format for display.
 */

export function luhnCheck(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

/** Normalize to digits only. */
export function toDigits(cardNumber: string): string {
  return cardNumber.replace(/\D/g, "");
}

/** Detect card brand from IIN (first 1–6 digits). Returns brand name or null. */
export function detectBrand(cardNumber: string): string | null {
  const d = toDigits(cardNumber);
  if (d.length < 4) return null;
  const p2 = d.slice(0, 2);
  const p4 = d.slice(0, 4);
  const p6 = d.slice(0, 6);
  const n2 = parseInt(p2, 10);
  const n4 = parseInt(p4, 10);
  const n6 = parseInt(p6, 10);
  if (d[0] === "4") return "Visa";
  if (n2 >= 51 && n2 <= 55) return "Mastercard";
  if (n6 >= 222100 && n6 <= 272099) return "Mastercard";
  if (p2 === "34" || p2 === "37") return "Amex";
  if (p4 === "6011" || p2 === "65") return "Discover";
  if (n4 >= 644 && n4 <= 649) return "Discover";
  return null;
}

/** Format digits as display string: 4-4-4-4 (Visa/MC/Discover) or 4-6-5 (Amex). */
export function formatCardNumber(digits: string): string {
  const d = digits.replace(/\D/g, "");
  const brand = detectBrand(d);
  if (brand === "Amex" && d.length >= 4) {
    return [d.slice(0, 4), d.slice(4, 10), d.slice(10, 15)].filter(Boolean).join(" ");
  }
  const parts: string[] = [];
  for (let i = 0; i < d.length; i += 4) parts.push(d.slice(i, i + 4));
  return parts.join(" ");
}

/** Mask to last 4 digits for safe display (e.g. **** **** 1234). */
export function maskLastFour(cardNumber: string): string {
  const d = toDigits(cardNumber);
  if (d.length < 4) return "*".repeat(d.length);
  const last4 = d.slice(-4);
  const brand = detectBrand(d);
  if (brand === "Amex") return "**** ***** " + last4;
  return "**** **** **** " + last4;
}

const PREFIXES: Record<string, { prefix: number[]; length: number[] }> = {
  Visa: { prefix: [4], length: [13, 16, 19] },
  Mastercard: { prefix: [51, 52, 53, 54, 55], length: [16] },
  Amex: { prefix: [34, 37], length: [15] },
  Discover: { prefix: [6011, 65], length: [16] },
};

function randomDigits(len: number): string {
  let s = "";
  for (let i = 0; i < len; i++) s += Math.floor(Math.random() * 10);
  return s;
}

function luhnChecksum(digitsWithoutCheck: string): number {
  let sum = 0;
  let alt = true;
  for (let i = digitsWithoutCheck.length - 1; i >= 0; i--) {
    let n = parseInt(digitsWithoutCheck[i], 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return (10 - (sum % 10)) % 10;
}

export function generateCardNumber(brand: keyof typeof PREFIXES): string {
  const config = PREFIXES[brand];
  if (!config) return "";
  const len = config.length[Math.floor(Math.random() * config.length.length)];
  const prefix = String(config.prefix[Math.floor(Math.random() * config.prefix.length)]);
  const restLen = len - prefix.length - 1;
  const rest = randomDigits(restLen);
  const withoutCheck = prefix + rest;
  const check = luhnChecksum(withoutCheck);
  return withoutCheck + check;
}

export const CARD_BRANDS = Object.keys(PREFIXES) as (keyof typeof PREFIXES)[];
