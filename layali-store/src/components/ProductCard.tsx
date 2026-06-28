"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/data/products";
import { useStore } from "./StoreProvider";
import Price from "./Price";
import Stars from "./Stars";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useStore();

  const discount =
    product.compareAt && product.compareAt > product.price
      ? Math.round((1 - product.price / product.compareAt) * 100)
      : 0;

  return (
    <div className="card group flex flex-col overflow-hidden">
      <Link href={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden bg-blush-50">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        {discount > 0 && (
          <span className="absolute top-3 right-3 rounded-full bg-blush-600 px-2 py-1 text-xs font-bold text-white ltr-nums">
            -{discount}%
          </span>
        )}
        {product.badges?.[0] && (
          <span className="absolute top-3 left-3 rounded-full bg-gold-500 px-2 py-1 text-[11px] font-bold text-white">
            {product.badges[0]}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <Stars rating={product.rating} count={product.reviewsCount} />
        <Link href={`/products/${product.slug}`} className="font-bold leading-snug text-plum-800 hover:text-blush-600">
          {product.name}
        </Link>
        <p className="text-sm text-plum-700/60">{product.tagline}</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <Price amount={product.price} compareAt={product.compareAt} />
        </div>
        <button
          onClick={() =>
            addItem({
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              image: product.image,
            })
          }
          className="btn-primary mt-2 w-full text-sm"
        >
          أضيفيه للسلة
        </button>
      </div>
    </div>
  );
}
