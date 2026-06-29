"use client";

import { CurrencyCode } from "@/data/config";
import { useStore } from "./StoreProvider";
import { money } from "@/lib/format";

export default function Price({
  prices,
  compareAt,
  className = "",
}: {
  prices: Record<CurrencyCode, number>;
  compareAt?: Record<CurrencyCode, number>;
  className?: string;
}) {
  const { currency, hydrated } = useStore();
  // Avoid hydration mismatch until the client-selected currency is known.
  if (!hydrated) {
    return <span className={className}>…</span>;
  }
  const amount = prices[currency.code];
  const cmp = compareAt?.[currency.code];
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <span className="font-bold text-blush-600 ltr-nums">{money(amount, currency)}</span>
      {cmp && cmp > amount && (
        <span className="text-sm text-plum-700/40 line-through ltr-nums">{money(cmp, currency)}</span>
      )}
    </span>
  );
}
