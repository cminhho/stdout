/**
 * Luhn check and test card number generation.
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
