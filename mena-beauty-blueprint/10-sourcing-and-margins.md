# MODULE 10 — Where to Source & Resell at a Profit

> The concrete answer to "where do I buy these products cheap and resell higher?" — best suppliers ranked for a MENA/Egypt beauty store, plus a **per-product sourcing + margin sheet** for all 20 SKUs.
>
> ⚠️ Costs are **planning estimates** (AliExpress/CJ typical landed cost) — verify live before ordering. FX anchor: ~48 EGP ≈ 1 USD.

---

## 1. Best sources (ranked for this business)

| # | Source | Use it for | Cost | Ships to Egypt/Gulf | Notes |
|---|--------|-----------|------|--------------------|-------|
| 1 | **AliExpress** (via **DSers**) | **Testing winners** cheaply, low risk | $ (cheapest unit) | Slow (2–4 wks) direct | Best to *validate* demand before committing cash |
| 2 | **CJdropshipping** | Scaling winners, QC, branding, faster lines | $$ | Yes, has warehouses | Assigned agent, can private-label, sources from 1688 for you |
| 3 | **Zendrop** | Curated/faster fulfillment | $$ | Global | Cleaner catalog, good for US-style ops |
| 4 | **1688 / Yiwu sourcing agent** | **Best margins** on *proven* winners (bulk) | ¢ (lowest) | Bulk → your 3PL | Cheapest; needs an agent + bulk import to a local warehouse |
| 5 | **Alibaba** | **Private label / your own brand** | $$ (MOQ) | Bulk | Brand the packaging once a product proves out → defensible margin |
| 6 | **Local EG wholesalers + Turkish/Korean (K-beauty) distributors** (e.g. via **Tradeling** B2B) | **Fast COD fulfillment** in Egypt, premium positioning | $$ | Local = fast | No customs headache; K-beauty/Turkish lines command higher prices |

**The play for Egypt (COD + speed):**
1. **Test** new products via AliExpress/CJ (cheap, low risk).
2. The moment one wins, **bulk-buy via a 1688 agent or CJ** and **stock in a local Egyptian 3PL / wholesaler** so COD delivery is 2–4 days (not 3 weeks). Fast delivery = far fewer COD refusals = your real profit lever.
3. **Brand the winners** (Alibaba private label) to escape price competition and protect margin.
4. **Liquids** (perfumes/serums): bulk-import once into the 3PL (Module 2) — never per-order.

---

## 2. Per-product sourcing & margin sheet

**Resale = our EGP store price. Cost = estimated landed unit cost. Gross margin is before ad/CPA & COD-refusal costs** (model those per Module 4 — keep blended net ≥25%).

| Product | Source | AliExpress search term | Est. cost (EGP) | Our price (EGP) | Gross margin |
|---|---|---|---|---|---|
| سيروم فيتامين C | AliExpress→CJ | "vitamin c serum face brightening" | ~170 | 399 | ~57% |
| سيروم نياسيناميد | AliExpress→CJ | "niacinamide serum oil control" | ~150 | 349 | ~57% |
| مرطب هيالورونيك | AliExpress→CJ | "hyaluronic ceramide moisturizer" | ~160 | 449 | ~64% |
| واقي شمس SPF50 | AliExpress→CJ | "invisible sunscreen spf50 no white cast" | ~160 | 379 | ~58% |
| معطر الشعر الفاخر | CJ / 1688 agent | "hair perfume mist long lasting musk" | ~180 | 499 | ~64% |
| طقم معطرات الجسم | CJ / 1688 | "body mist set travel fragrance" | ~250 | 549 | ~54% |
| زيت عطري رول-أون | CJ / local | "roll on perfume oil arabic musk" | ~130 | 299 | ~57% |
| معطر العباية | local / CJ | "fabric perfume spray long lasting" | ~120 | 279 | ~57% |
| كريم أساس مطفي | AliExpress→CJ | "long wear matte foundation waterproof" | ~180 | 449 | ~60% |
| بخاخ تثبيت المكياج | AliExpress→CJ | "matte makeup setting spray" | ~120 | 299 | ~60% |
| كحل مقاوم للماء | AliExpress | "waterproof kohl eyeliner black" | ~60 | 199 | ~70% |
| زيت الشفاه الملوّن | AliExpress→CJ | "tinted lip oil hydrating gloss" | ~80 | 249 | ~68% |
| سيروم الأرغان | AliExpress→CJ | "argan anti frizz hair serum" | ~130 | 349 | ~63% |
| ماسك الشعر | AliExpress→CJ | "hair mask deep conditioning" | ~150 | 399 | ~62% |
| طقم كيرلي بلا حرارة | AliExpress | "heatless curling rod set satin" | ~100 | 279 | ~64% |
| زيت إكليل الجبل | AliExpress→CJ | "rosemary oil hair growth" | ~100 | 299 | ~67% |
| مصفّف الشعر اللاسلكي | CJ / 1688 | "cordless hair styler multi-function 5 in 1" | ~1050 | **1899** | ~45% |
| رولر التبريد | AliExpress | "ice roller face" | ~150 | 249 | ~40% |
| جهاز IPL المنزلي | CJ / 1688 | "IPL hair removal device home" | ~1550 | **2499** | ~38% |
| طقم تفتيح وتقشير الجسم | AliExpress→CJ | "body scrub exfoliating brightening set" | ~160 | 349 | ~54% |

> ⚠️ **Pricing fix applied:** the two high-ticket electronics (hair styler, IPL) were under-priced for their landed cost — I raised them to margin-safe levels (styler **1299→1899**, IPL **1499→2499 EGP**) in the store and the YouCan import CSV. Verify against your actual supplier quote and adjust.

---

## 3. How to add real product images (1 paste each)

Because I can't browse AliExpress from here, you grab the images and I (or you) drop them in:
1. On the supplier listing, right-click the product image → **"Copy image address"**.
2. Paste the URL(s) into `imageOverrides` in `layali-store/src/data/products.ts`, keyed by product id — e.g.
   `"sk-vitc-serum": ["https://ae01.alicdn.com/.../x.jpg"]`.
3. That's it — the placeholder is replaced (images load unoptimized, so remote URLs need no config). Send me the URLs and I'll wire all 20 in minutes.

---

## 4. Margin rules of thumb
- **Consumables (skincare/makeup/hair):** target **3–4× cost** (≈60–70% gross). They reorder → LTV.
- **Perfume/mist:** **3.5–5× cost** — highest perceived value.
- **Electronics (styler/IPL):** **2–2.5× cost** (lower multiple, big absolute profit). Push these with **BNPL/instalments** so the ticket feels small.
- Always subtract **ad CPA + COD-refusal reserve (10–25% in Egypt)** before calling it profit (Module 4).
- **Fast local delivery is the #1 margin protector** — it slashes COD refusals.
