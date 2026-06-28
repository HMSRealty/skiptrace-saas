export default function Stars({ rating, count }: { rating: number; count?: number }) {
  const full = Math.round(rating);
  return (
    <div className="flex items-center gap-1 text-gold-500">
      <span aria-hidden className="text-sm">
        {"★".repeat(full)}
        <span className="text-plum-700/20">{"★".repeat(5 - full)}</span>
      </span>
      <span className="text-xs text-plum-700/70 ltr-nums">
        {rating.toFixed(1)}
        {typeof count === "number" ? ` (${count})` : ""}
      </span>
    </div>
  );
}
