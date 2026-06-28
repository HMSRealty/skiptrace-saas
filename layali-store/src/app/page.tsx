import Link from "next/link";
import Image from "next/image";
import { brand } from "@/data/config";
import { collections } from "@/data/collections";
import { bestSellers, productsByCollection } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import TrustBadges from "@/components/TrustBadges";
import Reviews from "@/components/Reviews";

export default function HomePage() {
  const featured = bestSellers();
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-bl from-blush-100 via-cream to-blush-50">
        <div className="container-px grid items-center gap-8 py-14 md:grid-cols-2 md:py-20">
          <div>
            <span className="inline-block rounded-full bg-white/70 px-4 py-1 text-sm font-semibold text-blush-600">
              ✨ تشكيلة فاخرة لكل امرأة
            </span>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight text-plum-900 md:text-5xl">
              {brand.name}… {brand.slogan}
            </h1>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-plum-700/80">
              مستحضرات تجميل وعناية وعطور فاخرة، مختارة بعناية لتناسب بشرتكِ ومناخكِ. منتجات أصلية،
              دفع عند الاستلام، وشحن سريع لمصر والخليج 💛
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/collections" className="btn-primary">تسوّقي الآن</Link>
              <Link href="/products/luxury-hair-mist" className="btn-outline">المنتج الأكثر مبيعاً</Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-soft md:aspect-square">
            <Image
              src="/hero.svg"
              alt="ليالي للجمال"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="container-px -mt-8 relative z-10">
        <TrustBadges />
      </section>

      {/* Collections */}
      <section className="container-px py-14">
        <h2 className="mb-6 text-center font-display text-3xl font-extrabold text-plum-900">تسوّقي حسب الفئة</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((c) => (
            <Link key={c.slug} href={`/collections/${c.slug}`} className="group relative h-48 overflow-hidden rounded-2xl shadow-soft">
              <Image src={c.image} alt={c.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-plum-900/80 to-transparent" />
              <div className="absolute bottom-0 right-0 p-5 text-right">
                <h3 className="font-display text-xl font-bold text-white">{c.name}</h3>
                <p className="text-sm text-cream/80">{c.tagline}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Best sellers */}
      <section className="bg-blush-50/60 py-14">
        <div className="container-px">
          <h2 className="mb-6 text-center font-display text-3xl font-extrabold text-plum-900">الأكثر مبيعاً 🔥</h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* New in skincare */}
      <section className="container-px py-14">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-3xl font-extrabold text-plum-900">العناية بالبشرة</h2>
          <Link href="/collections/skincare" className="text-sm font-semibold text-blush-600 hover:underline">عرض الكل ←</Link>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {productsByCollection("skincare").map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section className="bg-blush-50/60 py-14">
        <div className="container-px">
          <h2 className="mb-6 text-center font-display text-3xl font-extrabold text-plum-900">ماذا تقول عميلاتنا 💕</h2>
          <Reviews />
        </div>
      </section>
    </div>
  );
}
