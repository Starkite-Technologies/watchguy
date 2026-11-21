// SEO copy and structured data for watch listings. Pure functions with no
// server imports, so the admin editor can preview the same generated text.
//
// The write-up uses only facts stored on the listing. It never claims
// authentication, servicing, warranty or delivery terms: the store adds those
// in its own words when they are true.
import type { Watch } from "./types";

type Listing = Pick<
  Watch,
  | "slug"
  | "brand"
  | "model"
  | "reference"
  | "year"
  | "condition"
  | "price"
  | "currency"
  | "box"
  | "papers"
  | "diameter"
  | "movement"
  | "caseMaterial"
  | "dial"
  | "bracelet"
  | "waterResistance"
  | "defects"
  | "sellerType"
  | "availability"
>;

export type SeoContext = { siteName: string; location: string };

const clean = (value?: string | null) => (value || "").trim();
const formatPrice = (amount: number) =>
  "N$ " +
  new Intl.NumberFormat("en-NA", { maximumFractionDigits: 0 }).format(amount);

/** "a" or "an" for the word that follows. */
const article = (word: string) =>
  /^(8|11|18)\b|^[aeiou]/i.test(word) && !/^(one|uni|eu)/i.test(word)
    ? "an"
    : "a";
/** Lower-case the first word only when it is an ordinary word, keeping names. */
const COMMON =
  /^(automatic|manual|hand-wound|self-winding|mechanical|quartz|black|white|blue|green|silver|grey|gray|brown|champagne|cream|ivory|steel|stainless|leather|rubber|nato|fabric|metal)\b/i;
const softCase = (text: string) =>
  COMMON.test(text) ? text[0].toLowerCase() + text.slice(1) : text;

/** Stable small hash so each listing gets its own, but repeatable, wording. */
function pick<T>(seed: string, options: readonly T[]): T {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return options[Math.abs(h) % options.length];
}

export function watchName(w: Pick<Watch, "brand" | "model" | "reference">) {
  return [w.brand, w.model, clean(w.reference)].filter(Boolean).join(" ");
}

export function inclusions(w: Pick<Watch, "box" | "papers">) {
  if (w.box && w.papers) return "box and papers";
  if (w.box) return "original box";
  if (w.papers) return "original papers";
  return "";
}

function truncate(text: string, max: number) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,.;:\s]+$/, "") + "…";
}

/** <title>: under ~60 characters, most specific first. */
export function seoTitle(w: Listing & { seoTitle?: string | null }) {
  if (clean(w.seoTitle)) return clean(w.seoTitle);
  const name = watchName(w);
  const options = [
    `${name} for sale in Namibia`,
    `${name} | Pre-owned`,
    `${w.brand} ${w.model} for sale in Namibia`,
    `${w.brand} ${w.model}`,
  ];
  return options.find((t) => t.length <= 60) || truncate(name, 60);
}

/** Meta description: under ~155 characters, with the facts buyers search for. */
export function seoDescription(
  w: Listing & { seoDescription?: string | null },
  ctx: SeoContext,
) {
  if (clean(w.seoDescription)) return clean(w.seoDescription);
  const facts = [
    w.year ? String(w.year) : "",
    w.condition ? w.condition.toLowerCase() + " condition" : "",
    inclusions(w),
  ].filter(Boolean);
  const text =
    `Pre-owned ${watchName(w)}` +
    (facts.length ? ", " + facts.join(", ") : "") +
    `. ${formatPrice(w.price)}. View photos and enquire with ${ctx.siteName} in ${ctx.location.split(",")[0]}.`;
  return truncate(text, 158);
}

