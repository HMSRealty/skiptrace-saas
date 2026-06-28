# Layali (ليالي) — MENA Beauty Storefront

A complete, customer-ready **Next.js storefront** for a premium beauty/cosmetics brand targeting women in **Egypt & the Arab Gulf**. Built from the strategy in [`../mena-beauty-blueprint`](../mena-beauty-blueprint).

Fully **RTL Arabic**, mobile-first, with a working **cart** and **COD + WhatsApp checkout** — the order model most MENA dropshippers actually use, so the store is usable by real customers without any payment gateway on day one.

## Features

- 🏠 Home with hero, collections, best-sellers, reviews
- 🗂️ 5 collections × 4 products (20 SKUs) with full Arabic, benefit-driven copy
- 📄 Conversion-optimized product pages (gallery, AIDA copy, benefits, how-to-use, reviews, FAQ, guarantee, related)
- 🛒 Cart with quantity controls, free-shipping progress, localStorage persistence
- 💳 Checkout: delivery form + **Cash on Delivery** / card option → order sent to your WhatsApp
- 💱 Multi-currency switcher (SAR / AED / EGP)
- 💬 Floating WhatsApp button, "order via WhatsApp" on every product
- 📱 Responsive, RTL, Arabic fonts (Cairo / Tajawal)
- ℹ️ FAQ, About, Policies (return/refund for opened cosmetics) pages

## Tech stack

Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS 3. No database required — product data lives in `src/data/`.

## Getting started

```bash
cd layali-store
npm install
cp .env.example .env.local   # set your WhatsApp number
npm run dev                  # http://localhost:3000
```

Build for production:

```bash
npm run build && npm start
```

## Make it yours (launch checklist)

1. **WhatsApp number** — set `NEXT_PUBLIC_WHATSAPP_NUMBER` in `.env.local` (digits only, with country code).
2. **Brand & socials** — edit `src/data/config.ts` (name, slogan, email, Instagram/TikTok/Snapchat).
3. **Currencies & rates** — update rates / free-shipping thresholds in `src/data/config.ts`.
4. **Products** — edit `src/data/products.ts` (prices are base SAR; other currencies derive from rates). Swap the Unsplash image URLs for your real product photos (or drop files in `public/` and reference `/your-image.jpg`).
5. **Reviews** — replace samples in `src/data/reviews.ts` with real ones.
6. **Deploy** — works on Vercel / Netlify / any Node host. This app is self-contained and independent of the repo root.

## Project structure

```
src/
  app/            # routes: home, collections, products, cart, checkout, faq, about, policies
  components/     # Header, Footer, ProductCard, AddToCart, cart provider, etc.
  data/           # config, collections, products, reviews  ← edit these
  lib/            # currency formatting helpers
```

## Notes

- Prices are **base SAR**; AED/EGP are derived via approximate rates in `config.ts` — update to live rates.
- Product images use Unsplash placeholders for demonstration. Replace with licensed product photography before launch.
- For real card payments later, integrate Tap/Tabby/Tamara (Gulf) and Paymob (Egypt) per the blueprint — the WhatsApp/COD flow works in the meantime.
