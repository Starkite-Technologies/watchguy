import type { Metadata, Viewport } from "next";
import { brand } from "@/config/brand";
import "@fontsource/cormorant-garamond/latin-500.css";
import "@fontsource/cormorant-garamond/latin-600.css";
import "@fontsource/cormorant-garamond/latin-500-italic.css";
import "@fontsource-variable/inter/index.css";
import "./globals.css";
import { themeScript } from "@/components/theme-toggle";
import { WhatsAppFloat } from "@/components/whatsapp-float";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b111c" },
  ],
  colorScheme: "light dark",
};

// Computed per request: on Cloudflare Workers, APP_ORIGIN is only available
// once a request arrives, not when this module is first loaded.
export async function generateMetadata(): Promise<Metadata> {
  const origin = process.env.APP_ORIGIN || "http://localhost:3002";
  const index = process.env.DEMO_MODE !== "true";
  return {
    metadataBase: new URL(origin),
    title: {
      default: brand.name + " — Pre-owned Luxury Watches in Windhoek",
      template: "%s | " + brand.name,
    },
    description:
      "Buy and sell pre-owned luxury watches in Namibia. Browse Rolex, Omega, Tudor, TAG Heuer and more, with photos, condition and prices in N$, or submit your watch for review.",
    applicationName: brand.name,
    robots: { index, follow: index },
    openGraph: {
      siteName: brand.name,
      title: brand.name,
      description: brand.tagline,
      type: "website",
      locale: "en_NA",
      url: origin,
    },
    twitter: { card: "summary_large_image" },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-NA" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        {children}
        <WhatsAppFloat />
      </body>
    </html>
  );
}
