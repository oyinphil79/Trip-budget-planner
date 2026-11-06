import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "Receipt Agent",
  description: "Read a receipt into JSON, convert it to INR and keep a spending log.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="relative min-h-screen">
        <div aria-hidden className="glow pointer-events-none absolute inset-x-0 top-0 h-[420px]" />
        <div className="relative">{children}</div>
      </body>
    </html>
  );
}
