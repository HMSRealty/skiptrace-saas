"use client";

import Link from "next/link";
import Image from "next/image";
import { useStore } from "@/components/StoreProvider";
import { money } from "@/lib/format";

export default function CartPage() {
  const { items, setQty, removeItem, subtotal, currency, hydrated } = useStore();

  if (!hydrated) {
    return <div className="container-px py-20 text-center text-plum-700/60">جارٍ التحميل…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="container-px py-20 text-center">
        <div className="text-5xl">🛍️</div>
        <h1 className="mt-4 font-display text-2xl font-bold text-plum-900">سلتكِ فارغة</h1>
        <p className="mt-2 text-plum-700/70">اكتشفي تشكيلاتنا الفاخرة وأضيفي ما يعجبكِ.</p>
        <Link href="/collections" className="btn-primary mt-6">ابدئي التسوّق</Link>
      </div>
    );
  }

  const threshold = currency.freeShippingThreshold;
  const remaining = threshold - subtotal; // subtotal already in active currency

  return (
    <div className="container-px py-10">
      <h1 className="mb-6 font-display text-3xl font-extrabold text-plum-900">سلة التسوّق</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <div key={item.id} className="card flex items-center gap-4 p-4">
              <Link href={`/products/${item.slug}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-blush-50">
                <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
              </Link>
              <div className="flex-1">
                <Link href={`/products/${item.slug}`} className="font-bold text-plum-800 hover:text-blush-600">{item.name}</Link>
                <div className="mt-1 text-sm font-semibold text-blush-600 ltr-nums">{money(item.prices?.[currency.code] ?? 0, currency)}</div>
              </div>
              <div className="flex items-center rounded-full border border-plum-700/15">
                <button onClick={() => setQty(item.id, item.qty - 1)} className="px-3 py-1.5 font-bold text-plum-800">−</button>
                <span className="w-7 text-center font-bold ltr-nums">{item.qty}</span>
                <button onClick={() => setQty(item.id, item.qty + 1)} className="px-3 py-1.5 font-bold text-plum-800">+</button>
              </div>
              <button onClick={() => removeItem(item.id)} className="text-sm text-plum-700/50 hover:text-blush-600" aria-label="حذف">✕</button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="card h-fit p-6">
          <h2 className="mb-4 font-bold text-plum-900">ملخّص الطلب</h2>
          {remaining > 0 ? (
            <p className="mb-4 rounded-lg bg-blush-50 p-3 text-sm text-plum-700/80">
              أضيفي بقيمة <span className="font-bold text-blush-600 ltr-nums">{remaining} {currency.symbol}</span> للحصول على شحن مجاني 🚚
            </p>
          ) : (
            <p className="mb-4 rounded-lg bg-green-50 p-3 text-sm font-semibold text-green-700">🎉 مبروك! حصلتِ على شحن مجاني</p>
          )}
          <div className="flex items-center justify-between border-t border-plum-700/10 py-3">
            <span className="text-plum-700/70">المجموع الفرعي</span>
            <span className="font-bold text-plum-900 ltr-nums">{money(subtotal, currency)}</span>
          </div>
          <p className="text-xs text-plum-700/50">تُحتسب رسوم الشحن عند الدفع</p>
          <Link href="/checkout" className="btn-primary mt-5 w-full">إتمام الطلب</Link>
          <Link href="/collections" className="mt-3 block text-center text-sm font-semibold text-blush-600 hover:underline">مواصلة التسوّق</Link>
        </div>
      </div>
    </div>
  );
}
