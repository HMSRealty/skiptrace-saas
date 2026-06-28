"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Product } from "@/data/products";
import { useStore } from "./StoreProvider";
import { waLink } from "./WhatsAppButton";
import { formatPrice } from "@/lib/format";
import { brand } from "@/data/config";

export default function AddToCart({ product }: { product: Product }) {
  const { addItem, currency } = useStore();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const add = () => {
    addItem(
      {
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.image,
      },
      qty
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const orderNow = () => {
    const msg =
      `السلام عليكم 🌸 أرغب بطلب هذا المنتج من ${brand.name}:%0A` +
      `🛍️ ${product.name}%0A` +
      `الكمية: ${qty}%0A` +
      `السعر: ${formatPrice(product.price * qty, currency)}`;
    window.open(waLink(decodeURIComponent(msg)), "_blank");
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-plum-800">الكمية</span>
        <div className="flex items-center rounded-full border border-plum-700/15 bg-white">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-4 py-2 text-lg font-bold text-plum-800" aria-label="إنقاص">−</button>
          <span className="w-8 text-center font-bold ltr-nums">{qty}</span>
          <button onClick={() => setQty((q) => q + 1)} className="px-4 py-2 text-lg font-bold text-plum-800" aria-label="زيادة">+</button>
        </div>
      </div>

      <button onClick={add} className="btn-primary w-full">
        {added ? "✓ تمت الإضافة للسلة" : "أضيفيه إلى السلة"}
      </button>
      <button onClick={() => { add(); router.push("/checkout"); }} className="btn-outline w-full">
        اشتري الآن — الدفع عند الاستلام
      </button>
      <button onClick={orderNow} className="btn-whatsapp w-full">
        اطلبيه عبر واتساب
      </button>
    </div>
  );
}
