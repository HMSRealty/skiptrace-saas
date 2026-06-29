import { Currency } from "@/data/config";

// Format an amount that is ALREADY in the given currency (no conversion).
// Western numerals are the e-commerce standard for prices in MENA stores.
export function money(amount: number, currency: Currency): string {
  return `${amount.toLocaleString("en-US")} ${currency.symbol}`;
}
