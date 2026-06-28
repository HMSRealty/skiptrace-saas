import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { products, productBySlug, productsByCollection } from "@/data/products";
import { collectionBySlug } from "@/data/collections";
import ProductGallery from "@/components/ProductGallery";
import AddToCart from "@/components/AddToCart";
import Price from "@/components/Price";
import Stars from "@/components/Stars";
import Reviews from "@/components/Reviews";
import ProductCard from "@/components/ProductCard";
import Accordion from "@/components/Accordion";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = productBySlug(params.slug);
  return p
    ? { title: p.name, description: p.tagline }
    : { title: "المنتج" };
}

const productFaq = [
  { q: "هل المنتج أصلي ومضمون؟", a: "نعم، جميع منتجاتنا أصلية 100% ومختارة بعناية، وآمنة على البشرة. نوفّر لكِ ضمان استرجاع خلال 14 يوماً." },
  { q: "كم تستغرق مدة التوصيل؟", a: "من 1 إلى 3 أيام عمل داخل دول الخليج، ومن 2 إلى 5 أيام داخل مصر، مع رابط لتتبّع شحنتكِ." },
  { q: "هل يتوفر الدفع عند الاستلام؟", a: "نعم، الدفع عند الاستلام متاح، كما نوفّر الدفع الإلكتروني الآمن وخيار التقسيط في دول الخليج." },
];

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = productBySlug(params.slug);
  if (!product) notFound();
  const collection = collectionBySlug(product.collection);
  const related = productsByCollection(product.collection).filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="container-px py-8">
      {/* Breadcrumb */}
      <nav className="mb-5 text-sm text-plum-700/60">
        <Link href="/" className="hover:text-blush-600">الرئيسية</Link> /{" "}
        {collection && (
          <>
            <Link href={`/collections/${collection.slug}`} className="hover:text-blush-600">{collection.name}</Link> /{" "}
          </>
        )}
        <span className="text-plum-800">{product.name}</span>
      </nav>

      {/* Hero */}
      <div className="grid gap-8 md:grid-cols-2">
        <ProductGallery images={product.gallery.length ? product.gallery : [product.image]} alt={product.name} />

        <div className="flex flex-col gap-4">
          <h1 className="font-display text-3xl font-extrabold leading-tight text-plum-900">{product.name}</h1>
          <Stars rating={product.rating} count={product.reviewsCount} />
          <p className="text-lg text-plum-700/80">{product.tagline}</p>
          <Price amount={product.price} compareAt={product.compareAt} className="text-2xl" />

          <ul className="mt-1 space-y-1.5 text-sm text-plum-700/80">
            {product.benefits.slice(0, 4).map((b) => (
              <li key={b} className="flex items-start gap-2">
                <span className="text-blush-600">✦</span> {b}
              </li>
            ))}
          </ul>

          <div className="mt-2">
            <AddToCart product={product} />
          </div>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-plum-700/80">
            <span>✅ دفع عند الاستلام</span>
            <span>🚚 شحن سريع</span>
            <span>🔄 ضمان الاسترجاع 14 يوماً</span>
            <span>✅ منتج أصلي</span>
          </div>
        </div>
      </div>

      {/* Problem → Solution */}
      <section className="mt-14 grid gap-6 rounded-3xl bg-blush-50/70 p-8 md:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl font-bold text-plum-900">المشكلة</h2>
          <p className="mt-3 leading-relaxed text-plum-700/80">{product.problem}</p>
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold text-blush-600">الحل من ليالي</h2>
          <p className="mt-3 leading-relaxed text-plum-700/80">{product.description}</p>
        </div>
      </section>

      {/* Benefits */}
      <section className="mt-12">
        <h2 className="mb-6 text-center font-display text-2xl font-bold text-plum-900">لماذا ستحبّينه؟</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {product.benefits.map((b) => (
            <div key={b} className="card p-5 text-center">
              <div className="mb-2 text-2xl">💎</div>
              <p className="text-sm font-semibold text-plum-800">{b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How to use + ingredients */}
      <section className="mt-12 grid gap-6 md:grid-cols-2">
        <div className="card p-6">
          <h2 className="mb-4 font-display text-xl font-bold text-plum-900">طريقة الاستخدام</h2>
          <ol className="space-y-3">
            {product.howToUse.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blush-600 text-sm font-bold text-white ltr-nums">{i + 1}</span>
                <span className="text-sm text-plum-700/80">{step}</span>
              </li>
            ))}
          </ol>
        </div>
        {product.ingredients && product.ingredients !== "—" && (
          <div className="card p-6">
            <h2 className="mb-4 font-display text-xl font-bold text-plum-900">المكوّنات والأمان</h2>
            <p className="text-sm leading-relaxed text-plum-700/80">{product.ingredients}</p>
            <p className="mt-4 text-sm font-semibold text-blush-600">🌿 مكوّنات آمنة ومناسبة للبشرة الحسّاسة</p>
          </div>
        )}
      </section>

      {/* Reviews */}
      <section className="mt-14">
        <h2 className="mb-6 text-center font-display text-2xl font-bold text-plum-900">تقييمات العميلات</h2>
        <Reviews />
      </section>

      {/* FAQ */}
      <section className="mt-14">
        <h2 className="mb-6 text-center font-display text-2xl font-bold text-plum-900">أسئلة شائعة</h2>
        <Accordion items={productFaq} />
      </section>

      {/* Guarantee */}
      <section className="mt-12 rounded-3xl bg-plum-800 p-8 text-center text-cream">
        <h2 className="font-display text-2xl font-bold">رضاكِ هو أولويتنا 💛</h2>
        <p className="mx-auto mt-3 max-w-xl leading-relaxed text-cream/80">
          نحن في ليالي واثقون من جودة منتجاتنا. إذا لم تكوني راضية تماماً، فريقنا جاهز لمساعدتكِ خلال 14 يوماً من استلام طلبكِ.
          المنتجات المغلقة وغير المستخدمة قابلة للإرجاع، وأي منتج يصلكِ تالفاً أو خاطئاً نستبدله لكِ مجاناً.
        </p>
        <Link href="/policies" className="mt-5 inline-block text-sm font-semibold text-blush-300 hover:underline">
          اقرئي سياسة الإرجاع والشحن كاملة ←
        </Link>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-6 font-display text-2xl font-bold text-plum-900">قد يعجبكِ أيضاً</h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
