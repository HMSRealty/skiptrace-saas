import { CurrencyCode, currencies } from "./config";

export interface Product {
  id: string;
  slug: string;
  name: string; // Arabic
  tagline: string; // short Arabic hook
  collection: string; // collection slug
  price: number; // base price in SAR
  compareAt?: number; // crossed-out price in SAR
  image: string;
  gallery: string[];
  // AIDA-style description blocks (Arabic)
  problem: string;
  description: string;
  benefits: string[];
  howToUse: string[];
  ingredients: string;
  rating: number;
  reviewsCount: number;
  badges?: string[]; // e.g. "الأكثر مبيعاً"
  bestSeller?: boolean;
}

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

export const products: Product[] = [
  // ----------------------------- SKINCARE -----------------------------
  {
    id: "sk-vitc-serum",
    slug: "vitamin-c-brightening-serum",
    name: "سيروم فيتامين C للإشراق",
    tagline: "وداعاً للبقع الداكنة وبشرة باهتة",
    collection: "skincare",
    price: 119,
    compareAt: 179,
    image: img("photo-1620916566398-39f1143ab7be"),
    gallery: [img("photo-1620916566398-39f1143ab7be"), img("photo-1556228578-8c89e6adf883")],
    problem: "هل تعانين من بقع داكنة وبشرة باهتة بسبب التعرّض المستمر للشمس؟",
    description:
      "سيروم فيتامين C المركّز من ليالي يوحّد لون البشرة، يقلّل البقع الداكنة، ويمنحكِ إشراقة صحية تدوم. تركيبة خفيفة سريعة الامتصاص مناسبة للاستخدام اليومي تحت واقي الشمس.",
    benefits: [
      "يوحّد لون البشرة ويقلّل التصبّغات",
      "إشراقة فورية ونضارة ملحوظة",
      "مضاد للأكسدة يحمي من أضرار الشمس",
      "خفيف وسريع الامتصاص بلا لزوجة",
    ],
    howToUse: ["نظّفي بشرتكِ وجفّفيها", "ضعي 3-4 قطرات صباحاً على الوجه والرقبة", "اتبعيه بمرطب وواقي شمس"],
    ingredients: "Vitamin C (Sodium Ascorbyl Phosphate)، حمض الهيالورونيك، فيتامين E. خالٍ من البارابين.",
    rating: 4.8,
    reviewsCount: 327,
    badges: ["الأكثر مبيعاً"],
    bestSeller: true,
  },
  {
    id: "sk-niacinamide",
    slug: "niacinamide-oil-control-serum",
    name: "سيروم نياسيناميد للتحكم بالدهون",
    tagline: "بشرة مطفية بلا لمعان في الجو الحار",
    collection: "skincare",
    price: 99,
    compareAt: 149,
    image: img("photo-1611080626919-7cf5a9dbab5b"),
    gallery: [img("photo-1611080626919-7cf5a9dbab5b"), img("photo-1612817288484-6f916006741a")],
    problem: "لمعان زائد ومسام واسعة بسبب الرطوبة والحرارة؟",
    description:
      "سيروم النياسيناميد 10% يضبط إفراز الدهون، يصغّر المسام، ويمنح بشرتكِ مظهراً مطفياً ومتوازناً طوال اليوم حتى في أشدّ الأجواء حرارة ورطوبة.",
    benefits: ["يقلّل اللمعان والدهون الزائدة", "يصغّر مظهر المسام الواسعة", "يوحّد الملمس والمظهر", "يقوّي حاجز البشرة"],
    howToUse: ["بعد التنظيف، ضعي بضع قطرات صباحاً ومساءً", "دلّكي بلطف حتى الامتصاص", "اتبعيه بمرطب"],
    ingredients: "Niacinamide 10%، الزنك، حمض الهيالورونيك. خالٍ من الكحول.",
    rating: 4.7,
    reviewsCount: 211,
  },
  {
    id: "sk-moisturizer",
    slug: "hyaluronic-ceramide-moisturizer",
    name: "مرطب الهيالورونيك والسيراميد",
    tagline: "ترطيب عميق يقاوم جفاف المكيّفات",
    collection: "skincare",
    price: 129,
    image: img("photo-1556228453-efd6c1ff04f6"),
    gallery: [img("photo-1556228453-efd6c1ff04f6"), img("photo-1571781926291-c477ebfd024b")],
    problem: "بشرتكِ تجفّ بين تكييف البيت وحرارة الخارج؟",
    description:
      "مرطب غني بحمض الهيالورونيك والسيراميد يرطّب بعمق ويحبس الترطيب لساعات طويلة، فيعيد لبشرتكِ نعومتها ومرونتها دون أي ملمس دهني.",
    benefits: ["ترطيب يدوم 24 ساعة", "يقوّي حاجز البشرة", "ينعّم ويملأ الخطوط الدقيقة", "ملمس خفيف غير دهني"],
    howToUse: ["ضعي كمية مناسبة صباحاً ومساءً", "دلّكي بحركات دائرية لطيفة"],
    ingredients: "Hyaluronic Acid، Ceramides، Glycerin، Shea Butter.",
    rating: 4.9,
    reviewsCount: 184,
  },
  {
    id: "sk-spf50",
    slug: "invisible-sunscreen-spf50",
    name: "واقي الشمس الخفي SPF 50",
    tagline: "حماية عالية بلا أثر أبيض",
    collection: "skincare",
    price: 109,
    compareAt: 139,
    image: img("photo-1556228841-a3c527ebefe5"),
    gallery: [img("photo-1556228841-a3c527ebefe5"), img("photo-1620916297612-71d8d6f5b1a6")],
    problem: "تتجنّبين واقي الشمس بسبب الطبقة البيضاء واللزوجة؟",
    description:
      "واقي شمس بحماية SPF 50 بتركيبة خفيفة شفافة تماماً تمتصّها البشرة فوراً دون أثر أبيض أو لمعان، ليكون خطوتكِ الأهم ضد التصبّغ وعلامات التقدّم في السن.",
    benefits: ["حماية واسعة SPF 50", "بلا أثر أبيض وبلا لزوجة", "مناسب كأساس تحت المكياج", "يقي من التصبّغ والشيخوخة المبكرة"],
    howToUse: ["ضعيه كخطوة أخيرة صباحاً", "أعيدي التطبيق كل ساعتين عند التعرّض للشمس"],
    ingredients: "فلاتر شمسية حديثة، فيتامين E، النياسيناميد.",
    rating: 4.8,
    reviewsCount: 263,
    badges: ["موصى به"],
  },
  // ----------------------------- FRAGRANCE -----------------------------
  {
    id: "fr-hair-mist",
    slug: "luxury-hair-mist",
    name: "معطر الشعر الفاخر — مسك وعود",
    tagline: "رائحة تدوم حتى 12 ساعة",
    collection: "fragrance",
    price: 139,
    compareAt: 199,
    image: img("photo-1592945403244-b3fbafd7f539"),
    gallery: [img("photo-1592945403244-b3fbafd7f539"), img("photo-1588405748880-12d1d2a59d75")],
    problem: "هل يختفي عطركِ بعد ساعات قليلة في حرارة المنطقة؟",
    description:
      "معطر الشعر الفاخر من ليالي بتركيبة غنية بالمسك والعود الراقي، يمنح شعركِ رائحة فوّاحة أنيقة تدوم حتى 12 ساعة. خفيف، خالٍ من الكحول المجفّف، ويترك خصلاتكِ ناعمة ولامعة.",
    benefits: ["رائحة فاخرة تدوم طوال اليوم", "خالٍ من الكحول المجفّف — مناسب للمحجبات", "يرطّب ويضيف لمعاناً للشعر", "حجم عملي يناسب حقيبتكِ"],
    howToUse: ["رشّي على بُعد 20 سم من الشعر", "وزّعي بأصابعكِ بلطف", "أعيدي التطبيق عند الحاجة لتجديد الرائحة"],
    ingredients: "تركيبة عطرية خالية من الكحول، مكوّنات مرطّبة للشعر.",
    rating: 4.9,
    reviewsCount: 412,
    badges: ["الأكثر مبيعاً"],
    bestSeller: true,
  },
  {
    id: "fr-body-mist-set",
    slug: "body-mist-layering-set",
    name: "طقم معطرات الجسم للتنسيق",
    tagline: "نسّقي رائحتكِ المميزة",
    collection: "fragrance",
    price: 159,
    compareAt: 219,
    image: img("photo-1615634260167-c8cdede054de"),
    gallery: [img("photo-1615634260167-c8cdede054de"), img("photo-1592945403244-b3fbafd7f539")],
    problem: "تبحثين عن رائحة منعشة تدوم وتجدّدينها بسهولة خلال اليوم؟",
    description:
      "طقم من معطرات الجسم بأحجام عملية يتيح لكِ تنسيق روائحكِ الخاصة وتجديد انتعاشكِ في أي وقت، بتركيبة لطيفة على البشرة ومناسبة للأجواء الحارة.",
    benefits: ["3 روائح متناسقة قابلة للدمج", "أحجام سفر عملية", "انتعاش يدوم", "لطيف على البشرة"],
    howToUse: ["رشّي على الجسم بعد الاستحمام", "أعيدي التطبيق خلال اليوم للانتعاش"],
    ingredients: "تركيبات عطرية لطيفة على البشرة.",
    rating: 4.6,
    reviewsCount: 138,
  },
  {
    id: "fr-perfume-oil",
    slug: "concentrated-perfume-oil-rollon",
    name: "زيت عطري مركّز (مخلّط) رول-أون",
    tagline: "عطر مركّز خالٍ من الكحول",
    collection: "fragrance",
    price: 89,
    image: img("photo-1547887538-e3a2f32cb1cc"),
    gallery: [img("photo-1547887538-e3a2f32cb1cc"), img("photo-1588405748880-12d1d2a59d75")],
    problem: "تفضّلين عطراً مركّزاً يدوم بلا كحول وسهل التطبيق؟",
    description:
      "زيت عطري مركّز برائحة المخلّط الشرقي الفاخر، خالٍ من الكحول وبتركيز عالٍ يدوم طويلاً. عبوة رول-أون أنيقة لإعادة تطبيق سهلة وراقية أينما كنتِ.",
    benefits: ["تركيز عالٍ يدوم طويلاً", "خالٍ من الكحول — لطيف على البشرة", "عبوة رول-أون عملية", "رائحة شرقية فاخرة"],
    howToUse: ["مرّري على مواضع النبض (الرسغ، خلف الأذن)", "أعيدي عند الحاجة"],
    ingredients: "زيوت عطرية مركّزة، زيت ناقل لطيف.",
    rating: 4.8,
    reviewsCount: 176,
  },
  {
    id: "fr-abaya-spray",
    slug: "abaya-linen-fragrance-spray",
    name: "معطر العباية والأقمشة",
    tagline: "عباية منعشة بلا غسيل متكرّر",
    collection: "fragrance",
    price: 79,
    compareAt: 109,
    image: img("photo-1610113137429-3bb3a8c4ca9a"),
    gallery: [img("photo-1610113137429-3bb3a8c4ca9a"), img("photo-1615634260167-c8cdede054de")],
    problem: "تريدين إبقاء عباياتكِ وملابسكِ منعشة في الحرّ؟",
    description:
      "بخاخ معطّر للأقمشة والعباية يمنح ملابسكِ رائحة فاخرة منعشة تدوم، دون أن يترك بقعاً، ليبقى مظهركِ ورائحتكِ في أبهى حال طوال اليوم.",
    benefits: ["رائحة تدوم على الأقمشة", "لا يترك بقعاً", "منعش مثالي للأجواء الحارة", "اقتصادي وعملي"],
    howToUse: ["رشّي على بُعد 25 سم من القماش", "اتركيه يجفّ قبل الارتداء"],
    ingredients: "تركيبة معطّرة آمنة على الأقمشة.",
    rating: 4.7,
    reviewsCount: 94,
  },
  // ----------------------------- MAKEUP -----------------------------
  {
    id: "mk-foundation",
    slug: "longwear-matte-foundation",
    name: "كريم أساس مطفي ثابت",
    tagline: "ثبات يقاوم الحرارة والعرق",
    collection: "makeup",
    price: 129,
    compareAt: 169,
    image: img("photo-1631214540242-3cd8c4b0b3c8"),
    gallery: [img("photo-1631214540242-3cd8c4b0b3c8"), img("photo-1596462502278-27bfdc403348")],
    problem: "هل يذوب مكياجكِ في حرارة 40 درجة؟",
    description:
      "كريم أساس بتغطية كاملة ولمسة مطفية يقاوم الحرارة والعرق لساعات طويلة، فيمنحكِ بشرة متجانسة مثالية لا تذوب ولا تتأكسد مهما طال اليوم.",
    benefits: ["ثبات طويل يقاوم العرق والحرارة", "تغطية كاملة قابلة للبناء", "لمسة مطفية طبيعية", "لا يتأكسد ولا يغيّر لونه"],
    howToUse: ["وزّعي كمية صغيرة بالإسفنجة أو الفرشاة", "ابني التغطية حسب الحاجة", "ثبّتيه ببخاخ التثبيت"],
    ingredients: "تركيبة طويلة الثبات، مقاومة للماء والعرق.",
    rating: 4.7,
    reviewsCount: 205,
  },
  {
    id: "mk-setting-spray",
    slug: "matte-setting-spray",
    name: "بخاخ تثبيت المكياج المطفي",
    tagline: "يثبّت مكياجكِ ضد الرطوبة",
    collection: "makeup",
    price: 89,
    image: img("photo-1512496015851-a90fb38ba796"),
    gallery: [img("photo-1512496015851-a90fb38ba796"), img("photo-1596462502278-27bfdc403348")],
    problem: "مكياجكِ لا يصمد أمام الحرارة والرطوبة؟",
    description:
      "بخاخ تثبيت بلمسة مطفية يقفل مكياجكِ ويمنع انتقاله أو ذوبانه، ليبقى مثالياً وثابتاً طوال اليوم في أصعب الأجواء.",
    benefits: ["تثبيت يدوم لساعات", "مقاوم للرطوبة والعرق", "لمسة مطفية منعشة", "يمنع انتقال المكياج"],
    howToUse: ["أغمضي عينيكِ ورشّيه على بُعد 25 سم بعد المكياج", "اتركيه يجفّ"],
    ingredients: "تركيبة تثبيت لطيفة على البشرة.",
    rating: 4.6,
    reviewsCount: 121,
  },
  {
    id: "mk-kohl",
    slug: "waterproof-smudgeproof-kohl",
    name: "كحل مقاوم للماء واللطخات",
    tagline: "عيون مثالية لا تسيل أبداً",
    collection: "makeup",
    price: 59,
    compareAt: 89,
    image: img("photo-1583241800698-9c2e0f0f0f0f"),
    gallery: [img("photo-1583241800698-9c2e0f0f0f0f"), img("photo-1487412947147-5cebf100ffc2")],
    problem: "يسيل الكحل ويلطّخ عينيكِ مع الحرّ؟",
    description:
      "كحل أسود كثيف مقاوم للماء واللطخات يمنحكِ عيوناً ساحرة ثابتة طوال اليوم، بتركيبة ناعمة سهلة التطبيق لا تسيل ولا تتلطّخ.",
    benefits: ["لون أسود مكثّف", "مقاوم للماء واللطخات", "ثبات طوال اليوم", "تطبيق ناعم وسلس"],
    howToUse: ["مرّري الكحل على خط الرموش", "حدّدي حسب رغبتكِ"],
    ingredients: "تركيبة مقاومة للماء، لطيفة على العين.",
    rating: 4.8,
    reviewsCount: 298,
    badges: ["الأكثر مبيعاً"],
    bestSeller: true,
  },
  {
    id: "mk-lip-oil",
    slug: "hydrating-tinted-lip-oil",
    name: "زيت الشفاه المرطّب الملوّن",
    tagline: "لمعة طبيعية وترطيب فائق",
    collection: "makeup",
    price: 69,
    image: img("photo-1586495777744-4413f21062fa"),
    gallery: [img("photo-1586495777744-4413f21062fa"), img("photo-1487412947147-5cebf100ffc2")],
    problem: "شفاه جافة وتبحثين عن لون طبيعي ناعم؟",
    description:
      "زيت شفاه مرطّب بلون خفيف يمنح شفتيكِ لمعة طبيعية ساحرة وترطيباً عميقاً يدوم، لإطلالة نهارية أنيقة وملمس ناعم غير لزج.",
    benefits: ["ترطيب عميق يدوم", "لون طبيعي بلمعة راقية", "ملمس ناعم غير لزج", "يغذّي الشفاه"],
    howToUse: ["مرّري الأبليكاتور على الشفاه", "أعيدي عند الحاجة"],
    ingredients: "زيوت مغذّية، فيتامين E.",
    rating: 4.7,
    reviewsCount: 152,
  },
  // ----------------------------- HAIRCARE -----------------------------
  {
    id: "hc-argan-serum",
    slug: "anti-frizz-argan-serum",
    name: "سيروم الأرغان لمنع التجعّد",
    tagline: "شعر أملس لامع بلا هيشان",
    collection: "haircare",
    price: 99,
    compareAt: 139,
    image: img("photo-1522338242992-e1a54906a8da"),
    gallery: [img("photo-1522338242992-e1a54906a8da"), img("photo-1620331317314-3f5f0b3f0b3f")],
    problem: "يعاني شعركِ من الهيشان بسبب الرطوبة والمياه العسرة؟",
    description:
      "سيروم الأرغان والكيراتين يروّض الهيشان فوراً ويمنح شعركِ نعومة ولمعاناً صحياً، مع حماية من الحرارة والرطوبة لإطلالة مثالية تدوم.",
    benefits: ["يمنع التجعّد والهيشان", "نعومة ولمعان فوري", "حماية من الحرارة", "خفيف غير دهني"],
    howToUse: ["ضعي بضع قطرات على الشعر الرطب أو الجاف", "ركّزي على الأطراف"],
    ingredients: "زيت الأرغان، الكيراتين، فيتامين E.",
    rating: 4.8,
    reviewsCount: 241,
    badges: ["موصى به"],
  },
  {
    id: "hc-hair-mask",
    slug: "hydrating-hair-scalp-mask",
    name: "ماسك ترطيب الشعر وفروة الرأس",
    tagline: "تغذية عميقة بعد الشمس",
    collection: "haircare",
    price: 119,
    image: img("photo-1626015449072-0f0b3f0b3f0b"),
    gallery: [img("photo-1626015449072-0f0b3f0b3f0b"), img("photo-1522338242992-e1a54906a8da")],
    problem: "شعر جافّ ومتضرّر من الشمس والغسيل المتكرّر؟",
    description:
      "ماسك مكثّف يرطّب ويغذّي الشعر وفروة الرأس بعمق، يصلح التلف الناتج عن الشمس ويعيد للشعر حيويته ولمعانه من أول استخدام.",
    benefits: ["ترطيب وتغذية عميقة", "يصلح التلف والجفاف", "يهدّئ فروة الرأس", "نتائج من أول استخدام"],
    howToUse: ["ضعيه على الشعر النظيف الرطب", "اتركيه 5-10 دقائق ثم اشطفيه"],
    ingredients: "زبدة الشيا، زيوت طبيعية، بروتينات مغذّية.",
    rating: 4.7,
    reviewsCount: 133,
  },
  {
    id: "hc-heatless-curls",
    slug: "heatless-curling-set",
    name: "طقم تجعيد الشعر بلا حرارة",
    tagline: "كيرلي ناعم يحمي شعركِ",
    collection: "haircare",
    price: 79,
    compareAt: 119,
    image: img("photo-1599387737838-626f4cccd06c"),
    gallery: [img("photo-1599387737838-626f4cccd06c"), img("photo-1522338242992-e1a54906a8da")],
    problem: "تريدين تموّجات جميلة دون إتلاف شعركِ بالحرارة؟",
    description:
      "طقم تجعيد بلا حرارة من الساتان يمنحكِ تموّجات ناعمة طبيعية أثناء النوم، فتستيقظين بشعر منسّق صحّي دون أي ضرر حراري.",
    benefits: ["تموّجات بلا حرارة", "يحمي الشعر من التلف", "خامة ساتان لطيفة", "سهل الاستخدام أثناء النوم"],
    howToUse: ["لفّي خصلات الشعر الرطب حول الأداة قبل النوم", "فكّيها صباحاً"],
    ingredients: "خامة ساتان عالية الجودة.",
    rating: 4.6,
    reviewsCount: 187,
  },
  {
    id: "hc-rosemary-oil",
    slug: "rosemary-hair-growth-oil",
    name: "زيت إكليل الجبل لكثافة الشعر",
    tagline: "شعر أكثف وأقوى",
    collection: "haircare",
    price: 89,
    compareAt: 129,
    image: img("photo-1608248543803-ba4f8c70ae0b"),
    gallery: [img("photo-1608248543803-ba4f8c70ae0b"), img("photo-1522338242992-e1a54906a8da")],
    problem: "قلق من تساقط الشعر وضعف كثافته؟",
    description:
      "زيت إكليل الجبل الغني يحفّز فروة الرأس، يقوّي البصيلات، ويعزّز كثافة الشعر ونموّه الصحّي مع الاستخدام المنتظم.",
    benefits: ["يحفّز نمو الشعر", "يقوّي البصيلات ويقلّل التساقط", "يغذّي فروة الرأس", "مكوّنات طبيعية"],
    howToUse: ["دلّكي فروة الرأس بكمية مناسبة", "اتركيه ساعة أو طوال الليل ثم اغسليه", "كرّري 3 مرات أسبوعياً"],
    ingredients: "زيت إكليل الجبل، زيوت طبيعية مغذّية.",
    rating: 4.7,
    reviewsCount: 264,
    badges: ["الأكثر مبيعاً"],
    bestSeller: true,
  },
  // ----------------------------- TOOLS -----------------------------
  {
    id: "tl-hair-styler",
    slug: "cordless-ionic-hair-styler",
    name: "مصفّف الشعر الأيوني اللاسلكي",
    tagline: "تسريحة صالون في منزلكِ",
    collection: "tools",
    price: 349,
    compareAt: 499,
    image: img("photo-1522338140262-f46f5913618a"),
    gallery: [img("photo-1522338140262-f46f5913618a"), img("photo-1560066984-138dadb4c035")],
    problem: "تريدين تسريحة احترافية دون الذهاب للصالون؟",
    description:
      "مصفّف شعر أيوني لاسلكي متعدّد الرؤوس يمنحكِ تنعيماً وتجعيداً احترافياً بتقنية تحمي شعركِ من التلف، لإطلالة صالون أينما كنتِ.",
    benefits: ["لاسلكي قابل لإعادة الشحن", "رؤوس متعدّدة للتنعيم والتجعيد", "تقنية أيونية تقلّل الهيشان", "تسخين سريع وآمن"],
    howToUse: ["اشحنيه قبل الاستخدام", "اختاري الرأس المناسب والحرارة", "صفّفي خصلات صغيرة للحصول على أفضل نتيجة"],
    ingredients: "—",
    rating: 4.8,
    reviewsCount: 156,
    badges: ["الأعلى قيمة"],
    bestSeller: true,
  },
  {
    id: "tl-ice-roller",
    slug: "facial-ice-roller",
    name: "رولر التبريد للوجه",
    tagline: "ينعش ويشدّ البشرة فوراً",
    collection: "tools",
    price: 69,
    compareAt: 99,
    image: img("photo-1570172619644-dfd03ed5d881"),
    gallery: [img("photo-1570172619644-dfd03ed5d881"), img("photo-1556228720-195a672e8a03")],
    problem: "انتفاخ وإرهاق في البشرة بسبب الحرّ والسهر؟",
    description:
      "رولر التبريد يهدّئ البشرة، يقلّل الانتفاخ والهالات، ويغلق المسام مع إحساس منعش فوري — مثالي للأجواء الحارة وروتين الصباح.",
    benefits: ["يقلّل الانتفاخ والهالات", "يهدّئ ويغلق المسام", "إنعاش فوري للبشرة", "سهل الاستخدام يومياً"],
    howToUse: ["ضعيه في الثلاجة", "مرّريه بلطف على الوجه والرقبة لبضع دقائق"],
    ingredients: "—",
    rating: 4.6,
    reviewsCount: 119,
  },
  {
    id: "tl-ipl",
    slug: "at-home-ipl-hair-removal",
    name: "جهاز إزالة الشعر المنزلي IPL",
    tagline: "بشرة ناعمة دائمة في المنزل",
    collection: "tools",
    price: 399,
    compareAt: 599,
    image: img("photo-1598440947619-2c35fc9aa908"),
    gallery: [img("photo-1598440947619-2c35fc9aa908"), img("photo-1556228720-195a672e8a03")],
    problem: "سئمتِ من تكاليف ومواعيد الصالون لإزالة الشعر؟",
    description:
      "جهاز IPL منزلي يقلّل نمو الشعر تدريجياً بنتائج تدوم، بخصوصية وراحة في منزلكِ وبتكلفة أوفر بكثير من جلسات الصالون.",
    benefits: ["نتائج تدوم مع الاستخدام المنتظم", "آمن لمناطق الجسم المختلفة", "بخصوصية وراحة منزلكِ", "أوفر من الصالون على المدى الطويل"],
    howToUse: ["نظّفي واحلقي المنطقة", "اختاري المستوى المناسب ومرّري الجهاز", "كرّري حسب الإرشادات"],
    ingredients: "—",
    rating: 4.7,
    reviewsCount: 203,
    badges: ["الأعلى قيمة"],
  },
  {
    id: "tl-body-set",
    slug: "body-brightening-exfoliating-set",
    name: "طقم تفتيح وتقشير الجسم",
    tagline: "بشرة موحّدة ناعمة قبل المناسبات",
    collection: "tools",
    price: 99,
    compareAt: 149,
    image: img("photo-1608248597279-f99d160bfcbc"),
    gallery: [img("photo-1608248597279-f99d160bfcbc"), img("photo-1556228720-195a672e8a03")],
    problem: "تريدين بشرة جسم موحّدة وناعمة استعداداً للمناسبات؟",
    description:
      "طقم متكامل للتقشير والتفتيح يزيل خلايا الجلد الميت ويوحّد لون بشرة الجسم، ليمنحكِ نعومة وإشراقة مثالية لطقوس العناية قبل المناسبات.",
    benefits: ["يقشّر ويزيل الجلد الميت", "يوحّد لون بشرة الجسم", "نعومة وإشراقة فورية", "طقم متكامل بقيمة مميزة"],
    howToUse: ["استخدمي المقشّر على بشرة رطبة بحركات دائرية", "اشطفي وتابعي بمرطّب الجسم"],
    ingredients: "مكوّنات مقشّرة ومرطّبة لطيفة.",
    rating: 4.6,
    reviewsCount: 108,
  },
];

