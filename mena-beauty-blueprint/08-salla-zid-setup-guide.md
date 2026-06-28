# MODULE 8 — Salla / Zid Setup & Migration Guide (Gulf)

> The execution playbook for launching **Layali / ليالي** on **Salla (سلة)** or **Zid (زد)** — the two MENA-native platforms built for the Saudi/Gulf market. This replaces Module 3's Shopify path for a Gulf-first launch.
>
> Companion file: [`salla-products-import.csv`](./salla-products-import.csv) — the 20-product catalog ready to adapt to the platform's import template.

---

## 0. Why Salla/Zid over Shopify for the Gulf

| Need | Salla / Zid | Shopify |
|---|---|---|
| Arabic + RTL | ✅ Native (built Arabic-first) | ⚠️ Via apps/config |
| Mada, STC Pay, Apple Pay | ✅ Built-in | ⚠️ Via gateway (Tap/Checkout) |
| Tabby / Tamara (BNPL) | ✅ One-click integrations | ⚠️ Apps |
| Cash on Delivery | ✅ Native + COD fee handling | ⚠️ Add-on |
| Local shipping (SMSA, Aramex, iMile) | ✅ Pre-integrated | ⚠️ Apps |
| Saudi VAT (15%) & ZATCA e-invoicing | ✅ Built-in compliance | ⚠️ Manual/apps |
| Local support (Arabic) | ✅ Yes | ❌ Limited |

**Salla vs Zid:** both are excellent and very similar. **Salla** has the larger merchant base, app marketplace, and marketing tooling → **recommended default**. **Zid** is a strong alternative with great logistics. Pick Salla unless you have a specific reason; this guide uses Salla terminology (Zid steps are nearly identical).

> ⚠️ Platform features, plan prices, and payment/shipping integrations change. Verify in the live Salla/Zid dashboard before committing.

---

## 1. Prerequisites (do these first)

KSA payment gateways and COD require legitimacy documents. Start these early — they gate your launch.

- [ ] **Commercial Registration (السجل التجاري / CR)** — required to activate real payment gateways (Mada, Apple Pay, Tabby/Tamara). A freelance/e-commerce CR works for many sellers.
- [ ] **Maroof (معروف)** registration — Saudi business directory; builds trust and is often required by gateways.
- [ ] **VAT registration** if turnover exceeds the threshold (standard KSA VAT = **15%**); Salla supports ZATCA e-invoicing.
- [ ] **National Address / IBAN** for payouts.
- [ ] **Cosmetics compliance** — be aware of **SFDA (الهيئة العامة للغذاء والدواء)** rules for importing/selling cosmetics; keep supplier INCI lists and avoid banned actives (see Module 2 QC).
- [ ] **Domain** (`layali.com` or `.sa`) and **logo** ready.

> No CR yet? You can still **build the full store in test/demo mode** and use **COD + manual/WhatsApp payment** to start selling, then add card gateways once the CR is approved.

---

## 2. Account & store basics

