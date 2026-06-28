// ---------------------------------------------------------------------------
// Brand & store configuration.
// Edit these values to make the store yours. The WhatsApp number is where all
// COD / WhatsApp orders are sent — set NEXT_PUBLIC_WHATSAPP_NUMBER in your
// environment (digits only, with country code, no "+" or spaces) before launch.
// ---------------------------------------------------------------------------

export const brand = {
  name: "ليالي",
  nameLatin: "Layali",
  slogan: "جمالكِ يبدأ من هنا",
  // wa.me requires international format with no "+" / spaces, e.g. 9665XXXXXXXX
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "9665XXXXXXXX",
  email: "care@layali.example",
  instagram: "layali.beauty",
  tiktok: "layali.beauty",
  snapchat: "layali.beauty",
} as const;

export type CurrencyCode = "SAR" | "AED" | "EGP";

export interface Currency {
  code: CurrencyCode;
  label: string; // Arabic label
  symbol: string;
  rate: number; // multiplier relative to base price (SAR)
  freeShippingThreshold: number; // in this currency
}

// Base prices in products are expressed in SAR. Other currencies are derived
// via these (approximate) rates — update to live rates as needed.
export const currencies: Record<CurrencyCode, Currency> = {
  SAR: { code: "SAR", label: "ر.س", symbol: "ر.س", rate: 1, freeShippingThreshold: 200 },
  AED: { code: "AED", label: "د.إ", symbol: "د.إ", rate: 0.98, freeShippingThreshold: 200 },
  EGP: { code: "EGP", label: "ج.م", symbol: "ج.م", rate: 12.8, freeShippingThreshold: 2500 },
};

export const defaultCurrency: CurrencyCode = "SAR";