// Use self-hosted, on-brand image assets so the store always renders with no
// external dependency (generated by scripts/gen-images.mjs). To use real
// photos, drop a file at public/products/<id>.(jpg|png|svg) and point here.
for (const p of products) {
  p.image = `/products/${p.id}.svg`;
  p.gallery = [`/products/${p.id}.svg`];
}

// Egypt-native value pricing (EGP), set per Module 4 (value tier) rather than
// converted from Gulf prices. Gulf prices (SAR) live on each product; AED is
// derived. Keys are product ids.
const egpPricing: Record<string, { price: number; compareAt?: number }> = {
  "sk-vitc-serum": { price: 399, compareAt: 599 },
  "sk-niacinamide": { price: 349, compareAt: 499 },
  "sk-moisturizer": { price: 449 },
  "sk-spf50": { price: 379, compareAt: 549 },
  "fr-hair-mist": { price: 499, compareAt: 749 },
  "fr-body-mist-set": { price: 549, compareAt: 799 },
  "fr-perfume-oil": { price: 299 },
  "fr-abaya-spray": { price: 279, compareAt: 399 },
  "mk-foundation": { price: 449, compareAt: 649 },
  "mk-setting-spray": { price: 299 },
  "mk-kohl": { price: 199, compareAt: 299 },
  "mk-lip-oil": { price: 249 },
  "hc-argan-serum": { price: 349, compareAt: 499 },
  "hc-hair-mask": { price: 399 },
  "hc-heatless-curls": { price: 279, compareAt: 399 },
  "hc-rosemary-oil": { price: 299, compareAt: 449 },
  "tl-hair-styler": { price: 1299, compareAt: 1899 },
  "tl-ice-roller": { price: 249, compareAt: 349 },
  "tl-ipl": { price: 1499, compareAt: 2199 },
  "tl-body-set": { price: 349, compareAt: 499 },
};

// Concrete price per currency (no live conversion at display time).
export function priceMap(p: Product): Record<CurrencyCode, number> {
  const egp = egpPricing[p.id];
  return {
    SAR: p.price,
    AED: Math.round(p.price * currencies.AED.rate),
    EGP: egp ? egp.price : Math.round(p.price * currencies.EGP.rate),
  };
}

// Concrete compare-at (strike-through) price per currency, or undefined.
export function compareMap(p: Product): Record<CurrencyCode, number> | undefined {
  const egp = egpPricing[p.id];
  if (!p.compareAt && !egp?.compareAt) return undefined;
  return {
    SAR: p.compareAt ?? 0,
    AED: p.compareAt ? Math.round(p.compareAt * currencies.AED.rate) : 0,
    EGP: egp?.compareAt ?? (p.compareAt ? Math.round(p.compareAt * currencies.EGP.rate) : 0),
  };
}

export const productBySlug = (slug: string) =>
  products.find((p) => p.slug === slug);

export const productsByCollection = (slug: string) =>
  products.filter((p) => p.collection === slug);

export const bestSellers = () => products.filter((p) => p.bestSeller);
