import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PropyLeads — Skip Trace for Real Estate",
  description: "Upload your property list and get verified phones and emails in minutes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <footer
          className="text-center text-xs py-4 px-6"
          style={{ color: 'var(--text-2)', borderTop: '1px solid var(--border)', background: 'var(--bg-surface)' }}
        >
          © {new Date().getFullYear()} PropyLeads · Need help?{' '}
          <a
            href="mailto:Support@Propyleads.com"
            className="font-semibold"
            style={{ color: 'var(--blue)' }}
          >
            Support@Propyleads.com
          </a>
        </footer>
      </body>
    </html>
  );
}
