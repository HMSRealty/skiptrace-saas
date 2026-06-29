import type { Metadata } from "next";
import { brand } from "@/data/config";

export const metadata: Metadata = { title: "سياسة الإرجاع والشحن" };

export default function PoliciesPage() {
  return (
    <div className="container-px py-12">
      <div className="mx-auto max-w-3xl space-y-10">
        <h1 className="text-center font-display text-3xl font-extrabold text-plum-900">سياسة الإرجاع والشحن</h1>

        <section className="card p-6">
          <h2 className="mb-3 font-display text-xl font-bold text-blush-600">ضمان الرضا التام 💛</h2>
          <p className="leading-relaxed text-plum-700/80">
            نحن في {brand.name} واثقون من جودة منتجاتنا. إذا لم تكوني راضية تماماً، فريق خدمة العملاء لدينا جاهز
            لمساعدتكِ خلال 14 يوماً من استلام طلبكِ. هدفنا الوحيد هو إسعادكِ.
          </p>
        </section>

        <section className="card p-6">
          <h2 className="mb-3 font-display text-xl font-bold text-plum-900">سياسة الإرجاع والاستبدال</h2>
          <p className="mb-4 leading-relaxed text-plum-700/80">
            حرصاً على سلامة وصحة جميع عميلاتنا، ولأسباب تتعلق بالنظافة، نتّبع السياسة التالية:
          </p>
          <h3 className="mb-2 font-bold text-green-700">✅ يمكن إرجاع المنتج أو استبداله إذا:</h3>
          <ul className="mb-4 list-disc space-y-1 pr-6 text-sm text-plum-700/80">
            <li>كان المنتج مغلقاً وغير مستخدم وبختمه الأصلي سليماً.</li>
            <li>وصلكِ المنتج تالفاً أو معيباً أو مختلفاً عن طلبكِ.</li>
            <li>تم تقديم طلب الإرجاع خلال 14 يوماً من تاريخ الاستلام مع إثبات الشراء.</li>
          </ul>
          <h3 className="mb-2 font-bold text-blush-600">❌ لا يمكن إرجاع المنتجات التي:</h3>
          <ul className="list-disc space-y-1 pr-6 text-sm text-plum-700/80">
            <li>تم فتحها أو استخدامها (مثل العطور، السيرومات، الكريمات، المكياج) — لأسباب صحية ومعايير النظافة.</li>
            <li>تم إزالة الختم أو التغليف الواقي الخاص بها.</li>
          </ul>
        </section>

        <section className="card p-6">
          <h2 className="mb-3 font-display text-xl font-bold text-plum-900">في حال وصول منتج تالف أو خاطئ</h2>
          <p className="leading-relaxed text-plum-700/80">
            تواصلي معنا عبر الواتساب خلال 48 ساعة من الاستلام مع صورة للمنتج، وسنستبدله لكِ مجاناً أو نعيد لكِ
            المبلغ بالكامل دون أي عناء. 💛
          </p>
          <p className="mt-3 text-sm font-semibold text-blush-600">📲 للتواصل: واتساب +{brand.whatsapp}</p>
        </section>

        <section className="card p-6">
          <h2 className="mb-3 font-display text-xl font-bold text-plum-900">الشحن والتوصيل</h2>
          <ul className="list-disc space-y-1 pr-6 text-sm text-plum-700/80">
            <li>دول الخليج: من 1 إلى 3 أيام عمل.</li>
            <li>مصر: من 2 إلى 5 أيام عمل.</li>
            <li>شحن مجاني للطلبات التي تتجاوز الحد الموضّح في أعلى المتجر.</li>
            <li>يتوفّر الدفع عند الاستلام، والدفع الإلكتروني الآمن، والتقسيط في دول الخليج.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
