import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { collections, collectionBySlug } from "@/data/collections";
import { productsByCollection } from "@/data/products";
import ProductCard from "@/components/ProductCard";

export function generateStaticParams() {
  return collections.map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const c = collectionBySlug(params.slug);
  return { title: c ? c.name : "التشكيلة" };
}

export default function CollectionPage({ params }: { params: { slug: string } }) {
  const collection = collectionBySlug(params.slug);
  if (!collection) notFound();
  const items = productsByCollection(params.slug);

  return (
    <div className="container-px py-10">
      <nav className="mb-4 text-sm text-plum-700/60">
        <Link href="/" className="hover:text-blush-600">الرئيسية</Link> /{" "}
        <Link href="/collections" className="hover:text-blush-600">التشكيلات</Link> /{" "}
        <span className="text-plum-800">{collection.name}</span>
      </nav>

      <div className="mb-8 rounded-2xl bg-gradient-to-bl from-blush-100 to-cream p-8 text-center">
        <h1 className="font-display text-3xl font-extrabold text-plum-900">{collection.name}</h1>
        <p className="mt-2 text-plum-700/70">{collection.tagline}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
