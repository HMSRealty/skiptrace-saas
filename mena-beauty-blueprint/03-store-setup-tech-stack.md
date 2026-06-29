# MODULE 3 — Store Setup & Tech Stack (Shopify)

---

## 1. Theme & Localization

### Recommended themes (2 high-converting, beauty-suited)

| Theme | Why | Notes |
|---|---|---|
| **Dawn (free, Shopify official)** | Fast, clean, fully RTL-capable, native multi-currency support, mobile-first | Best starting point — zero cost, excellent Core Web Vitals; customize with a page builder app |
| **Impulse** *(or **Prestige**)* by Archetype Themes (paid) | Premium aesthetic built for fashion/beauty, strong promo/upsell blocks, great mega-menu | Prestige = the more luxury look; Impulse = more conversion/promo features. Both RTL-friendly |

> Either pairs well with the page builder in the app stack below. Avoid heavy themes with poor mobile speed — MENA traffic is **>85% mobile**.

### Perfect Arabic RTL Optimization Checklist
- [ ] Set Arabic as a store language (Shopify **Markets / Translate & Adapt**) and enable **RTL direction** site-wide.
- [ ] Confirm theme flips layout: nav, cart, buttons, product galleries all mirror right-to-left.
- [ ] Use an **Arabic web font** that renders cleanly (e.g. *Cairo, Tajawal, Almarai, Noto Naskh Arabic*) — set in theme typography.
- [ ] Numbers & prices: decide Western (123) vs Eastern Arabic (١٢٣) numerals — **Western numerals are standard for e-commerce prices**; keep consistent.
- [ ] Currency symbol placement correct per locale (SAR/AED/EGP).
- [ ] Translate **everything**: menus, buttons ("أضف إلى السلة"), checkout, emails, error messages, 404, search placeholder.
- [ ] Mixed LTR content (English brand names, %, prices) renders without breaking RTL flow — test every product title.
- [ ] Icons/arrows point the correct direction (back/next reversed in RTL).
- [ ] Product images with text: localize or keep text-free.
- [ ] Test full checkout flow in Arabic on a real phone (iOS Safari + Android Chrome).
- [ ] SEO: Arabic meta titles/descriptions + `hreflang` tags for ar-SA, ar-EG, ar-AE.
- [ ] Right-aligned forms, labels, and the WhatsApp widget on the correct (left) side.

---

## 2. Payment Strategy

**Principle: match payment to market behavior.** Egypt is COD-first; Gulf is card/wallet/BNPL-first.

### By market

| Market | Primary methods | Gateways to use |
|---|---|---|
| **Egypt** | **COD (dominant, ~60-70%)** + cards + Fawry/wallets | **Paymob** (cards, wallets, Fawry, installments) + a **COD logistics partner** (Bosta/Mylerz/R2S) for cash collection |
| **KSA / UAE / Gulf** | **Mada (KSA), Apple Pay, Visa/Mastercard, BNPL** | **Tap Payments** or **Checkout.com** + **Tabby / Tamara (BNPL)** + Apple Pay enabled |

### COD handling (critical for Egypt)
- Enable **Cash on Delivery** as a checkout method, but **gate it with WhatsApp/phone confirmation** (see app #1) to cut fake/refused orders.
- Consider a **small partial deposit or shipping fee** on COD to filter non-serious buyers, OR offer a **discount for prepaid** orders to nudge toward card.
- Track **COD refusal rate** as a core KPI; blacklist repeat refusers.

### Gulf premium experience
- **Apple Pay** is huge in UAE/KSA — enable it (massive conversion lift on mobile).
- **Tabby/Tamara (BNPL "pay in 4")** dramatically lifts AOV on premium items (hair stylers, IPL devices, perfume sets) — strongly recommended.
- **Mada** is essential for Saudi card coverage.

**Recommended gateway summary:** Paymob (Egypt) + Tap Payments (Gulf cards/Apple Pay/Mada) + Tabby & Tamara (Gulf BNPL) + COD via logistics partner.

---

## 3. The Exact 5-App Stack

| Need | Recommended app(s) | Why |
|---|---|---|
| **(1) COD confirmation via WhatsApp** | **Releasy COD / TrackiPal / EngageBay-style COD OTP**, or **WhatsApp + COD** apps like *DCC – Cash on Delivery* / *Releasy* | Auto-sends WhatsApp/SMS to confirm COD orders → slashes fake & refused orders. Pair with a WhatsApp automation tool (see Module 7). |
| **(2) Multi-currency (EGP, SAR, AED)** | **Shopify Markets** (native, free) — or **Currency Converter Plus / BEST Currency Converter** | Auto-displays local currency by gelocation; native Markets is free and integrates with Shopify Payments where available. |
| **(3) Upselling / Cross-selling** | **ReConvert** (post-purchase) + **Zipify OCU** or **Bold Upsell** | One-click post-purchase upsells & cart cross-sells → lifts AOV 10-20%, key for margin in COD markets. |
| **(4) Reviews with photo imports** | **Loox** *(photo-first, best for beauty)* or **Judge.me** | Photo/video reviews = the #1 trust driver for Arab women buying beauty online; Loox imports reviews & auto-requests photos. |
| **(5) Page Builder** | **PageFly** or **GemPages** | Build high-converting, RTL-friendly custom product/landing pages (see Module 5 layout) without code. |

**Bonus high-impact apps (optional but recommended):**
- **WhatsApp chat + automation:** *WATI, Gallabox, or SuperLemon* (for the Module 7 automated flows).
- **Order tracking page:** *17TRACK / TrackiPal* (Arabic tracking reduces "where's my order?" tickets).
- **Email/SMS:** *Klaviyo* (or *SMSBump*) for abandoned cart + retention.

> Keep the app list lean at launch — every app adds load time and monthly cost. Start with the core 5 + WhatsApp automation, add the rest once you have revenue.
