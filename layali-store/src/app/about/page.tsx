import type { Metadata } from "next";
import { brand } from "@/data/config";

export const metadata: Metadata = { title: "من نحن" };

export default function AboutPage() {
  return (
    <div className="container-px py-12">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-display text-3xl font-extrabold text-plum-900">من نحن</h1>
        <p className="mt-6 text-lg leading-relaxed text-plum-700/80">
          في {brand.name} نؤمن أن كل امرأة عربية تستحق منتجات تجميل فاخرة، آمنة، وموثوقة تصل إلى بابها بسهولة.
          نختار لكِ بعناية أفضل مستحضرات العناية والعطور التي تناسب بشرتكِ ومناخكِ، لنمنحكِ ثقة وإشراقة تدوم.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-3">
        {[
          { icon: "💎", t: "جودة فاخرة", d: "منتجات أصلية مختارة بعناية ومعايير صارمة" },
          { icon: "🤝", t: "خدمة موثوقة", d: "دفع عند الاستلام ودعم سريع عبر واتساب" },
          { icon: "🚚", t: "شحن سريع", d: "توصيل لمصر والخليج خلال أيام قليلة" },
        ].map((c) => (
          <div key={c.t} className="card p-6 text-center">
            <div className="text-3xl">{c.icon}</div>
            <h3 className="mt-2 font-bold text-plum-800">{c.t}</h3>
            <p className="mt-1 text-sm text-plum-700/70">{c.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
