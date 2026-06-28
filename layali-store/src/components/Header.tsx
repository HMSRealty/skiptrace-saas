"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore } from "./StoreProvider";
import { brand, currencies, CurrencyCode } from "@/data/config";
import { collections } from "@/data/collections";

export default function Header() {
  const { count, currencyCode, setCurrencyCode, hydrated } = useStore();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-plum-700/10 bg-cream/95 backdrop-blur">
      {/* Announcement bar */}
      <div className="bg-plum-800 text-center text-xs text-cream sm:text-sm">
        <p className="container-px py-2">
          ✨ شحن مجاني للطلبات فوق <span className="ltr-nums">{currencies[currencyCode].freeShippingThreshold}</span>{" "}
          {currencies[currencyCode].symbol} · الدفع عند الاستلام متاح 💛
        </p>
      </div>

      <div className="container-px flex items-center justify-between gap-3 py-3">
        {/* Mobile menu toggle */}
        <button
          aria-label="القائمة"
          className="rounded-lg p-2 md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="block h-0.5 w-6 bg-plum-800" />
          <span className="my-1.5 block h-0.5 w-6 bg-plum-800" />
          <span className="block h-0.5 w-6 bg-plum-800" />
        </button>

        {/* Logo */}
        <Link href="/" className="flex flex-col items-center leading-none">
          <span className="font-display text-2xl font-extrabold text-plum-800">{brand.name}</span>
          <span className="text-[10px] tracking-[0.3em] text-gold-600">{brand.nameLatin.toUpperCase()}</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/" className="text-sm font-semibold text-plum-800 hover:text-blush-600">
            الرئيسية
          </Link>
          {collections.map((c) => (
            <Link
              key={c.slug}
              href={`/collections/${c.slug}`}
              className="text-sm font-semibold text-plum-800 hover:text-blush-600"
            >
              {c.name}
            </Link>
          ))}
          <Link href="/faq" className="text-sm font-semibold text-plum-800 hover:text-blush-600">
            الأسئلة
          </Link>
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <select
            aria-label="العملة"
            value={currencyCode}
            onChange={(e) => setCurrencyCode(e.target.value as CurrencyCode)}
            className="rounded-lg border border-plum-700/15 bg-white px-2 py-1.5 text-sm font-semibold text-plum-800 focus:outline-none"
          >
            {Object.values(currencies).map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} {c.symbol}
              </option>
            ))}
          </select>

          <Link
            href="/cart"
            className="relative rounded-full bg-plum-800 px-4 py-2 text-sm font-semibold text-cream hover:bg-plum-700"
          >
            السلة
            {hydrated && count > 0 && (
              <span className="absolute -top-2 -left-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-blush-600 px-1 text-[11px] font-bold text-white ltr-nums">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <nav className="border-t border-plum-700/10 bg-cream md:hidden">
          <div className="container-px flex flex-col py-2">
            <Link href="/" onClick={() => setOpen(false)} className="py-2 font-semibold text-plum-800">
              الرئيسية
            </Link>
            {collections.map((c) => (
              <Link
                key={c.slug}
                href={`/collections/${c.slug}`}
                onClick={() => setOpen(false)}
                className="py-2 font-semibold text-plum-800"
              >
                {c.name}
              </Link>
            ))}
            <Link href="/faq" onClick={() => setOpen(false)} className="py-2 font-semibold text-plum-800">
              الأسئلة الشائعة
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
