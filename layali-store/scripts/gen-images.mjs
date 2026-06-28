// Generates self-hosted, on-brand SVG image assets so the store always renders
// (no external image dependency). Replace these files with real product photos
// later — keep the same filenames and no code changes are needed.
import { mkdirSync, writeFileSync } from "node:fs";

const OUT = new URL("../public/", import.meta.url).pathname;
mkdirSync(OUT + "products", { recursive: true });
mkdirSync(OUT + "collections", { recursive: true });

// id, name, collection — kept in sync with src/data/products.ts
const products = [
  ["sk-vitc-serum", "سيروم فيتامين C للإشراق", "skincare"],
  ["sk-niacinamide", "سيروم نياسيناميد للتحكم بالدهون", "skincare"],
  ["sk-moisturizer", "مرطب الهيالورونيك والسيراميد", "skincare"],
  ["sk-spf50", "واقي الشمس الخفي SPF 50", "skincare"],
  ["fr-hair-mist", "معطر الشعر الفاخر — مسك وعود", "fragrance"],
  ["fr-body-mist-set", "طقم معطرات الجسم للتنسيق", "fragrance"],
  ["fr-perfume-oil", "زيت عطري مركّز رول-أون", "fragrance"],
  ["fr-abaya-spray", "معطر العباية والأقمشة", "fragrance"],
  ["mk-foundation", "كريم أساس مطفي ثابت", "makeup"],
  ["mk-setting-spray", "بخاخ تثبيت المكياج المطفي", "makeup"],
  ["mk-kohl", "كحل مقاوم للماء واللطخات", "makeup"],
  ["mk-lip-oil", "زيت الشفاه المرطّب الملوّن", "makeup"],
  ["hc-argan-serum", "سيروم الأرغان لمنع التجعّد", "haircare"],
  ["hc-hair-mask", "ماسك ترطيب الشعر وفروة الرأس", "haircare"],
  ["hc-heatless-curls", "طقم تجعيد الشعر بلا حرارة", "haircare"],
  ["hc-rosemary-oil", "زيت إكليل الجبل لكثافة الشعر", "haircare"],
  ["tl-hair-styler", "مصفّف الشعر الأيوني اللاسلكي", "tools"],
  ["tl-ice-roller", "رولر التبريد للوجه", "tools"],
  ["tl-ipl", "جهاز إزالة الشعر المنزلي IPL", "tools"],
  ["tl-body-set", "طقم تفتيح وتقشير الجسم", "tools"],
];

const collections = [
  ["skincare", "العناية بالبشرة", "إشراقة تدوم تحت شمس المنطقة"],
  ["fragrance", "العطور ومعطرات الجسم", "روائح فاخرة تبقى طوال اليوم"],
  ["makeup", "المكياج", "ثبات يقاوم الحرارة والرطوبة"],
  ["haircare", "العناية بالشعر", "نعومة ولمعان بلا تجعّد"],
  ["tools", "أدوات الجمال والعناية بالجسم", "تجربة صالون في منزلكِ"],
];

const grad = {
  skincare: ["#fbeaec", "#eeb0ba"],
  fragrance: ["#4a2c3d", "#c69749"],
  makeup: ["#e28396", "#bd4060"],
  haircare: ["#f3e2c8", "#d4af6a"],
  tools: ["#3a2230", "#bd4060"],
  brand: ["#4a2c3d", "#bd4060"],
};

function wrap(text, max = 16) {
  const words = text.replace(/—/g, "·").split(" ");
  const lines = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > max) {
      if (cur) lines.push(cur.trim());
      cur = w;
    } else cur += " " + w;
  }
  if (cur) lines.push(cur.trim());
  return lines.slice(0, 3);
}

function escapeXml(s) {
  return s.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]));
}

function svg({ w = 900, h = 900, colors, title, sub }) {
  const [c1, c2] = colors;
  const dark = c1.startsWith("#4") || c1.startsWith("#3");
  const fg = dark ? "#fbf7f2" : "#3a2230";
  const lines = wrap(title);
  const lineH = 56;
  const startY = h / 2 - ((lines.length - 1) * lineH) / 2 + 10;
  const text = lines
    .map((l, i) => `<text x="50%" y="${startY + i * lineH}" text-anchor="middle" font-family="'Tajawal','Cairo',sans-serif" font-size="44" font-weight="800" fill="${fg}">${escapeXml(l)}</text>`)
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" direction="rtl">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}"/>
      <stop offset="1" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <circle cx="${w / 2}" cy="${h / 2}" r="${w * 0.34}" fill="${dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.35)"}"/>
  <circle cx="${w / 2}" cy="${h * 0.36}" r="${w * 0.14}" fill="${dark ? "rgba(212,175,106,0.25)" : "rgba(189,64,96,0.12)"}"/>
  <text x="50%" y="${h * 0.16}" text-anchor="middle" font-family="'Tajawal','Cairo',sans-serif" font-size="34" font-weight="800" letter-spacing="6" fill="${fg}" opacity="0.85">ليالي</text>
  ${text}
  ${sub ? `<text x="50%" y="${startY + lines.length * lineH + 18}" text-anchor="middle" font-family="'Cairo',sans-serif" font-size="26" fill="${fg}" opacity="0.75">${escapeXml(sub)}</text>` : ""}
</svg>`;
}

for (const [id, name, collection] of products) {
  writeFileSync(`${OUT}products/${id}.svg`, svg({ colors: grad[collection] || grad.brand, title: name }));
}
for (const [slug, name, tagline] of collections) {
  writeFileSync(`${OUT}collections/${slug}.svg`, svg({ colors: grad[slug] || grad.brand, title: name, sub: tagline }));
}
writeFileSync(`${OUT}hero.svg`, svg({ w: 1000, h: 1000, colors: grad.brand, title: "ليالي للجمال", sub: "جمالكِ يبدأ من هنا" }));

console.log(`Generated ${products.length} product + ${collections.length} collection images + hero.`);
