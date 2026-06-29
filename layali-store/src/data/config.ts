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
  // wa.me requires international format with no "+" / spaces.
  // Egypt example: 20100XXXXXXX · Gulf (KSA) example: 9665XXXXXXXX
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "2010XXXXXXXX",
  email: "care@layali.example",
  instagram: "layali.beauty",
  tiktok: "layali.beauty",
  snapchat: "layali.beauty",
} as const;

export type CurrencyCode = "EGP" | "SAR" | "AED";

export interface Currency {
  code: CurrencyCode;
  label: string; // Arabic label
  symbol: string;
  rate: number; // fallback multiplier vs base SAR price (used only if no explicit price)
  freeShippingThreshold: number; // in this currency
}

// Egypt is the primary market (EGP first / default); Gulf is served via the
// switcher. Product prices are set natively per market (see products.ts) — the
// `rate` here is only a fallback for any product missing an explicit price.
export const currencies: Record<CurrencyCode, Currency> = {
  EGP: { code: "EGP", label: "ج.م", symbol: "ج.م", rate: 12.8, freeShippingThreshold: 1500 },
  SAR: { code: "SAR", label: "ر.س", symbol: "ر.س", rate: 1, freeShippingThreshold: 200 },
  AED: { code: "AED", label: "د.إ", symbol: "د.إ", rate: 0.98, freeShippingThreshold: 200 },
};

export const defaultCurrency: CurrencyCode = "EGP";
