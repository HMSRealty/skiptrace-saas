import { sampleReviews } from "@/data/reviews";
import Stars from "./Stars";

export default function Reviews() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {sampleReviews.map((r, i) => (
        <div key={i} className="card p-5">
          <div className="mb-2 flex items-center justify-between">
            <div className="font-bold text-plum-800">{r.name}</div>
            <Stars rating={r.rating} />
          </div>
          <p className="text-sm leading-relaxed text-plum-700/80">{r.text}</p>
          <div className="mt-3 text-xs text-plum-700/50">📍 {r.city} · مشترٍ موثّق</div>
        </div>
      ))}
    </div>
  );
}
