"use client";

import { useStore } from "./StoreProvider";
import { formatPrice } from "@/lib/format";

export default function Price({
  amount,
  compareAt,
  className = "",
}: {
  amount: number; // base SAR
  compareAt?: number;
  className?: string;
}) {
  const { currency, hydrated } = useStore();
  // Avoid hydration mismatch: render base currency until client hydrates.
  if (!hydrated) {
    return <span className={className}>…</span>;
  }
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <span className="font-bold text-blush-600 ltr-nums">{formatPrice(amount, currency)}</span>
      {compareAt && compareAt > amount && (
        <span className="text-sm text-plum-700/40 line-through ltr-nums">
          {formatPrice(compareAt, currency)}
        </span>
      )}
    </span>
  );
}
