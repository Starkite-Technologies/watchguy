import { brand } from "@/config/brand";
import type { SiteContent, Watch } from "./types";
export const defaultContent: SiteContent = {
  heroTitle: "TIME IS EVERYTHING.",
  heroSubtitle: brand.tagline,
  aboutTitle: "MORE THAN A WATCH. A LEGACY.",
  aboutText:
    "Some things deserve to be chosen slowly. We’re creating a more personal place to discover, discuss and pass on exceptional timepieces. Considered design. Clear details. A conversation that starts with you.",
  contactEmail: brand.email,
  contactPhone: brand.phone,
  location: brand.location,
};
export function money(price: number, _currency = "NAD") {
  return (
    "N$ " +
    new Intl.NumberFormat("en-NA", {
      minimumFractionDigits: Number.isInteger(price) ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(price)
  );
}
export type Filters = {
  search?: string;
  brand?: string;
  condition?: string;
  availability?: string;
  minPrice?: number;
  maxPrice?: number;
  boxPapers?: boolean;
  sort?: string;
};
export const NEW_IN_DAYS = 21;
export const isNewIn = (w: Pick<Watch, "createdAt">, now = Date.now()) =>
  !!w.createdAt &&
  now - new Date(w.createdAt).getTime() < NEW_IN_DAYS * 86400000;
export function filterWatches(watches: Watch[], filters: Filters = {}) {
  const {
    search = "",
    brand: chosen = "All brands",
    condition = "All conditions",
    availability = "All availability",
    minPrice = 0,
    maxPrice = Infinity,
    sort = "newest",
  } = filters;
  const list = watches.filter(
    (w) =>
      w.published &&
      !["SOLD", "ARCHIVED"].includes(w.availability) &&
      (chosen === "All brands" || chosen === w.brand) &&
      (condition === "All conditions" || w.condition === condition) &&
      (availability === "All availability" ||
        w.availability === availability) &&
      w.price >= minPrice &&
      w.price <= maxPrice &&
      (!filters.boxPapers || (w.box && w.papers)) &&
      [w.brand, w.model, w.reference || ""]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  if (sort === "price-low") list.sort((a, b) => a.price - b.price);
  else if (sort === "price-high") list.sort((a, b) => b.price - a.price);
  else if (sort === "brand-az")
    list.sort(
      (a, b) =>
        a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model),
    );
  else
    list.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  return list;
}
