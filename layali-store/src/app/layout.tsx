import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/components/StoreProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FloatingWhatsApp } from "@/components/WhatsAppButton";
import { brand } from "@/data/config";

export const metadata: Metadata = {
  title: {
    default: `${brand.name} | ${brand.slogan}`,
    template: `%s | ${brand.name}`,
  },
  description:
    "ليالي — متجر مستحضرات التجميل والعناية والعطور الفاخرة. منتجات أصلية، دفع عند الاستلام، وشحن سريع لمصر والخليج.",
  keywords: ["مستحضرات تجميل", "عطور", "عناية بالبشرة", "مكياج", "السعودية", "الإمارات", "مصر"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Tajawal:wght@400;500;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <StoreProvider>
          <Header />
          <main className="min-h-[60vh]">{children}</main>
          <Footer />
          <FloatingWhatsApp />
        </StoreProvider>
      </body>
    </html>
  );
}