/** Multi-paragraph description built from the listing's own details. */
export function generateWriteUp(w: Listing, ctx: SeoContext) {
  const name = watchName(w);
  const seed = w.slug || name;
  const ref = clean(w.reference);
  const paragraphs: string[] = [];

  const opener = pick(seed, [
    `This pre-owned ${name} is available from ${ctx.siteName} in ${ctx.location}.`,
    `${ctx.siteName} presents a pre-owned ${name}, offered in ${ctx.location}.`,
    `Now available in ${ctx.location}: a pre-owned ${name} from ${ctx.siteName}.`,
  ]);
  const age = w.year
    ? pick(seed + "y", [
        ` It dates from ${w.year} and is graded ${w.condition.toLowerCase()}.`,
        ` This example is from ${w.year}, in ${w.condition.toLowerCase()} condition.`,
      ])
    : ` It is graded ${w.condition.toLowerCase()}.`;
  paragraphs.push(opener + age);

  const spec: string[] = [];
  const caseBits = [clean(w.diameter), softCase(clean(w.caseMaterial))]
    .filter(Boolean)
    .join(" ");
  if (caseBits) spec.push(`${article(caseBits)} ${caseBits} case`);
  if (clean(w.dial)) {
    const dial = softCase(clean(w.dial));
    spec.push(
      `${article(dial)} ${dial}${/\bdial\b/i.test(dial) ? "" : " dial"}`,
    );
  }
  if (clean(w.bracelet)) {
    const strap = softCase(clean(w.bracelet));
    spec.push(
      `${article(strap)} ${strap}${/\b(bracelet|strap)\b/i.test(strap) ? "" : " bracelet"}`,
    );
  }
  let specText = "";
  if (spec.length)
    specText =
      `The ${w.brand} ${w.model}${ref ? ` (reference ${ref})` : ""} pairs ` +
      (spec.length > 1
        ? spec.slice(0, -1).join(", ") + " and " + spec.at(-1)
        : spec[0]) +
      ".";
  if (clean(w.movement)) {
    const movement = softCase(clean(w.movement));
    specText += `${specText ? " " : ""}It runs on ${article(movement)} ${movement}${/\b(movement|calibre|caliber)\b/i.test(movement) ? "" : " movement"}.`;
  }
  if (clean(w.waterResistance))
    specText += `${specText ? " " : ""}Water resistance is rated at ${clean(w.waterResistance)}.`;
  if (specText) paragraphs.push(specText);

  const included = inclusions(w);
  let condition = included
    ? `The watch comes with its ${included}.`
    : "It is sold without the original box or papers.";
  if (clean(w.defects))
    condition +=
      " Known wear and marks are listed in the condition notes, so you know exactly what to expect.";
  paragraphs.push(condition);

  paragraphs.push(
    w.sellerType === "THIRD_PARTY"
      ? `It is listed on behalf of a private seller. Our team reviewed the submission and photographs before publishing it.`
      : `It is part of ${ctx.siteName}'s own collection.`,
  );

  paragraphs.push(
    (w.availability === "RESERVED"
      ? `This watch is currently reserved. `
      : `The asking price is ${formatPrice(w.price)}. `) +
      pick(seed + "c", [
        `Send an enquiry or message us on WhatsApp to ask questions or arrange a viewing.`,
        `Enquire online or on WhatsApp for more photos, questions or a viewing.`,
      ]),
  );
  return paragraphs.join("\n\n");
}

export function writeUpFor(
  w: Listing & { writeUp?: string | null },
  ctx: SeoContext,
) {
  return clean(w.writeUp) || generateWriteUp(w, ctx);
}

/** schema.org Product + Offer, for Google's product results. */
export function productJsonLd(
  w: Listing & { images: string[]; seoDescription?: string | null },
  url: string,
  ctx: SeoContext,
) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: watchName(w),
    brand: { "@type": "Brand", name: w.brand },
    model: w.model,
    ...(clean(w.reference)
      ? { mpn: clean(w.reference), sku: clean(w.reference) }
      : {}),
    ...(w.year ? { productionDate: String(w.year) } : {}),
    image: w.images,
    description: seoDescription(w, ctx),
    category: "Wristwatches",
    url,
    offers: {
      "@type": "Offer",
      url,
      price: w.price.toFixed(2),
      priceCurrency: w.currency || "NAD",
      itemCondition:
        w.condition === "Unworn"
          ? "https://schema.org/NewCondition"
          : "https://schema.org/UsedCondition",
      availability:
        w.availability === "RESERVED"
          ? "https://schema.org/LimitedAvailability"
          : "https://schema.org/InStock",
      seller: { "@type": "Organization", name: ctx.siteName },
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/** Safe for <script type="application/ld+json">. */
export const jsonLd = (data: unknown) =>
  JSON.stringify(data).replace(/</g, "\\u003c");
