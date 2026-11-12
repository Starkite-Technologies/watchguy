/**
 * Centralized Brand & Boutique Configuration
 * Update this file to modify client branding, contact details, and market defaults.
 */

export const BRAND = {
  name: "ATELIER TIMEPIECES",
  shortName: "ATELIER",
  tagline: "Exceptional watches. Timeless stories.",
  editorialHeadline: "MORE THAN A WATCH. A LEGACY.",
  description:
    "An exclusive Swiss luxury watch boutique and verified marketplace in Windhoek, Namibia. Curating rare icons, vintage grails, and modern haute horlogerie.",
  
  // Geographic & Legal
  location: "Windhoek, Namibia",
  address: "Maerua Mall & Independence Avenue, Windhoek",
  country: "Namibia",
  
  // Contact & Concierge
  contactEmail: "concierge@ateliertimepieces.com",
  adminEmail: "admin@ateliertimepieces.com",
  contactPhone: "+264 61 248 900",
  whatsappNumber: "+264812345678", // International format without spaces
  whatsappDisplay: "+264 (0)81 234 5678",
  
  // Currency & Market
  currencyCode: "NAD",
  currencySymbol: "N$",
  minorUnitFactor: 100, // Database stores prices in integer cents
  
  // Luxury Color Palette (for programmatic usage)
  colors: {
    obsidian: "#08090B",
    deepCharcoal: "#25282B",
    warmIvory: "#F4F1EA",
    champagneGold: "#B79B6C",
    pureWhite: "#FFFFFF",
  },
  
  // Curated Luxury Brands
  featuredBrands: [
    "Rolex",
    "Omega",
    "Patek Philippe",
    "Audemars Piguet",
    "Cartier",
    "IWC Schaffhausen",
    "Tudor",
    "Jaeger-LeCoultre",
  ],
  
  // Condition Standards
  conditions: [
    "Unworn / New",
    "Mint (Like New)",
    "Excellent",
    "Very Good",
    "Good",
  ],
};

/**
 * Format currency in Namibian Dollars (N$)
 * Accepts integer cents or decimal values
 */
export function formatNAD(amountInCents: number | bigint | null | undefined): string {
  if (amountInCents === null || amountInCents === undefined) return "N$ 0";
  const num = typeof amountInCents === "bigint" ? Number(amountInCents) : amountInCents;
  const majorUnits = Math.round(num / 100);
  return `N$ ${majorUnits.toLocaleString("en-US")}`;
}

/**
 * Generate a pre-filled WhatsApp link for watch enquiries
 */
export function getWhatsAppWatchLink(watch: { brand: string; model: string; referenceNumber?: string | null; slug: string; price: number }) {
  const refText = watch.referenceNumber ? ` (Ref. ${watch.referenceNumber})` : "";
  const priceText = formatNAD(watch.price);
  const message = `Hello Atelier Timepieces, I am enquiring about the ${watch.brand} ${watch.model}${refText} listed for ${priceText} on your website. Is this timepiece available for viewing or acquisition?`;
  return `https://wa.me/${BRAND.whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`;
}

/**
 * Generate a pre-filled general WhatsApp link
 */
export function getWhatsAppGeneralLink() {
  const message = `Hello Atelier Timepieces concierge, I would like to enquire about your luxury watch curation and bespoke advisory services.`;
  return `https://wa.me/${BRAND.whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`;
}
