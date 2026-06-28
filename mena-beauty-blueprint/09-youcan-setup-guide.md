# MODULE 9 — YouCan Setup Guide (Egypt-first, serves Gulf)

> The execution playbook for launching **Layali / ليالي** on **YouCan** — a MENA/North-Africa e-commerce platform that is **COD-first**, Arabic/RTL-native, and free to start. This is the chosen path: **Egypt as the primary market**, with the Gulf served as a secondary market.
>
> Companion file: [`youcan-products-import.csv`](./youcan-products-import.csv) — the 20-product catalog in **EGP** ready to adapt to YouCan's import template.

---

## 0. Why YouCan for Egypt

| Need | YouCan |
|---|---|
| Cash on Delivery (Egypt's dominant method) | ✅ Native, COD-first platform |
| Arabic + RTL | ✅ Built-in |
| Free to start | ✅ Free plan available; upgrade as you scale |
| Egyptian payments (cards, Fawry, wallets) | ✅ YouCan Pay + Paymob/Fawry integrations |
| Local couriers (Bosta, Mylerz, R2S) | ✅ Shipping integrations + COD collection |
| Custom domain | ✅ |
| Abandoned cart / upsell / apps | ✅ App marketplace |

**vs Salla/Zid:** those are Gulf/KSA-optimized (Mada, SFDA). **YouCan fits Egypt-first** (COD culture, lower entry cost, North-Africa logistics). You can still serve the Gulf from YouCan via multi-currency + international shipping; for a serious *Gulf-first* push later, add Salla (the catalog CSV in Module 8 makes that easy).

> ⚠️ Platform features and integrations change. Verify in the live YouCan dashboard before committing budget.

---

## 1. Prerequisites (Egypt — lighter than the Gulf)

- [ ] **Domain** (`layali.com`) and **logo** ready.
- [ ] **WhatsApp Business number** (Egyptian, `+20…`) — your order/support channel.
- [ ] **COD courier account** — **Bosta**, **Mylerz**, or **R2S** (they collect cash on delivery and remit to you).
- [ ] **For online card payments:** a **YouCan Pay** account and/or **Paymob** (cards, Fawry, wallets, installments). COD needs none of this — you can launch COD-only **today**.
- [ ] **Bank account / wallet** for payouts.
- [ ] Cosmetics: keep supplier ingredient lists; be aware of **Egyptian NFSA** rules for cosmetics (see Module 2 QC). Customs for liquids → local stock/3PL (Module 2).

> COD-only launch needs essentially **no paperwork** — this is YouCan's big Egypt advantage. Add card/Fawry later.

---

## 2. Account & store basics

1. Sign up at **youcan.shop** → create your store. Choose the free plan to start.
2. **Store identity:** logo, name **ليالي**, slogan **"جمالكِ يبدأ من هنا"**, brand colors (blush / plum / gold).
3. **Language & currency:** Arabic (RTL), primary currency **EGP (ج.م)**.
4. **Domain:** connect your custom domain in store settings.
5. **Pages:** add About, Contact, and the **Return/Refund policy** (Arabic text in Module 5).

---

## 3. Payments (Egypt-first)

Enable in *Settings → Payments*:

- [ ] **Cash on Delivery (الدفع عند الاستلام)** — your primary method. Add a small COD fee to filter non-serious orders.
- [ ] **YouCan Pay** and/or **Paymob** — cards, **Fawry**, wallets, installments.
- [ ] (Gulf customers) enable card/Apple Pay via the gateway; consider **Tabby/Tamara** if you push the Gulf seriously.

**On product pages show:** a COD badge, "ادفع عند الاستلام", and a prepaid discount nudge ("خصم عند الدفع المسبق") to shift some orders to card.

---

## 4. Shipping & fulfillment

Configure in *Settings → Shipping*:

- [ ] Connect **Bosta / Mylerz / R2S** for Egypt domestic delivery + **COD cash collection**.
- [ ] Set shipping rates per governorate; **free shipping over 1500 EGP** (matches the store funnel).
- [ ] **Gulf orders:** add an international/Gulf zone with its own rate (or use a Gulf 3PL). Stock liquids (perfumes/serums) in a **local 3PL** to avoid per-order customs (Module 2).
- [ ] Track your **COD refusal rate** — price in ~10–25% refusal cost (Module 4).

---

## 5. Catalog: categories + products

### 5.1 Create the 5 categories
العناية بالبشرة · العطور ومعطرات الجسم · المكياج · العناية بالشعر · أدوات الجمال والعناية بالجسم

### 5.2 Import the 20 products
- *Products → Import* → use YouCan's Excel/CSV template.
- Paste columns from [`youcan-products-import.csv`](./youcan-products-import.csv) into the matching fields — it's already in **EGP** value pricing with category, SKU, price + compare-at, quantity, and rich Arabic descriptions.
- Upload your real product **photos** per SKU after import.

### 5.3 Per-product polish (Module 5 copy)
Add the AIDA description, benefit bullets, how-to-use steps, ingredients/safety line, variants, and bundles ("اشتري ٢ ووفري") to each product.

---

## 6. Apps & marketing

From the YouCan app marketplace:
- [ ] **Photo reviews** (trust)
- [ ] **Upsell / cross-sell & bundles** (AOV)
- [ ] **WhatsApp** order confirmation + support (Module 7 flows)
- [ ] **Abandoned cart** (WhatsApp/SMS)
- [ ] **Meta + TikTok pixels** for ads (Module 6 — Egypt = Meta-first)
- [ ] **Coupons** — launch code (Module 6) + "شكراً15" retention code (Module 7)

---

## 7. Launch checklist

- [ ] Arabic RTL store live, EGP currency, domain connected
- [ ] **COD enabled** (+ YouCan Pay/Paymob/Fawry when ready)
- [ ] Bosta/Mylerz/R2S shipping + free-shipping over 1500 EGP
- [ ] Gulf shipping zone (optional) + multi-currency
- [ ] 5 categories + 20 products imported (EGP) with real photos
- [ ] Product pages polished (AIDA, reviews, bundles)
- [ ] WhatsApp + abandoned cart + reviews apps installed
- [ ] Meta/TikTok pixels installed
- [ ] Policies/About/Contact published
- [ ] Test order end-to-end (COD + card) on a real phone
- [ ] Launch coupon + influencer codes created

---

## 8. The custom Next.js store + YouCan

`layali-store/` (this repo) is now **Egypt-first too** (EGP default, Egypt checkout, COD + WhatsApp orders). Use it as:
- A **fast ad-funnel / landing page** for Meta/TikTok traffic that links to your YouCan product/checkout, **or**
- A **brand microsite** while YouCan runs operations, **or**
- Retire it once YouCan is live.

All Arabic copy, pricing, and structure are shared, so nothing is wasted either way.

> **Bottom line:** YouCan lets you launch **COD-first in Egypt with almost no paperwork**, Arabic-native, free to start. Import the EGP CSV + Module 5 copy, connect Bosta/Mylerz for COD, drive Meta/TikTok traffic (Module 6), and solve liquids via a local 3PL (Module 2). Add the Gulf as a second market when ready.
