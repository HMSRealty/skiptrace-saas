"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/components/StoreProvider";
import { waLink } from "@/components/WhatsAppButton";
import { money } from "@/lib/format";
import { brand } from "@/data/config";

// Egypt-first (primary market), Gulf served below it.
const countries = ["مصر", "السعودية", "الإمارات", "قطر", "الكويت", "البحرين", "عُمان"];

export default function CheckoutPage() {
  const { items, subtotal, currency, clear, hydrated } = useStore();
  const [form, setForm] = useState({ name: "", phone: "", country: "مصر", city: "", address: "", notes: "", payment: "cod" });
  const [placed, setPlaced] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const valid = form.name && form.phone.length >= 8 && form.city && form.address;

  const placeOrder = () => {
    if (!valid) return;
    const lines = items.map((i) => `• ${i.name} ×${i.qty} — ${money((i.prices?.[currency.code] ?? 0) * i.qty, currency)}`).join("%0A");
    const msg =
      `🌸 طلب جديد من ${brand.name}%0A%0A` +
      `👤 الاسم: ${form.name}%0A` +
      `📱 الجوال: ${form.phone}%0A` +
      `🌍 الدولة: ${form.country}%0A` +
      `🏙️ المدينة: ${form.city}%0A` +
      `📍 العنوان: ${form.address}%0A` +
      (form.notes ? `📝 ملاحظات: ${form.notes}%0A` : "") +
      `💳 طريقة الدفع: ${form.payment === "cod" ? "الدفع عند الاستلام" : "بطاقة / دفع إلكتروني"}%0A%0A` +
      `🛍️ الطلب:%0A${lines}%0A%0A` +
      `💰 الإجمالي: ${money(subtotal, currency)}`;
    window.open(waLink(decodeURIComponent(msg)), "_blank");
    clear();
    setPlaced(true);
  };

  if (placed) {
    return (
      <div className="container-px py-20 text-center">
        <div className="text-6xl">🎉</div>
        <h1 className="mt-4 font-display text-3xl font-extrabold text-plum-900">تم استلام طلبكِ!</h1>
        <p className="mx-auto mt-3 max-w-md text-plum-700/70">
          شكراً لثقتكِ بـ {brand.name} 💛 سيتواصل معكِ فريقنا عبر واتساب لتأكيد الطلب وتفاصيل التوصيل.
          إذا لم تفتح نافذة واتساب تلقائياً، تواصلي معنا على <span className="ltr-nums">+{brand.whatsapp}</span>.
        </p>
        <Link href="/" className="btn-primary mt-6">العودة للرئيسية</Link>
      </div>
    );
  }

  if (hydrated && items.length === 0) {
    return (
      <div className="container-px py-20 text-center">
        <h1 className="font-display text-2xl font-bold text-plum-900">سلتكِ فارغة</h1>
        <Link href="/collections" className="btn-primary mt-6">ابدئي التسوّق</Link>
      </div>
    );
  }

  return (
    <div className="container-px py-10">
      <h1 className="mb-6 font-display text-3xl font-extrabold text-plum-900">إتمام الطلب</h1>
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Form */}
        <div className="space-y-4 lg:col-span-2">
          <div className="card p-6">
            <h2 className="mb-4 font-bold text-plum-900">معلومات التوصيل</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="الاسم الكامل" value={form.name} onChange={(v) => set("name", v)} placeholder="مثال: نورة العتيبي" />
              <Field label="رقم الموبايل (واتساب)" value={form.phone} onChange={(v) => set("phone", v)} placeholder="01XXXXXXXXX" type="tel" />
              <div>
                <label className="mb-1 block text-sm font-semibold text-plum-800">الدولة</label>
                <select value={form.country} onChange={(e) => set("country", e.target.value)} className="w-full rounded-xl border border-plum-700/15 bg-white px-4 py-2.5 focus:border-blush-400 focus:outline-none">
                  {countries.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <Field label="المدينة" value={form.city} onChange={(v) => set("city", v)} placeholder="مثال: القاهرة" />
            </div>
            <div className="mt-4">
              <Field label="العنوان التفصيلي" value={form.address} onChange={(v) => set("address", v)} placeholder="الحي، الشارع، رقم المبنى" />
            </div>
            <div className="mt-4">
              <label className="mb-1 block text-sm font-semibold text-plum-800">ملاحظات (اختياري)</label>
              <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} className="w-full rounded-xl border border-plum-700/15 bg-white px-4 py-2.5 focus:border-blush-400 focus:outline-none" placeholder="أي تفاصيل إضافية للتوصيل" />
            </div>
          </div>

          <div className="card p-6">
            <h2 className="mb-4 font-bold text-plum-900">طريقة الدفع</h2>
            <label className={`mb-3 flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${form.payment === "cod" ? "border-blush-500 bg-blush-50" : "border-plum-700/15"}`}>
              <input type="radio" name="payment" checked={form.payment === "cod"} onChange={() => set("payment", "cod")} />
              <span className="font-semibold text-plum-800">💵 الدفع عند الاستلام — ادفعي بعد ما يوصلكِ الطلب</span>
            </label>
            <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${form.payment === "card" ? "border-blush-500 bg-blush-50" : "border-plum-700/15"}`}>
              <input type="radio" name="payment" checked={form.payment === "card"} onChange={() => set("payment", "card")} />
              <span className="font-semibold text-plum-800">💳 بطاقة / فوري / Apple Pay / تابي — يرسل لكِ الفريق رابط دفع آمن</span>
            </label>
          </div>
        </div>

        {/* Summary */}
        <div className="card h-fit p-6">
          <h2 className="mb-4 font-bold text-plum-900">ملخّص الطلب</h2>
          <div className="space-y-2">
            {items.map((i) => (
              <div key={i.id} className="flex items-center justify-between text-sm">
                <span className="text-plum-700/80">{i.name} ×<span className="ltr-nums">{i.qty}</span></span>
                <span className="font-semibold text-plum-900 ltr-nums">{money((i.prices?.[currency.code] ?? 0) * i.qty, currency)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-plum-700/10 pt-3">
            <span className="font-bold text-plum-900">الإجمالي</span>
            <span className="font-bold text-blush-600 ltr-nums">{money(subtotal, currency)}</span>
          </div>
          <button onClick={placeOrder} disabled={!valid} className="btn-primary mt-5 w-full disabled:cursor-not-allowed disabled:opacity-50">
            تأكيد الطلب عبر واتساب
          </button>
          {!valid && <p className="mt-2 text-center text-xs text-plum-700/50">يرجى تعبئة الحقول المطلوبة</p>}
          <p className="mt-3 text-center text-xs text-plum-700/50">بتأكيد الطلب توافقين على سياسة الإرجاع والشحن</p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-plum-800">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-plum-700/15 bg-white px-4 py-2.5 focus:border-blush-400 focus:outline-none" />
    </div>
  );
}
