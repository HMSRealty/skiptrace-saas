export interface Collection {
  slug: string;
  name: string; // Arabic
  tagline: string; // Arabic
  image: string;
}

export const collections: Collection[] = [
  {
    slug: "skincare",
    name: "العناية بالبشرة",
    tagline: "إشراقة تدوم تحت شمس المنطقة",
    image:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "fragrance",
    name: "العطور ومعطرات الجسم",
    tagline: "روائح فاخرة تبقى طوال اليوم",
    image:
      "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "makeup",
    name: "المكياج",
    tagline: "ثبات يقاوم الحرارة والرطوبة",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "haircare",
    name: "العناية بالشعر",
    tagline: "نعومة ولمعان بلا تجعّد",
    image:
      "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "tools",
    name: "أدوات الجمال والعناية بالجسم",
    tagline: "تجربة صالون في منزلكِ",
    image:
      "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?auto=format&fit=crop&w=900&q=80",
  },
];

// Self-hosted, on-brand collection images (see scripts/gen-images.mjs).
for (const c of collections) {
  c.image = `/collections/${c.slug}.svg`;
}

export const collectionBySlug = (slug: string) =>
  collections.find((c) => c.slug === slug);
