const badges = [
  { icon: "🚚", title: "شحن سريع", sub: "1-3 أيام للخليج · 2-5 لمصر" },
  { icon: "💵", title: "دفع عند الاستلام", sub: "ادفعي بعد ما يوصلكِ" },
  { icon: "🔄", title: "ضمان الاسترجاع", sub: "خلال 14 يوماً" },
  { icon: "✅", title: "منتجات أصلية", sub: "100% مضمونة وآمنة" },
];

export default function TrustBadges() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {badges.map((b) => (
        <div key={b.title} className="card flex items-center gap-3 p-4">
          <span className="text-2xl">{b.icon}</span>
          <div>
            <div className="text-sm font-bold text-plum-800">{b.title}</div>
            <div className="text-xs text-plum-700/60">{b.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
