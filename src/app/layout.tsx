import type { Metadata } from "next";
import { brand } from "@/config/brand";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_ORIGIN || "http://localhost:3002"),
  title: {
    default: brand.name + " — Exceptional Watches in Namibia",
    template: "%s | " + brand.name,
  },
  description:
    brand.tagline +
    " Explore a considered selection of watches in Namibia, or submit your timepiece for private review.",
  robots: {
    index: process.env.DEMO_MODE !== "true",
    follow: process.env.DEMO_MODE !== "true",
  },
  openGraph: { title: brand.name, description: brand.tagline, type: "website" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
