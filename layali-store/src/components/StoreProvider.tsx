"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { CurrencyCode, currencies, defaultCurrency, Currency } from "@/data/config";

export interface CartItem {
  id: string;
  slug: string;
  name: string;
  prices: Record<CurrencyCode, number>; // concrete price per currency
  image: string;
  qty: number;
}

interface StoreState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number; // in the active currency
  currencyCode: CurrencyCode;
  currency: Currency;
  setCurrencyCode: (c: CurrencyCode) => void;
  hydrated: boolean;
}

const StoreContext = createContext<StoreState | null>(null);

const CART_KEY = "layali_cart";
const CUR_KEY = "layali_currency";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [currencyCode, setCurrencyCodeState] = useState<CurrencyCode>(defaultCurrency);
  const [hydrated, setHydrated] = useState(false);

  // Load persisted state on mount.
  useEffect(() => {
    try {
      const rawCart = localStorage.getItem(CART_KEY);
      if (rawCart) {
        // Keep only well-formed items (drops legacy carts from older versions
        // that used a single `price` instead of the per-currency `prices` map).
        const parsed = JSON.parse(rawCart);
        const valid = Array.isArray(parsed)
          ? parsed.filter((i) => i && typeof i === "object" && i.prices && typeof i.prices === "object")
          : [];
        setItems(valid);
      }
      const rawCur = localStorage.getItem(CUR_KEY) as CurrencyCode | null;
      if (rawCur && currencies[rawCur]) setCurrencyCodeState(rawCur);
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const setCurrencyCode = (c: CurrencyCode) => {
    setCurrencyCodeState(c);
    try {
      localStorage.setItem(CUR_KEY, c);
    } catch {
      /* ignore */
    }
  };

  const addItem: StoreState["addItem"] = (item, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + qty } : i));
      }
      return [...prev, { ...item, qty }];
    });
  };

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const setQty = (id: string, qty: number) =>
    setItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i))
        .filter((i) => i.qty > 0)
    );

  const clear = () => setItems([]);

  const count = useMemo(() => items.reduce((n, i) => n + i.qty, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((s, i) => s + (i.prices?.[currencyCode] ?? 0) * i.qty, 0),
    [items, currencyCode]
  );

  const value: StoreState = {
    items,
    addItem,
    removeItem,
    setQty,
    clear,
    count,
    subtotal,
    currencyCode,
    currency: currencies[currencyCode],
    setCurrencyCode,
    hydrated,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
