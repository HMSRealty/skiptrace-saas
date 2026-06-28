import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { collections } from "@/data/collections";

export const metadata: Metadata = { title: "كل التشكيلات" };

export default function CollectionsPage() {
  return (
    <div className="container-px py-12">
      <h1 className="mb-8 text-center font-display text-3xl font-extrabold text-plum-900">كل التشكيلات</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((c) => (
          <Link key={c.slug} href={`/collections/${c.slug}`} className="group relative h-56 overflow-hidden rounded-2xl shadow-soft">
            <Image src={c.image} alt={c.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-plum-900/80 to-transparent" />
            <div className="absolute bottom-0 right-0 p-5 text-right">
              <h2 className="font-display text-2xl font-bold text-white">{c.name}</h2>
              <p className="text-sm text-cream/80">{c.tagline}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
