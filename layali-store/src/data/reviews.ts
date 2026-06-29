export interface Review {
  name: string;
  city: string;
  rating: number;
  text: string;
}

// Sample social-proof reviews shown across product pages. Replace with real
// imported reviews (e.g. via Loox/Judge.me) once live.
export const sampleReviews: Review[] = [
  { name: "نورة م.", city: "الرياض", rating: 5, text: "المنتج رهيب وفعلاً النتيجة بانت من أول أسبوع. التوصيل كان سريع والتغليف فخم 😍" },
  { name: "مريم ع.", city: "دبي", rating: 5, text: "جربت منتجات كثيرة وهذا أفضلها صراحة. الرائحة تدوم طويل والملمس خفيف. بطلبه مرة ثانية أكيد." },
  { name: "هبة س.", city: "القاهرة", rating: 4, text: "حلو جداً وسعره مناسب للجودة. وصلني خلال يومين والدفع عند الاستلام ساعدني كثير." },
  { name: "العنود ف.", city: "جدة", rating: 5, text: "تعاملهم راقي وردّوا عليّ بسرعة على الواتساب. المنتج أصلي ومضمون 💛" },
  { name: "سارة خ.", city: "الكويت", rating: 5, text: "أنصح فيه بشدة، النتيجة فاقت توقعاتي والخدمة ممتازة." },
];
