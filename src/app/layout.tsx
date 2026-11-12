import type { Metadata } from "next";
import "./globals.css";
import { BRAND } from "@/config/brand";

export const metadata: Metadata = {
  title: {
    default: `${BRAND.name} — Luxury Watch Marketplace & Swiss Horology`,
    template: `%s | ${BRAND.name}`,
  },
  description: BRAND.description,
  keywords: [
    "luxury watches",
    "Rolex Namibia",
    "Omega Windhoek",
    "Patek Philippe",
    "Swiss timepieces",
    "watch marketplace",
    "sell luxury watch Namibia",
  ],
  authors: [{ name: BRAND.name }],
  metadataBase: new URL(process.env.APP_ORIGIN || "http://localhost:3000"),
  openGraph: {
    title: `${BRAND.name} — Luxury Watch Marketplace`,
    description: BRAND.description,
    type: "website",
    locale: "en_NA",
    siteName: BRAND.name,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#08090B] text-[#F4F1EA] antialiased min-h-screen selection:bg-[#B79B6C]/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
