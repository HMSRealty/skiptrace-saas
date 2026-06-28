"use client";

import { useState } from "react";

export interface AccordionItem {
  q: string;
  a: string;
}

export default function Accordion({ items }: { items: AccordionItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-plum-700/10 overflow-hidden rounded-2xl bg-white shadow-soft">
      {items.map((item, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between gap-3 p-5 text-right"
          >
            <span className="font-bold text-plum-800">{item.q}</span>
            <span className="text-xl text-blush-600">{open === i ? "−" : "+"}</span>
          </button>
          {open === i && (
            <p className="px-5 pb-5 text-sm leading-relaxed text-plum-700/80">{item.a}</p>
          )}
        </div>
      ))}
    </div>
  );
}
