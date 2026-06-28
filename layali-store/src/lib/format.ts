import { Currency } from "@/data/config";

// Convert a base (SAR) price into the active currency and format it for display.
export function formatPrice(basePrice: number, currency: Currency): string {
  const value = Math.round(basePrice * currency.rate);
  // Western numerals are the e-commerce standard for prices in MENA stores.
  const formatted = value.toLocaleString("en-US");
  return `${formatted} ${currency.symbol}`;
}

export function convert(basePrice: number, currency: Currency): number {
  return Math.round(basePrice * currency.rate);
}
