import Link from "next/link";
import { brand } from "@/data/config";
import { collections } from "@/data/collections";

export default function Footer() {
  return (
    <footer className="mt-16 bg-plum-900 text-cream/90">
      <div className="container-px grid gap-8 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <div className="font-display text-2xl font-extrabold text-cream">{brand.name}</div>
          <p className="mt-3 text-sm leading-relaxed text-cream/70">
            مستحضرات تجميل وعناية وعطور فاخرة، مختارة بعناية لجمالكِ. منتجات أصلية وشحن سريع لمصر والخليج.
          </p>
        </div>

        <div>
          <h4 className="mb-3 font-bold text-cream">التشكيلات</h4>
          <ul className="space-y-2 text-sm text-cream/70">
            {collections.map((c) => (
              <li key={c.slug}>
                <Link href={`/collections/${c.slug}`} className="hover:text-blush-300">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-bold text-cream">روابط مهمة</h4>
          <ul className="space-y-2 text-sm text-cream/70">
            <li><Link href="/about" className="hover:text-blush-300">من نحن</Link></li>
            <li><Link href="/faq" className="hover:text-blush-300">الأسئلة الشائعة</Link></li>
            <li><Link href="/policies" className="hover:text-blush-300">سياسة الإرجاع والشحن</Link></li>
            <li><Link href="/cart" className="hover:text-blush-300">سلة التسوّق</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-bold text-cream">تواصلي معنا</h4>
          <ul className="space-y-2 text-sm text-cream/70">
            <li>📱 واتساب: <span className="ltr-nums">+{brand.whatsapp}</span></li>
            <li>📧 {brand.email}</li>
            <li>📷 إنستغرام: @{brand.instagram}</li>
            <li>🎵 تيك توك: @{brand.tiktok}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <p className="container-px py-4 text-center text-xs text-cream/60">
          © {new Date().getFullYear()} {brand.name} — جميع الحقوق محفوظة · الدفع عند الاستلام · شحن سريع
        </p>
      </div>
    </footer>
  );
}