1. Create a merchant account at **salla.sa** (or **zid.sa**). Choose a plan (there's an entry plan to start; upgrade as you grow).
2. **Store identity:** upload the Layali logo, set brand colors (blush / plum / gold), store name **ليالي**, and the slogan **"جمالكِ يبدأ من هنا"**.
3. **Language & currency:** Arabic (default), currency **SAR** (add AED for UAE later via multi-currency if expanding).
4. **Domain:** connect your custom domain in *Settings → Domain*.
5. **Store info pages:** add About, Contact, and the policy texts from Module 5 (return/refund) — Salla has dedicated policy pages.

---

## 3. Payments (the Gulf advantage)

Enable in *Settings → Payment*:

- [ ] **Mada** (essential — Saudi debit network)
- [ ] **Apple Pay** (huge conversion lift on mobile)
- [ ] **Visa / Mastercard** (credit)
- [ ] **STC Pay** (popular wallet)
- [ ] **Tabby** and **Tamara** — BNPL "ادفع على ٤ دفعات" → lifts AOV on hair stylers, IPL devices, perfume sets
- [ ] **Cash on Delivery (الدفع عند الاستلام)** — enable with a small COD fee to filter non-serious orders
- [ ] Optional: bank transfer for high-value orders

**Tip:** display "قسّميها على ٤ دفعات مع تابي/تمارا" on product pages and a COD badge in the header.

---

## 4. Shipping & fulfillment

Configure in *Settings → Shipping*:

- [ ] Connect **SMSA**, **Aramex**, and/or **iMile** (Salla has native integrations) for domestic Gulf delivery.
- [ ] Enable **COD cash collection** with your courier.
- [ ] Set **free-shipping threshold** (e.g. over **200 SAR**) — matches the blueprint funnel.
- [ ] Shipping zones: KSA cities first; add other Gulf countries (UAE, Qatar, Kuwait, Bahrain, Oman) as you expand.
- [ ] **Liquids/customs:** this is the same challenge as Module 2 — stock your perfumes/serums in a **local UAE/KSA 3PL** and fulfill domestically. Salla/Zid integrate with several fulfillment partners; connect yours so stock + tracking sync automatically.

---

## 5. Catalog: categories + products

### 5.1 Create the 5 categories (collections)
In *Products → Categories*, create:

1. العناية بالبشرة (Skincare)
2. العطور ومعطرات الجسم (Fragrance & Body Mists)
3. المكياج (Makeup)
4. العناية بالشعر (Hair Care)
5. أدوات الجمال والعناية بالجسم (Beauty Tools & Body Care)

### 5.2 Import the 20 products
- Use *Products → Import* and Salla/Zid's **Excel/CSV template**.
- Open the platform's official import template, then **paste the columns from [`salla-products-import.csv`](./salla-products-import.csv)** into the matching template fields (names, price, price-before-discount, category, SKU, description, quantity).
- The CSV already contains: Arabic product names, selling price + "was" price (for the strike-through discount), category mapping, SKU, and a rich Arabic description (tagline + benefits) per product.
- Upload product **images** (your real photos) per SKU after import.

### 5.3 Per-product polish (use Module 5 copy)
For each product page add:
- The **AIDA description** (the hair-mist example in Module 5 is the template — apply the same structure to all).
- **Benefits** as bullet points, **how-to-use** steps, **ingredients/safety** line.
- **Variants** (size/shade) where relevant.
- **Bundles** ("اشتري ٢ ووفري ٢٥٪") via Salla's offers engine.

---

## 6. Apps & marketing tools (Salla App Store)

Install from the Salla/Zid marketplace:

- [ ] **Reviews with photos** (social proof — #1 trust driver for beauty)
- [ ] **Upsell / cross-sell & bundles** (raise AOV)
- [ ] **WhatsApp** integration (order confirmation + support; pairs with Module 7 flows)
- [ ] **Abandoned cart** recovery (SMS/WhatsApp)
- [ ] **Loyalty / points** for repeat purchase (Module 7 LTV)
- [ ] **SEO / Snapchat & TikTok pixel** integrations for ads (Module 6)
- [ ] **Coupons** — create the launch code from Module 6 and the "شكراً15" retention code from Module 7

---

## 7. Compliance & trust (KSA-specific)

- [ ] Show **Maroof badge** and **VAT number** in the footer (trust + legal).
- [ ] **ZATCA-compliant invoices** (Salla generates these automatically once VAT is set).
- [ ] Display the **return/refund policy** (Module 5 Arabic text) — required and a conversion driver.
- [ ] Keep **SFDA-relevant product info** (ingredients, country of origin) accurate per SKU.

---

## 8. Launch checklist

- [ ] Brand, domain, Arabic store live
- [ ] Mada + Apple Pay + Tabby/Tamara + COD enabled (or COD-only if CR pending)
- [ ] SMSA/Aramex shipping + free-shipping threshold set
- [ ] 5 categories + 20 products imported with real photos
- [ ] Product pages polished with AIDA copy, reviews, bundles
- [ ] WhatsApp + abandoned cart + reviews apps installed
- [ ] Policies, About, Contact pages published
- [ ] Snapchat/TikTok pixels installed (Module 6)
- [ ] Test order end-to-end (card + COD) on a real phone
- [ ] Launch coupon + influencer codes created (Module 6)

---

## 9. Using the custom Next.js store alongside Salla (optional)

The `layali-store/` app I built can still earn its keep:

- **As a landing/funnel page** for paid ads (fast, fully controlled) that links "اطلبي الآن" to your Salla product/checkout — great for testing creatives cheaply.
- **As a brand microsite** while the Salla store handles transactions, payments, and operations.
- Or **retire it** once Salla is live — your call. Either way, all the Arabic product copy, structure, and pricing transfer 1:1 because they share the same `products` data and Module 5 copy.

> **Bottom line:** Salla/Zid handles payments, COD, shipping, VAT, and operations natively for the Gulf — far less operational pain than a custom store or Shopify for this market. Build the catalog there using the CSV + Module 5 copy, solve liquids via a local 3PL (Module 2), and drive traffic per Module 6.
