import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-px py-24 text-center">
      <div className="text-6xl">🌸</div>
      <h1 className="mt-4 font-display text-3xl font-extrabold text-plum-900">الصفحة غير موجودة</h1>
      <p className="mt-2 text-plum-700/70">عذراً، لم نجد ما تبحثين عنه.</p>
      <Link href="/" className="btn-primary mt-6">العودة للرئيسية</Link>
    </div>
  );
}
